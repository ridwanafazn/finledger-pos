export interface MetricSample {
  labels: Record<string, string>;
  value: number;
}

export type MetricMap = Map<string, MetricSample[]>;

export interface SystemMetrics {
  checkout: {
    count: number;
    totalSeconds: number;
    maxSeconds: number;
    avgMs: number;
  };
  http: {
    count: number;
    errorCount: number;
    errorRate: number;
  };
  db: {
    active: number;
    idle: number;
    max: number;
    pending: number;
  };
  jvm: {
    heapUsedMb: number;
    heapMaxMb: number;
  };
  kafka: {
    listenerCount: number;
  };
  reconciliation: {
    discrepanciesLast: number;
  };
  fetchedAt: string;
}

/**
 * Minimal Prometheus text parser. Only the metrics used by the System tab
 * are read, so a full exposition-format implementation is unnecessary.
 */
export function parsePrometheus(text: string): MetricMap {
  const map: MetricMap = new Map();

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const spaceIndex = line.lastIndexOf(" ");
    if (spaceIndex < 0) continue;

    const nameAndLabels = line.slice(0, spaceIndex);
    const value = Number(line.slice(spaceIndex + 1));
    if (!Number.isFinite(value)) continue;

    const braceIndex = nameAndLabels.indexOf("{");
    const name =
      braceIndex >= 0 ? nameAndLabels.slice(0, braceIndex) : nameAndLabels;

    const labels: Record<string, string> = {};
    if (braceIndex >= 0) {
      const labelText = nameAndLabels.slice(
        braceIndex + 1,
        nameAndLabels.lastIndexOf("}"),
      );
      const regex = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:[^"\\]|\\.)*)"/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(labelText)) !== null) {
        labels[match[1]] = match[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
    }

    const samples = map.get(name) ?? [];
    samples.push({ labels, value });
    map.set(name, samples);
  }

  return map;
}

function sum(map: MetricMap, name: string): number {
  return (map.get(name) ?? []).reduce((total, sample) => total + sample.value, 0);
}

function max(map: MetricMap, name: string): number {
  return (map.get(name) ?? []).reduce(
    (current, sample) => Math.max(current, sample.value),
    0,
  );
}

function sumWhere(
  map: MetricMap,
  name: string,
  predicate: (labels: Record<string, string>) => boolean,
): number {
  return (map.get(name) ?? [])
    .filter((sample) => predicate(sample.labels))
    .reduce((total, sample) => total + sample.value, 0);
}

function last(map: MetricMap, name: string): number {
  const samples = map.get(name) ?? [];
  return samples.length > 0 ? samples[samples.length - 1].value : 0;
}

export function buildSystemMetrics(map: MetricMap): SystemMetrics {
  const checkoutCount = sum(map, "ledger_checkout_seconds_count");
  const checkoutTotal = sum(map, "ledger_checkout_seconds_sum");
  const checkoutMax = max(map, "ledger_checkout_seconds_max");

  const httpCount = sum(map, "http_server_requests_seconds_count");
  const httpErrors = sumWhere(
    map,
    "http_server_requests_seconds_count",
    (labels) => (labels.status ?? "").startsWith("5"),
  );

  return {
    checkout: {
      count: checkoutCount,
      totalSeconds: checkoutTotal,
      maxSeconds: checkoutMax,
      avgMs: checkoutCount > 0 ? (checkoutTotal / checkoutCount) * 1000 : 0,
    },
    http: {
      count: httpCount,
      errorCount: httpErrors,
      errorRate: httpCount > 0 ? (httpErrors / httpCount) * 100 : 0,
    },
    db: {
      active: sum(map, "hikaricp_connections_active"),
      idle: sum(map, "hikaricp_connections_idle"),
      max: sum(map, "hikaricp_connections_max"),
      pending: sum(map, "hikaricp_connections_pending"),
    },
    jvm: {
      heapUsedMb:
        sumWhere(
          map,
          "jvm_memory_used_bytes",
          (labels) => labels.area === "heap",
        ) /
        (1024 * 1024),
      heapMaxMb:
        sumWhere(
          map,
          "jvm_memory_max_bytes",
          (labels) => labels.area === "heap",
        ) /
        (1024 * 1024),
    },
    kafka: {
      listenerCount: sum(map, "spring_kafka_listener_seconds_count"),
    },
    reconciliation: {
      discrepanciesLast: last(map, "finledger_reconciliation_discrepancies_last"),
    },
    fetchedAt: new Date().toISOString(),
  };
}

import { createHash, randomUUID } from "node:crypto";

// WhatsApp may supply a serialized string or an ID object.
export function messageExternalId(message) {
  for (const value of [message?.id, message?._data?.id]) {
    for (const candidate of [
      typeof value === "string" ? value : undefined,
      value?._serialized,
      typeof value?.id === "string" ? `wa-id:${value.id}` : undefined,
    ]) {
      if (typeof candidate === "string" && candidate.trim() && candidate.length <= 250)
        return candidate;
    }
  }
}

export function ensureIncomingId(event, recoveryKey) {
  if (typeof event.externalId === "string" && event.externalId.trim() && event.externalId.length <= 250)
    return event;
  // Recover existing spool files deterministically, including after a restart.
  // New ID-less events get separate local IDs so identical messages aren't lost.
  return {
    ...event,
    externalId: recoveryKey
      ? `local:${createHash("sha256").update(recoveryKey).digest("hex")}`
      : `local:${randomUUID()}`,
  };
}

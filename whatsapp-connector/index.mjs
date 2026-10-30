import {
  mkdir,
  writeFile,
  readdir,
  readFile,
  unlink,
  rename,
} from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import "dotenv/config";
import whatsapp from "whatsapp-web.js";
import QRCode from "qrcode";
const { Client, LocalAuth, MessageMedia } = whatsapp;
const base = process.env.CRM_APP_URL?.replace(/\/$/, ""),
  secret = process.env.CRM_CONNECTOR_SECRET;
if (!base || !secret || secret.length < 32)
  throw Error("Configure CRM_APP_URL e CRM_CONNECTOR_SECRET (32+ caracteres).");
const spool = path.resolve(
  process.env.WA_SESSION_PATH || "./data/sessions",
  "../incoming",
);
await mkdir(spool, { recursive: true, mode: 0o700 });
async function persistIncoming(event) {
  const key = createHash("sha256")
    .update(event.accountId + event.externalId)
    .digest("hex");
  const tmp = path.join(spool, key + "." + randomUUID() + ".tmp");
  await writeFile(tmp, JSON.stringify(event), { mode: 0o600 });
  await rename(tmp, path.join(spool, key + ".json"));
}
async function flushIncoming() {
  for (const name of (await readdir(spool)).filter((n) =>
    /^[a-f0-9]{64}\.json$/.test(n),
  )) {
    const file = path.join(spool, name);
    await api("incoming", JSON.parse(await readFile(file, "utf8")));
    await unlink(file);
  }
}
const clients = new Map(),
  seen = new Map();
let stopping = false;
async function api(path, body) {
  const response = await fetch(`${base}/api/connector/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const reason = typeof detail?.error === "string"
      ? `: ${detail.error.slice(0, 1000)}`
      : "";
    throw Error(`CRM respondeu ${response.status} em ${path}${reason}`);
  }
  return response.json();
}
const status = (id, state, qr) =>
  api("status", { accountId: id, status: state, ...(qr ? { qr } : {}) }).catch(
    (e) => console.error(e.message),
  );
async function connect(account) {
  if (clients.has(account.id)) return;
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: account.id,
      dataPath: process.env.WA_SESSION_PATH || "./data/sessions",
    }),
    puppeteer: {
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  });
  const entry = { client, ready: false };
  clients.set(account.id, entry);
  await status(account.id, "connecting");
  client.on("qr", async (qr) => {
    await status(account.id, "qr", await QRCode.toDataURL(qr));
  });
  client.on("ready", async () => {
    if (client.info?.wid?.user !== account.phone) {
      entry.wrong = true;
      await status(account.id, "wrong_number");
      await client.logout().catch(() => {});
      entry.ready = false;
      return;
    }
    entry.ready = true;
    await status(account.id, "connected");
  });
  client.on("auth_failure", () => {
    entry.ready = false;
    void status(account.id, "error");
  });
  client.on("disconnected", () => {
    entry.ready = false;
    void status(account.id, entry.wrong ? "wrong_number" : "disconnected");
  });
  client.on("message", async (message) => {
    try {
      if (
        message.fromMe ||
        message.isStatus ||
        message.from.endsWith("@g.us") ||
        message.from.endsWith("@broadcast")
      )
        return;
      const contact = await message.getContact();
      const phone = contact.number;
      if (!/^\d{8,16}$/.test(phone || "")) return;
      const event = {
        accountId: account.id,
        externalId: message.id._serialized,
        phone,
        name: (contact.pushname || contact.name || "").slice(0, 120),
        body: (message.body || "").slice(0, 20000),
      };
      try {
        if (message.hasMedia) {
          if (message._data?.size > 10 * 1024 * 1024)
            event.body += "\n[Anexo acima de 10 MB: confira no WhatsApp.]";
          else {
            const media = await message.downloadMedia();
            if (media && media.data.length <= 14000000)
              event.media = {
                base64: media.data,
                mime: media.mimetype,
                name: (media.filename || "anexo").slice(0, 160),
              };
            else event.body += "\n[Anexo indisponível: confira no WhatsApp.]";
          }
        }
      } catch {
        event.body += "\n[Anexo indisponível: confira no WhatsApp.]";
      }
      await persistIncoming(event);
    } catch (error) {
      console.error("Falha ao registrar recebimento:", error.message);
    }
  });
  client.on("message_ack", (message, ack) => {
    void api("ack", {
      accountId: account.id,
      externalId: message.id._serialized,
      ack,
    }).catch((e) => console.error(e.message));
  });
  client.initialize().catch(async (error) => {
    entry.ready = false;
    await status(account.id, "error");
    console.error("Falha de conexão:", error.message);
  });
}
async function tick() {
  await flushIncoming();
  const accounts = await api("accounts");
  for (const account of accounts) {
    if (seen.get(account.id) !== account.commandId) {
      seen.set(account.id, account.commandId);
      const old = clients.get(account.id);
      if (old) {
        await old.client.logout().catch(() => {});
        await old.client.destroy().catch(() => {});
        clients.delete(account.id);
      }
      if (account.command === "connect") await connect(account);
      else await status(account.id, "disconnected");
    }
    const entry = clients.get(account.id);
    if (entry?.ready && entry.client.info?.wid?.user !== account.phone) {
      entry.ready = false;
      entry.wrong = true;
      await entry.client.logout().catch(() => {});
      await status(account.id, "wrong_number");
    }
    if (account.command !== "connect" || !entry?.ready) continue;
    const job = await api("claim", { accountId: account.id });
    if (!job) continue;
    let sent;
    try {
      const target = `${job.conversation.phone}@c.us`;
      if (job.attachment) {
        const response = await fetch(
          `${base}/api/connector/attachments/${job.attachment.id}`,
          {
            headers: { Authorization: `Bearer ${secret}` },
            signal: AbortSignal.timeout(30000),
          },
        );
        if (!response.ok) throw Error("Anexo indisponível antes do envio.");
        const media = new MessageMedia(
          job.attachment.mime,
          Buffer.from(await response.arrayBuffer()).toString("base64"),
          job.attachment.name,
        );
        sent = await entry.client.sendMessage(target, media, {
          caption: job.body,
          sendMediaAsDocument: job.attachment.mime === "application/pdf",
        });
      } else sent = await entry.client.sendMessage(target, job.body);
    } catch (error) {
      await api("result", {
        id: job.id,
        status: "unknown",
        error: "Resultado incerto. Confira no WhatsApp antes de reenviar.",
      });
      continue;
    }
    // Never retry the WhatsApp send if acknowledging to the CRM fails.
    await api("result", {
      id: job.id,
      status: "sent",
      externalId: sent.id._serialized,
    });
    if (sent.ack >= 2)
      await api("ack", {
        accountId: account.id,
        externalId: sent.id._serialized,
        ack: sent.ack,
      });
  }
}
async function stop() {
  stopping = true;
  for (const { client } of clients.values())
    await client.destroy().catch(() => {});
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

while (!stopping) {
  try {
    await tick();
  } catch (error) {
    console.error(error.message);
  }
  await new Promise((r) => setTimeout(r, 3000));
}

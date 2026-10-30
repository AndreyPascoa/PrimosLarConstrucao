import { randomBytes, scryptSync } from "node:crypto";
// Generate a unique password locally; never commit the output or send it to the browser.
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
console.log("Guarde a senha em seu gerenciador de senhas:");
console.log(password);
console.log(
  "\nConfigure somente este hash em ADMIN_PASSWORD_HASH no servidor:",
);
console.log(hash);
console.log("\nTrocar o hash invalida todas as sessões anteriores.");

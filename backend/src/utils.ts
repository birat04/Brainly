import crypto from "crypto";

export function random(len: number): string {
  if (len <= 0 || !Number.isInteger(len)) {
    throw new Error("Length must be a positive integer.");
  }
  const options = "qwertyuiopasdfghjklzxcvbnm1234567890";
  const bytes = crypto.randomBytes(len);
  let ans = "";
  for (let i = 0; i < len; i++) {
    ans += options[bytes[i] % options.length];
  }
  return ans;
}

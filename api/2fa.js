import express from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import bodyParser from "body-parser";
import { encrypt, decrypt } from "./crypto.js";
import supabase from "./supabaseClient.js";

const router = express.Router();
router.use(bodyParser.json());

async function saveUserTwoFA(userId, twofaObj) {
  const { data, error } = await supabase
    .from("users")
    .update({ twofa: twofaObj })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return data;
}

async function getUserTwoFA(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("twofa")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data?.twofa || null;
}

router.post("/generate", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const secret = speakeasy.generateSecret({
      name: `Empirox (${email || userId})`,
      length: 20,
    });

    const otpAuth = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpAuth);

    await saveUserTwoFA(userId, { enabled: false, secret_encrypted: encrypt(secret.base32) });

    res.json({
      secret: secret.base32,
      otpAuthUrl: otpAuth,
      qrDataUrl,
    });
  } catch (error) {
    console.error("Generate 2FA error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-setup", async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: "userId & token required" });

    const twofa = await getUserTwoFA(userId);
    if (!twofa || !twofa.secret_encrypted)
      return res.status(400).json({ error: "No secret found. Generate first" });

    const secret = decrypt(twofa.secret_encrypted);

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) return res.status(400).json({ verified: false, error: "Invalid token" });

    await saveUserTwoFA(userId, { enabled: true, secret_encrypted: twofa.secret_encrypted });

    res.json({ verified: true });
  } catch (error) {
    console.error("Verify setup error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-login", async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: "userId & token required" });

    const twofa = await getUserTwoFA(userId);
    if (!twofa || !twofa.enabled) return res.status(400).json({ error: "2FA not enabled" });

    const secret = decrypt(twofa.secret_encrypted);

    const ok = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!ok) return res.status(401).json({ ok: false, error: "Invalid 2FA code" });

    res.json({ ok: true });
  } catch (error) {
    console.error("Verify login error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, country, standard } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password, country, standard) VALUES ($1, $2, $3, $4) RETURNING id, email, country, standard",
      [email, hashedPassword, country, standard]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;

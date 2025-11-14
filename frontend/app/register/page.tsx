"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        throw new Error("Registration failed");
      }

      setSuccess("Account created. You can now sign in.");
    } catch (err) {
      console.error(err);
      setError("Registration failed. This email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">
          Set up a basic account to save your questionnaires and re-run coverage
          checkups over time.
        </p>

        <form onSubmit={handleRegister}>
          <div className="field-group">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword" className="field-label">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="field-input"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
}

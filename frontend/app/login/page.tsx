"use client";

import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Visiting /login will log out the user
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        throw new Error("Login failed");
      }

      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/questionnaire";
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">
          Use the same email and password you used when creating your account.
        </p>

        <form onSubmit={handleLogin}>
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

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account? </span>
          <a href="/register">Create one</a>
        </div>
      </div>
    </div>
  );
}

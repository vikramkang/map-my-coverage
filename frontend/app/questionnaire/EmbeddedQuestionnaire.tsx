"use client";

import {
  FormEvent,
  ChangeEvent,
  useState,
  useEffect,
} from "react";
import { apiRequest } from "../../lib/api";

interface FormState {
  age: number;
  province: string;
  income: number;
  dependants: number;
  has_vehicle: boolean;
  liability_limit: number;
  owns_home: boolean;
  rents: boolean;
  has_mortgage: boolean;
  travels_outside_canada: boolean;
  has_existing_life: boolean;
}

interface EmbeddedQuestionnaireProps {
  partner?: string;
  protectWithLogin?: boolean;
}

export default function EmbeddedQuestionnaire({
  partner = "public",
  protectWithLogin = true,
}: EmbeddedQuestionnaireProps) {
  const [form, setForm] = useState<FormState>({
    age: 32,
    province: "ON",
    income: 90000,
    dependants: 0,
    has_vehicle: false,
    liability_limit: 2000000,
    owns_home: false,
    rents: true,
    has_mortgage: false,
    travels_outside_canada: false,
    has_existing_life: false,
  });

  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Optional login guard
  useEffect(() => {
    if (!protectWithLogin) return;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
      }
    }
  }, [protectWithLogin]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setReport(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (protectWithLogin && !token) {
      setError("You must be logged in. Go to /login first.");
      setLoading(false);
      return;
    }

    try {
      const q = await apiRequest("/questionnaires/", {
        method: "POST",
        token: protectWithLogin ? token : undefined,
      });

      await apiRequest(`/questionnaires/${q.id}/answers`, {
        method: "PUT",
        token: protectWithLogin ? token : undefined,
        body: { answers: { ...form, _partner: partner } },
      });

      const completed = await apiRequest(
        `/questionnaires/${q.id}/complete`,
        {
          method: "POST",
          token: protectWithLogin ? token : undefined,
        }
      );

      setReport(completed);
    } catch (err) {
      console.error(err);
      setError("Something went wrong calling the API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-grid">
      <div className="page-grid__inner">
        {/* Left: form card */}
        <section className="card card--padded">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.08,
                  color: "#64748b",
                  marginBottom: 2,
                }}
              >
                Step 1
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                Coverage checkup
              </h1>
            </div>
            <span className="tag tag-soft">~ 2–3 minutes</span>
          </div>

          <p
            style={{
              marginTop: 0,
              marginBottom: 18,
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            Tell us a bit about your situation in Canada. We&apos;ll scan for
            gaps in life, home, auto, and travel coverage and give you a
            simple, prioritized summary.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Personal & income section */}
            <section className="section">
              <div className="section__head">
                <h2 className="section__title">Personal details</h2>
                <span className="section__hint">
                  Used for life &amp; income protection
                </span>
              </div>
              <div className="section__grid">
                <div className="field-group">
                  <label htmlFor="age" className="field-label">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="field-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="province" className="field-label">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="field-select"
                  >
                    <option value="ON">Ontario</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="income" className="field-label">
                    Annual income (before tax)
                  </label>
                  <input
                    id="income"
                    type="number"
                    name="income"
                    value={form.income}
                    onChange={handleChange}
                    className="field-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="dependants" className="field-label">
                    Number of dependants
                  </label>
                  <input
                    id="dependants"
                    type="number"
                    name="dependants"
                    value={form.dependants}
                    onChange={handleChange}
                    className="field-input"
                  />
                </div>
              </div>
            </section>

            {/* Housing & vehicle section */}
            <section className="section">
              <div className="section__head">
                <h2 className="section__title">Housing &amp; vehicle</h2>
                <span className="section__hint">
                  Used for home / tenant &amp; auto coverage
                </span>
              </div>

              <div className="section__grid">
                <div>
                  <div className="field-check-row">
                    <input
                      type="checkbox"
                      name="owns_home"
                      checked={form.owns_home}
                      onChange={handleChange}
                    />
                    <span>I own my home</span>
                  </div>
                  <div
                    className="field-check-row"
                    style={{ marginTop: 6 }}
                  >
                    <input
                      type="checkbox"
                      name="rents"
                      checked={form.rents}
                      onChange={handleChange}
                    />
                    <span>I rent my home</span>
                  </div>
                  <div
                    className="field-check-row"
                    style={{ marginTop: 6 }}
                  >
                    <input
                      type="checkbox"
                      name="has_mortgage"
                      checked={form.has_mortgage}
                      onChange={handleChange}
                    />
                    <span>I have a mortgage</span>
                  </div>
                </div>

                <div>
                  <div className="field-check-row">
                    <input
                      type="checkbox"
                      name="has_vehicle"
                      checked={form.has_vehicle}
                      onChange={handleChange}
                    />
                    <span>I own a vehicle</span>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div
                      className="field-group"
                      style={{ marginBottom: 0 }}
                    >
                      <label
                        htmlFor="liability_limit"
                        className="field-label"
                      >
                        Auto liability limit (if known)
                      </label>
                      <input
                        id="liability_limit"
                        type="number"
                        name="liability_limit"
                        value={form.liability_limit}
                        onChange={handleChange}
                        className="field-input"
                      />
                    </div>
                    <p className="field-help">
                      Many Ontario drivers choose $2,000,000.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Other coverage section */}
            <section
              className="section"
              style={{ borderBottom: "none" }}
            >
              <div className="section__head">
                <h2 className="section__title">
                  Other coverage &amp; habits
                </h2>
                <span className="section__hint">
                  Helps us assess travel &amp; life insurance needs
                </span>
              </div>
              <div className="section__grid-wide">
                <label className="field-check-row">
                  <input
                    type="checkbox"
                    name="travels_outside_canada"
                    checked={form.travels_outside_canada}
                    onChange={handleChange}
                  />
                  <span>I travel outside Canada</span>
                </label>

                <label className="field-check-row">
                  <input
                    type="checkbox"
                    name="has_existing_life"
                    checked={form.has_existing_life}
                    onChange={handleChange}
                  />
                  <span>I already have life insurance</span>
                </label>
              </div>
            </section>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Calculating..." : "Run checkup"}
            </button>
          </form>
        </section>

        {/* Right: summary / results card */}
        <aside className="card card--dark-soft hero-side">
          <h2 className="hero-side__title">Your coverage snapshot</h2>
          {!report && (
            <>
              <p className="hero-side__text">
                After you run the checkup, we&apos;ll highlight where you
                may be under-protected and where you&apos;re likely in
                good shape.
              </p>
              <ul className="hero-side__list">
                <li>Personalized recommendations by category</li>
                <li>Neutral, rule-based scoring – no sales pitch</li>
                <li>Optimized for Canadian (Ontario-first) coverage</li>
              </ul>
            </>
          )}

            {report && (
              <div style={{ marginTop: 10 }}>
                {/* Overall score */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    backgroundColor: "rgba(15, 23, 42, 0.65)",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.08,
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    Overall score
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                    }}
                  >
                    {report.assessment.overall_risk_score}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        marginLeft: 6,
                        color: "#9ca3af",
                      }}
                    >
                      / 100
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  }}
                >
                  {Object.entries(report.assessment.categories).map(
                    ([key, cat]: any) => (
                      <div
                        key={key}
                        style={{
                          borderRadius: 10,
                          border: "1px solid rgba(148, 163, 184, 0.4)",
                          padding: "8px 10px",
                          backgroundColor: "rgba(15, 23, 42, 0.7)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              textTransform: "uppercase",
                              letterSpacing: 0.08,
                            }}
                          >
                            {key}
                          </span>
                          <span>{(cat as any).score}</span>
                        </div>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: 16,
                            fontSize: 11,
                            color: "#d1d5db",
                          }}
                        >
                          {(cat as any).recommendations.slice(0, 2).map(
                            (r: any, idx: number) => (
                              <li key={idx}>{r.title}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>

                {/* AI advice block */}
                {report.ai_advice && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(148, 163, 184, 0.4)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.08,
                        color: "#9ca3af",
                        marginBottom: 6,
                      }}
                    >
                      AI summary (beta)
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#e5e7eb",
                        marginTop: 0,
                        marginBottom: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      {report.ai_advice.summary}
                    </p>

                    {Array.isArray(report.ai_advice.bullets) &&
                      report.ai_advice.bullets.length > 0 && (
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: 18,
                            fontSize: 12,
                            color: "#d1d5db",
                          }}
                        >
                          {report.ai_advice.bullets.map(
                            (b: string, idx: number) => (
                              <li key={idx} style={{ marginBottom: 4 }}>
                                {b}
                              </li>
                            )
                          )}
                        </ul>
                      )}

                    <p
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        marginTop: 8,
                      }}
                    >
                      This explanation is generated by AI for general education only and
                      is not financial, legal, or insurance advice. Please confirm details
                      with a licensed advisor.
                    </p>
                  </div>
                )}
              </div>
            )}

        </aside>
      </div>
    </div>
  );
}

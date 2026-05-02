"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Bot, Send, Briefcase, DollarSign, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SalaryResult {
  marketMin?: number;
  marketAverage?: number;
  marketMax?: number;
  assessment?: string;
  recommendation?: string;
  gratuityNote?: string;
  raw?: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your UAE HR & Labour Law Assistant. I can help you with:\n\n• UAE Labour Law questions\n• Gratuity calculations\n• Leave entitlements\n• WPS requirements\n• Visa & work permit queries\n• MOHRE regulations\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "salary" | "jd">("chat");

  const [salaryForm, setSalaryForm] = useState({
    designation: "",
    department: "",
    experience: "",
    currentSalary: "",
    nationality: "",
  });
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [jdForm, setJdForm] = useState({
    designation: "",
    department: "",
    requirements: "",
  });
  const [jdResult, setJdResult] = useState("");
  const [jdLoading, setJdLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/api/ai/ask", { question: userMsg });
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      toast.error("AI request failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSalaryAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalaryLoading(true);
    try {
      const { data } = await api.post("/api/ai/analyze-salary", salaryForm);
      setSalaryResult(data);
      toast.success("Salary analysis complete!");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleJD = async (e: React.FormEvent) => {
    e.preventDefault();
    setJdLoading(true);
    try {
      const { data } = await api.post("/api/ai/job-description", jdForm);
      setJdResult(data.jobDescription);
      toast.success("Job description generated!");
    } catch {
      toast.error("Generation failed");
    } finally {
      setJdLoading(false);
    }
  };

  const quickQuestions = [
    "How is gratuity calculated in UAE?",
    "What are annual leave entitlements?",
    "What is the WPS system?",
    "UAE sick leave policy?",
    "Notice period rules in UAE?",
    "Can employer deduct salary in UAE?",
  ];

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 7,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
  };
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    display: "block",
    marginBottom: 5,
  };

  return (
    <DashboardLayout title="AI HR Assistant">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "chat", label: "HR Chat Assistant", icon: Bot },
          { id: "salary", label: "Salary Analyzer", icon: DollarSign },
          { id: "jd", label: "Job Description Generator", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "chat" | "salary" | "jd")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 8,
                border: "1.5px solid",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                borderColor: activeTab === tab.id ? "#00732F" : "#e5e7eb",
                background: activeTab === tab.id ? "#00732F" : "#fff",
                color: activeTab === tab.id ? "#fff" : "#555",
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              height: 600,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#00732F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>UAE HR Assistant</div>
                <div style={{ fontSize: 12, color: "#00732F" }}>● Online — Powered by Gemini AI</div>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: msg.role === "user" ? "#00732F" : "#f5f6fa",
                      color: msg.role === "user" ? "#fff" : "#1a1a1a",
                      fontSize: 14,
                      lineHeight: 1.6,
                      borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                      borderBottomLeftRadius: msg.role === "assistant" ? 4 : 12,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#f5f6fa",
                      fontSize: 14,
                      color: "#888",
                    }}
                  >
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: 16,
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                gap: 10,
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about UAE labour law, gratuity, leave..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  background: loading || !input.trim() ? "#a0bea0" : "#00732F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Quick Questions */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              height: "fit-content",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>
              Quick Questions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  style={{
                    padding: "10px 12px",
                    background: "#f5f6fa",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#555",
                    cursor: "pointer",
                    textAlign: "left",
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e6f4ed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                >
                  {q}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#e6f4ed", borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: "#00732F", fontWeight: 600, margin: "0 0 4px" }}>
                DISCLAIMER
              </p>
              <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.5 }}>
                AI responses are for guidance only. Always consult MOHRE or a legal advisor for
                official matters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Salary Analyzer Tab */}
      {activeTab === "salary" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <DollarSign size={20} color="#00732F" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                UAE Salary Analyzer
              </h3>
            </div>
            <form onSubmit={handleSalaryAnalysis}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(
                  [
                    ["designation", "Job Title / Designation", "text"],
                    ["department", "Department", "text"],
                    ["experience", "Years of Experience", "number"],
                    ["currentSalary", "Current Salary (AED)", "number"],
                    ["nationality", "Nationality", "text"],
                  ] as [keyof typeof salaryForm, string, string][]
                ).map(([key, label, type]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type={type}
                      required
                      value={salaryForm[key]}
                      onChange={(e) => setSalaryForm({ ...salaryForm, [key]: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={salaryLoading}
                  style={{
                    padding: "12px",
                    background: salaryLoading ? "#a0bea0" : "#00732F",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: salaryLoading ? "not-allowed" : "pointer",
                    marginTop: 4,
                  }}
                >
                  {salaryLoading ? "Analyzing..." : "Analyze Salary"}
                </button>
              </div>
            </form>
          </div>

          {salaryResult ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 20 }}>
                Analysis Results
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Market Minimum", `AED ${Number(salaryResult.marketMin || 0).toLocaleString()}`],
                  ["Market Average", `AED ${Number(salaryResult.marketAverage || 0).toLocaleString()}`],
                  ["Market Maximum", `AED ${Number(salaryResult.marketMax || 0).toLocaleString()}`],
                  ["Assessment", String(salaryResult.assessment || "")],
                  ["Recommendation", String(salaryResult.recommendation || "")],
                  ["Gratuity Note", String(salaryResult.gratuityNote || "")],
                ]
                  .filter(([, v]) => v && v !== "AED 0")
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>{value}</span>
                    </div>
                  ))}
                {salaryResult.raw && (
                  <div style={{ padding: 14, background: "#f5f6fa", borderRadius: 8 }}>
                    <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {salaryResult.raw}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#f5f6fa",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Briefcase size={48} color="#ccc" />
              <p style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
                Fill in the form and click Analyze Salary to get UAE market insights
              </p>
            </div>
          )}
        </div>
      )}

      {/* Job Description Tab */}
      {activeTab === "jd" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <FileText size={20} color="#00732F" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                Job Description Generator
              </h3>
            </div>
            <form onSubmit={handleJD}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Job Title</label>
                  <input
                    required
                    value={jdForm.designation}
                    onChange={(e) => setJdForm({ ...jdForm, designation: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input
                    required
                    value={jdForm.department}
                    onChange={(e) => setJdForm({ ...jdForm, department: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Information Technology"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Key Requirements</label>
                  <textarea
                    required
                    value={jdForm.requirements}
                    onChange={(e) => setJdForm({ ...jdForm, requirements: e.target.value })}
                    rows={4}
                    placeholder="e.g. 5+ years experience, React, Node.js, UAE driving license..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={jdLoading}
                  style={{
                    padding: "12px",
                    background: jdLoading ? "#a0bea0" : "#00732F",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: jdLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {jdLoading ? "Generating..." : "Generate Job Description"}
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              maxHeight: 600,
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>
              Generated Job Description
            </h3>
            {jdResult ? (
              <>
                <div
                  style={{
                    fontSize: 14,
                    color: "#333",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {jdResult}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jdResult);
                    toast.success("Copied to clipboard!");
                  }}
                  style={{
                    marginTop: 16,
                    padding: "10px 18px",
                    background: "#e6f4ed",
                    color: "#00732F",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy to Clipboard
                </button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <FileText size={48} color="#ccc" />
                <p style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
                  Fill in the form to generate a professional UAE job description
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
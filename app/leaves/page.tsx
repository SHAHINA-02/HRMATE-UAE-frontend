"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Leave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  comments: string;
  created_at: string;
  employees: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    employee_id: "",
    leave_type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const query = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const { data } = await api.get(`/api/leaves${query}`);
      setLeaves(data.leaves);
    } catch {
      toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/api/employees");
      setEmployees(data.employees);
    } catch {
      console.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/leaves", form);
      toast.success("Leave application submitted!");
      setShowModal(false);
      setForm({
        employee_id: "",
        leave_type: "annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
      fetchLeaves();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to submit leave");
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}!`);
      fetchLeaves();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const statusColor = (status: string) =>
    ({
      pending: { bg: "#FEF3C7", color: "#D97706" },
      approved: { bg: "#e6f4ed", color: "#00732F" },
      rejected: { bg: "#fdecea", color: "#C8102E" },
    }[status] || { bg: "#f5f6fa", color: "#888" });

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
    <DashboardLayout title="Leave Management">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1.5px solid",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                borderColor: filterStatus === s ? "#00732F" : "#e5e7eb",
                background: filterStatus === s ? "#00732F" : "#fff",
                color: filterStatus === s ? "#fff" : "#555",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#00732F",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* UAE Leave Policy Notice */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 13, color: "#1d4ed8", margin: 0 }}>
          <strong>UAE Labour Law:</strong> Employees are entitled to 30 days
          annual leave after 1 year of service. Sick leave: 15 days full pay,
          30 days half pay, 45 days no pay.
        </p>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f6fa" }}>
              {[
                "Employee",
                "Leave Type",
                "Duration",
                "Days",
                "Reason",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  Loading leaves...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  No leave records found.
                </td>
              </tr>
            ) : (
              leaves.map((leave, i) => {
                const sc = statusColor(leave.status);
                return (
                  <tr
                    key={leave.id}
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {leave.employees?.first_name}{" "}
                        {leave.employees?.last_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {leave.employees?.department}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: "#f0f4f0",
                          color: "#555",
                          textTransform: "capitalize",
                        }}
                      >
                        {leave.leave_type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#555",
                      }}
                    >
                      {leave.start_date?.split("T")[0]} →{" "}
                      {leave.end_date?.split("T")[0]}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {leave.days}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#555",
                        maxWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {leave.reason}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {leave.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() =>
                              handleStatus(leave.id, "approved")
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#e6f4ed",
                              border: "none",
                              borderRadius: 6,
                              padding: "6px 10px",
                              cursor: "pointer",
                              color: "#00732F",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatus(leave.id, "rejected")
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#fdecea",
                              border: "none",
                              borderRadius: 6,
                              padding: "6px 10px",
                              cursor: "pointer",
                              color: "#C8102E",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}
              >
                Apply for Leave
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>
                    Employee ({employees.length} available)
                  </label>
                  <select
                    required
                    value={form.employee_id}
                    onChange={(e) =>
                      setForm({ ...form, employee_id: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      {employees.length === 0
                        ? "No employees found — add employees first"
                        : "Select Employee"}
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p style={{ fontSize: 12, color: "#C8102E", marginTop: 4 }}>
                      Please add employees first from the Employees page.
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Leave Type</label>
                  <select
                    value={form.leave_type}
                    onChange={(e) =>
                      setForm({ ...form, leave_type: e.target.value })
                    }
                    style={inputStyle}
                  >
                    {[
                      "annual",
                      "sick",
                      "emergency",
                      "unpaid",
                      "maternity",
                      "paternity",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input
                      type="date"
                      required
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input
                      type="date"
                      required
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Reason</label>
                  <textarea
                    required
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={employees.length === 0}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background:
                        employees.length === 0 ? "#a0bea0" : "#00732F",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor:
                        employees.length === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "12px 24px",
                      background: "#f5f6fa",
                      color: "#555",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
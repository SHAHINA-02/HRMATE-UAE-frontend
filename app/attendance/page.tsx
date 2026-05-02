"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Clock, CheckCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface Attendance {
  id: string;
  date: string;
  check_in: string;
  check_out: string;
  hours_worked: number;
  overtime_hours: number;
  status: string;
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

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<{
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalOvertime: number;
  } | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const query = selectedEmployee ? `?employee_id=${selectedEmployee}` : "";
      const { data } = await api.get(`/api/attendance${query}`);
      setAttendance(data.attendance);
    } catch {
      toast.error("Failed to fetch attendance");
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
    fetchAttendance();
    fetchEmployees();
  }, [selectedEmployee]);

  const handleCheckIn = async (employeeId: string) => {
    try {
      await api.post("/api/attendance/checkin", { employee_id: employeeId });
      toast.success("Check-in recorded!");
      fetchAttendance();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Check-in failed");
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    try {
      await api.post("/api/attendance/checkout", { employee_id: employeeId });
      toast.success("Check-out recorded!");
      fetchAttendance();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Check-out failed");
    }
  };

  const fetchReport = async () => {
    try {
      const { data } = await api.get(
        `/api/attendance/report/${reportMonth}/${reportYear}`
      );
      setReport(data.summary);
      toast.success("Report generated!");
    } catch {
      toast.error("Failed to generate report");
    }
  };

  const statusColor = (status: string) =>
    ({
      present: { bg: "#e6f4ed", color: "#00732F" },
      absent: { bg: "#fdecea", color: "#C8102E" },
      late: { bg: "#FEF3C7", color: "#D97706" },
      "half-day": { bg: "#eff6ff", color: "#3B82F6" },
    }[status] || { bg: "#f5f6fa", color: "#888" });

  const formatTime = (time: string) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-AE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout title="Attendance">
      {/* Quick Check In/Out */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h3
          style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}
        >
          Quick Attendance
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#555",
                display: "block",
                marginBottom: 5,
              }}
            >
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 7,
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          {selectedEmployee && (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleCheckIn(selectedEmployee)}
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
                <CheckCircle size={16} /> Check In
              </button>
              <button
                onClick={() => handleCheckOut(selectedEmployee)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#C8102E",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} /> Check Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Report */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h3
          style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}
        >
          Monthly Report
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#555",
                display: "block",
                marginBottom: 5,
              }}
            >
              Month
            </label>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              style={{
                padding: "9px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            >
              {[
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec",
              ].map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#555",
                display: "block",
                marginBottom: 5,
              }}
            >
              Year
            </label>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              style={{
                padding: "9px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchReport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Clock size={16} /> Generate Report
          </button>
        </div>

        {report && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              { label: "Present", value: report.totalPresent, color: "#00732F", bg: "#e6f4ed" },
              { label: "Absent", value: report.totalAbsent, color: "#C8102E", bg: "#fdecea" },
              { label: "Late", value: report.totalLate, color: "#D97706", bg: "#FEF3C7" },
              { label: "Overtime Hrs", value: report.totalOvertime?.toFixed(1), color: "#3B82F6", bg: "#eff6ff" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: card.bg,
                  borderRadius: 10,
                  padding: "14px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Table */}
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
                "Employee","Date","Check In","Check Out",
                "Hours","Overtime","Status",
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
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                  Loading attendance...
                </td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              attendance.map((rec, i) => {
                const sc = statusColor(rec.status);
                return (
                  <tr
                    key={rec.id}
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                        {rec.employees?.first_name} {rec.employees?.last_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {rec.employees?.department}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>
                      {rec.date?.split("T")[0]}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>
                      {formatTime(rec.check_in)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>
                      {formatTime(rec.check_out)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>
                      {rec.hours_worked ? `${rec.hours_worked}h` : "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: rec.overtime_hours > 0 ? "#D97706" : "#555",
                        fontWeight: rec.overtime_hours > 0 ? 600 : 400,
                      }}
                    >
                      {rec.overtime_hours > 0 ? `+${rec.overtime_hours}h` : "-"}
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
                          textTransform: "capitalize",
                        }}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
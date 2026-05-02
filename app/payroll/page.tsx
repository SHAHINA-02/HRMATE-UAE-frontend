"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { DollarSign, Download, CheckCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface Payroll {
  id: string;
  month: number;
  year: number;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowance: number;
  overtime_amount: number;
  total_deductions: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  wps_status: string;
  employees: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    designation: string;
  };
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/payroll?month=${month}&year=${year}`);
      setPayrolls(data.payrolls);
    } catch { toast.error("Failed to fetch payroll"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayrolls(); }, [month, year]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post("/api/payroll/generate", { month, year });
      toast.success(data.message);
      fetchPayrolls();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to generate payroll");
    } finally { setGenerating(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/api/payroll/${id}/approve`);
      toast.success("Payroll approved!");
      fetchPayrolls();
    } catch { toast.error("Failed to approve"); }
  };

  const handleWPS = async () => {
    try {
      const response = await api.get(`/api/payroll/wps/${month}/${year}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `WPS_${month}_${year}.sif`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("WPS SIF file downloaded!");
    } catch { toast.error("No approved payrolls for WPS export"); }
  };

  const totalNet = payrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0);
  const totalGross = payrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0);

  return (
    <DashboardLayout title="Payroll & WPS">
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            style={{ padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleWPS}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff", color: "#00732F", border: "1.5px solid #00732F", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <Download size={16} /> Export WPS SIF
          </button>
          <button onClick={handleGenerate} disabled={generating}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: generating ? "#a0bea0" : "#00732F", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: generating ? "not-allowed" : "pointer" }}>
            <DollarSign size={16} /> {generating ? "Generating..." : "Generate Payroll"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Employees", value: payrolls.length, color: "#3B82F6", bg: "#eff6ff" },
          { label: "Total Gross", value: `AED ${totalGross.toLocaleString()}`, color: "#D97706", bg: "#FEF3C7" },
          { label: "Total Net Payroll", value: `AED ${totalNet.toLocaleString()}`, color: "#00732F", bg: "#e6f4ed" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* WPS Notice */}
      <div style={{ background: "#e6f4ed", border: "1px solid #b3d9c2", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <FileText size={18} color="#00732F" />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#00732F" }}>WPS Compliance: </span>
          <span style={{ fontSize: 13, color: "#555" }}>Generate payroll, approve all records, then export WPS SIF file for UAE Central Bank submission. Salaries must be paid within 10 days of month end.</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f6fa" }}>
              {["Employee", "Department", "Basic", "Allowances", "Overtime", "Deductions", "Net Salary", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading payroll...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#888" }}>No payroll records. Click Generate Payroll to create records for {MONTHS[month - 1]} {year}.</td></tr>
            ) : payrolls.map((p, i) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{p.employees?.first_name} {p.employees?.last_name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{p.employees?.employee_id}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{p.employees?.department}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a" }}>AED {(p.basic_salary || 0).toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a" }}>AED {((p.housing_allowance || 0) + (p.transport_allowance || 0) + (p.other_allowance || 0)).toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#D97706" }}>AED {(p.overtime_amount || 0).toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#C8102E" }}>AED {(p.total_deductions || 0).toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#00732F" }}>AED {(p.net_salary || 0).toLocaleString()}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: p.status === "approved" ? "#e6f4ed" : p.status === "paid" ? "#eff6ff" : "#FEF3C7",
                    color: p.status === "approved" ? "#00732F" : p.status === "paid" ? "#3B82F6" : "#D97706",
                  }}>{p.status.toUpperCase()}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {p.status === "draft" && (
                    <button onClick={() => handleApprove(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#e6f4ed", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#00732F", fontSize: 12, fontWeight: 600 }}>
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
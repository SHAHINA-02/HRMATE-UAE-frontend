"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Plus, Search, Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  department: string;
  designation: string;
  employment_type: string;
  join_date: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowance: number;
  is_active: boolean;
  visa_expiry: string;
  emirates_id_expiry: string;
  passport_expiry: string;
}

const DEPARTMENTS = ["IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal", "Admin"];
const NATIONALITIES = ["UAE", "Indian", "Pakistani", "Filipino", "Egyptian", "British", "American", "Other"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    nationality: "", department: "", designation: "",
    employment_type: "full-time", join_date: "",
    basic_salary: "", housing_allowance: "", transport_allowance: "", other_allowance: "",
    bank_name: "", iban: "",
    passport_number: "", passport_expiry: "",
    emirates_id: "", emirates_id_expiry: "",
    visa_number: "", visa_expiry: "",
  });

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get(`/api/employees?search=${search}`);
      setEmployees(data.employees);
    } catch { toast.error("Failed to fetch employees"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.put(`/api/employees/${selected.id}`, form);
        toast.success("Employee updated successfully!");
      } else {
        await api.post("/api/employees", form);
        toast.success("Employee added successfully!");
      }
      setShowModal(false);
      setSelected(null);
      resetForm();
      fetchEmployees();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save employee");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this employee?")) return;
    try {
      await api.delete(`/api/employees/${id}`);
      toast.success("Employee deactivated");
      fetchEmployees();
    } catch { toast.error("Failed to deactivate"); }
  };

  const resetForm = () => setForm({
    first_name: "", last_name: "", email: "", phone: "",
    nationality: "", department: "", designation: "",
    employment_type: "full-time", join_date: "",
    basic_salary: "", housing_allowance: "", transport_allowance: "", other_allowance: "",
    bank_name: "", iban: "",
    passport_number: "", passport_expiry: "",
    emirates_id: "", emirates_id_expiry: "",
    visa_number: "", visa_expiry: "",
  });

  const handleEdit = (emp: Employee) => {
    setSelected(emp);
    setForm({
      first_name: emp.first_name, last_name: emp.last_name,
      email: emp.email, phone: emp.phone || "",
      nationality: emp.nationality || "", department: emp.department,
      designation: emp.designation, employment_type: emp.employment_type,
      join_date: emp.join_date?.split("T")[0] || "",
      basic_salary: String(emp.basic_salary), housing_allowance: String(emp.housing_allowance),
      transport_allowance: String(emp.transport_allowance), other_allowance: String(emp.other_allowance),
      bank_name: "", iban: "", passport_number: "", passport_expiry: "",
      emirates_id: "", emirates_id_expiry: "", visa_number: "", visa_expiry: "",
    });
    setShowModal(true);
  };

  const totalSalary = (emp: Employee) => (emp.basic_salary || 0) + (emp.housing_allowance || 0) + (emp.transport_allowance || 0) + (emp.other_allowance || 0);

  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 };

  return (
    <DashboardLayout title="Employee Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 14px" }}>
            <Search size={16} color="#888" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
              style={{ border: "none", outline: "none", fontSize: 14, width: 220 }} />
          </div>
        </div>
        <button onClick={() => { setSelected(null); resetForm(); setShowModal(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#00732F", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f6fa" }}>
              {["Employee ID", "Name", "Department", "Designation", "Total Salary", "Documents", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888" }}>No employees found. Add your first employee!</td></tr>
            ) : employees.map((emp, i) => (
              <tr key={emp.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#00732F" }}>{emp.employee_id}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{emp.first_name} {emp.last_name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{emp.email}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{emp.department}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{emp.designation}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>AED {totalSalary(emp).toLocaleString()}</td>
                <td style={{ padding: "12px 16px" }}>
                  {(isExpiringSoon(emp.visa_expiry) || isExpiringSoon(emp.emirates_id_expiry) || isExpiringSoon(emp.passport_expiry)) ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#C8102E", fontSize: 12, fontWeight: 600 }}>
                      <AlertTriangle size={14} /> Expiring Soon
                    </span>
                  ) : (
                    <span style={{ color: "#00732F", fontSize: 12, fontWeight: 600 }}>✓ Valid</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setSelected(emp); setShowView(true); }}
                      style={{ background: "#eff6ff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#3B82F6" }}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleEdit(emp)}
                      style={{ background: "#e6f4ed", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#00732F" }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)}
                      style={{ background: "#fdecea", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#C8102E" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{selected ? "Edit Employee" : "Add New Employee"}</h2>
              <button onClick={() => { setShowModal(false); setSelected(null); }} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00732F", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Personal Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["first_name", "First Name", "text"], ["last_name", "Last Name", "text"], ["email", "Email", "email"], ["phone", "Phone", "text"]].map(([key, label, type]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} required={key === "first_name" || key === "last_name" || key === "email"}
                        value={(form as Record<string, string>)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Nationality</label>
                    <select value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} style={inputStyle}>
                      <option value="">Select</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Join Date</label>
                    <input type="date" required value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00732F", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Job Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <select required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inputStyle}>
                      <option value="">Select</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Designation</label>
                    <input required value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Employment Type</label>
                    <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} style={inputStyle}>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00732F", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Salary (AED)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["basic_salary", "Basic Salary"], ["housing_allowance", "Housing Allowance"], ["transport_allowance", "Transport Allowance"], ["other_allowance", "Other Allowance"]].map(([key, label]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="number" required={key === "basic_salary"}
                        value={(form as Record<string, string>)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00732F", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Bank Details (WPS)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["bank_name", "Bank Name"], ["iban", "IBAN Number"]].map(([key, label]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00732F", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Documents</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["passport_number", "Passport Number", "text"], ["passport_expiry", "Passport Expiry", "date"], ["emirates_id", "Emirates ID", "text"], ["emirates_id_expiry", "Emirates ID Expiry", "date"], ["visa_number", "Visa Number", "text"], ["visa_expiry", "Visa Expiry", "date"]].map(([key, label, type]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#00732F", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                  {selected ? "Update Employee" : "Add Employee"}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setSelected(null); }}
                  style={{ padding: "12px 24px", background: "#f5f6fa", color: "#555", border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Employee Details</h2>
              <button onClick={() => setShowView(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: "#f5f6fa", borderRadius: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#00732F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>
                {selected.first_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{selected.first_name} {selected.last_name}</div>
                <div style={{ fontSize: 14, color: "#888" }}>{selected.designation} — {selected.department}</div>
                <div style={{ fontSize: 12, color: "#00732F", fontWeight: 600 }}>{selected.employee_id}</div>
              </div>
            </div>
            {[
              ["Email", selected.email],
              ["Phone", selected.phone],
              ["Nationality", selected.nationality],
              ["Employment Type", selected.employment_type],
              ["Join Date", selected.join_date?.split("T")[0]],
              ["Basic Salary", `AED ${(selected.basic_salary || 0).toLocaleString()}`],
              ["Total Salary", `AED ${totalSalary(selected).toLocaleString()}`],
              ["Visa Expiry", selected.visa_expiry?.split("T")[0]],
              ["Emirates ID Expiry", selected.emirates_id_expiry?.split("T")[0]],
              ["Passport Expiry", selected.passport_expiry?.split("T")[0]],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, color: "#888", minWidth: 160 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
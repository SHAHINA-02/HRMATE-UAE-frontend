"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Users, DollarSign, Calendar, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#00732F", "#C8102E", "#D97706", "#3B82F6", "#8B5CF6", "#EC4899"];

interface DeptStat {
  department: string;
  count: number;
  avgSalary: number;
}

interface Stats {
  totalEmployees?: number;
  totalPayroll?: number;
  pendingLeaves?: number;
  presentToday?: number;
  newThisMonth?: number;
  expiringDocs?: number;
}

interface PayrollChart {
  month: string;
  total: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [payrollChart, setPayrollChart] = useState<PayrollChart[]>([]);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, payrollRes, deptRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/payroll-chart"),
          api.get("/api/dashboard/department-stats"),
        ]);
        setStats(statsRes.data);
        setPayrollChart(payrollRes.data);
        setDeptStats(deptRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees || 0, icon: Users, color: "#00732F", bg: "#e6f4ed" },
    { label: "Monthly Payroll", value: `AED ${(stats.totalPayroll || 0).toLocaleString()}`, icon: DollarSign, color: "#3B82F6", bg: "#eff6ff" },
    { label: "Pending Leaves", value: stats.pendingLeaves || 0, icon: Calendar, color: "#D97706", bg: "#FEF3C7" },
    { label: "Present Today", value: stats.presentToday || 0, icon: Clock, color: "#8B5CF6", bg: "#f3f0ff" },
    { label: "New This Month", value: stats.newThisMonth || 0, icon: TrendingUp, color: "#00732F", bg: "#e6f4ed" },
    { label: "Expiring Docs", value: stats.expiringDocs || 0, icon: AlertTriangle, color: "#C8102E", bg: "#fdecea" },
  ];

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div style={{ color: "#888", fontSize: 16 }}>Loading dashboard...</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Dashboard">
      {/* UAE Banner */}
      <div style={{ background: "linear-gradient(135deg, #00732F, #004d20)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Welcome to HRMate UAE</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "4px 0 0" }}>WPS Compliant HR & Payroll Management System</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["UAE Labour Law", "WPS Ready", "MOHRE Compliant"].map(badge => (
            <span key={badge} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)" }}>{badge}</span>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={22} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{card.value}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 20 }}>Monthly Payroll (AED)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={payrollChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [`AED ${Number(value).toLocaleString()}`, "Payroll"]} />
              <Bar dataKey="total" fill="#00732F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 20 }}>Employees by Department</h3>
          {deptStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deptStats} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={80}>
                    {deptStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {deptStats.map((dept, index) => (
                  <div key={dept.department} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#555", flex: 1 }}>{dept.department}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{dept.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 14 }}>
              No department data yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";
import {
  LayoutDashboard, Users, DollarSign, Calendar,
  Clock, Bot, LogOut, Building2, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/payroll", label: "Payroll & WPS", icon: DollarSign },
  { href: "/leaves", label: "Leave Management", icon: Calendar },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/ai", label: "AI HR Assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div style={{ width: collapsed ? 70 : 240, minHeight: "100vh", background: "#00732F", display: "flex", flexDirection: "column", transition: "width 0.3s", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 color="#fff" size={24} />
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>HRMate UAE</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>WPS COMPLIANT</div>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 8px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, marginBottom: 4,
              background: active ? "rgba(255,255,255,0.2)" : "transparent",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        {!collapsed && user && (
          <div style={{ padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, textTransform: "uppercase" }}>{user.role}</div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%",
          padding: "10px 12px", borderRadius: 8, background: "transparent",
          border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 14,
        }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
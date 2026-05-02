"use client";
import { Bell, Search } from "lucide-react";
import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";

export default function Header({ title }: { title: string }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f6fa", borderRadius: 8, padding: "8px 12px" }}>
          <Search size={16} color="#888" />
          <input placeholder="Search..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "#333", width: 180 }} />
        </div>
        <button style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative" }}>
          <Bell size={20} color="#555" />
          <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#C8102E" }} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#00732F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </div>
  );
}
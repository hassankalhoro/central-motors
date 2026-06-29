"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar role={user.role} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar user={user} onMenu={() => setOpen(true)} />
        <main className="px-5 py-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

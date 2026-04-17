"use client";

import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  return {
    session,
    status,
    userId,
    role,
    isAuthenticated: status === "authenticated" && !!session,
    isSuperAdmin: role === "superadmin",
    isAdmin: role === "superadmin" || role === "admin",
    isLoading: status === "loading",
  };
}

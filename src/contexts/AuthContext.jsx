import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
const apiUrl = import.meta.env.VITE_API_URL;
const AuthContext = createContext(null);
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function AuthProvider({ children }) {
  const nav = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Fetch failed");
      }
      return res.json();
    },
    retry: false, // không retry khi 401
  });

  useEffect(() => {
    if (isError && error?.message === "Unauthorized") {
      if (!publicRoutes.includes(window.location.pathname)) {
        nav("/login", { replace: true });
      }
    }
  }, [isError, error, nav]);

  useEffect(() => {
    if (data && !isLoading) {
      setAuthUser(data);
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

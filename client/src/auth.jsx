import { useEffect, useMemo, useState } from "react";
import { api, getApiError, TOKEN_KEY } from "./api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(window.localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const onSessionExpired = () => setUser(null);
    window.addEventListener("session:expired", onSessionExpired);

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return () => window.removeEventListener("session:expired", onSessionExpired);

    api
      .get("/auth/me")
      .then(({ data }) => {
        const currentUser = data?.data;
        if (!currentUser) {
          throw new Error("The backend did not return the current user.");
        }
        setUser(currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => window.removeEventListener("session:expired", onSessionExpired);
  }, []);

  async function login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const token = data?.data?.token;

      if (!token) {
        throw new Error("The backend login response did not include a token.");
      }

      window.localStorage.setItem(TOKEN_KEY, token);
      const profile = await api.get("/auth/me");
      const currentUser = profile.data?.data;

      if (!currentUser) {
        throw new Error("The backend did not return the signed-in user.");
      }

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw new Error(getApiError(error, "Unable to sign in."));
    }
  }

  async function refreshUser() {
    const { data } = await api.get("/auth/me");
    const currentUser = data?.data;

    if (!currentUser) {
      throw new Error("The backend did not return the current user.");
    }

    setUser(currentUser);
    return currentUser;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

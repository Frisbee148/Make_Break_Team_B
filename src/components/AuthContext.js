import React, { createContext, useState, useEffect } from "react";
import { onAuthChange } from "../firebase";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return () => unsub();
  }, []);
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

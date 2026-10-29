import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "pegboard:user";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);
    if (
      !user ||
      typeof user.id !== "string" ||
      typeof user.username !== "string"
    ) {
      throw new Error("Stored user data is invalid.");
    }

    return user;
  } catch (error) {
    console.error("Could not restore the logged-in user:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Could not persist the logged-in user:", error);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}

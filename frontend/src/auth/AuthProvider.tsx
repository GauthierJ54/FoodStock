import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { useNavigate } from "react-router-dom";


type AuthMessage =
  | { type: "LOGIN"; token: string; username: string }
  | { type: "LOGOUT" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("token_channel");
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<AuthMessage>) => {
      if (event.data.type === "LOGIN") {
        setToken(event.data.token);
        setUsername(event.data.username);
        navigate("/");
      }

      if (event.data.type === "LOGOUT") {
        setToken(null);
        setUsername(null);
        navigate("/login");
      }
    };

    return () => channel.close();
  }, [navigate]);

  const login = (token: string, username: string) => {
    setToken(token);
    setUsername(username);

    channelRef.current?.postMessage({
      type: "LOGIN",
      token,
      username,
    });
  };

  const logout = () => {
    setToken(null);
    setUsername(null);

    channelRef.current?.postMessage({
      type: "LOGOUT",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
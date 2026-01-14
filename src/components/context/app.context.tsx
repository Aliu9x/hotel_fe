import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchAccountApi } from "@/services/api";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "HOTEL_OWNER" | "CUSTOMER";
  avatar?: string;
  fullname: string;
} | null;

type AppContextType = {
  isAuthenticated: boolean | null; // null = chưa biết, đang bootstrap
  setIsAuthenticated: (v: boolean) => void;
  user: User;
  setUser: (u: User) => void;
  isAppLoading: boolean; // true khi đang bootstrap
  setIsAppLoading: (v: boolean) => void;
  refreshAccount: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  const refreshAccount = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAppLoading(false);
      return;
    }

    setIsAppLoading(true);
    try {
      const res = await fetchAccountApi();
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsAppLoading(false);
    }
  };

  useEffect(() => {
    // Bootstrap ngay khi app mount
    refreshAccount();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated: (v: boolean) => setIsAuthenticated(v),
      user,
      setUser,
      isAppLoading,
      setIsAppLoading,
      refreshAccount,
    }),
    [isAuthenticated, user, isAppLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useCurrentApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useCurrentApp must be used within AppProvider");
  return ctx;
};

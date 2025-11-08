import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface WireModeContextValue {
  wireMode: boolean;
  toggleWireMode: () => void;
  setWireMode: (value: boolean) => void;
}

const WireModeContext = createContext<WireModeContextValue | undefined>(undefined);

export function WireModeProvider({ children }: { children: ReactNode }) {
  const [wireMode, setWireMode] = useState(false);

  const toggleWireMode = useCallback(() => {
    setWireMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ wireMode, toggleWireMode, setWireMode }),
    [wireMode, toggleWireMode, setWireMode]
  );

  return <WireModeContext.Provider value={value}>{children}</WireModeContext.Provider>;
}

export function useWireMode() {
  const context = useContext(WireModeContext);
  if (!context) {
    throw new Error("useWireMode must be used within a WireModeProvider");
  }
  return context;
}

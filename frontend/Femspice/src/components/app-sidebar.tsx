import type { ComponentType, DragEvent } from "react"
import { Activity, Settings, Zap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useWireMode } from "@/context/wire-mode-context"
import capacitorIcon from "@/assets/componentsIcons/capacitor.png"
import capacitorIconWhite from "@/assets/componentsIcons/capcitor_white.png"
import inductorIcon from "@/assets/componentsIcons/inductor.png"
import inductorIconWhite from "@/assets/componentsIcons/inductor_white.png"
import pulseSourceIcon from "@/assets/componentsIcons/pulse_source.png"
import pulseSourceIconWhite from "@/assets/componentsIcons/pulse_source_white.png"
import resistorIcon from "@/assets/componentsIcons/Resistor.png"
import resistorIconWhite from "@/assets/componentsIcons/Resistor_white.png"
import{ Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { PulseSettings } from "@/electric_components/PulseVoltageSourceNode"
type AppSidebarProps = {
  onRunCircuit?: () => void
  mode?: "dc" | "ac"
  onModeChange?: (mode: "dc" | "ac") => void
  onSaveCircuit?: () => void
  onClearCircuit?: () => void
  id ?: string
}

type ComponentPaletteItem = {
  title: string
  type: string
  value?: number
  icon?: ComponentType<{ className?: string }>
  imageSrc?: string
  imageSrcDark?: string
  pulseSettings?: PulseSettings
}




const componentPalette: ComponentPaletteItem[] = [
  {
    title: "Voltage Source",
    type: "voltageSource",
    value: 5,
    icon: Zap,
  },
  {
    title: "Resistor",
    type: "resistor",
    value: 1000,
    imageSrc: resistorIcon,
    imageSrcDark: resistorIconWhite,
  },
  {
    title: "Capacitor",
    type: "capacitor",
    value: 1e-6,
    imageSrc: capacitorIcon,
    imageSrcDark: capacitorIconWhite,
  },
  {
    title: "Inductor",
    type: "inductor",
    value: 0.01,
    imageSrc: inductorIcon,
    imageSrcDark: inductorIconWhite,
  },
  {
    title: "Current Source",
    type: "currentSource",
    value: 5,
    icon: Activity,
  },
  {
    title: "Pulse Voltage Source",
    type: "pulseVoltageSource",
    imageSrc: pulseSourceIcon,
    imageSrcDark: pulseSourceIconWhite,
    pulseSettings: {
      initialValue: 0,
      pulseValue: 10,
      pulseWidth: 0.01,
      period: 0.02,
    },
  },
  {
    title: "Ground",
    type: "ground",
    icon: Settings,
  },
]

export function AppSidebar({ id , onSaveCircuit, onClearCircuit, onRunCircuit, mode = "dc", onModeChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("User");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });
  useEffect(() => {
    const storedName = localStorage.getItem("sub");
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    updateMode();

    const observer = new MutationObserver(updateMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  const { wireMode, toggleWireMode } = useWireMode();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  const themedPalette = useMemo(
    () =>
      componentPalette.map((component) => ({
        ...component,
        imageSrc: isDarkMode
          ? component.imageSrcDark ?? component.imageSrc
          : component.imageSrc,
      })),
    [isDarkMode],
  );
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    component: ComponentPaletteItem
  ) => {
    event.dataTransfer.setData(
      "application/femspice-component",
      JSON.stringify({
        type: component.type,
        value: component.value,
        title: component.title,
        pulseSettings: component.pulseSettings,
      })
    )
    event.dataTransfer.effectAllowed = "move"
  }
  const onLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("sub");
    navigate("/login", { replace: true });
  }, [navigate]);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent className="overflow-y-auto gap-4 p-2">
            <div className="flex flex-col gap-3">
              <Button
                variant={wireMode ? "default" : "outline"}
                onClick={toggleWireMode}
              >
                {wireMode ? "Wire Mode: On" : "Wire Mode: Off"}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mode === "dc" ? "default" : "outline"}
                  onClick={() => onModeChange?.("dc")}
                >
                  DC Mode
                </Button>
                <Button
                  variant={mode === "ac" ? "default" : "outline"}
                  onClick={() => onModeChange?.("ac")}
                >
                  AC Mode
                </Button>
              </div>
              <SidebarMenu>
                {themedPalette.map((component) => (
                  <SidebarMenuItem key={component.type}>
                    <SidebarMenuButton
                      draggable
                      onDragStart={(event) => handleDragStart(event, component)}
                    >
                      {component.icon ? (
                        <component.icon className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-white" : ""}`} />
                      ) : component.imageSrc ? (
                        <img
                          src={component.imageSrc}
                          alt={`${component.title} icon`}
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                      ) : null}
                      <span className="ml-2 flex-1 text-left">{component.title}</span>
                      {component.value !== undefined ? (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {component.value}
                        </span>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <div className="gap-2 flex flex-col">
                {onRunCircuit ? (
                <Button className="w-full" onClick={onRunCircuit}>
                  Run Circuit
                </Button>
              ) : null}
              {onSaveCircuit ? (
                <Button className="w-full" variant="secondary" onClick={onSaveCircuit}>
                  Save Circuit
                </Button>
              ) : null}
              {onClearCircuit ? (
                <Button className="w-full" variant="destructive" onClick={onClearCircuit}>
                  Clear All
                </Button>
              ) : null}
              </div>
              
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 w-full">
          <Link to={`/profile?id=${id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${displayName}`} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Hi,</p>
            <p className="truncate text-sm font-medium">{displayName}</p>
          </div>
          <Button variant="outline" className="ml-auto" onClick={onLogout}>Logout</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

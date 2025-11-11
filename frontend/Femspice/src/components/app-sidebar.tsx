import type { ComponentType, DragEvent } from "react"
import { Calendar, Home, Inbox, Search, Settings, Zap } from "lucide-react"
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
import inductorIcon from "@/assets/componentsIcons/inductor.png"
import resistorIcon from "@/assets/componentsIcons/Resistor.png"
import{ Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
type AppSidebarProps = {
  onRunCircuit?: () => void
  mode?: "dc" | "ac"
  onModeChange?: (mode: "dc" | "ac") => void
}

type ComponentPaletteItem = {
  title: string
  type: string
  value?: number
  icon?: ComponentType<{ className?: string }>
  imageSrc?: string
}

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]


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
  },
  {
    title: "Capacitor",
    type: "capacitor",
    value: 1e-6,
    imageSrc: capacitorIcon,
  },
  {
    title: "Inductor",
    type: "inductor",
    value: 0.01,
    imageSrc: inductorIcon,
  },
]

export function AppSidebar({ onRunCircuit, mode = "dc", onModeChange }: AppSidebarProps) {
  const [displayName, setDisplayName] = useState("User");
  useEffect(() => {
    const storedName = localStorage.getItem("sub");
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);
  const { wireMode, toggleWireMode } = useWireMode();

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    component: ComponentPaletteItem
  ) => {
    event.dataTransfer.setData(
      "application/femspice-component",
      JSON.stringify({ type: component.type, value: component.value, title: component.title })
    )
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                {componentPalette.map((component) => (
                  <SidebarMenuItem key={component.type}>
                    <SidebarMenuButton
                      draggable
                      onDragStart={(event) => handleDragStart(event, component)}
                    >
                      {component.icon ? (
                        <component.icon className="h-4 w-4 shrink-0" />
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
              {onRunCircuit ? (
                <Button className="w-full" onClick={onRunCircuit}>
                  Run Circuit
                </Button>
              ) : null}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${displayName}`} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Hi,</p>
            <p className="truncate text-sm font-medium">{displayName}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

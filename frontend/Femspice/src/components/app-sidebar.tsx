import type { ComponentType, DragEvent } from "react"
import { Calendar, Home, Inbox, Search, Settings, Zap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
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

type AppSidebarProps = {
  onRunCircuit?: () => void
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

export function AppSidebar({ onRunCircuit }: AppSidebarProps) {
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
    </Sidebar>
  )
}

import type { ComponentType, DragEvent } from "react"
import { Calendar, Home, Inbox, Search, Settings, Zap, Square } from "lucide-react"
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

type ComponentPaletteItem = {
  title: string
  type: string
  value: number
  icon?: ComponentType<{ className?: string }>
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
    icon: Square,
  },
]

export function AppSidebar() {
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
                      ) : null}
                      <span>{component.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {component.value}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

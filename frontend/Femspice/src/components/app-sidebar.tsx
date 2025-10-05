import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import ResistorNode from "@/electric_components/ResistorNode"
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



export function AppSidebar() {
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
          <SidebarGroupContent className="overflow-y-auto gap-20">
            <SidebarMenu>
              <SidebarMenuItem>
                  <div draggable = "true" 
                    className="align-center w-[90%] m-auto"
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "application/reactflow",
                        JSON.stringify({ type: "resistor", label: "Resistor", value: 100 })
                      )
                      event.dataTransfer.effectAllowed = "move"
                      
                    }}>
                    <ResistorPreview />
                  </div>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                  <div draggable = "true" 
                    className="align-center w-[90%] m-auto"
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "application/reactflow",
                        JSON.stringify({ type: "voltageSource", label: "Voltage Source", value: 10 })
                      )
                      event.dataTransfer.effectAllowed = "move"
                    }}>
                    <VoltageSourcePreview />
                  </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function ResistorPreview() {
  return (
        <div className="p-2 border-black-200 border rounded text-center bg-white  cursor-grab hover:cursor-grabbing ">
            <strong>Resistor</strong>
            <p>10 Ω</p>
        </div>
  )
}
function VoltageSourcePreview() {
  return (
        <div className="p-2 border-black-200 border rounded text-center bg-white cursor-grab hover:cursor-grabbing ">
            <strong>Voltage Source</strong>
            <p>10 V</p>
        </div>
  )
}
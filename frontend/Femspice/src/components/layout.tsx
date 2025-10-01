import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b">
                <SidebarTrigger />
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
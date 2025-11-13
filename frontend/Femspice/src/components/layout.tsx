import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SquareMenu, Sun, Moon } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import TutorialModal from "./tutorial";
type LayoutProps = {
  children: React.ReactNode;
  onRunCircuit?: () => void;
  mode?: "dc" | "ac";
  onModeChange?: (mode: "dc" | "ac") => void;
  onSaveCircuit?: () => void;
  onClearCircuit?: () => void;
  id ?: string;
};

export default function Layout({ id, onSaveCircuit, onClearCircuit, children, onRunCircuit, mode, onModeChange }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (

      <SidebarProvider 
        defaultOpen={true}
        style={{
          "--sidebar-width": "300px", 
          "--sidebar-width-mobile": "280px"
        } as React.CSSProperties}
      >
        <div className="flex h-screen w-full">
          <AppSidebar id={id} onRunCircuit={onRunCircuit} mode={mode} onModeChange={onModeChange} onSaveCircuit={onSaveCircuit} onClearCircuit={onClearCircuit}/>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b">
                <SidebarTrigger >
                  {isDark ? <SquareMenu className="h-4 w-4" /> : <SquareMenu className="h-4 w-4" color="black" />}
                </SidebarTrigger>
                <div className="flex-1 justify-center flex flex-row gap-20" >
                  <NavigationMenu viewport={false} className="z-50">
                    <NavigationMenuList className="gap-4">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className=" ">Pages</NavigationMenuTrigger>
                        <NavigationMenuContent className="w-[400px] text-black z-50">
                          <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                            <li>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">Home Page</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Navigate to the main home page
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link
                                to="/home"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    window.location.href = "/home";
                                  }}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                <div className="text-sm font-medium leading-none">Circuit Page</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Fresh new circuit workspace
                                  </p>
                                </Link>
                                
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className=" ">About</NavigationMenuTrigger>
                        <NavigationMenuContent className="w-[400px] text-black z-50">
                          <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                            <li className="w-full">
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/about"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">About Page</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Learn more about our application
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/team"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">Our Team</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Meet the team behind the project
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="">Tutorials</NavigationMenuTrigger>
                        <NavigationMenuContent className="w-[400px] text-black z-50">
                          <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                            <li>
                              <NavigationMenuLink asChild>
                                <button
                                  type="button"
                                  onClick={() => setIsTutorialOpen(true)}
                                  className="w-full select-none space-y-1 rounded-md p-3 text-left leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">Guided Tutorial</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Walk through key features step-by-step.
                                  </p>
                                </button>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-white"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" color="black" />}
                  </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
            <TutorialModal
              isOpen={isTutorialOpen}
              onClose={() => setIsTutorialOpen(false)}
            />
        </div>
      </div>
      </SidebarProvider>
  )
}

// function ListItem({
//   title,
//   children,
//   href,
//   ...props
// }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
//   return (
//     <li {...props}>
//       <NavigationMenuLink asChild>
//         <Link href={href}>
//           <div className="text-sm leading-none font-medium">{title}</div>
//           <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
//             {children}
//           </p>
//         </Link>
//       </NavigationMenuLink>
//     </li>
//   )
// }
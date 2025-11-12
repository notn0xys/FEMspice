import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navigationSections = [
  {
    label: "Product",
    items: [
      {
        title: "Landing Page",
        description: "Discover FEMspice and get started",
        to: "/",
      },
      {
        title: "Circuit Editor",
        description: "Jump into the interactive schematic workspace",
        to: "/home",
      },
      {
        title: "Profile Page",
        description: "Review saved circuits and manage your preferences",
        to: "/profile",
      },
    ],
  },
  {
    label: "About",
    items: [
      {
        title: "About Page",
        description: "Learn more about FEMspice",
        to: "/about",
      },
      {
        title: "Our Team",
        description: "Meet the people behind the project",
        to: "/team",
      },
    ],
  },
  {
    label: "Get Started",
    items: [
      {
        title: "Login",
        description: "Access your FEMspice workspace",
        to: "/login",
      },
      {
        title: "Sign Up",
        description: "Create a new FEMspice account",
        to: "/signup",
      },
    ],
  },
];

export default function PageNav() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const shouldDark = savedTheme === "dark";
      setIsDark(shouldDark);
      document.documentElement.classList.toggle("dark", shouldDark);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-4">
        <div className="flex flex-1 items-center justify-center gap-20">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-4">
              {navigationSections.map((section) => (
                <NavigationMenuItem key={section.label}>
                  <NavigationMenuTrigger>{section.label}</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-[400px] text-foreground">
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      {section.items.map((item) => (
                        <li key={item.to}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.to}
                              className="select-none space-y-1 rounded-md p-3 text-sm leading-snug no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="font-medium leading-none">{item.title}</div>
                              <p className="text-muted-foreground">{item.description}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

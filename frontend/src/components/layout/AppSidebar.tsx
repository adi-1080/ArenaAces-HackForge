
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { BookText, BookOpen, LayoutDashboard, Pen, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Story Generator",
      url: "/generate",
      icon: BookText,
    },
    {
      title: "Plot Analysis",
      url: "/plot-analysis",
      icon: BookOpen,
    },
    {
      title: "Writing Assistant",
      url: "/writing",
      icon: Pen,
    },
    {
      title: "Collaboration",
      url: "/collaboration",
      icon: Users,
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-story-purple" />
          <h1 className="text-xl font-semibold text-story-purple">
            StoryCompanion
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={
                      location.pathname === item.url 
                        ? "bg-sidebar-accent text-primary"
                        : ""
                    }
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          StoryCompanion v0.1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

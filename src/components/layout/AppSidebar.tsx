import { NavLink } from "react-router-dom";
import { Home, Building2, UserCircle, FileText, LogOut, Settings, UserPlus, Library, CheckSquare, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Organisations", url: "/organizations", icon: Building2 },
  { title: "Contacts", url: "/contacts", icon: UserCircle },
  { title: "Tâches", url: "/tasks", icon: CheckSquare },
  { title: "Onboarding", url: "/onboarding", icon: UserPlus },
  { title: "Bibliothèque", url: "/library", icon: Library },
  { title: "Facturation", url: "/invoices", icon: FileText },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Déconnexion réussie" });
    navigate("/auth");
  };
  
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-4">
            {!isCollapsed ? (
              <>
                <BrandLogo className="h-12 w-auto object-contain" />
                <SidebarTrigger />
              </>
            ) : (
              <div className="w-full flex flex-col items-center gap-2">
                <SidebarTrigger />
                <BrandLogo className="h-8 w-8 object-contain" />
              </div>
            )}
          </div>

        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Déconnexion</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}

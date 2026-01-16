import { Users, Wallet, LayoutDashboard, Building2, Calendar, FileText, Settings, LogOut, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "members", label: "Membres", icon: Users },
    { id: "commissions", label: "Commissions", icon: Building2 },
    { id: "events", label: "Événements", icon: Calendar },
    { id: "finance", label: "Finances", icon: Wallet },
    { id: "reports", label: "Rapports", icon: FileText },
  ];

  const adminItems = [{ id: "settings", label: "Paramètres", icon: Settings }];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col shadow-lg z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Star className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm leading-tight">Daara</h1>
            <p className="text-xs text-muted-foreground">Askhaboul Janaty</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn("nav-item w-full", currentPage === item.id && "nav-item-active")}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Administration</p>
            </div>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn("nav-item w-full", currentPage === item.id && "nav-item-active")}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-sm font-medium text-secondary-foreground">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

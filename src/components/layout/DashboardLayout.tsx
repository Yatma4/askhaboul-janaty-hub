import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import Dashboard from '@/pages/Dashboard';
import MembersPage from '@/pages/MembersPage';
import CommissionsPage from '@/pages/CommissionsPage';
import EventsPage from '@/pages/EventsPage';
import FinancePage from '@/pages/FinancePage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'members':
        return <MembersPage />;
      case 'commissions':
        return <CommissionsPage />;
      case 'events':
        return <EventsPage />;
      case 'finance':
        return <FinancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="ml-64 min-h-screen">
        {/* Header with logout button */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-14 items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-foreground capitalize">
              {currentPage === 'dashboard' ? 'Tableau de bord' : 
               currentPage === 'members' ? 'Membres' :
               currentPage === 'commissions' ? 'Commissions' :
               currentPage === 'events' ? 'Événements' :
               currentPage === 'finance' ? 'Finances' :
               currentPage === 'reports' ? 'Rapports' :
               currentPage === 'settings' ? 'Paramètres' : currentPage}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Bonjour, <span className="font-medium text-foreground">{user?.username}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

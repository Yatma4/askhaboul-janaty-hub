import React, { useState } from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import Sidebar from './Sidebar';
import Dashboard from '@/pages/Dashboard';
import MembersPage from '@/pages/MembersPage';
import CommissionsPage from '@/pages/CommissionsPage';
import EventsPage from '@/pages/EventsPage';
import FinancePage from '@/pages/FinancePage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const RESET_CODE = 'DAHIRA2024';

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const { user, logout } = useAuth();
  const { resetData } = useData();

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
              
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Réinitialiser les données</DialogTitle>
                    <DialogDescription>
                      Cette action va réinitialiser toutes les données de l'application aux valeurs de démonstration.
                      Entrez le code de confirmation pour continuer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-code">Code de confirmation</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="Entrez le code..."
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-muted-foreground">
                        Indice : Le code est <strong>DAHIRA2024</strong>
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResetDialogOpen(false);
                        setInputCode('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (inputCode === RESET_CODE) {
                          resetData();
                          toast.success('Données réinitialisées avec succès !');
                          setResetDialogOpen(false);
                          setInputCode('');
                        } else {
                          toast.error('Code incorrect. Veuillez réessayer.');
                        }
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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

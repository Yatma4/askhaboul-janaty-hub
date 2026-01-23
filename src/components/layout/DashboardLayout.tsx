import React, { useState } from 'react';
import { LogOut, RotateCcw, Archive } from 'lucide-react';
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

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [archiveCode, setArchiveCode] = useState('');
  const { user, logout } = useAuth();
  const { members, commissions, events, cotisations, transactions, resetData, archiveAndClearData, securityCodes } = useData();

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
              
              {/* Archive Dialog */}
              <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Archiver les données</DialogTitle>
                    <DialogDescription>
                      Cette action va sauvegarder toutes les données dans un fichier JSON, puis supprimer les événements, cotisations et transactions. Les membres et commissions seront conservés.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="archive-code">Code de confirmation</Label>
                      <Input
                        id="archive-code"
                        type="text"
                        placeholder="Entrez le code..."
                        value={archiveCode}
                        onChange={(e) => setArchiveCode(e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-muted-foreground">
                        Entrez le code de sécurité pour archiver les données
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setArchiveDialogOpen(false);
                        setArchiveCode('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        if (archiveCode === securityCodes.archiveCode) {
                          archiveAndClearData();
                          toast.success('Données archivées et nettoyées avec succès !');
                          setArchiveDialogOpen(false);
                          setArchiveCode('');
                        } else {
                          toast.error('Code incorrect. Veuillez réessayer.');
                        }
                      }}
                    >
                      Archiver
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Reset Dialog */}
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
                    <DialogTitle>Supprimer toutes les données</DialogTitle>
                    <DialogDescription>
                      Cette action va supprimer définitivement toutes les données de l'application (membres, événements, cotisations, commissions, transactions).
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
                        Entrez le code de sécurité pour réinitialiser les données
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
                        if (inputCode === securityCodes.resetCode) {
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

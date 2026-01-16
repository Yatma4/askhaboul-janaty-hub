import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Users, Wallet, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const ReportsPage = () => {
  const { members, events, cotisations, transactions, commissions } = useData();
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const selectedEvent = events.find(e => e.id === selectedEventId);
  
  const eventCotisations = cotisations.filter(c => c.eventId === selectedEventId);
  const eventTransactions = transactions.filter(t => t.eventId === selectedEventId);
  
  const totalCotisations = eventCotisations.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalIncome = eventTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = eventTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const adultMembers = members.filter(m => m.isAdult);
  const paidMembers = eventCotisations.filter(c => c.isPaid).length;

  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF
    const reportData = {
      event: selectedEvent?.name,
      date: new Date().toLocaleDateString('fr-FR'),
      totalCotisations,
      totalIncome,
      totalExpenses,
      balance: totalCotisations + totalIncome - totalExpenses,
      paidMembers,
      totalAdultMembers: adultMembers.length,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${selectedEvent?.name || 'dahira'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Génération de rapports financiers et de gestion
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-sm text-muted-foreground">Membres total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Événements</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{commissions.length}</p>
              <p className="text-sm text-muted-foreground">Commissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adultMembers.length}</p>
              <p className="text-sm text-muted-foreground">Cotisants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Rapport par Événement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un événement" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEventId && (
              <Button variant="gradient" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>

          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="p-4 rounded-xl bg-secondary/30">
                <h3 className="font-semibold text-lg mb-2">{selectedEvent.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cotisation Homme: {selectedEvent.cotisationHomme.toLocaleString()} F CFA | Femme: {selectedEvent.cotisationFemme.toLocaleString()} F CFA
                </p>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <p className="text-sm text-muted-foreground">Cotisations collectées</p>
                  <p className="text-2xl font-bold text-primary">{totalCotisations.toLocaleString()} F</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paidMembers} / {adultMembers.length} membres
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-success/10">
                  <p className="text-sm text-muted-foreground">Autres recettes</p>
                  <p className="text-2xl font-bold text-success">{totalIncome.toLocaleString()} F</p>
                </div>

                <div className="p-4 rounded-xl bg-destructive/10">
                  <p className="text-sm text-muted-foreground">Dépenses</p>
                  <p className="text-2xl font-bold text-destructive">{totalExpenses.toLocaleString()} F</p>
                </div>

                <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                  <p className="text-sm opacity-90">Solde</p>
                  <p className="text-2xl font-bold">
                    {(totalCotisations + totalIncome - totalExpenses).toLocaleString()} F
                  </p>
                </div>
              </div>

              {/* Cotisation Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression des cotisations</span>
                  <span className="font-medium">
                    {adultMembers.length > 0 
                      ? Math.round((paidMembers / adultMembers.length) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full gradient-primary transition-all duration-500"
                    style={{ 
                      width: `${adultMembers.length > 0 
                        ? (paidMembers / adultMembers.length) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Sélectionnez un événement pour voir le rapport
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Rapport des Membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Par sexe</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span>Hommes</span>
                  <span className="font-semibold text-primary">
                    {members.filter(m => m.gender === 'Homme').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span>Femmes</span>
                  <span className="font-semibold text-accent">
                    {members.filter(m => m.gender === 'Femme').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Par statut</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span>Adultes</span>
                  <span className="font-semibold text-success">
                    {adultMembers.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span>Mineurs</span>
                  <span className="font-semibold text-warning">
                    {members.filter(m => !m.isAdult).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Par commission</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {commissions.slice(0, 4).map((commission) => (
                  <div key={commission.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                    <span className="truncate">{commission.name}</span>
                    <span className="font-semibold text-primary">
                      {members.filter(m => m.commissionId === commission.id).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;

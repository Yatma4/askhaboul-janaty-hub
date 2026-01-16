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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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

  // Prepare chart data
  const eventFinanceData = events.map(event => {
    const evtCotisations = cotisations.filter(c => c.eventId === event.id);
    const evtTransactions = transactions.filter(t => t.eventId === event.id);
    const cotTotal = evtCotisations.reduce((sum, c) => sum + c.paidAmount, 0);
    const incTotal = evtTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expTotal = evtTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      cotisations: cotTotal,
      recettes: incTotal,
      depenses: expTotal,
      solde: cotTotal + incTotal - expTotal,
    };
  });

  const genderDistribution = [
    { name: 'Hommes', value: members.filter(m => m.gender === 'Homme').length },
    { name: 'Femmes', value: members.filter(m => m.gender === 'Femme').length },
  ];

  const expenseByCategory = selectedEventId ? 
    eventTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find(e => e.name === t.category);
        if (existing) {
          existing.value += t.amount;
        } else {
          acc.push({ name: t.category, value: t.amount });
        }
        return acc;
      }, [] as { name: string; value: number }[]) 
    : [];

  const handleDownloadPDF = () => {
    if (!selectedEvent) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DAHIRA DAARA ASKHABOUL JANATY', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Rapport Financier - ${selectedEvent.name}`, pageWidth / 2, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Event Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const eventDate = new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Date de l'événement: ${eventDate}`, 14, 55);
    doc.text(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, 14, 62);
    doc.text(`Cotisation Homme: ${selectedEvent.cotisationHomme} F CFA`, 14, 69);
    doc.text(`Cotisation Femme: ${selectedEvent.cotisationFemme} F CFA`, 14, 76);
    
    // Financial Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé Financier', 14, 92);
    
    autoTable(doc, {
      startY: 98,
      head: [['Description', 'Montant (F CFA)']],
      body: [
        ['Cotisations collectées', `${totalCotisations} F`],
        ['Autres recettes', `${totalIncome} F`],
        ['Total des entrées', `${totalCotisations + totalIncome} F`],
        ['Total des dépenses', `${totalExpenses} F`],
        ['Solde final', `${totalCotisations + totalIncome - totalExpenses} F`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 11 },
    });
    
    // Cotisations Details
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Cotisations', 14, yPos);
    
    const cotisationDetails = eventCotisations.map(cot => {
      const member = members.find(m => m.id === cot.memberId);
      return [
        member ? `${member.firstName} ${member.lastName}` : 'Inconnu',
        member?.gender || '-',
        `${cot.amount} F`,
        `${cot.paidAmount} F`,
        cot.isPaid ? 'Payé' : 'En attente',
      ];
    });
    
    autoTable(doc, {
      startY: yPos + 6,
      head: [['Membre', 'Genre', 'Montant dû', 'Montant payé', 'Statut']],
      body: cotisationDetails.length > 0 ? cotisationDetails : [['Aucune cotisation enregistrée', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
    });
    
    // Statistics
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques', 14, yPos);
    
    const tauxRecouvrement = adultMembers.length > 0 ? Math.round((paidMembers * 100) / adultMembers.length) : 0;
    
    autoTable(doc, {
      startY: yPos + 6,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Nombre total de membres adultes', String(adultMembers.length)],
        ['Membres ayant payé', String(paidMembers)],
        ['Taux de recouvrement', `${tauxRecouvrement}%`],
        ['Hommes adultes', String(adultMembers.filter(m => m.gender === 'Homme').length)],
        ['Femmes adultes', String(adultMembers.filter(m => m.gender === 'Femme').length)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
    });
    
    // Transactions Details
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Transactions', 14, yPos);
    
    const transactionDetails = eventTransactions.map(t => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.type === 'income' ? 'Recette' : 'Dépense',
      t.category,
      t.description,
      `${t.amount} F`,
    ]);
    
    autoTable(doc, {
      startY: yPos + 6,
      head: [['Date', 'Type', 'Catégorie', 'Description', 'Montant']],
      body: transactionDetails.length > 0 ? transactionDetails : [['Aucune transaction', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `rapport-${selectedEvent.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Génération de rapports financiers et visualisations
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Evolution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Évolution Financière par Événement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventFinanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventFinanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} F`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cotisations" name="Cotisations" fill="#0EA5E9" />
                  <Bar dataKey="recettes" name="Recettes" fill="#10B981" />
                  <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Répartition par Genre
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value} membres`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucun membre enregistré
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Rapport par Événement (PDF)
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
              <Button variant="gradient" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
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
                    {paidMembers} sur {adultMembers.length} membres
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

              {/* Expense by Category Chart */}
              {expenseByCategory.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30">
                  <h4 className="font-medium mb-4">Répartition des Dépenses</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `${value.toLocaleString()} F`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

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
                Sélectionnez un événement pour voir le rapport et le télécharger en PDF
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

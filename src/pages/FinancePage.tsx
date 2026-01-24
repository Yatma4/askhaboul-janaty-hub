import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Users,
  Search
} from 'lucide-react';

const FinancePage = () => {
  const { user } = useAuth();
  const { 
    members, 
    events, 
    cotisations, 
    transactions, 
    addCotisation, 
    updateCotisation, 
    addTransaction 
  } = useData();

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCotisationDialogOpen, setIsCotisationDialogOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    eventId: '',
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
  });
  const [cotisationForm, setCotisationForm] = useState({
    memberId: '',
    eventId: '',
    paidAmount: 0,
  });
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';

  const adultMembers = members.filter(m => m.isAdult);
  
  // Filter members by search query
  const filteredAdultMembers = adultMembers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );
  
  // Get members who can still contribute to the selected event
  const getEligibleMembers = () => {
    if (!cotisationForm.eventId) return filteredAdultMembers;
    
    const event = events.find(e => e.id === cotisationForm.eventId);
    if (!event) return filteredAdultMembers;
    
    return filteredAdultMembers.filter(member => {
      const existingCotisation = cotisations.find(
        c => c.memberId === member.id && c.eventId === cotisationForm.eventId
      );
      
      if (!existingCotisation) return true;
      
      const expectedAmount = member.gender === 'Homme' 
        ? event.cotisationHomme 
        : event.cotisationFemme;
      
      // Only include members who haven't fully paid
      return existingCotisation.paidAmount < expectedAmount;
    });
  };
  
  const eligibleMembers = getEligibleMembers();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalCotisations = cotisations.reduce((sum, c) => sum + c.paidAmount, 0);

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      ...transactionForm,
      date: new Date(),
    });
    setIsTransactionDialogOpen(false);
    setTransactionForm({
      eventId: '',
      type: 'income',
      category: '',
      amount: 0,
      description: '',
    });
  };

  const handleCotisationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event = events.find(e => e.id === cotisationForm.eventId);
    const member = members.find(m => m.id === cotisationForm.memberId);
    if (!event || !member) return;

    const cotisationAmount = member.gender === 'Homme' ? event.cotisationHomme : event.cotisationFemme;
    
    // Check if there's an existing cotisation to update
    const existingCotisation = cotisations.find(
      c => c.memberId === cotisationForm.memberId && c.eventId === cotisationForm.eventId
    );
    
    if (existingCotisation) {
      // Cap the amount to not exceed the expected amount
      const remainingAmount = cotisationAmount - existingCotisation.paidAmount;
      const cappedAmount = Math.min(cotisationForm.paidAmount, remainingAmount);
      
      updateCotisation(existingCotisation.id, {
        paidAmount: existingCotisation.paidAmount + cappedAmount,
        isPaid: existingCotisation.paidAmount + cappedAmount >= cotisationAmount,
        paidAt: new Date(),
      });
    } else {
      // Cap the amount to not exceed the expected amount
      const cappedAmount = Math.min(cotisationForm.paidAmount, cotisationAmount);
      
      addCotisation({
        memberId: cotisationForm.memberId,
        eventId: cotisationForm.eventId,
        amount: cotisationAmount,
        paidAmount: cappedAmount,
        isPaid: cappedAmount >= cotisationAmount,
        paidAt: cappedAmount > 0 ? new Date() : undefined,
      });
    }
    
    setIsCotisationDialogOpen(false);
    setCotisationForm({
      memberId: '',
      eventId: '',
      paidAmount: 0,
    });
    setMemberSearchQuery('');
  };

  const expenseCategories = [
    'Alimentation',
    'Transport',
    'Location',
    'Équipement',
    'Communication',
    'Décoration',
    'Autres',
  ];

  const incomeCategories = [
    'Cotisations',
    'Dons',
    'Ventes',
    'Sponsors',
    'Autres',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground mt-1">
            Gestion financière du Dahira
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Dialog open={isCotisationDialogOpen} onOpenChange={setIsCotisationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Cotisation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enregistrer une cotisation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCotisationSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Événement</Label>
                    <Select
                      value={cotisationForm.eventId}
                      onValueChange={(value) => setCotisationForm({ ...cotisationForm, eventId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un événement" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} (H: {event.cotisationHomme.toLocaleString()} F / F: {event.cotisationFemme.toLocaleString()} F)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Membre (adulte)</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un membre..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select
                      value={cotisationForm.memberId}
                      onValueChange={(value) => setCotisationForm({ ...cotisationForm, memberId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un membre" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleMembers.length > 0 ? (
                          eligibleMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName} ({member.gender})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            {cotisationForm.eventId 
                              ? "Aucun membre éligible trouvé" 
                              : "Sélectionnez d'abord un événement"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {cotisationForm.memberId && cotisationForm.eventId && (() => {
                    const selectedMember = members.find(m => m.id === cotisationForm.memberId);
                    const selectedEvent = events.find(e => e.id === cotisationForm.eventId);
                    if (!selectedMember || !selectedEvent) return null;
                    
                    const expectedAmount = selectedMember.gender === 'Homme' 
                      ? selectedEvent.cotisationHomme 
                      : selectedEvent.cotisationFemme;
                    const existingCot = cotisations.find(
                      c => c.memberId === cotisationForm.memberId && c.eventId === cotisationForm.eventId
                    );
                    const alreadyPaid = existingCot?.paidAmount || 0;
                    const remainingAmount = expectedAmount - alreadyPaid;
                    
                    return (
                      <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Montant attendu:</span>
                          <span className="font-bold text-primary">{expectedAmount.toLocaleString()} F</span>
                        </div>
                        {alreadyPaid > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Déjà payé:</span>
                            <span className="font-medium text-success">{alreadyPaid.toLocaleString()} F</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm text-muted-foreground">Reste à payer:</span>
                          <span className="font-bold text-warning">{remainingAmount.toLocaleString()} F</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <Label>Montant payé (F CFA)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={cotisationForm.paidAmount}
                      onChange={(e) => setCotisationForm({ ...cotisationForm, paidAmount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCotisationDialogOpen(false);
                      setMemberSearchQuery('');
                    }}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="gradient" disabled={!cotisationForm.memberId || !cotisationForm.eventId || cotisationForm.paidAmount <= 0}>
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTransactionSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Événement</Label>
                    <Select
                      value={transactionForm.eventId}
                      onValueChange={(value) => setTransactionForm({ ...transactionForm, eventId: value })}
                    >
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

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={transactionForm.type}
                      onValueChange={(value: 'income' | 'expense') => 
                        setTransactionForm({ ...transactionForm, type: value, category: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Recette</SelectItem>
                        <SelectItem value="expense">Dépense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={transactionForm.category}
                      onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Montant (F CFA)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                      placeholder="Description de la transaction"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="gradient">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {(totalIncome + totalCotisations - totalExpenses).toLocaleString()} F
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recettes</p>
                <p className="text-2xl font-bold text-success">
                  {totalIncome.toLocaleString()} F
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dépenses</p>
                <p className="text-2xl font-bold text-destructive">
                  {totalExpenses.toLocaleString()} F
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cotisations</p>
                <p className="text-2xl font-bold text-accent">
                  {totalCotisations.toLocaleString()} F
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {events.find(e => e.id === transaction.eventId)?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {transaction.category}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end gap-1 font-medium ${
                            transaction.type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            {transaction.amount.toLocaleString()} F
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune transaction enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cotisations">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Suivi des cotisations</CardTitle>
            </CardHeader>
            <CardContent>
              {cotisations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Montant dû</TableHead>
                      <TableHead>Montant payé</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cotisations.map((cotisation) => {
                      const member = members.find(m => m.id === cotisation.memberId);
                      const event = events.find(e => e.id === cotisation.eventId);
                      return (
                        <TableRow key={cotisation.id}>
                          <TableCell>
                            {member ? `${member.firstName} ${member.lastName}` : '-'}
                          </TableCell>
                          <TableCell>{event?.name || '-'}</TableCell>
                          <TableCell>{cotisation.amount.toLocaleString()} F</TableCell>
                          <TableCell>{cotisation.paidAmount.toLocaleString()} F</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cotisation.isPaid 
                                ? 'bg-success/10 text-success' 
                                : 'bg-warning/10 text-warning'
                            }`}>
                              {cotisation.isPaid ? 'Payé' : 'En attente'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune cotisation enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;

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
import { Plus, Search, Edit, Trash2, Phone, MapPin, User, Wallet, ArrowUpAZ, ArrowDownZA } from 'lucide-react';
import { Member, Gender, MemberRole, MEMBER_ROLES } from '@/types';

interface CotisationDialogProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

const CotisationDialog = ({ member, isOpen, onClose }: CotisationDialogProps) => {
  const { events, cotisations, addCotisation, updateCotisation } = useData();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [amount, setAmount] = useState(0);

  // Filter active events and exclude those where member has already fully paid
  const activeEvents = events.filter(e => {
    if (e.status === 'completed') return false;
    
    const existingCotisation = cotisations.find(
      c => c.memberId === member.id && c.eventId === e.id
    );
    
    if (existingCotisation) {
      const expectedAmount = member.gender === 'Homme' ? e.cotisationHomme : e.cotisationFemme;
      // Exclude event if member has already paid full amount
      return existingCotisation.paidAmount < expectedAmount;
    }
    
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    const existingCotisation = cotisations.find(
      c => c.memberId === member.id && c.eventId === selectedEventId
    );

    const event = events.find(e => e.id === selectedEventId);
    const expectedAmount = member.gender === 'Homme' 
      ? event?.cotisationHomme || 0 
      : event?.cotisationFemme || 0;

    if (existingCotisation) {
      // Cap the amount to not exceed the expected amount
      const remainingAmount = expectedAmount - existingCotisation.paidAmount;
      const cappedAmount = Math.min(amount, remainingAmount);
      
      updateCotisation(existingCotisation.id, {
        paidAmount: existingCotisation.paidAmount + cappedAmount,
        isPaid: existingCotisation.paidAmount + cappedAmount >= expectedAmount,
        paidAt: new Date(),
      });
    } else {
      // Cap the amount to not exceed the expected amount
      const cappedAmount = Math.min(amount, expectedAmount);
      
      addCotisation({
        memberId: member.id,
        eventId: selectedEventId,
        amount: expectedAmount,
        paidAmount: cappedAmount,
        isPaid: cappedAmount >= expectedAmount,
        paidAt: new Date(),
      });
    }

    onClose();
    setSelectedEventId('');
    setAmount(0);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const expectedAmount = selectedEvent 
    ? (member.gender === 'Homme' ? selectedEvent.cotisationHomme : selectedEvent.cotisationFemme)
    : 0;
  
  // Calculate remaining amount for the selected event
  const existingCotisation = selectedEventId 
    ? cotisations.find(c => c.memberId === member.id && c.eventId === selectedEventId)
    : null;
  const remainingAmount = existingCotisation 
    ? expectedAmount - existingCotisation.paidAmount 
    : expectedAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Cotisation - {member.firstName} {member.lastName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Événement</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un événement" />
              </SelectTrigger>
              <SelectContent>
                {activeEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && (
            <>
              <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant attendu ({member.gender}):</span>
                  <span className="font-bold text-primary">{expectedAmount.toLocaleString()} F</span>
                </div>
                {existingCotisation && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Déjà payé:</span>
                    <span className="font-medium text-success">{existingCotisation.paidAmount.toLocaleString()} F</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">Reste à payer:</span>
                  <span className="font-bold text-warning">{remainingAmount.toLocaleString()} F</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant payé (F CFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  max={remainingAmount}
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Math.min(parseInt(e.target.value) || 0, remainingAmount))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {remainingAmount.toLocaleString()} F CFA
                </p>
              </div>
            </>
          )}

          {activeEvents.length === 0 && (
            <div className="p-4 text-center text-muted-foreground bg-secondary/20 rounded-lg">
              Ce membre a déjà payé toutes ses cotisations pour les événements actifs.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="gradient" disabled={!selectedEventId || amount <= 0 || activeEvents.length === 0}>
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MembersPage = () => {
  const { user } = useAuth();
  const { members, commissions, addMember, updateMember, deleteMember } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [cotisationMember, setCotisationMember] = useState<Member | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Homme' as Gender,
    age: 18,
    phone: '',
    address: '',
    role: 'Membre' as MemberRole,
    commissionId: '',
    commissionRole: '' as 'president' | 'vice-president' | 'member' | '',
  });

  const isAdmin = user?.role === 'admin';

  const filteredMembers = members
    .filter(
      (member) =>
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' }) 
        : nameB.localeCompare(nameA, 'fr', { sensitivity: 'base' });
    });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Homme',
      age: 18,
      phone: '',
      address: '',
      role: 'Membre',
      commissionId: '',
      commissionRole: '',
    });
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      isAdult: formData.age >= 18,
      commissionRole: formData.commissionRole || undefined,
      commissionId: formData.commissionId || undefined,
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
    } else {
      addMember(memberData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      gender: member.gender,
      age: member.age,
      phone: member.phone,
      address: member.address,
      role: member.role,
      commissionId: member.commissionId || '',
      commissionRole: member.commissionRole || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      deleteMember(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Membres</h1>
          <p className="text-muted-foreground mt-1">
            {members.length} membres enregistrés
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Modifier le membre' : 'Ajouter un nouveau membre'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexe</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: Gender) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Homme">Homme</SelectItem>
                        <SelectItem value="Femme">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Âge</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle dans le Dahira</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: MemberRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission</Label>
                    <Select
                      value={formData.commissionId || "none"}
                      onValueChange={(value) => setFormData({ ...formData, commissionId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une commission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {commissions.map((commission) => (
                          <SelectItem key={commission.id} value={commission.id}>
                            {commission.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.commissionId && (
                    <div className="space-y-2">
                      <Label htmlFor="commissionRole">Rôle dans la commission</Label>
                      <Select
                        value={formData.commissionRole || "member"}
                        onValueChange={(value: 'president' | 'vice-president' | 'member') => 
                          setFormData({ ...formData, commissionRole: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="president">Président</SelectItem>
                          <SelectItem value="vice-president">Vice-président</SelectItem>
                          <SelectItem value="member">Membre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingMember ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Sort */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-12 px-4"
            >
              {sortOrder === 'asc' ? (
                <>
                  <ArrowUpAZ className="w-5 h-5 mr-2" />
                  A → Z
                </>
              ) : (
                <>
                  <ArrowDownZA className="w-5 h-5 mr-2" />
                  Z → A
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-secondary/30">
          <CardTitle className="text-lg">Liste des Membres</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/20">
                <TableHead>Membre</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-secondary/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.gender}, {member.age} ans
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{member.address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.commissionId ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {commissions.find(c => c.id === member.commissionId)?.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.isAdult 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {member.isAdult ? 'Adulte' : 'Mineur'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.isAdult && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary hover:bg-primary/10"
                            onClick={() => setCotisationMember(member)}
                          >
                            <Wallet className="w-4 h-4 mr-1" />
                            Cotiser
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun membre trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cotisation Dialog */}
      {cotisationMember && (
        <CotisationDialog
          member={cotisationMember}
          isOpen={!!cotisationMember}
          onClose={() => setCotisationMember(null)}
        />
      )}
    </div>
  );
};

export default MembersPage;

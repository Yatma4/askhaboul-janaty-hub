import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Building2, Users, Crown, Edit, Trash2 } from 'lucide-react';
import { Commission } from '@/types';

const CommissionsPage = () => {
  const { user } = useAuth();
  const { commissions, members, addCommission, updateCommission, deleteCommission } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const isAdmin = user?.role === 'admin';

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCommission(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCommission) {
      updateCommission(editingCommission.id, formData);
    } else {
      addCommission({ ...formData, memberIds: [] });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      name: commission.name,
      description: commission.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commission ?')) {
      deleteCommission(id);
    }
  };

  const getCommissionMembers = (commissionId: string) => {
    return members.filter(m => m.commissionId === commissionId);
  };

  const getCommissionPresident = (commissionId: string) => {
    return members.find(m => m.commissionId === commissionId && m.commissionRole === 'president');
  };

  const getCommissionVicePresident = (commissionId: string) => {
    return members.find(m => m.commissionId === commissionId && m.commissionRole === 'vice-president');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commissions</h1>
          <p className="text-muted-foreground mt-1">
            {commissions.length} commissions actives
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
                Ajouter une commission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCommission ? 'Modifier la commission' : 'Nouvelle commission'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la commission</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingCommission ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Bureau Exécutif */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Bureau Exécutif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Jeuwrigne */}
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Jeuwrigne du Dahira</h3>
              {members.find(m => m.role === 'Jeuwrigne') ? (
                <p className="text-muted-foreground mt-1">
                  {members.find(m => m.role === 'Jeuwrigne')?.firstName}{' '}
                  {members.find(m => m.role === 'Jeuwrigne')?.lastName}
                </p>
              ) : (
                <p className="text-muted-foreground mt-1">Non assigné</p>
              )}
            </div>

            {/* Secrétaire Général */}
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Secrétaire Général</h3>
              {members.find(m => m.role === 'Secrétaire Général') ? (
                <p className="text-muted-foreground mt-1">
                  {members.find(m => m.role === 'Secrétaire Général')?.firstName}{' '}
                  {members.find(m => m.role === 'Secrétaire Général')?.lastName}
                </p>
              ) : (
                <p className="text-muted-foreground mt-1">Non assigné</p>
              )}
            </div>

            {/* Présidents des commissions */}
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Présidents Commissions</h3>
              <p className="text-muted-foreground mt-1">
                {members.filter(m => m.commissionRole === 'president').length} présidents
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commissions.map((commission) => {
          const commissionMembers = getCommissionMembers(commission.id);
          const president = getCommissionPresident(commission.id);
          const vicePresident = getCommissionVicePresident(commission.id);

          return (
            <Card key={commission.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{commission.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {commissionMembers.length} membre{commissionMembers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(commission)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(commission.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {commission.description && (
                  <p className="text-sm text-muted-foreground">
                    {commission.description}
                  </p>
                )}

                <div className="space-y-3">
                  {/* President */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Président</p>
                      <p className="text-sm font-medium truncate">
                        {president 
                          ? `${president.firstName} ${president.lastName}` 
                          : 'Non assigné'}
                      </p>
                    </div>
                  </div>

                  {/* Vice-President */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Vice-président</p>
                      <p className="text-sm font-medium truncate">
                        {vicePresident 
                          ? `${vicePresident.firstName} ${vicePresident.lastName}` 
                          : 'Non assigné'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simple members */}
                {commissionMembers.filter(m => m.commissionRole === 'member').length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Membres ({commissionMembers.filter(m => m.commissionRole === 'member').length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {commissionMembers
                        .filter(m => m.commissionRole === 'member')
                        .slice(0, 3)
                        .map((member) => (
                          <span
                            key={member.id}
                            className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                          >
                            {member.firstName}
                          </span>
                        ))}
                      {commissionMembers.filter(m => m.commissionRole === 'member').length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                          +{commissionMembers.filter(m => m.commissionRole === 'member').length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CommissionsPage;

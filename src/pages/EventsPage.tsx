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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Edit, Clock, DollarSign } from 'lucide-react';
import { Event } from '@/types';

const EventsPage = () => {
  const { user } = useAuth();
  const { events, addEvent, updateEvent } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    cotisationAmount: 0,
    description: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
  });

  const isAdmin = user?.role === 'admin';

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      cotisationAmount: 0,
      description: '',
      status: 'upcoming',
    });
    setEditingEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      date: new Date(formData.date),
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: new Date(event.date).toISOString().split('T')[0],
      cotisationAmount: event.cotisationAmount,
      description: event.description || '',
      status: event.status,
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-warning/10 text-warning';
      case 'ongoing':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'ongoing':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Événements</h1>
          <p className="text-muted-foreground mt-1">
            {events.length} événement{events.length > 1 ? 's' : ''} enregistré{events.length > 1 ? 's' : ''}
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
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'événement</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Magal de Touba 2024"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cotisation">Cotisation (F CFA)</Label>
                    <Input
                      id="cotisation"
                      type="number"
                      min="0"
                      value={formData.cotisationAmount}
                      onChange={(e) => setFormData({ ...formData, cotisationAmount: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'upcoming' | 'ongoing' | 'completed') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">À venir</SelectItem>
                      <SelectItem value="ongoing">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Description de l'événement..."
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
                    {editingEvent ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              <p className="text-sm text-muted-foreground">À venir</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ongoingEvents.length}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedEvents.length}</p>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg gradient-primary text-primary-foreground">
                <span className="text-sm font-medium">Cotisation</span>
                <span className="text-lg font-bold">
                  {event.cotisationAmount.toLocaleString()} F
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && (
          <Card className="border-0 shadow-lg col-span-full">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground mb-2">
                Aucun événement
              </p>
              <p className="text-muted-foreground">
                Créez votre premier événement pour commencer
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventsPage;

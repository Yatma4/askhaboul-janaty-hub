import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Shield, Bell, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [dahiraInfo, setDahiraInfo] = useState({
    name: 'Dahira Daara Askhaboul Janaty',
    address: 'Dakar, Sénégal',
    phone: '+221 77 000 00 00',
    email: 'contact@dahira.sn',
  });

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Configuration de l'application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 space-y-2">
              <button className="nav-item nav-item-active w-full">
                <Settings className="w-5 h-5" />
                <span>Général</span>
              </button>
              <button className="nav-item w-full">
                <User className="w-5 h-5" />
                <span>Profil</span>
              </button>
              <button className="nav-item w-full">
                <Shield className="w-5 h-5" />
                <span>Sécurité</span>
              </button>
              <button className="nav-item w-full">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dahira Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informations du Dahira</CardTitle>
              <CardDescription>
                Modifiez les informations générales de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du Dahira</Label>
                  <Input
                    id="name"
                    value={dahiraInfo.name}
                    onChange={(e) => setDahiraInfo({ ...dahiraInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={dahiraInfo.phone}
                    onChange={(e) => setDahiraInfo({ ...dahiraInfo, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dahiraInfo.email}
                    onChange={(e) => setDahiraInfo({ ...dahiraInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={dahiraInfo.address}
                    onChange={(e) => setDahiraInfo({ ...dahiraInfo, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>
                Gérez votre compte et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={user?.username || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Input
                    id="role"
                    value={user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full md:w-auto">
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="gradient" size="lg" onClick={handleSave}>
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

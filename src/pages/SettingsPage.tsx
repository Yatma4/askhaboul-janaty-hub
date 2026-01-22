import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Star, 
  UserPlus, 
  Trash2, 
  Edit2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type SettingsTab = 'general' | 'profile' | 'security' | 'notifications' | 'users';

interface AppUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  createdAt: Date;
}

const SettingsPage = () => {
  const { user, updateUserCredentials, addUser, deleteUser, getUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  const [dahiraInfo, setDahiraInfo] = useState({
    name: 'Dahira Daara Askhaboul Janaty',
    address: 'Dakar, Sénégal',
    phone: '+221 77 000 00 00',
    email: 'contact@dahira.sn',
  });

  const [profileInfo, setProfileInfo] = useState({
    displayName: user?.username || '',
    email: 'admin@dahira.sn',
    phone: '+221 77 000 00 00',
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    cotisationReminders: true,
    eventReminders: true,
    newMemberAlerts: false,
    weeklyReports: true,
  });

  const appUsers = getUsers().map(u => ({
    ...u,
    email: u.username + '@dahira.sn',
    createdAt: new Date(),
  }));

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
  };

  const handleSaveProfile = () => {
    toast.success('Profil mis à jour avec succès');
  };

  const handleChangePassword = () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (securitySettings.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    toast.success('Mot de passe modifié avec succès');
    setSecuritySettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    addUser(newUser.username, newUser.password, newUser.role);
    setNewUser({ username: '', email: '', password: '', role: 'user' });
    setShowAddUserDialog(false);
    toast.success(`Utilisateur "${newUser.username}" créé avec succès`);
  };

  const handleDeleteUser = (userId: string) => {
    const success = deleteUser(userId);
    if (!success) {
      toast.error('Impossible de supprimer le compte administrateur principal');
      return;
    }
    toast.success('Utilisateur supprimé');
  };

  const handleEditUser = (userId: string, currentUsername: string) => {
    setEditingUserId(userId);
    setEditUsername(currentUsername);
    setEditPassword('');
  };

  const handleSaveUserCredentials = () => {
    if (!editingUserId || !editUsername.trim() || !editPassword.trim()) {
      toast.error('Veuillez remplir le nom d\'utilisateur et le mot de passe');
      return;
    }
    updateUserCredentials(editingUserId, editUsername, editPassword);
    setEditingUserId(null);
    setEditUsername('');
    setEditPassword('');
    toast.success('Identifiants mis à jour avec succès');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
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

            {/* Save Button */}
            <div className="flex justify-end">
              <Button variant="gradient" size="lg" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Mon Profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.username}</h3>
                    <p className="text-muted-foreground capitalize">
                      {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Input
                      id="displayName"
                      value={profileInfo.displayName}
                      onChange={(e) => setProfileInfo({ ...profileInfo, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail">Email</Label>
                    <Input
                      id="profileEmail"
                      type="email"
                      value={profileInfo.email}
                      onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone">Téléphone</Label>
                    <Input
                      id="profilePhone"
                      value={profileInfo.phone}
                      onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })}
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
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="gradient" size="lg" onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Mettre à jour le profil
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Changez votre mot de passe et gérez la sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        placeholder="Entrez votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                      placeholder="Au moins 6 caractères"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      placeholder="Confirmez le mot de passe"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="gradient" onClick={handleChangePassword}>
                    <Shield className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Sessions actives</CardTitle>
                <CardDescription>
                  Gérez vos sessions de connexion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-secondary/30 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">Connecté maintenant</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez recevoir les notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Rappels de cotisations</p>
                      <p className="text-sm text-muted-foreground">Rappeler aux membres de payer leurs cotisations</p>
                    </div>
                    <Switch
                      checked={notifications.cotisationReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, cotisationReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Rappels d'événements</p>
                      <p className="text-sm text-muted-foreground">Notifications avant les événements à venir</p>
                    </div>
                    <Switch
                      checked={notifications.eventReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, eventReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Alertes nouveaux membres</p>
                      <p className="text-sm text-muted-foreground">Notification lors de l'ajout d'un nouveau membre</p>
                    </div>
                    <Switch
                      checked={notifications.newMemberAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newMemberAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Rapports hebdomadaires</p>
                      <p className="text-sm text-muted-foreground">Recevoir un résumé hebdomadaire par email</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="gradient" size="lg" onClick={() => toast.success('Préférences de notifications enregistrées')}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les préférences
              </Button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Ajoutez et gérez les utilisateurs de l'application
                  </CardDescription>
                </div>
                <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="gradient">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter un utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvel utilisateur</DialogTitle>
                      <DialogDescription>
                        Créez un nouveau compte utilisateur pour l'application
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="newUsername">Nom d'utilisateur *</Label>
                        <Input
                          id="newUsername"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          placeholder="Nom d'utilisateur"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUserEmail">Email</Label>
                        <Input
                          id="newUserEmail"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUserPassword">Mot de passe *</Label>
                        <Input
                          id="newUserPassword"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Au moins 6 caractères"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUserRole">Rôle</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                          Annuler
                        </Button>
                        <Button variant="gradient" onClick={handleAddUser}>
                          Créer l'utilisateur
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appUsers.map((appUser) => (
                      <TableRow key={appUser.id}>
                        <TableCell className="font-medium">
                          {editingUserId === appUser.id ? (
                            <Input
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              placeholder="Nom d'utilisateur"
                              className="h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {appUser.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {appUser.username}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === appUser.id ? (
                            <Input
                              type="password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Nouveau mot de passe"
                              className="h-8"
                            />
                          ) : (
                            appUser.email || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appUser.role === 'admin' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            {appUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {appUser.createdAt.toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {editingUserId === appUser.id ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={handleSaveUserCredentials}
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Sauver
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setEditUsername('');
                                    setEditPassword('');
                                  }}
                                >
                                  Annuler
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditUser(appUser.id, appUser.username)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteUser(appUser.id)}
                                  disabled={appUser.id === '1'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              <button 
                onClick={() => setActiveTab('general')}
                className={`nav-item w-full ${activeTab === 'general' ? 'nav-item-active' : ''}`}
              >
                <Settings className="w-5 h-5" />
                <span>Général</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`nav-item w-full ${activeTab === 'profile' ? 'nav-item-active' : ''}`}
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`nav-item w-full ${activeTab === 'security' ? 'nav-item-active' : ''}`}
              >
                <Shield className="w-5 h-5" />
                <span>Sécurité</span>
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`nav-item w-full ${activeTab === 'notifications' ? 'nav-item-active' : ''}`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`nav-item w-full ${activeTab === 'users' ? 'nav-item-active' : ''}`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Utilisateurs</span>
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

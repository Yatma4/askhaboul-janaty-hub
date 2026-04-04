import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset password state
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError("Identifiants incorrects");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetUsername.trim() || !resetCode.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setResetError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsResetting(true);
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'reset-password-with-code',
        username: resetUsername,
        securityCode: resetCode,
        newPassword,
      },
    });

    if (error || data?.error) {
      setResetError(data?.error || "Erreur lors de la réinitialisation");
    } else {
      toast.success("Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
      setShowResetForm(false);
      setResetUsername("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-xl shadow-primary/25 mb-6">
            <Star className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dahira Daara</h1>
          <p className="text-lg text-primary font-arabic">Askhaboul Janaty</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          {!showResetForm ? (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Connexion</CardTitle>
                <CardDescription>Accédez à votre espace de gestion</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="animate-scale-in">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Entrez votre nom d'utilisateur"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pr-12"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="gradient" size="lg" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                <button
                  onClick={() => setShowResetForm(true)}
                  className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
                >
                  <KeyRound className="w-4 h-4" />
                  Mot de passe oublié ?
                </button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Réinitialiser le mot de passe</CardTitle>
                <CardDescription>
                  Entrez votre nom d'utilisateur et le code de sécurité fourni par l'administrateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetError && (
                    <Alert variant="destructive" className="animate-scale-in">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="resetUsername">Nom d'utilisateur</Label>
                    <Input
                      id="resetUsername"
                      type="text"
                      placeholder="Votre nom d'utilisateur"
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resetCode">Code de sécurité</Label>
                    <Input
                      id="resetCode"
                      type="text"
                      placeholder="Code fourni par l'administrateur"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Au moins 6 caractères"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirmez le mot de passe"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <Button type="submit" variant="gradient" size="lg" className="w-full mt-6" disabled={isResetting}>
                    {isResetting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                  </Button>
                </form>

                <button
                  onClick={() => { setShowResetForm(false); setResetError(""); }}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">© 2026 Dahira Daara Askhaboul Janaty</p>
      </div>
    </div>
  );
};

export default LoginPage;

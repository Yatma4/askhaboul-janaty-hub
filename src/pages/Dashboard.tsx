import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Calendar, Wallet, TrendingUp, Star } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { user } = useAuth();
  const { members, commissions, events, cotisations, transactions } = useData();

  const adultMembers = members.filter(m => m.isAdult).length;
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

  const stats = [
    {
      title: 'Total Membres',
      value: members.length,
      subtext: `${adultMembers} adultes`,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Commissions',
      value: commissions.length,
      subtext: 'Actives',
      icon: Building2,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Événements',
      value: events.length,
      subtext: `${upcomingEvents} à venir`,
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Balance',
      value: `${(totalIncome - totalExpenses).toLocaleString()} F`,
      subtext: 'Solde actuel',
      icon: Wallet,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const recentMembers = members.slice(-5).reverse();

  // Get executive bureau members
  const executiveBureau = members.filter(m => 
    m.role === 'Jeuwrigne' || 
    m.role === 'Secrétaire Général' ||
    m.role === 'Président Commission Organisation' ||
    m.role === 'Vice-Président Commission Organisation' ||
    m.commissionRole === 'president'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenue, {user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">
            Tableau de bord - Dahira Daara Askhaboul Janaty
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
          <Star className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="stat-card border-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtext}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Membres Récents</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {recentMembers.length > 0 ? (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.role}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.gender === 'Homme' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {member.gender}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun membre enregistré
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Événements à Venir</CardTitle>
            <Calendar className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {events.filter(e => e.status === 'upcoming').length > 0 ? (
              <div className="space-y-4">
                {events.filter(e => e.status === 'upcoming').map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{event.name}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning">
                        À venir
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex gap-2">
                        <span className="font-medium text-primary">
                          H: {event.cotisationHomme.toLocaleString()} F
                        </span>
                        <span className="font-medium text-accent">
                          F: {event.cotisationFemme.toLocaleString()} F
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement prévu
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Executive Bureau */}
      {executiveBureau.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bureau Exécutif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {executiveBureau.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commissions Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Aperçu des Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                onClick={() => onNavigate?.('commissions')}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all hover:scale-105 text-center cursor-pointer"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {commission.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {members.filter(m => m.commissionId === commission.id).length} membres
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

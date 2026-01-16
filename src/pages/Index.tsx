import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
};

export default Index;

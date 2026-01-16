import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '@/pages/Dashboard';
import MembersPage from '@/pages/MembersPage';
import CommissionsPage from '@/pages/CommissionsPage';
import EventsPage from '@/pages/EventsPage';
import FinancePage from '@/pages/FinancePage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'members':
        return <MembersPage />;
      case 'commissions':
        return <CommissionsPage />;
      case 'events':
        return <EventsPage />;
      case 'finance':
        return <FinancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

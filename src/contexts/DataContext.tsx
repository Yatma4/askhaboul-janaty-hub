import React, { createContext, useContext, useState } from 'react';
import { Member, Commission, Event, Cotisation, Transaction } from '@/types';

interface DataContextType {
  members: Member[];
  commissions: Commission[];
  events: Event[];
  cotisations: Cotisation[];
  transactions: Transaction[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addCommission: (commission: Omit<Commission, 'id'>) => void;
  updateCommission: (id: string, commission: Partial<Commission>) => void;
  deleteCommission: (id: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  addCotisation: (cotisation: Omit<Cotisation, 'id'>) => void;
  updateCotisation: (id: string, cotisation: Partial<Cotisation>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial demo data
const initialCommissions: Commission[] = [
  { id: '1', name: 'Organisation', description: 'Supervise toutes les commissions', memberIds: [] },
  { id: '2', name: 'Hygiène', description: 'Propreté et hygiène', memberIds: [] },
  { id: '3', name: 'Collation', description: 'Gestion des collations', memberIds: [] },
  { id: '4', name: 'Café', description: 'Service café', memberIds: [] },
  { id: '5', name: 'Cuisine', description: 'Préparation des repas', memberIds: [] },
  { id: '6', name: 'Multimédia', description: 'Gestion audiovisuelle', memberIds: [] },
  { id: '7', name: 'Culturel', description: 'Activités culturelles', memberIds: [] },
  { id: '8', name: 'Finance', description: 'Gestion financière', memberIds: [] },
];

const initialMembers: Member[] = [
  {
    id: '1',
    firstName: 'Amadou',
    lastName: 'Diallo',
    gender: 'Homme',
    age: 45,
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    function: 'Jeuwrigne',
    position: 'Bureau Exécutif',
    isAdult: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    gender: 'Femme',
    age: 38,
    phone: '+221 76 234 56 78',
    address: 'Thiès, Sénégal',
    function: 'Secrétaire Général',
    position: 'Bureau Exécutif',
    isAdult: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    firstName: 'Moussa',
    lastName: 'Sow',
    gender: 'Homme',
    age: 42,
    phone: '+221 78 345 67 89',
    address: 'Saint-Louis, Sénégal',
    function: 'Président',
    position: 'Commission Organisation',
    commissionId: '1',
    commissionRole: 'president',
    isAdult: true,
    createdAt: new Date(),
  },
];

const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Magal de Touba 2024',
    date: new Date('2024-09-15'),
    cotisationAmount: 5000,
    description: 'Célébration annuelle du Magal',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Gamou 2024',
    date: new Date('2024-10-20'),
    cotisationAmount: 3000,
    description: 'Célébration du Gamou',
    status: 'upcoming',
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addMember = (member: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addCommission = (commission: Omit<Commission, 'id'>) => {
    const newCommission: Commission = {
      ...commission,
      id: Date.now().toString(),
    };
    setCommissions(prev => [...prev, newCommission]);
  };

  const updateCommission = (id: string, updates: Partial<Commission>) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCommission = (id: string) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addCotisation = (cotisation: Omit<Cotisation, 'id'>) => {
    const newCotisation: Cotisation = {
      ...cotisation,
      id: Date.now().toString(),
    };
    setCotisations(prev => [...prev, newCotisation]);
  };

  const updateCotisation = (id: string, updates: Partial<Cotisation>) => {
    setCotisations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  return (
    <DataContext.Provider value={{
      members,
      commissions,
      events,
      cotisations,
      transactions,
      addMember,
      updateMember,
      deleteMember,
      addCommission,
      updateCommission,
      deleteCommission,
      addEvent,
      updateEvent,
      addCotisation,
      updateCotisation,
      addTransaction,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

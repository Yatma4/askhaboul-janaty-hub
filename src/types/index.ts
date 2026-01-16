export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type Gender = 'Homme' | 'Femme';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  phone: string;
  address: string;
  function: string;
  position: string;
  commissionId?: string;
  commissionRole?: 'president' | 'vice-president' | 'member';
  isAdult: boolean;
  createdAt: Date;
}

export interface Commission {
  id: string;
  name: string;
  description?: string;
  presidentId?: string;
  vicePresidentId?: string;
  memberIds: string[];
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  cotisationAmount: number;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Cotisation {
  id: string;
  memberId: string;
  eventId: string;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface Transaction {
  id: string;
  eventId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
}

export interface FinancialReport {
  eventId: string;
  eventName: string;
  totalIncome: number;
  totalExpenses: number;
  totalCotisations: number;
  balance: number;
}

export interface ExecutiveBureau {
  jeuwrigneId?: string;
  secretaireGeneralId?: string;
  commissionPresidentIds: string[];
}

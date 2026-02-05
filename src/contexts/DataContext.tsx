 import React, { createContext, useContext } from 'react';
 import { Member, Commission, Event, Cotisation, Transaction } from '@/types';
 import { useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useMembers, useAddMember, useUpdateMember, useDeleteMember } from '@/hooks/useMembers';
 import { useCommissions, useAddCommission, useUpdateCommission, useDeleteCommission } from '@/hooks/useCommissions';
 import { useEvents, useAddEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
 import { useCotisations, useAddCotisation, useUpdateCotisation } from '@/hooks/useCotisations';
 import { useTransactions, useAddTransaction } from '@/hooks/useTransactions';
 import { useReportHistory, useAddReportHistory } from '@/hooks/useReportHistory';
 import { useSecurityCodes, useUpdateSecurityCodes } from '@/hooks/useSecurityCodes';

export interface ReportHistory {
  id: string;
  type: 'event' | 'annual';
  name: string;
  date: string;
  eventId?: string;
  year?: string;
}

interface SecurityCodes {
  archiveCode: string;
  resetCode: string;
}

interface DataContextType {
  members: Member[];
  commissions: Commission[];
  events: Event[];
  cotisations: Cotisation[];
  transactions: Transaction[];
  reportHistory: ReportHistory[];
  securityCodes: SecurityCodes;
   isLoading: boolean;
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
  resetData: () => void;
  archiveAndClearData: () => void;
  addReportToHistory: (report: Omit<ReportHistory, 'id' | 'date'>) => void;
  updateSecurityCodes: (codes: Partial<SecurityCodes>) => void;
}

const DEFAULT_SECURITY_CODES: SecurityCodes = {
  archiveCode: 'ARCHIVE2024',
  resetCode: 'DAHIRA2024',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const queryClient = useQueryClient();
   
   // Fetch data using hooks
   const { data: members = [], isLoading: membersLoading } = useMembers();
   const { data: commissions = [], isLoading: commissionsLoading } = useCommissions();
   const { data: events = [], isLoading: eventsLoading } = useEvents();
   const { data: cotisations = [], isLoading: cotisationsLoading } = useCotisations();
   const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
   const { data: reportHistory = [], isLoading: reportHistoryLoading } = useReportHistory();
   const { data: securityCodes = DEFAULT_SECURITY_CODES, isLoading: securityCodesLoading } = useSecurityCodes();
   
   // Mutations
   const addMemberMutation = useAddMember();
   const updateMemberMutation = useUpdateMember();
   const deleteMemberMutation = useDeleteMember();
   const addCommissionMutation = useAddCommission();
   const updateCommissionMutation = useUpdateCommission();
   const deleteCommissionMutation = useDeleteCommission();
   const addEventMutation = useAddEvent();
   const updateEventMutation = useUpdateEvent();
   const deleteEventMutation = useDeleteEvent();
   const addCotisationMutation = useAddCotisation();
   const updateCotisationMutation = useUpdateCotisation();
   const addTransactionMutation = useAddTransaction();
   const addReportHistoryMutation = useAddReportHistory();
   const updateSecurityCodesMutation = useUpdateSecurityCodes();
   
   const isLoading = membersLoading || commissionsLoading || eventsLoading || 
                     cotisationsLoading || transactionsLoading || reportHistoryLoading || securityCodesLoading;
 
   const addMember = (member: Omit<Member, 'id' | 'createdAt'>) => {
     addMemberMutation.mutate(member);
   };
 
   const updateMember = (id: string, updates: Partial<Member>) => {
     updateMemberMutation.mutate({ id, updates });
   };
 
   const deleteMember = (id: string) => {
     deleteMemberMutation.mutate(id);
   };
 
   const addCommission = (commission: Omit<Commission, 'id'>) => {
     addCommissionMutation.mutate(commission);
   };
 
   const updateCommission = (id: string, updates: Partial<Commission>) => {
     updateCommissionMutation.mutate({ id, updates });
   };
 
   const deleteCommission = (id: string) => {
     deleteCommissionMutation.mutate(id);
   };
 
   const addEvent = (event: Omit<Event, 'id'>) => {
     addEventMutation.mutate(event);
   };
 
   const updateEvent = (id: string, updates: Partial<Event>) => {
     updateEventMutation.mutate({ id, updates });
   };
 
   const addCotisation = (cotisation: Omit<Cotisation, 'id'>) => {
     addCotisationMutation.mutate(cotisation);
   };
 
   const updateCotisation = (id: string, updates: Partial<Cotisation>) => {
     updateCotisationMutation.mutate({ id, updates });
   };
 
   const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
     addTransactionMutation.mutate(transaction);
   };
 
   const resetData = async () => {
     // Delete all data from database
     await supabase.from('cotisations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('commissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('report_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     
     // Invalidate all queries to refresh data
     queryClient.invalidateQueries();
   };
 
   const archiveAndClearData = async () => {
     // Create archive object with all current data
     const archiveData = {
       exportDate: new Date().toISOString(),
      members,
      commissions,
      events,
      cotisations,
      transactions,
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(archiveData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dahira-archive-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

     // Clear events, cotisations, and transactions from database (keep members and commissions)
     await supabase.from('cotisations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await supabase.from('report_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     
     // Invalidate queries to refresh data
     queryClient.invalidateQueries({ queryKey: ['events'] });
     queryClient.invalidateQueries({ queryKey: ['cotisations'] });
     queryClient.invalidateQueries({ queryKey: ['transactions'] });
     queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
  };

  const addReportToHistory = (report: Omit<ReportHistory, 'id' | 'date'>) => {
     addReportHistoryMutation.mutate(report);
  };

   const handleUpdateSecurityCodes = (codes: Partial<SecurityCodes>) => {
     updateSecurityCodesMutation.mutate(codes);
  };

  return (
    <DataContext.Provider value={{
      members,
      commissions,
      events,
      cotisations,
      transactions,
      reportHistory,
      securityCodes,
       isLoading,
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
      resetData,
      archiveAndClearData,
      addReportToHistory,
       updateSecurityCodes: handleUpdateSecurityCodes,
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

 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Transaction } from '@/types';
 
 interface DbTransaction {
   id: string;
   event_id: string;
   type: string;
   category: string;
   amount: number;
   description: string;
   date: string;
 }
 
 const mapDbToTransaction = (db: DbTransaction): Transaction => ({
   id: db.id,
   eventId: db.event_id,
   type: db.type as Transaction['type'],
   category: db.category,
   amount: db.amount,
   description: db.description,
   date: new Date(db.date),
 });
 
 export const useTransactions = () => {
   return useQuery({
     queryKey: ['transactions'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('transactions')
         .select('*')
         .order('date', { ascending: false });
       
       if (error) throw error;
       return (data as DbTransaction[]).map(mapDbToTransaction);
     },
   });
 };
 
 export const useAddTransaction = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
       const { data, error } = await supabase
         .from('transactions')
         .insert({
           event_id: transaction.eventId,
           type: transaction.type,
           category: transaction.category,
           amount: transaction.amount,
           description: transaction.description,
           date: transaction.date.toISOString(),
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToTransaction(data as DbTransaction);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
     },
   });
 };
 
 export const useDeleteTransaction = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('transactions')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
     },
   });
 };
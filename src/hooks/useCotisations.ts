 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Cotisation } from '@/types';
 
 interface DbCotisation {
   id: string;
   member_id: string;
   event_id: string;
   amount: number;
   paid_amount: number;
   is_paid: boolean;
   paid_at: string | null;
 }
 
 const mapDbToCotisation = (db: DbCotisation): Cotisation => ({
   id: db.id,
   memberId: db.member_id,
   eventId: db.event_id,
   amount: db.amount,
   paidAmount: db.paid_amount,
   isPaid: db.is_paid,
   paidAt: db.paid_at ? new Date(db.paid_at) : undefined,
 });
 
 export const useCotisations = () => {
   return useQuery({
     queryKey: ['cotisations'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('cotisations')
         .select('*');
       
       if (error) throw error;
       return (data as DbCotisation[]).map(mapDbToCotisation);
     },
   });
 };
 
 export const useAddCotisation = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (cotisation: Omit<Cotisation, 'id'>) => {
       const { data, error } = await supabase
         .from('cotisations')
         .insert({
           member_id: cotisation.memberId,
           event_id: cotisation.eventId,
           amount: cotisation.amount,
           paid_amount: cotisation.paidAmount,
           is_paid: cotisation.isPaid,
           paid_at: cotisation.paidAt?.toISOString() || null,
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToCotisation(data as DbCotisation);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cotisations'] });
     },
   });
 };
 
 export const useUpdateCotisation = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ id, updates }: { id: string; updates: Partial<Cotisation> }) => {
       const dbUpdates: Record<string, unknown> = {};
       if (updates.memberId !== undefined) dbUpdates.member_id = updates.memberId;
       if (updates.eventId !== undefined) dbUpdates.event_id = updates.eventId;
       if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
       if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;
       if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
       if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt?.toISOString() || null;
       
       const { error } = await supabase
         .from('cotisations')
         .update(dbUpdates)
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cotisations'] });
     },
   });
 };
 
 export const useDeleteCotisation = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('cotisations')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cotisations'] });
     },
   });
 };
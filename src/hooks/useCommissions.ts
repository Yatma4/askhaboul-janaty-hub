 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Commission } from '@/types';
 
 interface DbCommission {
   id: string;
   name: string;
   description: string | null;
   president_id: string | null;
   vice_president_id: string | null;
   member_ids: string[];
 }
 
 const mapDbToCommission = (db: DbCommission): Commission => ({
   id: db.id,
   name: db.name,
   description: db.description || undefined,
   presidentId: db.president_id || undefined,
   vicePresidentId: db.vice_president_id || undefined,
   memberIds: db.member_ids || [],
 });
 
 export const useCommissions = () => {
   return useQuery({
     queryKey: ['commissions'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('commissions')
         .select('*')
         .order('name');
       
       if (error) throw error;
       return (data as DbCommission[]).map(mapDbToCommission);
     },
   });
 };
 
 export const useAddCommission = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (commission: Omit<Commission, 'id'>) => {
       const { data, error } = await supabase
         .from('commissions')
         .insert({
           name: commission.name,
           description: commission.description || null,
           president_id: commission.presidentId || null,
           vice_president_id: commission.vicePresidentId || null,
           member_ids: commission.memberIds || [],
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToCommission(data as DbCommission);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['commissions'] });
     },
   });
 };
 
 export const useUpdateCommission = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ id, updates }: { id: string; updates: Partial<Commission> }) => {
       const dbUpdates: Record<string, unknown> = {};
       if (updates.name !== undefined) dbUpdates.name = updates.name;
       if (updates.description !== undefined) dbUpdates.description = updates.description || null;
       if (updates.presidentId !== undefined) dbUpdates.president_id = updates.presidentId || null;
       if (updates.vicePresidentId !== undefined) dbUpdates.vice_president_id = updates.vicePresidentId || null;
       if (updates.memberIds !== undefined) dbUpdates.member_ids = updates.memberIds;
       
       const { error } = await supabase
         .from('commissions')
         .update(dbUpdates)
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['commissions'] });
     },
   });
 };
 
 export const useDeleteCommission = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('commissions')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['commissions'] });
     },
   });
 };
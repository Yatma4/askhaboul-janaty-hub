 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Event } from '@/types';
 
 interface DbEvent {
   id: string;
   name: string;
   date: string;
   cotisation_homme: number;
   cotisation_femme: number;
   description: string | null;
   status: string;
 }
 
 const mapDbToEvent = (db: DbEvent): Event => ({
   id: db.id,
   name: db.name,
   date: new Date(db.date),
   cotisationHomme: db.cotisation_homme,
   cotisationFemme: db.cotisation_femme,
   description: db.description || undefined,
   status: db.status as Event['status'],
 });
 
 export const useEvents = () => {
   return useQuery({
     queryKey: ['events'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('events')
         .select('*')
         .order('date', { ascending: false });
       
       if (error) throw error;
       return (data as DbEvent[]).map(mapDbToEvent);
     },
   });
 };
 
 export const useAddEvent = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (event: Omit<Event, 'id'>) => {
       const { data, error } = await supabase
         .from('events')
         .insert({
           name: event.name,
           date: event.date.toISOString(),
           cotisation_homme: event.cotisationHomme,
           cotisation_femme: event.cotisationFemme,
           description: event.description || null,
           status: event.status,
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToEvent(data as DbEvent);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['events'] });
     },
   });
 };
 
 export const useUpdateEvent = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
       const dbUpdates: Record<string, unknown> = {};
       if (updates.name !== undefined) dbUpdates.name = updates.name;
       if (updates.date !== undefined) dbUpdates.date = updates.date.toISOString();
       if (updates.cotisationHomme !== undefined) dbUpdates.cotisation_homme = updates.cotisationHomme;
       if (updates.cotisationFemme !== undefined) dbUpdates.cotisation_femme = updates.cotisationFemme;
       if (updates.description !== undefined) dbUpdates.description = updates.description || null;
       if (updates.status !== undefined) dbUpdates.status = updates.status;
       
       const { error } = await supabase
         .from('events')
         .update(dbUpdates)
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['events'] });
     },
   });
 };
 
 export const useDeleteEvent = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('events')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['events'] });
       queryClient.invalidateQueries({ queryKey: ['cotisations'] });
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
     },
   });
 };
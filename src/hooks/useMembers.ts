 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Member } from '@/types';
 
 interface DbMember {
   id: string;
   first_name: string;
   last_name: string;
   gender: string;
   age: number;
   phone: string;
   address: string;
   role: string;
   commission_id: string | null;
   commission_role: string | null;
   is_adult: boolean;
   created_at: string;
 }
 
 const mapDbToMember = (db: DbMember): Member => ({
   id: db.id,
   firstName: db.first_name,
   lastName: db.last_name,
   gender: db.gender as Member['gender'],
   age: db.age,
   phone: db.phone,
   address: db.address,
   role: db.role as Member['role'],
   commissionId: db.commission_id || undefined,
   commissionRole: db.commission_role as Member['commissionRole'],
   isAdult: db.is_adult,
   createdAt: new Date(db.created_at),
 });
 
 export const useMembers = () => {
   return useQuery({
     queryKey: ['members'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('members')
         .select('*')
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       return (data as DbMember[]).map(mapDbToMember);
     },
   });
 };
 
 export const useAddMember = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (member: Omit<Member, 'id' | 'createdAt'>) => {
       const { data, error } = await supabase
         .from('members')
         .insert({
           first_name: member.firstName,
           last_name: member.lastName,
           gender: member.gender,
           age: member.age,
           phone: member.phone,
           address: member.address,
           role: member.role,
           commission_id: member.commissionId || null,
           commission_role: member.commissionRole || null,
           is_adult: member.isAdult,
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToMember(data as DbMember);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['members'] });
     },
   });
 };
 
 export const useUpdateMember = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
       const dbUpdates: Record<string, unknown> = {};
       if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
       if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
       if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
       if (updates.age !== undefined) dbUpdates.age = updates.age;
       if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
       if (updates.address !== undefined) dbUpdates.address = updates.address;
       if (updates.role !== undefined) dbUpdates.role = updates.role;
       if (updates.commissionId !== undefined) dbUpdates.commission_id = updates.commissionId || null;
       if (updates.commissionRole !== undefined) dbUpdates.commission_role = updates.commissionRole || null;
       if (updates.isAdult !== undefined) dbUpdates.is_adult = updates.isAdult;
       
       const { error } = await supabase
         .from('members')
         .update(dbUpdates)
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['members'] });
     },
   });
 };
 
 export const useDeleteMember = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('members')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['members'] });
     },
   });
 };
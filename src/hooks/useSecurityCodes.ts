 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useRealtimeSync } from './useRealtimeSync';

 const SECURITY_CODES_KEY = ['securityCodes'];
 
 interface SecurityCodes {
   archiveCode: string;
   resetCode: string;
 }
 
 interface DbSecurityCodes {
   id: string;
   archive_code: string;
   reset_code: string;
 }
 
 export const useSecurityCodes = () => {
   useRealtimeSync('security_codes', SECURITY_CODES_KEY);
   return useQuery({
     queryKey: SECURITY_CODES_KEY,
     queryFn: async () => {
       const { data, error } = await supabase
         .from('security_codes')
         .select('*')
         .limit(1)
         .single();
       
       if (error) throw error;
       const db = data as DbSecurityCodes;
       return {
         archiveCode: db.archive_code,
         resetCode: db.reset_code,
       } as SecurityCodes;
     },
   });
 };
 
 export const useUpdateSecurityCodes = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (codes: Partial<SecurityCodes>) => {
       const dbUpdates: Record<string, unknown> = {};
       if (codes.archiveCode !== undefined) dbUpdates.archive_code = codes.archiveCode;
       if (codes.resetCode !== undefined) dbUpdates.reset_code = codes.resetCode;
       
       // Get the first (and only) row
       const { data: existingData } = await supabase
         .from('security_codes')
         .select('id')
         .limit(1)
         .single();
       
       if (existingData) {
         const { error } = await supabase
           .from('security_codes')
           .update(dbUpdates)
           .eq('id', existingData.id);
         
         if (error) throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['securityCodes'] });
     },
   });
 };
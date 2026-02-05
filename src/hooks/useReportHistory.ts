 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { ReportHistory } from '@/contexts/DataContext';
 
 interface DbReportHistory {
   id: string;
   type: string;
   name: string;
   event_id: string | null;
   year: string | null;
   created_at: string;
 }
 
 const mapDbToReportHistory = (db: DbReportHistory): ReportHistory => ({
   id: db.id,
   type: db.type as ReportHistory['type'],
   name: db.name,
   eventId: db.event_id || undefined,
   year: db.year || undefined,
   date: db.created_at,
 });
 
 export const useReportHistory = () => {
   return useQuery({
     queryKey: ['reportHistory'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('report_history')
         .select('*')
         .order('created_at', { ascending: false })
         .limit(20);
       
       if (error) throw error;
       return (data as DbReportHistory[]).map(mapDbToReportHistory);
     },
   });
 };
 
 export const useAddReportHistory = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (report: Omit<ReportHistory, 'id' | 'date'>) => {
       const { data, error } = await supabase
         .from('report_history')
         .insert({
           type: report.type,
           name: report.name,
           event_id: report.eventId || null,
           year: report.year || null,
         })
         .select()
         .single();
       
       if (error) throw error;
       return mapDbToReportHistory(data as DbReportHistory);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
     },
   });
 };
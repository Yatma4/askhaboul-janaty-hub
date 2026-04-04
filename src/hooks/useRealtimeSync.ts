import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const REALTIME_TABLES = [
  { table: 'members', queryKey: ['members'] },
  { table: 'commissions', queryKey: ['commissions'] },
  { table: 'events', queryKey: ['events'] },
  { table: 'cotisations', queryKey: ['cotisations'] },
  { table: 'transactions', queryKey: ['transactions'] },
  { table: 'report_history', queryKey: ['reportHistory'] },
  { table: 'security_codes', queryKey: ['securityCodes'] },
];

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('realtime-all');

    REALTIME_TABLES.forEach(({ table, queryKey }) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

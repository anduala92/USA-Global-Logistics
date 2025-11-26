import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, Chip, Button } from '@mui/material';

export function Dashboard() {
  const qc = useQueryClient();
  const { data: shipments } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => (await api.get('/shipments')).data,
  });

  const seed = useMutation({
    mutationFn: async () => (await api.post('/ui/seed')).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['locations'] });
      qc.invalidateQueries({ queryKey: ['vehicle-models'] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['carriers'] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    }
  });

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">USA Global Logistics — Dashboard</Typography>
        <Button variant="contained" onClick={() => seed.mutate()}>Load Demo Data</Button>
      </Stack>
      <Stack spacing={1}>
        {(shipments ?? []).map(s => (
          <Stack key={s.id} direction="row" spacing={2} alignItems="center">
            <Typography variant="body1">Shipment #{s.id} — Order #{s.orderId}</Typography>
            <Chip size="small" label={s.status} />
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}

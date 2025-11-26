import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Chip, IconButton, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useToast } from '../components/ToastProvider';

export function ShipmentDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: shipment } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => (await api.get(`/ui/shipments/${id}`)).data,
  });

  // Assign vehicles
  const [vehicleIds, setVehicleIds] = useState('');
  const assignVehicles = useMutation({
    mutationFn: async () => await api.post(`/shipments/${id}/vehicles`, vehicleIds.split(',').map(x => parseInt(x.trim(), 10)).filter(Boolean)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); toast.success('Vehicles assigned'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Assign failed'),
  });
  const removeVehicle = useMutation({
    mutationFn: async (vehicleId) => await api.delete(`/shipments/${id}/vehicles/${vehicleId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); toast.success('Vehicle removed'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Remove failed'),
  });

  // Assign drivers
  const [driverId, setDriverId] = useState('');
  const assignDriver = useMutation({
    mutationFn: async () => await api.post(`/shipments/${id}/drivers`, [{ driverId: parseInt(driverId, 10), role: 'Primary' }]),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); toast.success('Driver assigned'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Assign failed'),
  });
  const removeDriver = useMutation({
    mutationFn: async (dId) => await api.delete(`/shipments/${id}/drivers/${dId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipment', id] }); toast.success('Driver removed'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Remove failed'),
  });

  // Advance status
  const advance = async (status) => {
    try {
      await api.post(`/shipments/${id}/status`, { status });
      toast.success(`Status -> ${status}`);
      qc.invalidateQueries({ queryKey: ['shipment', id] });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status change failed');
    }
  };

  if (!shipment) return <Container sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Shipment #{shipment.id}</Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography>Order #{shipment.orderId}</Typography>
        <Chip label={shipment.status} size="small" />
      </Stack>

      <Typography variant="h6">Vehicles</Typography>
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>VIN</TableCell>
            <TableCell>Model</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(shipment.vehicles ?? []).map(v => (
            <TableRow key={v.id} hover>
              <TableCell>{v.id}</TableCell>
              <TableCell>{v.vin}</TableCell>
              <TableCell>{v.modelMake} {v.modelName}</TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => removeVehicle.mutate(v.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField size="small" label="Vehicle IDs (comma)" value={vehicleIds} onChange={e => setVehicleIds(e.target.value)} />
        <Button variant="contained" onClick={() => assignVehicles.mutate()} disabled={!vehicleIds.trim()}>Assign</Button>
      </Stack>

      <Typography variant="h6">Drivers</Typography>
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(shipment.drivers ?? []).map(d => (
            <TableRow key={d.driverId} hover>
              <TableCell>{d.driverId}</TableCell>
              <TableCell>{d.driver?.fullName}</TableCell>
              <TableCell>{d.role ?? 'N/A'}</TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => removeDriver.mutate(d.driverId)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField size="small" label="Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} />
        <Button variant="contained" onClick={() => assignDriver.mutate()} disabled={!driverId.trim()}>Assign</Button>
      </Stack>

      <Typography variant="h6">Advance Status</Typography>
      <Stack direction="row" spacing={1}>
        {['Scheduled','PickedUp','InTransit','Delivered'].map(s => (
          <Button key={s} variant="outlined" onClick={() => advance(s)}>{s}</Button>
        ))}
      </Stack>
    </Container>
  );
}

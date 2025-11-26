import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, InputLabel, FormControl, TextField, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Shipments() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: shipments } = useQuery({ queryKey: ['shipments'], queryFn: async () => (await api.get('/ui/shipments')).data });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: async () => (await api.get('/ui/orders')).data });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await api.get('/ui/locations')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ orderId: '', pickupLocationId: '', deliveryLocationId: '', status: 'Created', scheduledPickup: '', scheduledDelivery: '', priceUsd: '' });

  const openCreate = () => { setEditing(null); setForm({ orderId: '', pickupLocationId: '', deliveryLocationId: '', status: 'Created', scheduledPickup: '', scheduledDelivery: '', priceUsd: '' }); setOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      orderId: s.orderId,
      pickupLocationId: s.pickupLocationId,
      deliveryLocationId: s.deliveryLocationId,
      status: s.status,
      scheduledPickup: s.scheduledPickup ? s.scheduledPickup.substring(0,16) : '',
      scheduledDelivery: s.scheduledDelivery ? s.scheduledDelivery.substring(0,16) : '',
      priceUsd: s.priceUsd ?? ''
    });
    setOpen(true);
  };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/shipments', {
      orderId: parseInt(form.orderId, 10),
      pickupLocationId: parseInt(form.pickupLocationId, 10),
      deliveryLocationId: parseInt(form.deliveryLocationId, 10),
      status: form.status,
      scheduledPickup: form.scheduledPickup ? new Date(form.scheduledPickup).toISOString() : null,
      scheduledDelivery: form.scheduledDelivery ? new Date(form.scheduledDelivery).toISOString() : null,
      priceUsd: form.priceUsd === '' ? null : Number(form.priceUsd)
    })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });

  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/shipments/${editing.id}`, {
      id: editing.id,
      orderId: parseInt(form.orderId, 10),
      pickupLocationId: parseInt(form.pickupLocationId, 10),
      deliveryLocationId: parseInt(form.deliveryLocationId, 10),
      status: form.status,
      scheduledPickup: form.scheduledPickup ? new Date(form.scheduledPickup).toISOString() : null,
      scheduledDelivery: form.scheduledDelivery ? new Date(form.scheduledDelivery).toISOString() : null,
      priceUsd: form.priceUsd === '' ? null : Number(form.priceUsd)
    })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/shipments/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Shipments</Typography>
        <Button variant="contained" onClick={openCreate}>New Shipment</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Order</TableCell>
            <TableCell>Pickup</TableCell>
            <TableCell>Delivery</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Detail</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(shipments ?? []).map(s => (
            <TableRow key={s.id} hover>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.orderId}</TableCell>
              <TableCell>{s.pickupLocation?.city ?? s.pickupLocationId}</TableCell>
              <TableCell>{s.deliveryLocation?.city ?? s.deliveryLocationId}</TableCell>
              <TableCell>{s.status}</TableCell>
              <TableCell>{s.priceUsd ?? ''}</TableCell>
              <TableCell><MuiLink component={Link} to={`/shipments/${s.id}`}>Open</MuiLink></TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(s.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="order-label">Order</InputLabel>
              <Select labelId="order-label" label="Order" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })}>
                {(orders ?? []).map(o => (<MenuItem key={o.id} value={o.id}>Order #{o.id}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="pickup-label">Pickup</InputLabel>
              <Select labelId="pickup-label" label="Pickup" value={form.pickupLocationId} onChange={e => setForm({ ...form, pickupLocationId: e.target.value })}>
                {(locations ?? []).map(l => (<MenuItem key={l.id} value={l.id}>{l.city}, {l.state}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="delivery-label">Delivery</InputLabel>
              <Select labelId="delivery-label" label="Delivery" value={form.deliveryLocationId} onChange={e => setForm({ ...form, deliveryLocationId: e.target.value })}>
                {(locations ?? []).map(l => (<MenuItem key={l.id} value={l.id}>{l.city}, {l.state}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select labelId="status-label" label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['Created','Scheduled','PickedUp','InTransit','Delivered','Canceled'].map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Scheduled Pickup" type="datetime-local" value={form.scheduledPickup} onChange={e => setForm({ ...form, scheduledPickup: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="Scheduled Delivery" type="datetime-local" value={form.scheduledDelivery} onChange={e => setForm({ ...form, scheduledDelivery: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="Price USD" type="number" value={form.priceUsd} onChange={e => setForm({ ...form, priceUsd: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.orderId || !form.pickupLocationId || !form.deliveryLocationId}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

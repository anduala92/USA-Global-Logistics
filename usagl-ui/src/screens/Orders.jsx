import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Orders() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: async () => (await api.get('/ui/orders')).data });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/ui/customers')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customerId: '', status: 'New', notes: '' });

  const openCreate = () => { setEditing(null); setForm({ customerId: '', status: 'New', notes: '' }); setOpen(true); };
  const openEdit = (o) => { setEditing(o); setForm({ customerId: o.customerId, status: o.status, notes: o.notes || '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/orders', form)).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/orders/${editing.id}`, { id: editing.id, ...form })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/orders/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Orders</Typography>
        <Button variant="contained" onClick={openCreate}>New Order</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(orders ?? []).map(o => (
            <TableRow key={o.id} hover>
              <TableCell>{o.id}</TableCell>
              <TableCell>{o.customerId}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell>{o.notes}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(o)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(o.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Order' : 'New Order'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="cust-label">Customer</InputLabel>
              <Select labelId="cust-label" label="Customer" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                {(customers ?? []).map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select labelId="status-label" label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['New','Confirmed','Canceled'].map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.customerId}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

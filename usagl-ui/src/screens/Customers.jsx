import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Customers() {
  const qc = useQueryClient();
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', billingTerms: '' });

  const openCreate = () => { setEditing(null); setForm({ name: '', contactEmail: '', phone: '', billingTerms: '' }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name || '', contactEmail: c.contactEmail || '', phone: c.phone || '', billingTerms: c.billingTerms || '' }); setOpen(true); };

  const toast = useToast();
  const create = useMutation({
    mutationFn: async () => (await api.post('/customers', form)).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/customers/${editing.id}`, { id: editing.id, ...form })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/customers/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Customers</Typography>
        <Button variant="contained" onClick={openCreate}>New Customer</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Billing Terms</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(customers ?? []).map(c => (
            <TableRow key={c.id} hover>
              <TableCell>{c.id}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.contactEmail}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.billingTerms}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(c.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Billing Terms" value={form.billingTerms} onChange={e => setForm({ ...form, billingTerms: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.name}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

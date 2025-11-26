import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Carriers() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: carriers } = useQuery({ queryKey: ['carriers'], queryFn: async () => (await api.get('/ui/carriers')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ legalName: '', dotNumber: '', mcNumber: '', phone: '', email: '' });

  const openCreate = () => { setEditing(null); setForm({ legalName: '', dotNumber: '', mcNumber: '', phone: '', email: '' }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ legalName: c.legalName, dotNumber: c.dotNumber || '', mcNumber: c.mcNumber || '', phone: c.phone || '', email: c.email || '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/carriers', form)).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Carrier created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/carriers/${editing.id}`, { id: editing.id, ...form })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Carrier updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/carriers/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Carrier deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Carriers</Typography>
        <Button variant="contained" onClick={openCreate}>New Carrier</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Legal Name</TableCell>
            <TableCell>DOT</TableCell>
            <TableCell>MC</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(carriers ?? []).map(c => (
            <TableRow key={c.id} hover>
              <TableCell>{c.id}</TableCell>
              <TableCell>{c.legalName}</TableCell>
              <TableCell>{c.dotNumber}</TableCell>
              <TableCell>{c.mcNumber}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(c.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Carrier' : 'New Carrier'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Legal Name" value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} />
            <TextField label="DOT" value={form.dotNumber} onChange={e => setForm({ ...form, dotNumber: e.target.value })} />
            <TextField label="MC" value={form.mcNumber} onChange={e => setForm({ ...form, mcNumber: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.legalName}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Locations() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await api.get('/ui/locations')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address1: '', city: '', state: '', zip: '', lat: '', lng: '' });

  const openCreate = () => { setEditing(null); setForm({ name: '', address1: '', city: '', state: '', zip: '', lat: '', lng: '' }); setOpen(true); };
  const openEdit = (l) => { setEditing(l); setForm({ name: l.name, address1: l.address1, city: l.city, state: l.state, zip: l.zip, lat: l.lat ?? '', lng: l.lng ?? '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/locations', { ...form, lat: form.lat === '' ? null : Number(form.lat), lng: form.lng === '' ? null : Number(form.lng) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/locations/${editing.id}`, { id: editing.id, ...form, lat: form.lat === '' ? null : Number(form.lat), lng: form.lng === '' ? null : Number(form.lng) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/locations/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); toast.success('Location deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Locations</Typography>
        <Button variant="contained" onClick={openCreate}>New Location</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>City</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Zip</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(locations ?? []).map(l => (
            <TableRow key={l.id} hover>
              <TableCell>{l.id}</TableCell>
              <TableCell>{l.name}</TableCell>
              <TableCell>{l.address1}</TableCell>
              <TableCell>{l.city}</TableCell>
              <TableCell>{l.state}</TableCell>
              <TableCell>{l.zip}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(l)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(l.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Location' : 'New Location'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Address" value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} />
            <TextField label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <TextField label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <TextField label="Zip" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Lat" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
              <TextField label="Lng" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.name || !form.address1 || !form.city || !form.state || !form.zip}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

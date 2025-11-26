import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function VehicleModels() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: models } = useQuery({ queryKey: ['vehicle-models'], queryFn: async () => (await api.get('/ui/vehicle-models')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ make: '', model: '', bodyType: '' });

  const openCreate = () => { setEditing(null); setForm({ make: '', model: '', bodyType: '' }); setOpen(true); };
  const openEdit = (m) => { setEditing(m); setForm({ make: m.make, model: m.model, bodyType: m.bodyType || '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/vehicle-models', form)).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['vehicle-models'] }); toast.success('Model created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/vehicle-models/${editing.id}`, { id: editing.id, ...form })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['vehicle-models'] }); toast.success('Model updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/vehicle-models/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicle-models'] }); toast.success('Model deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Vehicle Models</Typography>
        <Button variant="contained" onClick={openCreate}>New Model</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Make</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Body</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(models ?? []).map(m => (
            <TableRow key={m.id} hover>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.make}</TableCell>
              <TableCell>{m.model}</TableCell>
              <TableCell>{m.bodyType}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(m.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Model' : 'New Model'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <TextField label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <TextField label="Body Type" value={form.bodyType} onChange={e => setForm({ ...form, bodyType: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.make || !form.model}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

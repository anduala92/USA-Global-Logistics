import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, InputLabel, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Vehicles() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: async () => (await api.get('/ui/vehicles')).data });
  const { data: models } = useQuery({ queryKey: ['vehicle-models'], queryFn: async () => (await api.get('/ui/vehicle-models')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vin: '', year: '', color: '', modelId: '', operable: false, valueUsd: '' });

  const openCreate = () => { setEditing(null); setForm({ vin: '', year: '', color: '', modelId: '', operable: false, valueUsd: '' }); setOpen(true); };
  const openEdit = (v) => { setEditing(v); setForm({ vin: v.vin, year: v.year, color: v.color || '', modelId: v.modelId, operable: v.operable, valueUsd: v.valueUsd ?? '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/vehicles', { ...form, year: parseInt(form.year, 10), modelId: parseInt(form.modelId, 10), valueUsd: form.valueUsd === '' ? null : Number(form.valueUsd) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/vehicles/${editing.id}`, { id: editing.id, ...form, year: parseInt(form.year, 10), modelId: parseInt(form.modelId, 10), valueUsd: form.valueUsd === '' ? null : Number(form.valueUsd) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/vehicles/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Vehicles</Typography>
        <Button variant="contained" onClick={openCreate}>New Vehicle</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>VIN</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Operable</TableCell>
            <TableCell>Value USD</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(vehicles ?? []).map(v => (
            <TableRow key={v.id} hover>
              <TableCell>{v.id}</TableCell>
              <TableCell>{v.vin}</TableCell>
              <TableCell>{v.year}</TableCell>
              <TableCell>{v.modelMake ? `${v.modelMake} ${v.modelName}` : `${v.model?.make ?? ''} ${v.model?.model ?? ''}`}</TableCell>
              <TableCell>{v.operable ? 'Yes' : 'No'}</TableCell>
              <TableCell>{v.valueUsd ?? ''}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(v)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(v.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Vehicle' : 'New Vehicle'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="VIN" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} />
            <TextField label="Year" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            <TextField label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel id="model-label">Model</InputLabel>
              <Select labelId="model-label" label="Model" value={form.modelId} onChange={e => setForm({ ...form, modelId: e.target.value })}>
                {(models ?? []).map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.make} {m.model}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel control={<Checkbox checked={form.operable} onChange={e => setForm({ ...form, operable: e.target.checked })} />} label="Operable" />
            <TextField label="Value USD" type="number" value={form.valueUsd} onChange={e => setForm({ ...form, valueUsd: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.vin || !form.year || !form.modelId}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

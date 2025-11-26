import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Container, Typography, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../components/ToastProvider';

export function Drivers() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: async () => (await api.get('/ui/drivers')).data });
  const { data: carriers } = useQuery({ queryKey: ['carriers'], queryFn: async () => (await api.get('/ui/carriers')).data });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ carrierId: '', fullName: '', licenseNo: '', licenseState: '', phone: '' });

  const openCreate = () => { setEditing(null); setForm({ carrierId: '', fullName: '', licenseNo: '', licenseState: '', phone: '' }); setOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ carrierId: d.carrierId, fullName: d.fullName, licenseNo: d.licenseNo || '', licenseState: d.licenseState || '', phone: d.phone || '' }); setOpen(true); };

  const create = useMutation({
    mutationFn: async () => (await api.post('/ui/drivers', { ...form, carrierId: parseInt(form.carrierId, 10) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver created'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/ui/drivers/${editing.id}`, { id: editing.id, ...form, carrierId: parseInt(form.carrierId, 10) })).data,
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });
  const del = useMutation({
    mutationFn: async (id) => (await api.delete(`/ui/drivers/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const submit = () => { editing ? update.mutate() : create.mutate(); };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Drivers</Typography>
        <Button variant="contained" onClick={openCreate}>New Driver</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Carrier</TableCell>
            <TableCell>License</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(drivers ?? []).map(d => (
            <TableRow key={d.id} hover>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.fullName}</TableCell>
              <TableCell>{d.carrier?.legalName ?? d.carrierId}</TableCell>
              <TableCell>{d.licenseNo}</TableCell>
              <TableCell>{d.licenseState}</TableCell>
              <TableCell>{d.phone}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => del.mutate(d.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Driver' : 'New Driver'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="carrier-label">Carrier</InputLabel>
              <Select labelId="carrier-label" label="Carrier" value={form.carrierId} onChange={e => setForm({ ...form, carrierId: e.target.value })}>
                {(carriers ?? []).map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.legalName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="License No" value={form.licenseNo} onChange={e => setForm({ ...form, licenseNo: e.target.value })} />
            <TextField label="License State" value={form.licenseState} onChange={e => setForm({ ...form, licenseState: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.carrierId || !form.fullName}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

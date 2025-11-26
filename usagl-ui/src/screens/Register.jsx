import { useState } from 'react';
import { api } from '../api/client';
import { Container, Stack, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const toast = useToast();
  async function doRegister() {
    setError(null); setSuccess(null);
    try {
      await api.post('/auth/register', { email, password, role });
      setSuccess('Registration successful. You can now login.');
      toast.success('Registration successful');
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <Container sx={{ py: 8, maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Create account</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <FormControl fullWidth>
          <InputLabel id="role-label">Role</InputLabel>
          <Select labelId="role-label" label="Role" value={role} onChange={e => setRole(e.target.value)}>
            {['Admin','Dispatcher','Driver'].map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={doRegister} disabled={!email || !password}>Register</Button>
          <Button component={Link} to="/login">Back to Login</Button>
        </Stack>
      </Stack>
    </Container>
  );
}

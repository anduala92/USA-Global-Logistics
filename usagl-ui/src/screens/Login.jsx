import { useState } from 'react';
import { api } from '../api/client';
import { setTokens, loadTokens } from '../auth/tokenStore';
import { Container, Stack, TextField, Button, Typography, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export function Login() {
  const [email, setEmail] = useState('admin@usagl.com');
  const [password, setPassword] = useState('P@ssw0rd!');
  const [error, setError] = useState(null);

  const toast = useToast();
  async function doLogin() {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password, deviceInfo: 'UI' });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      loadTokens();
      toast.success('Login successful');
      setTimeout(() => { window.location.href = '/'; }, 200);
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <Container sx={{ py: 8, maxWidth: 420 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Sign in</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" onClick={doLogin}>Login</Button>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Don\'t have an account? <Link to="/register">Register</Link>
        </Typography>
      </Stack>
    </Container>
  );
}

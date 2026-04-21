import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Tabs, Tab, TextField, Button, Stack, Typography, Alert,
} from '@mui/material';
import api from '../api.js';
import { setAuth } from '../auth.js';

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const path = tab === 0 ? '/auth/login' : '/auth/register';
      const body = tab === 0 ? { email, password } : { storeName, email, password };
      const { data } = await api.post(path, body);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Clothing Admin</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Registro" />
        </Tabs>
        <form onSubmit={submit}>
          <Stack spacing={2}>
            {tab === 1 && (
              <TextField
                label="Nombre de la tienda"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                fullWidth
              />
            )}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            {err && <Alert severity="error">{err}</Alert>}
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {tab === 0 ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

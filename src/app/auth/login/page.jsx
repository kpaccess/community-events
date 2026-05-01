'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    router.push('/events');
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F8F7FF 50%, #FDF4FF 100%)',
    }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 3 }} elevation={0}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 52, height: 52, mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
            }}>
              <Typography sx={{ color: '#fff', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.5rem' }}>G</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back</Typography>
            <Typography color="text.secondary" fontSize="0.9rem">
              Sign in to your Gather account
            </Typography>
          </Box>

          {/* Hint */}
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
            <strong>Admin demo:</strong> admin@gather.com / admin123
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              type={showPw ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                      {showPw ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.4, fontSize: '1rem', mb: 2 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography textAlign="center" fontSize="0.9rem" color="text.secondary">
            Don't have an account?{' '}
            <Box component={Link} href="/auth/signup" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>
              Sign up free
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

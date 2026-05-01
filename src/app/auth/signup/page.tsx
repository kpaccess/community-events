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
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '@/context/AppContext';

const PERKS = [
  'RSVP to events in one click',
  'Get reminders & updates',
  'Connect with the community',
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Signup failed.'); return; }
    router.push('/events');
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #EEF2FF 0%, #F8F7FF 50%, #FDF4FF 100%)' }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ width: 44, height: 44, mb: 2, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              <Typography sx={{ color: '#fff', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>G</Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1, fontFamily: '"Syne", sans-serif' }}>Join Gather</Typography>
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>Your local community events hub. Free forever.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {PERKS.map(p => (
                <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>{p}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={700} mb={2.5} display={{ xs: 'none', md: 'block' }}>Create account</Typography>
            <Typography variant="h6" fontWeight={700} mb={0.5} display={{ xs: 'block', md: 'none' }}>Create your account</Typography>
            <Typography color="text.secondary" fontSize="0.9rem" mb={2.5} display={{ xs: 'block', md: 'none' }}>Join the community today</Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField label="Full name" fullWidth value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <TextField label="Email address" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <TextField label="Password" type={showPw ? 'text' : 'password'} fullWidth value={password}
                onChange={e => setPassword(e.target.value)} helperText="At least 6 characters" sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                        {showPw ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.4, fontSize: '1rem', mb: 2 }}>
                {loading ? 'Creating account…' : 'Create free account'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography textAlign="center" fontSize="0.9rem" color="text.secondary">
              Already have an account?{' '}
              <Box component={Link} href="/auth/login" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Sign in</Box>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

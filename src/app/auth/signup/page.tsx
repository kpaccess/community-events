'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

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

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: '/events' });
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
              <Button
                variant="outlined" fullWidth size="large"
                startIcon={<GoogleIcon />}
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                sx={{ py: 1.2, borderColor: 'divider', color: 'text.primary', fontWeight: 500, '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' } }}
              >
                {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
              </Button>
              <Button
                variant="outlined" fullWidth size="large"
                startIcon={<GitHubIcon />}
                onClick={() => handleOAuth('github')}
                disabled={!!oauthLoading}
                sx={{ py: 1.2, borderColor: 'divider', color: 'text.primary', fontWeight: 500, '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' } }}
              >
                {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography fontSize="0.8rem" color="text.secondary">or sign up with email</Typography>
            </Divider>

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
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || !!oauthLoading} sx={{ py: 1.4, fontSize: '1rem', mb: 2 }}>
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

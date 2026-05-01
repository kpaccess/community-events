'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#1C1917',
    },
    success: { main: '#10B981', light: '#D1FAE5', dark: '#047857' },
    error: { main: '#EF4444', light: '#FEE2E2', dark: '#B91C1C' },
    warning: { main: '#F59E0B' },
    info: { main: '#6366F1' },
    background: {
      default: '#F8F7FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E1B4B',
      secondary: '#6B7280',
    },
    divider: 'rgba(79,70,229,0.1)',
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
    subtitle1: { fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(79,70,229,0.06)',
    '0 1px 4px rgba(79,70,229,0.08)',
    '0 2px 8px rgba(79,70,229,0.08)',
    '0 4px 16px rgba(79,70,229,0.10)',
    '0 8px 24px rgba(79,70,229,0.12)',
    '0 12px 32px rgba(79,70,229,0.14)',
    '0 16px 40px rgba(79,70,229,0.16)',
    '0 20px 48px rgba(79,70,229,0.18)',
    '0 24px 56px rgba(79,70,229,0.20)',
    ...Array(15).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"Syne", sans-serif',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: '0.95rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(79,70,229,0.45)',
            background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
          boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
          },
        },
        outlinedPrimary: {
          borderColor: '#4F46E5',
          '&:hover': {
            background: 'rgba(79,70,229,0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.06)',
          border: '1px solid rgba(79,70,229,0.08)',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 28px rgba(79,70,229,0.14)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F46E5',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: '"Syne", sans-serif',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 0 rgba(79,70,229,0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#6B7280',
            background: '#F8F7FF',
          },
        },
      },
    },
  },
});

export default theme;

'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import { useApp } from '@/context/AppContext';

const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Violet', value: '#7C3AED' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Rose', value: '#EC4899' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Sky', value: '#0EA5E9' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Slate', value: '#475569' },
];

interface EventFormState {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  address: string;
  category: string;
  capacity: number | string;
  colorTag: string;
  tags: string;
  online: boolean;
}

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  location: '',
  address: '',
  category: '',
  capacity: 50,
  colorTag: '#4F46E5',
  tags: '',
  online: false,
};

function CreateEventPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin, events, createEvent, updateEvent } = useApp();

  const editId = searchParams.get('edit');
  const isEdit = Boolean(editId);

  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = Array.from(
    new Set(events.map(e => e.category?.trim()).filter((c): c is string => Boolean(c)))
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (currentUser && !isAdmin) router.push('/events');
    if (!currentUser) router.push('/auth/login');
  }, [currentUser, isAdmin, router]);

  useEffect(() => {
    if (isEdit && editId) {
      const evt = events.find(e => e.id === editId);
      if (evt) {
        setForm({
          title: evt.title || '',
          description: evt.description || '',
          date: evt.date || '',
          time: evt.time || '',
          endTime: evt.endTime || '',
          location: evt.location || '',
          address: evt.address || '',
          category: evt.category || '',
          capacity: evt.capacity || 50,
          colorTag: evt.colorTag || '#4F46E5',
          tags: (evt.tags || []).join(', '),
          online: evt.online || false,
        });
      }
    }
  }, [isEdit, editId, events]);

  const set = (key: keyof EventFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Event title is required.'); return; }
    if (!form.date) { setError('Event date is required.'); return; }
    if (!form.time) { setError('Start time is required.'); return; }
    if (!form.location.trim()) { setError('Location is required.'); return; }
    if (!form.category.trim()) { setError('Event type is required.'); return; }
    if (Number(form.capacity) < 1) { setError('Capacity must be at least 1.'); return; }

    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      endTime: form.endTime,
      location: form.location,
      address: form.address,
      category: form.category.trim(),
      capacity: parseInt(String(form.capacity)),
      colorTag: form.colorTag,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      online: form.location.toLowerCase().includes('online') || form.location.toLowerCase().includes('zoom') || form.online,
    };

    try {
      if (isEdit && editId) {
        await updateEvent(editId, payload);
        router.push(`/events/${editId}`);
      } else {
        const newEvent = await createEvent(payload);
        if (!newEvent) { setError('Failed to create event.'); setSaving(false); return; }
        router.push(`/events/${newEvent.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  };

  if (!currentUser || !isAdmin) return null;

  return (
    <Box sx={{ background: '#F8F7FF', minHeight: 'calc(100vh - 64px)', pb: 8 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B, #312E81)', py: 4 }}>
        <Container maxWidth="lg">
          <Button component={Link} href="/events" startIcon={<ArrowBackIcon />} sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, '&:hover': { color: '#fff' } }}>
            Back to Events
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${form.colorTag}, ${form.colorTag}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EventIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h4" color="#fff" fontWeight={800}>{isEdit ? 'Edit Event' : 'Create New Event'}</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={2.5}>Basic Information</Typography>
                <TextField label="Event Title *" fullWidth value={form.title} onChange={set('title')} sx={{ mb: 2.5 }}
                  inputProps={{ maxLength: 100 }} helperText={`${form.title.length}/100`}
                />
                <TextField label="Description *" fullWidth multiline rows={7} value={form.description} onChange={set('description')}
                  helperText="Describe what attendees can expect. Tip: Use line breaks for readability."
                />
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={2.5}>Date & Time</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Date *" type="date" fullWidth value={form.date} onChange={set('date')} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="Start Time *" type="time" fullWidth value={form.time} onChange={set('time')} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField label="End Time" type="time" fullWidth value={form.endTime} onChange={set('endTime')} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={2.5}>Location</Typography>
                <TextField label="Venue / Location Name *" fullWidth value={form.location} onChange={set('location')}
                  placeholder="e.g. WeWork Downtown Nashville, or Online – Zoom" sx={{ mb: 2 }}
                  helperText='Type "Online" or "Zoom" to mark as a virtual event'
                />
                <TextField label="Street Address" fullWidth value={form.address} onChange={set('address')}
                  placeholder="e.g. 500 Church St, Nashville, TN 37219"
                />
              </Paper>

              <Paper sx={{ p: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={2.5}>Event Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo
                      options={categoryOptions}
                      value={form.category}
                      onChange={(_, value) => setForm(f => ({ ...f, category: value ?? '' }))}
                      onInputChange={(_, value) => setForm(f => ({ ...f, category: value }))}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Event Type *"
                          placeholder="e.g. Hiking, Downtown tour, Workshop"
                          helperText="Type a new event type or choose one already used."
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Capacity *" type="number" fullWidth value={form.capacity} onChange={set('capacity')}
                      inputProps={{ min: 1, max: 10000 }} helperText="Max number of attendees"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Tags" fullWidth value={form.tags} onChange={set('tags')}
                      placeholder="React, Next.js, TypeScript"
                      helperText="Comma-separated tags to help people find your event"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>Event Color</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>Appears on the event card and detail page</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {COLOR_OPTIONS.map(c => (
                    <Tooltip key={c.value} title={c.label}>
                      <Box onClick={() => setForm(f => ({ ...f, colorTag: c.value }))}
                        sx={{
                          width: 36, height: 36, borderRadius: 2, cursor: 'pointer', background: c.value,
                          boxShadow: form.colorTag === c.value ? `0 0 0 2px #fff, 0 0 0 4px ${c.value}` : '0 2px 6px rgba(0,0,0,0.2)',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 2, background: `${form.colorTag}12`, border: `1px solid ${form.colorTag}30` }}>
                  <Box sx={{ width: '100%', height: 4, borderRadius: 1, background: form.colorTag, mb: 1 }} />
                  <Typography fontSize="0.8rem" fontWeight={700} color={form.colorTag}>{form.category || 'Event Type'}</Typography>
                  <Typography fontSize="0.85rem" fontWeight={600} mt={0.5} color="text.primary" noWrap>{form.title || 'Your Event Title'}</Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={1}>{isEdit ? 'Save Changes' : 'Publish Event'}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                  {isEdit ? 'Changes will be visible immediately.' : 'Your event will be visible to all members once published.'}
                </Typography>
                <Button type="submit" variant="contained" fullWidth size="large" startIcon={<SaveIcon />} disabled={saving} sx={{ py: 1.5, mb: 1.5 }}>
                  {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Event'}
                </Button>
                <Button component={Link} href={isEdit && editId ? `/events/${editId}` : '/events'} variant="outlined" fullWidth disabled={saving}>
                  Cancel
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={null}>
      <CreateEventPageInner />
    </Suspense>
  );
}

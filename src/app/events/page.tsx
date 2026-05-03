'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import EventCard from '@/components/EventCard';
import { useApp } from '@/context/AppContext';
import type { Attendee } from '@/types';

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date (Soonest)' },
  { value: 'date-desc', label: 'Date (Latest)' },
  { value: 'popular', label: 'Most Popular' },
];

function EventsPageInner() {
  const searchParams = useSearchParams();
  const { events, currentUser, loading } = useApp();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('date-asc');
  const [showPast, setShowPast] = useState(false);

  const categories = useMemo(() => {
    const eventCategories = events
      .map(e => e.category?.trim())
      .filter((cat): cat is string => Boolean(cat));
    return ['All', ...Array.from(new Set(eventCategories)).sort((a, b) => a.localeCompare(b))];
  }, [events]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => {
        const isUpcoming = new Date(e.date + 'T23:59:59') >= now;
        if (!showPast && !isUpcoming) return false;
        if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
            !(e.description ?? '').toLowerCase().includes(search.toLowerCase()) &&
            !(e.location ?? '').toLowerCase().includes(search.toLowerCase())) return false;
        if (category !== 'All' && e.category !== category) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sort === 'popular') {
          const ag = (a.attendees || []).filter(x => x.status === 'going').length;
          const bg = (b.attendees || []).filter(x => x.status === 'going').length;
          return bg - ag;
        }
        return 0;
      });
  }, [events, search, category, sort, showPast]);

  const myRsvpMap = useMemo(() => {
    if (!currentUser) return {} as Record<string, Attendee>;
    return events.reduce((map, e) => {
      const rsvp = (e.attendees || []).find(a => a.userId === currentUser.id);
      if (rsvp) map[e.id] = rsvp;
      return map;
    }, {} as Record<string, Attendee>);
  }, [events, currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" color="#fff" sx={{ mb: 0.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>Explore Events</Typography>
          <Typography color="rgba(255,255,255,0.65)" sx={{ mb: 3, fontSize: '1rem' }}>
            {events.filter(e => new Date(e.date + 'T23:59:59') >= new Date()).length} upcoming events in your community
          </Typography>
          <TextField
            placeholder="Search events by name, location, or topic…"
            fullWidth value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              sx: { background: '#fff', borderRadius: 2 },
            }}
            sx={{ maxWidth: 600 }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
            {categories.map(cat => (
              <Chip key={cat} label={cat} onClick={() => setCategory(cat)}
                variant={category === cat ? 'filled' : 'outlined'}
                color={category === cat ? 'primary' : 'default'}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              />
            ))}
            <Chip label={showPast ? 'Hide Past' : 'Show Past'} onClick={() => setShowPast(p => !p)}
              variant={showPast ? 'filled' : 'outlined'}
              color={showPast ? 'secondary' : 'default'}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sort} label="Sort by" onChange={e => setSort(e.target.value)} sx={{ borderRadius: 2 }}>
              {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
          {filtered.length} {filtered.length === 1 ? 'event' : 'events'} found
        </Typography>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <EventIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>No events found</Typography>
            <Typography>Try adjusting your search or filters.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(event => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} myRsvp={myRsvpMap[event.id]} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsPageInner />
    </Suspense>
  );
}

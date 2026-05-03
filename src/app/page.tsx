"use client";
import { useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BrushIcon from "@mui/icons-material/Brush";
import CampaignIcon from "@mui/icons-material/Campaign";
import HikingIcon from "@mui/icons-material/Hiking";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EventCard from "@/components/EventCard";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  { label: "Hiking", icon: <HikingIcon />, color: "#16A34A" },
  { label: "Downtown", icon: <LocationCityIcon />, color: "#0EA5E9" },
  { label: "Technology", icon: <CodeIcon />, color: "#4F46E5" },
  {
    label: "AI & Machine Learning",
    icon: <PsychologyIcon />,
    color: "#F59E0B",
  },
  { label: "Design", icon: <BrushIcon />, color: "#EC4899" },
  { label: "Marketing", icon: <CampaignIcon />, color: "#10B981" },
];

const STEPS = [
  {
    n: "01",
    title: "Discover Events",
    desc: "Browse upcoming events by category, date, or location. Find your community.",
  },
  {
    n: "02",
    title: "Join & RSVP",
    desc: "Sign up with one click. Secure your spot before it fills up.",
  },
  {
    n: "03",
    title: "Connect & Learn",
    desc: "Show up, meet people, and grow together. That simple.",
  },
];

export default function HomePage() {
  const { events, currentUser } = useApp();

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.date + "T23:59:59") >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  const totalGoing = useMemo(
    () =>
      events.reduce(
        (sum, e) =>
          sum + (e.attendees || []).filter((a) => a.status === "going").length,
        0,
      ),
    [events],
  );

  return (
    <Box>
      {/* Hero */}
      <Box
        className="hero-bg"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 10, md: 14 },
        }}
      >
        <Box className="hero-mesh" />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ maxWidth: 720, mx: "auto", textAlign: "center" }}>
            <Chip
              label="✦ Community-first events platform"
              sx={{
                mb: 3,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.8rem",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.8rem", md: "4.5rem" },
                color: "#fff",
                mb: 2.5,
                lineHeight: 1.05,
              }}
            >
              Find Your
              <Box
                component="span"
                sx={{
                  display: "block",
                  background: "linear-gradient(135deg, #FCD34D, #F97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Community
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.75)",
                mb: 5,
                fontWeight: 400,
                fontSize: { xs: "1rem", md: "1.2rem" },
                lineHeight: 1.7,
              }}
            >
              Discover events, meet like-minded people, and grow together.
              <br />
              From tech meetups to creative workshops — it all happens here.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                href="/events"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(135deg, #F59E0B, #F97316)",
                  color: "#fff",
                  fontFamily: '"Syne", sans-serif',
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 20px rgba(245,158,11,0.5)",
                  "&:hover": {
                    boxShadow: "0 6px 28px rgba(245,158,11,0.6)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Browse Events
              </Button>
              {!currentUser && (
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.5)",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      borderColor: "#fff",
                      background: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Create Account
                </Button>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: { xs: 3, md: 6 },
              mt: 8,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: <EventIcon />, value: events.length, label: "Events" },
              { icon: <PeopleIcon />, value: `${totalGoing}+`, label: "RSVPs" },
              { icon: <LocationOnIcon />, value: "3", label: "Cities" },
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: "center", color: "#fff" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ color: "#FCD34D", display: "flex" }}>{s.icon}</Box>
                  <Typography
                    sx={{
                      fontFamily: '"Syne", sans-serif',
                      fontWeight: 800,
                      fontSize: "1.8rem",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Upcoming Events */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={700}
              sx={{ letterSpacing: "0.1em" }}
            >
              Happening Soon
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}
            >
              Upcoming Events
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/events"
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: "primary.main",
              fontWeight: 600,
              display: { xs: "none", sm: "flex" },
            }}
          >
            View all
          </Button>
        </Box>

        {upcoming.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
            <Typography>No upcoming events. Check back soon!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {upcoming.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            display: { xs: "block", sm: "none" },
          }}
        >
          <Button
            component={Link}
            href="/events"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
          >
            View all events
          </Button>
        </Box>
      </Container>

      {/* Categories */}
      <Box
        sx={{
          background: "rgba(79,70,229,0.03)",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            sx={{ letterSpacing: "0.1em", display: "block", mb: 1 }}
          >
            Explore by Category
          </Typography>
          <Typography
            variant="h3"
            sx={{ mb: 4, fontSize: { xs: "1.8rem", md: "2.2rem" } }}
          >
            Find What You Love
          </Typography>
          <Grid container spacing={2}>
            {CATEGORIES.map((cat) => (
              <Grid item xs={6} sm={4} md={2.4} key={cat.label}>
                <Paper
                  component={Link}
                  href={`/events?category=${encodeURIComponent(cat.label)}`}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    textDecoration: "none",
                    cursor: "pointer",
                    display: "block",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      borderColor: cat.color,
                      background: `${cat.color}08`,
                      transform: "translateY(-3px)",
                    },
                    transition: "all 0.25s",
                  }}
                >
                  <Box
                    sx={{ color: cat.color, mb: 1, "& svg": { fontSize: 28 } }}
                  >
                    {cat.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    fontSize="0.8rem"
                    color="text.primary"
                  >
                    {cat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            sx={{ letterSpacing: "0.1em" }}
          >
            Simple as 1-2-3
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}
          >
            How It Works
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {STEPS.map((step, i) => (
            <Grid item xs={12} md={4} key={step.n}>
              <Box sx={{ position: "relative" }}>
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      top: 28,
                      left: "60%",
                      right: "-20%",
                      height: 2,
                      background:
                        "linear-gradient(90deg, #4F46E5, transparent)",
                      zIndex: 0,
                    }}
                  />
                )}
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Syne", sans-serif',
                      fontWeight: 800,
                      fontSize: "3.5rem",
                      color: "rgba(79,70,229,0.12)",
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {step.n}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      {!currentUser && (
        <Box
          sx={{
            background: "linear-gradient(135deg, #1E1B4B, #3730A3)",
            py: { xs: 8, md: 10 },
            textAlign: "center",
          }}
        >
          <Container maxWidth="sm">
            <Typography
              variant="h3"
              color="#fff"
              sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.4rem" } }}
            >
              Ready to join the community?
            </Typography>
            <Typography
              color="rgba(255,255,255,0.7)"
              sx={{ mb: 4, fontSize: "1.1rem" }}
            >
              Create a free account and start RSVPing to events today.
            </Typography>
            <Button
              component={Link}
              href="/auth/signup"
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(135deg, #F59E0B, #F97316)",
                px: 5,
                py: 1.5,
                fontSize: "1.05rem",
                boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
              }}
            >
              Get Started Free
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const deadlineDate = new Date('2025-10-26').getTime();
      const now = new Date().getTime();
      const difference = deadlineDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
            }}
          >
            Universidade Agostinho Neto
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Inscrição ao Exame de Acesso
          </Typography>

          <Box sx={{ mb: 5 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                fontSize: '1.1rem',
                opacity: 0.9,
              }}
            >
              Prazo para inscrição:
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 2,
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              {[
                { label: 'Dias', value: countdown.days },
                { label: 'Horas', value: countdown.hours },
                { label: 'Minutos', value: countdown.minutes },
                { label: 'Segundos', value: countdown.seconds },
              ].map((item) => (
                <Paper
                  key={item.label}
                  sx={{
                    p: 2.5,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 0.5,
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          <Paper
            sx={{
              p: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#333',
                mb: 2,
                fontWeight: 600,
              }}
            >
              ⏰ Não perca o prazo!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              Complete sua inscrição ao Exame de Acesso preenchendo todos os campos obrigatórios e anexando os documentos solicitados.
            </Typography>
            <Button
              onClick={() => navigate('/inscricao')}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 1,
              }}
            >
              Iniciar Inscrição
            </Button>
          </Paper>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
            }}
          >
            © 2025 Universidade Agostinho Neto. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

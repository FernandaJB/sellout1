import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { Toast } from 'primereact/toast';

const RestablecerContrasenia = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // Entre 8 y 10 caracteres, al menos una mayúscula, una minúscula y un número
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,10}$/;
    return re.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'El correo electrónico es requerido';
    else if (!validateEmail(email)) newErrors.email = 'Ingrese un correo electrónico válido';

    if (!code.trim()) newErrors.code = 'El código de verificación es requerido';
    else if (code.length !== 6) newErrors.code = 'El código debe tener 6 dígitos';

    if (!newPassword) newErrors.newPassword = 'La nueva contraseña es requerida';
    else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'La contraseña debe tener entre 8 y 10 caracteres, incluyendo al menos una mayúscula, una minúscula y un número';
    }

    if (!confirmPassword) newErrors.confirmPassword = 'Confirme la nueva contraseña';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Por favor, corrija los errores en el formulario' });
      return;
    }

    setProcessing(true);

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('code', code);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      const response = await fetch('/api/security/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Contraseña restablecida exitosamente' });
        setTimeout(() => {
          setEmail('');
          setCode('');
          setNewPassword('');
          setConfirmPassword('');
          navigate('/');
        }, 4000);
      } else {
        const errorMessage = await response.text();
        toast.current.show({ severity: 'error', summary: 'Error', detail: `Error: ${errorMessage}` });
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `Error: ${error.message}` });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: 'linear-gradient(to bottom right, #1d1c1a, #555151, #c2ac33)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Restablecer Contraseña
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="code"
              label="Código de Verificación"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="newPassword"
              label="Nueva Contraseña"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Restablecer Contraseña'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
              disabled={processing}
            >
              Regresar al Login
            </Button>
          </Box>
        </Paper>
      </Container>
      <Toast ref={toast} />
    </Box>
  );
};

export default RestablecerContrasenia;
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface FormData {
  fullName: string;
  biNumber: string;
  birthDate: string;
  maritalStatus: string;
  nationality: string;
  address: string;
  phone: string;
  school: string;
  education: string;
  yearOfCompletion: string;
  finalGrade: string;
  course1: string;
  course1Regime: string;
  course2: string;
  course2Regime: string;
  email: string;
  registrationNumber?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface DocumentFiles {
  [key: string]: File | null;
}

const COURSES = ['Matemática', 'Ciência', 'Raciocínio Lógico', 'Direito', 'Engenharia'];
const REGIMES = ['Diurno', 'Noturno', 'Pós-laboral'];
const COUNTRIES = ['Angola', 'Portugal', 'Brasil', 'Moçambique', 'Cabo Verde', 'Outros'];
const MARITAL_STATUSES = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União de Fato'];

const InscricaoMultiStep: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    biNumber: '',
    birthDate: '',
    maritalStatus: '',
    nationality: '',
    address: '',
    phone: '',
    school: '',
    education: '',
    yearOfCompletion: new Date().getFullYear().toString(),
    finalGrade: '',
    course1: '',
    course1Regime: '',
    course2: '',
    course2Regime: '',
    email: '',
    registrationNumber: `REG-${Date.now()}`,
  });

  const [documents, setDocuments] = useState<DocumentFiles>({
    secondaryCertificate: null,
    identification: null,
    photo: null,
    paymentProof: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const steps = [
    'Informações Pessoais',
    'Origem e Formação',
    'Seleção de Cursos',
    'Documentos',
    'Confirmação',
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+|00)?[0-9\s\-()]{7,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
      if (!formData.biNumber.trim()) newErrors.biNumber = 'Número do BI é obrigatório';
      if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
      if (!formData.maritalStatus) newErrors.maritalStatus = 'Estado civil é obrigatório';
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
      else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    } else if (step === 1) {
      if (!formData.nationality) newErrors.nationality = 'Nacionalidade é obrigatória';
      if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
      if (!formData.phone.trim()) newErrors.phone = 'Telemóvel é obrigatório';
      else if (!validatePhone(formData.phone)) newErrors.phone = 'Número inválido';
      if (!formData.school.trim()) newErrors.school = 'Escola é obrigatória';
      if (!formData.education.trim()) newErrors.education = 'Habilitação é obrigatória';
      if (!formData.yearOfCompletion) newErrors.yearOfCompletion = 'Ano é obrigatório';
    } else if (step === 2) {
      if (!formData.course1) newErrors.course1 = 'Selecione um curso';
      if (!formData.course1Regime) newErrors.course1Regime = 'Selecione o regime';
      if (!formData.course2) newErrors.course2 = 'Selecione um curso';
      if (!formData.course2Regime) newErrors.course2Regime = 'Selecione o regime';
    } else if (step === 3) {
      if (!documents.identification) newErrors.identification = 'Documento obrigatório';
      if (!documents.secondaryCertificate) newErrors.secondaryCertificate = 'Certificado obrigatório';
      if (!documents.photo) newErrors.photo = 'Foto obrigatória';
      if (!documents.paymentProof) newErrors.paymentProof = 'Comprovativo obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects an option
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      
      // Clear error when user uploads a file
      if (errors[docType]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[docType];
          return newErrors;
        });
      }
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFinish = () => {
    if (validateStep(activeStep)) {
      setSuccessDialogOpen(true);
      // Here you would typically submit the form data to your backend
      console.log('Form submitted:', { ...formData, documents });
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      biNumber: '',
      birthDate: '',
      maritalStatus: '',
      nationality: '',
      address: '',
      phone: '',
      school: '',
      education: '',
      yearOfCompletion: new Date().getFullYear().toString(),
      finalGrade: '',
      course1: '',
      course1Regime: '',
      course2: '',
      course2Regime: '',
      email: '',
      registrationNumber: `REG-${Date.now()}`,
    });
    setDocuments({
      secondaryCertificate: null,
      identification: null,
      photo: null,
      paymentProof: null,
    });
    setErrors({});
    setActiveStep(0);
    setSuccessDialogOpen(false);
  };

  const renderStepContent = (step: number) => {
    const formFieldSx = {
      mb: isMobile ? 1.5 : 2,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
      },
    };

    switch (step) {
      case 0:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Informações Pessoais
            </Typography>
            <TextField
              fullWidth
              label="Nome Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="BI/Passaporte"
              name="biNumber"
              value={formData.biNumber}
              onChange={handleInputChange}
              error={!!errors.biNumber}
              helperText={errors.biNumber}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="Data de Nascimento"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <FormControl fullWidth error={!!errors.maritalStatus} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Estado Civil</InputLabel>
              <Select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleSelectChange}
                label="Estado Civil"
              >
                {MARITAL_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
              {errors.maritalStatus && (
                <Typography variant="caption" color="error">
                  {errors.maritalStatus}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Origem e Formação
            </Typography>
            <FormControl fullWidth error={!!errors.nationality} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Nacionalidade</InputLabel>
              <Select
                name="nationality"
                value={formData.nationality}
                onChange={handleSelectChange}
                label="Nacionalidade"
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
              {errors.nationality && (
                <Typography variant="caption" color="error">
                  {errors.nationality}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Endereço"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={!!errors.address}
              helperText={errors.address}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="Telemóvel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={!!errors.phone}
              helperText={errors.phone}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="Escola de Origem"
              name="school"
              value={formData.school}
              onChange={handleInputChange}
              error={!!errors.school}
              helperText={errors.school}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="Habilitação Literária"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              error={!!errors.education}
              helperText={errors.education}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              fullWidth
              label="Ano de Conclusão"
              name="yearOfCompletion"
              type="number"
              value={formData.yearOfCompletion}
              onChange={handleInputChange}
              error={!!errors.yearOfCompletion}
              helperText={errors.yearOfCompletion}
              variant="outlined"
              sx={formFieldSx}
              size={isMobile ? 'small' : 'medium'}
              inputProps={{
                min: 1900,
                max: new Date().getFullYear(),
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Seleção de Cursos
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              1ª Opção de Curso
            </Typography>
            <FormControl fullWidth error={!!errors.course1} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Curso</InputLabel>
              <Select
                name="course1"
                value={formData.course1}
                onChange={handleSelectChange}
                label="Curso"
              >
                {COURSES.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
              {errors.course1 && (
                <Typography variant="caption" color="error">
                  {errors.course1}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.course1Regime} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Regime</InputLabel>
              <Select
                name="course1Regime"
                value={formData.course1Regime}
                onChange={handleSelectChange}
                label="Regime"
              >
                {REGIMES.map((regime) => (
                  <MenuItem key={regime} value={regime}>
                    {regime}
                  </MenuItem>
                ))}
              </Select>
              {errors.course1Regime && (
                <Typography variant="caption" color="error">
                  {errors.course1Regime}
                </Typography>
              )}
            </FormControl>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
              2ª Opção de Curso
            </Typography>
            <FormControl fullWidth error={!!errors.course2} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Curso</InputLabel>
              <Select
                name="course2"
                value={formData.course2}
                onChange={handleSelectChange}
                label="Curso"
              >
                {COURSES.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
              {errors.course2 && (
                <Typography variant="caption" color="error">
                  {errors.course2}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.course2Regime} sx={{ ...formFieldSx }} size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Regime</InputLabel>
              <Select
                name="course2Regime"
                value={formData.course2Regime}
                onChange={handleSelectChange}
                label="Regime"
              >
                {REGIMES.map((regime) => (
                  <MenuItem key={regime} value={regime}>
                    {regime}
                  </MenuItem>
                ))}
              </Select>
              {errors.course2Regime && (
                <Typography variant="caption" color="error">
                  {errors.course2Regime}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Documentos Necessários
            </Typography>
            <Alert severity="info" sx={{ mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
              Por favor, faça o upload de todos os documentos solicitados.
            </Alert>
            
            {[
              { id: 'identification', label: 'Bilhete de Identidade/Passaporte', error: errors.identification },
              { id: 'secondaryCertificate', label: 'Certificado de Habilitações', error: errors.secondaryCertificate },
              { id: 'photo', label: 'Fotografia Tipo Passe', error: errors.photo },
              { id: 'paymentProof', label: 'Comprovativo de Pagamento', error: errors.paymentProof },
            ].map((doc) => (
              <Box key={doc.id} sx={{ mb: 2 }}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id={`${doc.id}-upload`}
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, doc.id)}
                />
                <label htmlFor={`${doc.id}-upload`}>
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      textAlign: 'left',
                      p: 1.5,
                      borderStyle: 'dashed',
                      borderColor: documents[doc.id] ? 'success.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {doc.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {documents[doc.id] 
                          ? `Arquivo: ${documents[doc.id]?.name}` 
                          : 'Clique para fazer upload'}
                      </Typography>
                    </Box>
                  </Button>
                </label>
                {doc.error && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
                    {doc.error}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Confirmação
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Por favor, confirme que todas as informações estão corretas antes de enviar.
            </Alert>
            
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'background.paper', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                Dados Pessoais
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                <strong>Nome:</strong> {formData.fullName}<br />
                <strong>BI/Passaporte:</strong> {formData.biNumber}<br />
                <strong>Data de Nascimento:</strong> {formData.birthDate}<br />
                <strong>Estado Civil:</strong> {formData.maritalStatus}<br />
                <strong>Nacionalidade:</strong> {formData.nationality}<br />
                <strong>Endereço:</strong> {formData.address}<br />
                <strong>Telefone:</strong> {formData.phone}<br />
                <strong>Email:</strong> {formData.email}<br />
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2, color: 'primary.main' }}>
                Formação Académica
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                <strong>Escola:</strong> {formData.school}<br />
                <strong>Habilitação:</strong> {formData.education}<br />
                <strong>Ano de Conclusão:</strong> {formData.yearOfCompletion}<br />
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2, color: 'primary.main' }}>
                Opções de Curso
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>1ª Opção:</strong> {formData.course1} ({formData.course1Regime})
              </Typography>
              <Typography variant="body2">
                <strong>2ª Opção:</strong> {formData.course2} ({formData.course2Regime})
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mt: 3, fontSize: '0.85rem' }}>
              Ao confirmar, você concorda com os termos e condições do processo de inscrição.
            </Alert>
          </Box>
        );
      default:
        return <div>Step {step + 1}</div>;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: '900px',
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: '#333',
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Inscrição UAN
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: '#666',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
          }}
        >
          Exame de Acesso - Universidade Agostinho Neto
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              '&.Mui-active, &.Mui-completed': {
                fontWeight: 600,
              },
            },
            '& .MuiStepConnector-line': {
              minHeight: isMobile ? 30 : 'auto',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box 
          sx={{ 
            minHeight: { xs: 'auto', sm: '400px' },
            maxHeight: { xs: '60vh', sm: 'none' },
            overflowY: 'auto',
            pr: { xs: 0.5, sm: 1 },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 4,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            sx={{ minWidth: 100 }}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              minWidth: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            {activeStep === steps.length - 1 ? 'Confirmar' : 'Próximo'}
          </Button>
        </Box>
      </Paper>

      <Dialog 
        open={successDialogOpen} 
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ color: 'success.main', mb: 2 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
            </svg>
          </Box>
          Inscrição Concluída com Sucesso!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                // Create a new PDF document
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.text('Comprovativo de Inscrição', 105, 20, { align: 'center' });
                
                // Add registration number
                doc.setFontSize(12);
                doc.text(`Número de Inscrição: ${formData.registrationNumber}`, 20, 40);
                
                // Add personal information section
                doc.setFontSize(14);
                doc.text('Dados Pessoais', 20, 60);
                doc.setFontSize(10);
                doc.text(`Nome Completo: ${formData.fullName}`, 20, 70);
                doc.text(`BI/Passaporte: ${formData.biNumber}`, 20, 78);
                doc.text(`Data de Nascimento: ${formData.birthDate}`, 20, 86);
                doc.text(`Estado Civil: ${formData.maritalStatus}`, 20, 94);
                doc.text(`Nacionalidade: ${formData.nationality}`, 20, 102);
                doc.text(`Endereço: ${formData.address}`, 20, 110);
                doc.text(`Telefone: ${formData.phone}`, 20, 118);
                doc.text(`Email: ${formData.email}`, 20, 126);
                
                // Add course information
                doc.setFontSize(14);
                doc.text('Cursos Selecionados', 20, 146);
                doc.setFontSize(10);
                doc.text(`1ª Opção: ${formData.course1} (${formData.course1Regime})`, 25, 156);
                doc.text(`2ª Opção: ${formData.course2} (${formData.course2Regime})`, 25, 164);
                
                // Add QR code with registration number
                const qrCodeData = await QRCode.toDataURL(formData.registrationNumber || '');
                doc.addImage(qrCodeData, 'PNG', 150, 60, 40, 40);
                
                // Add footer
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFontSize(8);
                doc.text('Este é um documento gerado automaticamente. Por favor, apresente este comprovativo no dia do exame.', 105, pageHeight - 20, { align: 'center' });
                
                // Save the PDF
                doc.save(`comprovativo-${formData.registrationNumber}.pdf`);
                
              } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Ocorreu um erro ao gerar o comprovativo. Por favor, tente novamente.');
              }
            }}
            sx={{ mb: 3, background: '#4CAF50', '&:hover': { background: '#388E3C' } }}
          >
            Baixar Comprovativo (PDF)
          </Button>
          <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
            Sua inscrição foi registrada com sucesso no sistema.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Número de inscrição: <strong>{formData.registrationNumber}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Um e-mail de confirmação foi enviado para <strong>{formData.email}</strong>
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleResetForm}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            Nova Inscrição
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InscricaoMultiStep;

import React, { useState, useEffect, useCallback } from 'react';
import useDateInput from '../hooks/useDateInput';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
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

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
  // Theme and responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data state
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

  // Date input hook
  const {
    date: birthDate,
    day: birthDay,
    month: birthMonth,
    year: birthYear,
    setDay: setBirthDay,
    setMonth: setBirthMonth,
    setYear: setBirthYear,
  } = useDateInput('');

  // Update formData when birthDate changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      birthDate: birthDate
    }));
  }, [birthDate]);

  // Documents state
  const [documents, setDocuments] = useState<DocumentFiles>({
    secondaryCertificate: null,
    identification: null,
    photo: null,
    paymentProof: null,
  });

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Steps for the stepper
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
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

  const generatePDF = useCallback(async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add background color
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add header with logo and title
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      // Add title
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROVATIVO DE INSCRIÇÃO', pageWidth / 2, 35, { align: 'center' as any });
      
      // Add current date
      const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: pt });
      doc.setFontSize(10);
      doc.text(`Emitido em: ${currentDate}`, pageWidth - 15, 20, { align: 'right' as any });
      
      // Add registration number
      doc.setFontSize(12);
      doc.text(`Nº de Inscrição: ${formData.registrationNumber}`, 20, 80);
      
      // Add personal information section
      doc.setFillColor(220, 220, 220);
      doc.rect(20, 90, pageWidth - 40, 15, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS PESSOAIS', 25, 101);
      
      // Add personal information table
      const personalData = [
        ['Nome Completo', formData.fullName],
        ['BI/Passaporte', formData.biNumber],
        ['Data de Nascimento', formData.birthDate ? format(parseISO(formData.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: pt }) : ''],
        ['Estado Civil', formData.maritalStatus],
        ['Nacionalidade', formData.nationality],
        ['Endereço', formData.address],
        ['Telefone', formData.phone],
        ['Email', formData.email]
      ];
      
      (doc as any).autoTable({
        startY: 110,
        head: [['Campo', 'Informação']],
        body: personalData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Add course information
      doc.setFillColor(220, 220, 220);
      doc.rect(20, (doc as any).lastAutoTable.finalY + 10, pageWidth - 40, 15, 'F');
      doc.setFontSize(14);
      doc.text('CURSOS SELECIONADOS', 25, (doc as any).lastAutoTable.finalY + 21);
      
      const courseData = [
        ['1ª Opção', formData.course1, formData.course1Regime],
        ['2ª Opção', formData.course2, formData.course2Regime]
      ];
      
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 30,
        head: [['', 'Curso', 'Regime']],
        body: courseData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10,
          valign: 'middle',
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 40 }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Add QR code with registration number
      const qrCodeData = await QRCode.toDataURL(formData.registrationNumber || '');
      doc.addImage(qrCodeData, 'PNG', pageWidth - 60, (doc as any).lastAutoTable.finalY + 20, 40, 40);
      
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Este é um documento gerado automaticamente. Por favor, apresente este comprovativo no dia do exame.', 
              pageWidth / 2, pageHeight - 10, { align: 'center' as any });
      
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Save the PDF
      doc.save(`comprovativo-${formData.registrationNumber}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o comprovativo. Por favor, tente novamente.');
    }
  }, [formData]);

  // Generate PDF when success dialog opens
  useEffect(() => {
    if (successDialogOpen) {
      generatePDF();
    }
  }, [successDialogOpen, generatePDF]);

  const handleFinish = () => {
    if (validateStep(activeStep)) {
      setSuccessDialogOpen(true);
      // Here you would typically submit the form data to your backend
      console.log('Form submitted:', { ...formData, documents });
    }
  };

  const handleResetForm = () => {
    // Reset date inputs
    setBirthDay('');
    setBirthMonth('');
    setBirthYear('');
    
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
            <Box sx={{ mb: errors.birthDate ? 0 : 2 }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Data de Nascimento
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <TextField
                  fullWidth
                  label="Dia"
                  name="birthDay"
                  type="number"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  onBlur={() => {
                    if (birthDay && birthMonth && birthYear) {
                      const newDate = `${birthYear}-${birthMonth}-${birthDay.padStart(2, '0')}`;
                      setFormData(prev => ({
                        ...prev,
                        birthDate: newDate
                      }));
                    }
                  }}
                  inputProps={{ min: 1, max: 31 }}
                  variant="outlined"
                  sx={{ flex: 1 }}
                  size={isMobile ? 'small' : 'medium'}
                  error={!!errors.birthDate}
                />
                <FormControl fullWidth sx={{ flex: 1 }} error={!!errors.birthDate}>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    name="birthMonth"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    onBlur={() => {
                      if (birthDay && birthMonth && birthYear) {
                        const newDate = `${birthYear}-${birthMonth}-${birthDay.padStart(2, '0')}`;
                        setFormData(prev => ({
                          ...prev,
                          birthDate: newDate
                        }));
                      }
                    }}
                    label="Mês"
                  >
                    <MenuItem value=""><em>Selecione</em></MenuItem>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <MenuItem key={month} value={month.toString().padStart(2, '0')}>
                        {new Date(2000, month - 1, 1).toLocaleString('pt-AO', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Ano"
                  name="birthYear"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  onBlur={() => {
                    if (birthDay && birthMonth && birthYear) {
                      const newDate = `${birthYear}-${birthMonth}-${birthDay.padStart(2, '0')}`;
                      setFormData(prev => ({
                        ...prev,
                        birthDate: newDate
                      }));
                    }
                  }}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                  variant="outlined"
                  sx={{ flex: 1 }}
                  size={isMobile ? 'small' : 'medium'}
                  error={!!errors.birthDate}
                />
              </Box>
              {errors.birthDate && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.birthDate}
                </Typography>
              )}
            </Box>
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
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.maritalStatus}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      default:
        return <div>Step {step + 1} content</div>;
    }
  };

  // Main component return
  
  return (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 3 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Voltar
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
                sx={{ ml: 1 }}
              >
                Finalizar
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ ml: 1 }}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inscrição Concluída com Sucesso!</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" align="center" gutterBottom>
              Sua inscrição foi realizada com sucesso!
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Um e-mail de confirmação foi enviado para {formData.email}.
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Número de inscrição: {formData.registrationNumber || 'N/A'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleResetForm}
            size="large"
          >
            Nova Inscrição
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={generatePDF}
            size="large"
            sx={{ ml: 2 }}
          >
            Baixar Comprovativo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InscricaoMultiStep;

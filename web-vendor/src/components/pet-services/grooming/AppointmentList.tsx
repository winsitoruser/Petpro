import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon, 
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';

interface AppointmentProps {
  id: string;
  serviceId: string;
  serviceName: string;
  petName: string;
  petType: string;
  petBreed: string;
  ownerName: string;
  date: string;
  duration: number;
  status: string;
  price: number;
}

interface AppointmentListProps {
  appointments: AppointmentProps[];
  loading: boolean;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, loading }) => {
  const { t } = useTranslation('petServices');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentProps | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, appointment: AppointmentProps) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenStatusDialog = () => {
    if (selectedAppointment) {
      setNewStatus(selectedAppointment.status);
      setStatusDialogOpen(true);
      handleCloseMenu();
    }
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = () => {
    // API call would go here to update appointment status
    console.log(`Updating appointment ${selectedAppointment?.id} status to ${newStatus}`);
    // Here we'd update the local state if successful
    handleCloseStatusDialog();
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`appointmentStatus.${status}`);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('common.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? t('common.hour') : t('common.hours')}`;
    }
    return `${hours} ${hours === 1 ? t('common.hour') : t('common.hours')} ${mins} ${t('common.minutes')}`;
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('appointments.id')}</TableCell>
              <TableCell>{t('appointments.petName')}</TableCell>
              <TableCell>{t('appointments.service')}</TableCell>
              <TableCell>{t('appointments.date')}</TableCell>
              <TableCell>{t('appointments.duration')}</TableCell>
              <TableCell>{t('appointments.status')}</TableCell>
              <TableCell>{t('appointments.price')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((item) => (
              <TableRow key={item}>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('appointments.noAppointments')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('appointments.noAppointmentsDescription')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('appointments.id')}</TableCell>
              <TableCell>{t('appointments.petName')}</TableCell>
              <TableCell>{t('appointments.service')}</TableCell>
              <TableCell>{t('appointments.date')}</TableCell>
              <TableCell>{t('appointments.duration')}</TableCell>
              <TableCell>{t('appointments.status')}</TableCell>
              <TableCell>{t('appointments.price')}</TableCell>
              <TableCell>{t('appointments.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell component="th" scope="row">
                    #{appointment.id.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.petName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {appointment.petBreed}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{appointment.serviceName}</TableCell>
                  <TableCell>{formatDateTime(appointment.date)}</TableCell>
                  <TableCell>{formatDuration(appointment.duration)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(appointment.status)}
                      color={getStatusChipColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }).format(appointment.price)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, appointment)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={appointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Appointment actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenStatusDialog}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('appointments.menu.updateStatus')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('appointments.menu.markCompleted')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('appointments.menu.cancel')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <TimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('appointments.menu.reschedule')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status update dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('appointments.statusDialog.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              {t('appointments.statusDialog.appointmentId')}: #{selectedAppointment?.id.slice(-4)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {t('appointments.statusDialog.petName')}: {selectedAppointment?.petName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {t('appointments.statusDialog.service')}: {selectedAppointment?.serviceName}
            </Typography>
            <Typography variant="body2" gutterBottom mb={2}>
              {t('appointments.statusDialog.currentStatus')}: {selectedAppointment && getStatusLabel(selectedAppointment.status)}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('appointments.statusDialog.newStatus')}</InputLabel>
              <Select
                value={newStatus}
                onChange={handleStatusChange}
                label={t('appointments.statusDialog.newStatus')}
              >
                <MenuItem value="pending">{t('appointmentStatus.pending')}</MenuItem>
                <MenuItem value="confirmed">{t('appointmentStatus.confirmed')}</MenuItem>
                <MenuItem value="in_progress">{t('appointmentStatus.in_progress')}</MenuItem>
                <MenuItem value="completed">{t('appointmentStatus.completed')}</MenuItem>
                <MenuItem value="cancelled">{t('appointmentStatus.cancelled')}</MenuItem>
                <MenuItem value="no_show">{t('appointmentStatus.no_show')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label={t('appointments.statusDialog.notes')}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveStatus} variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentList;

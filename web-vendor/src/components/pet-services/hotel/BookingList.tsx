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
  Button,
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
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon, 
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Chat as ChatIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';

interface BookingProps {
  id: string;
  roomId: string;
  roomName: string;
  petName: string;
  petType: string;
  ownerName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
}

interface BookingListProps {
  bookings: BookingProps[];
  loading: boolean;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, loading }) => {
  const { t } = useTranslation('petServices');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingProps | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, booking: BookingProps) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenStatusDialog = () => {
    if (selectedBooking) {
      setNewStatus(selectedBooking.status);
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
    // API call would go here to update booking status
    console.log(`Updating booking ${selectedBooking?.id} status to ${newStatus}`);
    // Here we'd update the local state if successful
    handleCloseStatusDialog();
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'checked-in': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`bookingStatus.${status}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('bookings.id')}</TableCell>
              <TableCell>{t('bookings.petName')}</TableCell>
              <TableCell>{t('bookings.roomName')}</TableCell>
              <TableCell>{t('bookings.dates')}</TableCell>
              <TableCell>{t('bookings.status')}</TableCell>
              <TableCell>{t('bookings.price')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((item) => (
              <TableRow key={item}>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={160} /></TableCell>
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

  if (!bookings || bookings.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('bookings.noBookings')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('bookings.noBookingsDescription')}
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
              <TableCell>{t('bookings.id')}</TableCell>
              <TableCell>{t('bookings.petName')}</TableCell>
              <TableCell>{t('bookings.roomName')}</TableCell>
              <TableCell>{t('bookings.checkIn')}</TableCell>
              <TableCell>{t('bookings.checkOut')}</TableCell>
              <TableCell>{t('bookings.status')}</TableCell>
              <TableCell>{t('bookings.price')}</TableCell>
              <TableCell>{t('bookings.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell component="th" scope="row">
                    #{booking.id.slice(-4)}
                  </TableCell>
                  <TableCell>{booking.petName}</TableCell>
                  <TableCell>{booking.roomName}</TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(booking.status)}
                      color={getStatusChipColor(booking.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }).format(booking.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, booking)}
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
        count={bookings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Booking actions menu */}
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
          <ListItemText>{t('bookings.menu.updateStatus')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('bookings.menu.viewDetails')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('bookings.menu.contactOwner')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('bookings.menu.printDetails')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status update dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('bookings.statusDialog.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              {t('bookings.statusDialog.bookingId')}: #{selectedBooking?.id.slice(-4)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {t('bookings.statusDialog.petName')}: {selectedBooking?.petName}
            </Typography>
            <Typography variant="body2" gutterBottom mb={2}>
              {t('bookings.statusDialog.currentStatus')}: {selectedBooking && getStatusLabel(selectedBooking.status)}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('bookings.statusDialog.newStatus')}</InputLabel>
              <Select
                value={newStatus}
                onChange={handleStatusChange}
                label={t('bookings.statusDialog.newStatus')}
              >
                <MenuItem value="pending">{t('bookingStatus.pending')}</MenuItem>
                <MenuItem value="confirmed">{t('bookingStatus.confirmed')}</MenuItem>
                <MenuItem value="checked-in">{t('bookingStatus.checked-in')}</MenuItem>
                <MenuItem value="completed">{t('bookingStatus.completed')}</MenuItem>
                <MenuItem value="cancelled">{t('bookingStatus.cancelled')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label={t('bookings.statusDialog.notes')}
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

export default BookingList;

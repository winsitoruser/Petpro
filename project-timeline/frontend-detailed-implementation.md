# Detailed Frontend Implementation Specifications

## Web Vendor Dashboard - Notification Center Component

### Technical Requirements
- **Component Type**: Header dropdown with notification panel
- **State Management**: Redux store for notifications with socket middleware
- **UI Framework**: Material UI with custom styling
- **Animation**: Framer Motion for smooth transitions
- **Completion**: Nov 27, 2025

### Implementation Steps

#### 1. Create Notification Store (1.5 points)
```typescript
// src/store/notifications/types.ts
export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_updated' | 'booking_cancelled' | 'system';
  title: string;
  message: string;
  bookingId?: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}
```

```typescript
// src/store/notifications/actions.ts
export const addNotification = (notification: Notification) => ({
  type: 'ADD_NOTIFICATION',
  payload: notification
});

export const markAsRead = (id: string) => ({
  type: 'MARK_AS_READ',
  payload: id
});

export const markAllAsRead = () => ({
  type: 'MARK_ALL_AS_READ'
});

export const fetchNotifications = () => ({
  type: 'FETCH_NOTIFICATIONS_REQUEST'
});

export const fetchNotificationsSuccess = (notifications: Notification[]) => ({
  type: 'FETCH_NOTIFICATIONS_SUCCESS',
  payload: notifications
});
```

```typescript
// src/store/notifications/reducer.ts
import { NotificationState } from './types';

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_NOTIFICATIONS_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        items: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        isLoading: false
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        items: [action.payload, ...state.items],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        items: state.items.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        items: state.items.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    default:
      return state;
  }
};
```

#### 2. Socket Middleware for Notifications (2 points)
```typescript
// src/middleware/socketMiddleware.ts
import { socketService } from '../services/socketService';
import { addNotification } from '../store/notifications/actions';

export const socketMiddleware = store => next => action => {
  // Listen for socket events and dispatch actions
  if (action.type === 'SOCKET_CONNECT') {
    socketService.connect(action.payload.token);
    
    socketService.on('booking-status-update', (data) => {
      store.dispatch(addNotification({
        id: `booking-${data.bookingId}-${Date.now()}`,
        type: 'booking_updated',
        title: 'Booking Status Updated',
        message: `Booking #${data.bookingId} status changed to ${data.status}`,
        bookingId: data.bookingId,
        createdAt: new Date().toISOString(),
        read: false,
        priority: 'medium'
      }));
    });

    socketService.on('notification', (data) => {
      store.dispatch(addNotification({
        id: `notification-${Date.now()}`,
        type: data.type || 'system',
        title: data.title,
        message: data.message,
        bookingId: data.bookingId,
        createdAt: new Date().toISOString(),
        read: false,
        priority: data.priority || 'low'
      }));
    });
  }
  
  return next(action);
};
```

#### 3. Notification Icon Component (1 point)
```tsx
// src/components/notifications/NotificationIcon.tsx
import React from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';

interface NotificationIconProps {
  onClick: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ onClick }) => {
  const unreadCount = useSelector(state => state.notifications.unreadCount);
  
  return (
    <IconButton
      color="inherit"
      aria-label="notifications"
      onClick={onClick}
    >
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationIcon;
```

#### 4. Notification List Component (2 points)
```tsx
// src/components/notifications/NotificationList.tsx
import React from 'react';
import { List, Typography, Button, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { markAllAsRead } from '../../store/notifications/actions';
import NotificationItem from './NotificationItem';

const NotificationList: React.FC = () => {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector(state => state.notifications);
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  return (
    <Box sx={{ width: 320, maxHeight: 400 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      
      {items.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No notifications yet</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 320, overflow: 'auto' }}>
          {items.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationList;
```

#### 5. Notification Item Component (1 point)
```tsx
// src/components/notifications/NotificationItem.tsx
import React from 'react';
import { ListItem, ListItemText, ListItemIcon, Typography, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAsRead } from '../../store/notifications/actions';
import { formatDistanceToNow } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Map notification types to icons and colors
const typeConfig = {
  booking_created: { icon: <EventIcon color="success" />, color: '#e6f7ed' },
  booking_updated: { icon: <InfoIcon color="primary" />, color: '#e6f3ff' },
  booking_cancelled: { icon: <WarningIcon color="error" />, color: '#ffe6e6' },
  system: { icon: <InfoIcon color="disabled" />, color: '#f5f5f5' }
};

const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleClick = () => {
    dispatch(markAsRead(notification.id));
    
    // Navigate to booking if bookingId exists
    if (notification.bookingId) {
      navigate(`/bookings/${notification.bookingId}`);
    }
  };
  
  const { icon, color } = typeConfig[notification.type] || typeConfig.system;
  
  return (
    <ListItem 
      button 
      onClick={handleClick}
      sx={{
        backgroundColor: notification.read ? 'transparent' : color,
        '&:hover': {
          backgroundColor: notification.read ? '#f9f9f9' : '#f0f0f0'
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={notification.title}
        secondary={
          <>
            <Typography variant="body2" component="span" sx={{ display: 'block' }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;
```

#### 6. Main Notification Dropdown Component (2 points)
```tsx
// src/components/notifications/NotificationCenter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Popper, Grow, Paper, ClickAwayListener } from '@mui/material';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../../store/notifications/actions';
import NotificationIcon from './NotificationIcon';
import NotificationList from './NotificationList';

const NotificationCenter: React.FC = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // Fetch initial notifications
    dispatch(fetchNotifications());
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };
  
  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };
  
  return (
    <>
      <NotificationIcon 
        ref={anchorRef}
        onClick={handleToggle}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'right top' : 'right bottom' }}
          >
            <Paper elevation={3}>
              <ClickAwayListener onClickAway={handleClose}>
                <NotificationList />
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default NotificationCenter;
```

### Integration with Layout

```tsx
// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import NotificationCenter from '../notifications/NotificationCenter';
// Other imports...

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PetPro Vendor Dashboard
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <NotificationCenter />
          {/* Other header icons/controls */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
```

### API Integration

```typescript
// src/services/notificationService.ts
import apiClient from './apiClient';

export const fetchNotifications = async () => {
  const response = await apiClient.get('/api/notifications');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await apiClient.put(`/api/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/api/notifications/read-all');
  return response.data;
};
```

### Audio Notification Utility

```typescript
// src/utils/soundNotifications.ts
export const notificationSounds = {
  booking_created: new Audio('/sounds/new-booking.mp3'),
  booking_updated: new Audio('/sounds/update.mp3'),
  booking_cancelled: new Audio('/sounds/cancel.mp3'),
  system: new Audio('/sounds/notification.mp3')
};

let isMuted = false;

export const playNotificationSound = (type) => {
  if (isMuted) return;
  
  const sound = notificationSounds[type] || notificationSounds.system;
  sound.play().catch(err => console.log('Error playing sound', err));
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const setMute = (value) => {
  isMuted = value;
};
```

## User Preferences for Notifications

```typescript
// src/store/preferences/types.ts
export interface NotificationPreferences {
  enableSounds: boolean;
  desktopNotifications: boolean;
  bookingCreated: boolean;
  bookingUpdated: boolean;
  bookingCancelled: boolean;
  system: boolean;
}

export interface PreferencesState {
  notifications: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
}
```

```tsx
// src/components/preferences/NotificationPreferences.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Switch, 
  FormControlLabel,
  Divider,
  Typography
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateNotificationPreferences } from '../../store/preferences/actions';

const NotificationPreferences: React.FC = () => {
  const dispatch = useDispatch();
  const preferences = useSelector(state => state.preferences.notifications);
  
  const handleToggle = (key) => (event) => {
    dispatch(updateNotificationPreferences({
      [key]: event.target.checked
    }));
  };
  
  return (
    <Card>
      <CardHeader title="Notification Preferences" />
      <Divider />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          General
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.enableSounds} 
              onChange={handleToggle('enableSounds')}
            />
          }
          label="Enable sound notifications"
        />
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.desktopNotifications} 
              onChange={handleToggle('desktopNotifications')}
            />
          }
          label="Enable desktop notifications"
        />
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Notification Types
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.bookingCreated} 
              onChange={handleToggle('bookingCreated')}
            />
          }
          label="New bookings"
        />
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.bookingUpdated} 
              onChange={handleToggle('bookingUpdated')}
            />
          }
          label="Booking updates"
        />
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.bookingCancelled} 
              onChange={handleToggle('bookingCancelled')}
            />
          }
          label="Booking cancellations"
        />
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.system} 
              onChange={handleToggle('system')}
            />
          }
          label="System notifications"
        />
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
```

## Mobile App - Push Notification Integration

### Firebase Configuration

```typescript
// src/services/firebaseService.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../constants/api';

// Store FCM token in AsyncStorage
const storeFcmToken = async (token: string) => {
  await AsyncStorage.setItem('fcmToken', token);
};

// Register FCM token with backend
const registerTokenWithBackend = async (token: string) => {
  try {
    await fetch(`${api.BASE_URL}/api/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
      },
      body: JSON.stringify({
        token,
        device_type: Platform.OS
      })
    });
    return true;
  } catch (error) {
    console.error('Failed to register FCM token with backend:', error);
    return false;
  }
};

// Request notification permissions
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  
  console.log('User declined notifications permission');
  return false;
};

// Get FCM token
export const getFcmToken = async () => {
  try {
    const token = await AsyncStorage.getItem('fcmToken');
    
    if (!token) {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        await storeFcmToken(fcmToken);
        await registerTokenWithBackend(fcmToken);
        return fcmToken;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

// Setup notification listeners
export const setupNotifications = () => {
  // Refresh token when needed
  messaging().onTokenRefresh(async token => {
    await storeFcmToken(token);
    await registerTokenWithBackend(token);
  });
  
  // Handle background notifications
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // Store in AsyncStorage for retrieval when app opens
    const storedNotifications = await AsyncStorage.getItem('pendingNotifications');
    const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    notifications.push(remoteMessage);
    await AsyncStorage.setItem('pendingNotifications', JSON.stringify(notifications));
  });
};

// Get notification categories and handling functions
export const getNotificationHandlers = (navigation) => ({
  'booking_created': (notification) => {
    navigation.navigate('BookingDetails', { id: notification.data.bookingId });
  },
  'booking_updated': (notification) => {
    navigation.navigate('BookingDetails', { id: notification.data.bookingId });
  },
  'booking_cancelled': (notification) => {
    navigation.navigate('BookingHistory');
  },
  'system': (notification) => {
    navigation.navigate('Notifications');
  }
});
```

### Integration with App.tsx

```tsx
// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { SocketProvider } from './src/contexts/SocketContext';
import { requestUserPermission, setupNotifications, getNotificationHandlers } from './src/services/firebaseService';

const App = () => {
  const navigationRef = React.useRef(null);

  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await requestUserPermission();
      
      if (hasPermission) {
        setupNotifications();
      }
    };
    
    initNotifications();
    
    // Handle notifications when app is in foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
      
      // Show in-app notification
      if (remoteMessage.notification) {
        Toast.show({
          type: 'success',
          text1: remoteMessage.notification.title,
          text2: remoteMessage.notification.body,
          onPress: () => {
            // Navigate based on notification type
            const handlers = getNotificationHandlers(navigationRef.current);
            const handler = handlers[remoteMessage.data.type] || handlers.system;
            handler(remoteMessage);
          }
        });
      }
    });
    
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <SocketProvider>
        {/* Rest of your app */}
      </SocketProvider>
    </NavigationContainer>
  );
};

export default App;
```

### Notification History Screen

```tsx
// src/screens/customer/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${api.BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setNotifications(data);
      
      // Clear pending notifications
      await AsyncStorage.setItem('pendingNotifications', JSON.stringify([]));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Check for stored notifications from background state
    const checkStoredNotifications = async () => {
      const storedNotifications = await AsyncStorage.getItem('pendingNotifications');
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (parsedNotifications.length > 0) {
          // Process stored notifications
          console.log('Processing stored notifications:', parsedNotifications);
          await AsyncStorage.setItem('pendingNotifications', JSON.stringify([]));
        }
      }
    };
    
    checkStoredNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.bookingId) {
      navigation.navigate('BookingDetails', { id: notification.bookingId });
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await fetch(`${api.BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return <Ionicons name="calendar" size={24} color="#4caf50" />;
      case 'booking_updated':
        return <Ionicons name="refresh" size={24} color="#2196f3" />;
      case 'booking_cancelled':
        return <Ionicons name="close-circle" size={24} color="#f44336" />;
      case 'system':
      default:
        return <Ionicons name="information-circle" size={24} color="#9e9e9e" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadItem
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        {renderNotificationIcon(item.type)}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>{moment(item.createdAt).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color="#9e9e9e" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 16
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41
  },
  unreadItem: {
    backgroundColor: '#e6f7ff'
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center'
  },
  contentContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  message: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8
  },
  timestamp: {
    fontSize: 12,
    color: '#9e9e9e'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575'
  }
});

export default NotificationsScreen;
```

# PetPro Vendor Dashboard Developer Handoff Documentation

This document provides technical specifications, interaction details, and API integrations for implementing the PetPro vendor dashboard based on the wireframe documentation.

## Technical Stack

- **Frontend Framework**: React with Next.js
- **State Management**: Redux Toolkit
- **UI Component Library**: Material-UI
- **API Communication**: Axios
- **Form Handling**: Formik with Yup validation
- **Charts**: Chart.js with React wrapper
- **Date/Time Handling**: Day.js
- **Authentication**: JWT with refresh tokens

## Global Components & Patterns

### 1. Navigation Components

#### Main Navigation
```jsx
// Implementation specification
<MainNav
  activeItem="dashboard" // One of: dashboard, orders, appointments, inventory, reviews, promotions, analytics, settings
  vendorInfo={{
    name: "Happy Paws Pet Clinic",
    avatar: "/images/vendor-logo.png",
    role: "Vendor"
  }}
  notificationCount={5}
/>
```

#### Breadcrumbs
```jsx
// Implementation specification
<Breadcrumbs 
  items={[
    { label: "Dashboard", path: "/dashboard" },
    { label: "Orders", path: "/orders" },
    { label: "Order #12345", path: "/orders/12345" }
  ]} 
/>
```

### 2. Data Display Components

#### Data Tables
```jsx
// Implementation specification
<DataTable
  columns={[
    { id: "id", label: "Order ID", sortable: true },
    { id: "date", label: "Order Date", sortable: true },
    { id: "customer", label: "Customer", sortable: true },
    { id: "total", label: "Total", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "actions", label: "Actions", sortable: false }
  ]}
  data={orders}
  pagination={{
    page: 1,
    pageSize: 10,
    totalItems: 156,
    onPageChange: (page) => setPage(page)
  }}
  sorting={{
    sortBy: "date",
    sortDirection: "desc",
    onSortChange: (sortBy, sortDirection) => setSorting(sortBy, sortDirection)
  }}
  filters={[
    { id: "status", label: "Status", options: statusOptions }
  ]}
/>
```

#### Status Indicators
```jsx
// Implementation specification
<StatusIndicator 
  type="order" // One of: order, appointment, inventory, payment
  status="shipped" // Values depend on type
  // Order: pending, processing, shipped, delivered, canceled, refunded
  // Appointment: scheduled, confirmed, in-progress, completed, canceled
  // Inventory: in-stock, low-stock, out-of-stock, discontinued
  // Payment: pending, completed, failed, refunded
/>
```

#### Charts
```jsx
// Implementation specification
<ChartComponent
  type="line" // One of: line, bar, pie, doughnut
  data={salesData}
  options={{
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'bottom'
    },
    // Additional Chart.js options
  }}
  height={300}
  width="100%"
/>
```

### 3. Form Components

#### Input Fields
```jsx
// Implementation specification
<FormField
  id="productName"
  label="Product Name"
  type="text" // text, number, email, password, textarea, select, date
  value={productName}
  onChange={handleChange}
  error={errors.productName}
  required={true}
  helperText="Enter the full product name"
  maxLength={100}
/>
```

#### Form Submission
```jsx
// Implementation specification
<Form
  initialValues={initialValues}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
  submitButtonText="Save Changes"
  cancelButtonText="Cancel"
  onCancel={handleCancel}
  isSubmitting={isSubmitting}
/>
```

## API Integration Specifications

### 1. Authentication

#### Login
```javascript
// POST /api/v1/auth/login
const loginUser = async (credentials) => {
  try {
    const response = await axios.post('/api/v1/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Get Current User
```javascript
// GET /api/v1/vendors/me
const getCurrentVendor = async () => {
  try {
    const response = await axios.get('/api/v1/vendors/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 2. Orders Management

#### Get Orders List
```javascript
// GET /api/v1/vendors/{vendorId}/orders
const getOrders = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/orders`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        startDate: params.startDate,
        endDate: params.endDate,
        search: params.search
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Get Order Details
```javascript
// GET /api/v1/vendors/{vendorId}/orders/{orderId}
const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Update Order Status
```javascript
// PATCH /api/v1/vendors/{vendorId}/orders/{orderId}
const updateOrderStatus = async (orderId, statusUpdate) => {
  try {
    const response = await axios.patch(
      `/api/v1/vendors/${vendorId}/orders/${orderId}`,
      { status: statusUpdate.status, statusNote: statusUpdate.note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 3. Appointment Management

#### Get Appointments
```javascript
// GET /api/v1/vendors/{vendorId}/appointments
const getAppointments = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/appointments`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status,
        sortBy: params.sortBy || 'appointmentDate',
        sortDirection: params.sortDirection || 'asc',
        startDate: params.startDate,
        endDate: params.endDate,
        search: params.search
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Update Appointment
```javascript
// PATCH /api/v1/vendors/{vendorId}/appointments/{appointmentId}
const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await axios.patch(
      `/api/v1/vendors/${vendorId}/appointments/${appointmentId}`,
      appointmentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 4. Inventory Management

#### Get Products
```javascript
// GET /api/v1/vendors/{vendorId}/products
const getProducts = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/products`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        category: params.category,
        status: params.status,
        sortBy: params.sortBy || 'name',
        sortDirection: params.sortDirection || 'asc',
        search: params.search
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Update Product Stock
```javascript
// PATCH /api/v1/vendors/{vendorId}/products/{productId}/stock
const updateProductStock = async (productId, stockData) => {
  try {
    const response = await axios.patch(
      `/api/v1/vendors/${vendorId}/products/${productId}/stock`,
      { 
        quantity: stockData.quantity,
        reason: stockData.reason,
        note: stockData.note
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 5. Reviews Management

#### Get Reviews
```javascript
// GET /api/v1/vendors/{vendorId}/reviews
const getReviews = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/reviews`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        rating: params.rating,
        responseStatus: params.responseStatus, // responded, not_responded
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        search: params.search
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Reply to Review
```javascript
// POST /api/v1/vendors/{vendorId}/reviews/{reviewId}/replies
const replyToReview = async (reviewId, replyData) => {
  try {
    const response = await axios.post(
      `/api/v1/vendors/${vendorId}/reviews/${reviewId}/replies`,
      { content: replyData.content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 6. Promotions Management

#### Get Promotions
```javascript
// GET /api/v1/vendors/{vendorId}/promotions
const getPromotions = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/promotions`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status, // active, scheduled, expired
        sortBy: params.sortBy || 'startDate',
        sortDirection: params.sortDirection || 'desc'
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Create Promotion
```javascript
// POST /api/v1/vendors/{vendorId}/promotions
const createPromotion = async (promotionData) => {
  try {
    const response = await axios.post(
      `/api/v1/vendors/${vendorId}/promotions`,
      promotionData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 7. Analytics

#### Get Dashboard Analytics
```javascript
// GET /api/v1/vendors/{vendorId}/analytics/dashboard
const getDashboardAnalytics = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/analytics/dashboard`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        compareWithPrevious: params.compareWithPrevious || true
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

#### Get Sales Analytics
```javascript
// GET /api/v1/vendors/{vendorId}/analytics/sales
const getSalesAnalytics = async (params) => {
  try {
    const response = await axios.get(`/api/v1/vendors/${vendorId}/analytics/sales`, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy || 'day', // day, week, month
        category: params.category
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## Page-Specific Implementation Guidelines

### 1. Order Management

#### Orders List Page

**Component Hierarchy:**
```
- OrdersPage
  - PageHeader
  - FiltersBar
    - StatusFilter
    - DateRangeFilter
    - SearchInput
  - OrdersTable
    - OrderRow
      - StatusIndicator
      - ActionMenu
  - Pagination
```

**State Management:**
```javascript
// Orders list page state
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({
  page: 1,
  pageSize: 10,
  totalItems: 0
});
const [filters, setFilters] = useState({
  status: '',
  startDate: null,
  endDate: null,
  search: ''
});
const [sorting, setSorting] = useState({
  sortBy: 'createdAt',
  sortDirection: 'desc'
});
```

**Data Fetching:**
```javascript
// Initial load and when dependencies change
useEffect(() => {
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({
        page: pagination.page,
        limit: pagination.pageSize,
        ...filters,
        sortBy: sorting.sortBy,
        sortDirection: sorting.sortDirection
      });
      setOrders(response.data);
      setPagination(prev => ({
        ...prev,
        totalItems: response.meta.totalItems
      }));
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  fetchOrders();
}, [pagination.page, pagination.pageSize, filters, sorting]);
```

**Key Interactions:**
- Clicking on order row navigates to order details page
- Status filter changes trigger data refetch
- Date range selection refreshes data
- Search input has 300ms debounce before triggering search
- Action menu provides quick status update options

### 2. Inventory Management

#### Product Stock Update

**Component Structure:**
```
- ProductStockUpdateModal
  - ProductInfo
  - CurrentStockDisplay
  - StockUpdateForm
    - QuantityInput
    - ReasonDropdown
    - NotesField
  - ActionButtons
```

**Form Validation:**
```javascript
// Stock update validation schema
const stockUpdateSchema = Yup.object().shape({
  quantity: Yup.number()
    .required('Quantity is required')
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  reason: Yup.string()
    .required('Please select a reason for the update'),
  note: Yup.string()
    .max(500, 'Note cannot exceed 500 characters')
});
```

**Stock Update Flow:**
```javascript
// Handle stock update submission
const handleStockUpdate = async (values) => {
  setSubmitting(true);
  try {
    await updateProductStock(productId, {
      quantity: values.quantity,
      reason: values.reason,
      note: values.note
    });
    
    // Show success notification
    showNotification({
      type: 'success',
      message: 'Stock updated successfully'
    });
    
    // Refresh product data
    fetchProductDetails();
    
    // Close modal
    onClose();
  } catch (error) {
    // Show error notification
    showNotification({
      type: 'error',
      message: error.message || 'Failed to update stock'
    });
  } finally {
    setSubmitting(false);
  }
};
```

### 3. Analytics Dashboard

#### Sales Trend Chart

**Chart Configuration:**
```javascript
// Sales trend chart setup
const salesChartConfig = {
  type: 'line',
  data: {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: 'Current Period',
        data: salesData.map(item => item.revenue),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Previous Period',
        data: previousSalesData.map(item => item.revenue),
        borderColor: '#9E9E9E',
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      },
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          borderDash: [5, 5]
        },
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  }
};
```

**Time Period Selection:**
```javascript
// Handle time period change
const handlePeriodChange = (period) => {
  const today = dayjs();
  let startDate, endDate;
  
  switch(period) {
    case '7days':
      startDate = today.subtract(7, 'day').startOf('day');
      endDate = today.endOf('day');
      break;
    case '30days':
      startDate = today.subtract(30, 'day').startOf('day');
      endDate = today.endOf('day');
      break;
    case '90days':
      startDate = today.subtract(90, 'day').startOf('day');
      endDate = today.endOf('day');
      break;
    case 'year':
      startDate = today.subtract(1, 'year').startOf('day');
      endDate = today.endOf('day');
      break;
    default:
      startDate = today.subtract(30, 'day').startOf('day');
      endDate = today.endOf('day');
  }
  
  setDateRange({
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD')
  });
  
  // This will trigger data refetch via useEffect
};
```

## Error Handling & Network Status

### Global Error Handling

```javascript
// Axios interceptor for global error handling
axios.interceptors.response.use(
  response => response,
  error => {
    const { status, data } = error.response || {};
    
    // Handle authentication errors
    if (status === 401) {
      // Clear stored tokens
      authStore.clearTokens();
      // Redirect to login
      router.push('/login');
      return Promise.reject(error);
    }
    
    // Handle server errors
    if (status >= 500) {
      showNotification({
        type: 'error',
        message: 'Server error. Please try again later.'
      });
      return Promise.reject(error);
    }
    
    // Handle validation errors
    if (status === 400 && data.errors) {
      const errorMessage = Object.values(data.errors)
        .flat()
        .join(', ');
      
      showNotification({
        type: 'error',
        message: errorMessage
      });
    }
    
    return Promise.reject(error);
  }
);
```

### Network Status Indicator

```javascript
// Network status component
const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!isOnline) {
    return (
      <div className="network-status-indicator offline">
        <OfflineIcon />
        You are currently offline. Changes will sync when you're back online.
      </div>
    );
  }
  
  return null;
};
```

## Loading States & Skeletons

### Loading States

```jsx
// Example loading state for tables
{loading ? (
  <TableSkeleton rows={10} columns={6} />
) : (
  <DataTable
    columns={columns}
    data={data}
    // ...other props
  />
)}
```

```jsx
// Example loading state for forms
<Button 
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting ? <Spinner size="small" /> : 'Save Changes'}
</Button>
```

### Skeleton Components

```jsx
// Card skeleton component
const CardSkeleton = ({ height = 200 }) => (
  <div className="card-skeleton" style={{ height }}>
    <div className="skeleton-header" />
    <div className="skeleton-body">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  </div>
);
```

```css
/* Skeleton loading animation */
@keyframes skeletonPulse {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.card-skeleton {
  border-radius: 4px;
  padding: 16px;
  background: #f8f8f8;
}

.skeleton-header,
.skeleton-line {
  height: 20px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200px 100%;
  animation: skeletonPulse 1.5s infinite;
  border-radius: 4px;
}

.skeleton-header {
  height: 32px;
  width: 60%;
  margin-bottom: 24px;
}

.skeleton-line:last-child {
  width: 80%;
}
```

## Additional Implementation Notes

### 1. Environment Variables

```javascript
// Required environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.petpro.com';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.petpro.com/ws';
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY;
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
```

### 2. Browser Compatibility Requirements

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

### 3. Performance Requirements

- Initial load time: < 2s
- Time to interactive: < 3s
- First meaningful paint: < 1.5s
- Core Web Vitals:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

### 4. Security Considerations

- Implement CSRF protection
- Use Content Security Policy (CSP)
- Store sensitive data only in HTTPOnly cookies
- Implement rate limiting for API requests
- Sanitize all user inputs
- Use HTTPS for all communications
- Implement proper authentication and authorization checks for all API endpoints

## Developer Resources

- [Design System Repository](https://github.com/petpro/design-system)
- [API Documentation](https://api.petpro.com/docs)
- [Postman Collection](https://www.postman.com/petpro/workspace/petpro-api)
- [Figma Design Files](https://figma.com/file/petpro-vendor-dashboard)
- [Test Account Credentials](https://wiki.petpro.com/test-accounts)

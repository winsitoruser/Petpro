-- Seed Data for PetPro
-- This script populates initial system data required for the application to function

-- Default Permissions
INSERT INTO permissions (id, name, description, resource, action) VALUES 
-- User management permissions
(uuid_generate_v4(), 'view_users', 'View user profiles', 'users', 'read'),
(uuid_generate_v4(), 'create_users', 'Create new users', 'users', 'create'),
(uuid_generate_v4(), 'update_users', 'Update user profiles', 'users', 'update'),
(uuid_generate_v4(), 'delete_users', 'Delete users', 'users', 'delete'),
(uuid_generate_v4(), 'manage_roles', 'Assign or remove user roles', 'roles', 'manage'),

-- Pet management permissions
(uuid_generate_v4(), 'view_pets', 'View pet details', 'pets', 'read'),
(uuid_generate_v4(), 'create_pets', 'Create pet profiles', 'pets', 'create'),
(uuid_generate_v4(), 'update_pets', 'Update pet details', 'pets', 'update'),
(uuid_generate_v4(), 'delete_pets', 'Delete pet profiles', 'pets', 'delete'),
(uuid_generate_v4(), 'manage_pet_health', 'Manage pet health records', 'health_records', 'manage'),

-- Clinic management permissions
(uuid_generate_v4(), 'view_clinics', 'View clinic details', 'clinics', 'read'),
(uuid_generate_v4(), 'create_clinics', 'Create clinics', 'clinics', 'create'),
(uuid_generate_v4(), 'update_clinics', 'Update clinic details', 'clinics', 'update'),
(uuid_generate_v4(), 'delete_clinics', 'Delete clinics', 'clinics', 'delete'),
(uuid_generate_v4(), 'manage_services', 'Manage clinic services', 'services', 'manage'),
(uuid_generate_v4(), 'manage_staff', 'Manage clinic staff', 'staff', 'manage'),

-- Appointment permissions
(uuid_generate_v4(), 'view_appointments', 'View appointments', 'appointments', 'read'),
(uuid_generate_v4(), 'create_appointments', 'Create appointments', 'appointments', 'create'),
(uuid_generate_v4(), 'update_appointments', 'Update appointments', 'appointments', 'update'),
(uuid_generate_v4(), 'cancel_appointments', 'Cancel appointments', 'appointments', 'cancel'),

-- Product management permissions
(uuid_generate_v4(), 'view_products', 'View products', 'products', 'read'),
(uuid_generate_v4(), 'create_products', 'Create products', 'products', 'create'),
(uuid_generate_v4(), 'update_products', 'Update product details', 'products', 'update'),
(uuid_generate_v4(), 'delete_products', 'Delete products', 'products', 'delete'),
(uuid_generate_v4(), 'manage_inventory', 'Manage product inventory', 'inventory', 'manage'),

-- Order management permissions
(uuid_generate_v4(), 'view_orders', 'View orders', 'orders', 'read'),
(uuid_generate_v4(), 'create_orders', 'Create orders', 'orders', 'create'),
(uuid_generate_v4(), 'update_orders', 'Update order details', 'orders', 'update'),
(uuid_generate_v4(), 'process_orders', 'Process orders', 'orders', 'process'),
(uuid_generate_v4(), 'cancel_orders', 'Cancel orders', 'orders', 'cancel'),

-- Review management permissions
(uuid_generate_v4(), 'view_reviews', 'View reviews', 'reviews', 'read'),
(uuid_generate_v4(), 'create_reviews', 'Create reviews', 'reviews', 'create'),
(uuid_generate_v4(), 'update_reviews', 'Update review content', 'reviews', 'update'),
(uuid_generate_v4(), 'delete_reviews', 'Delete reviews', 'reviews', 'delete'),
(uuid_generate_v4(), 'moderate_reviews', 'Moderate reviews', 'reviews', 'moderate'),

-- Payment management permissions
(uuid_generate_v4(), 'view_payments', 'View payment details', 'payments', 'read'),
(uuid_generate_v4(), 'process_payments', 'Process payments', 'payments', 'process'),
(uuid_generate_v4(), 'refund_payments', 'Process refunds', 'payments', 'refund'),

-- Analytics permissions
(uuid_generate_v4(), 'view_analytics', 'View system analytics', 'analytics', 'read'),
(uuid_generate_v4(), 'export_reports', 'Export system reports', 'reports', 'export');

-- Define role permissions
-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    id 
FROM 
    permissions;

-- Customer role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'customer'),
    id 
FROM 
    permissions 
WHERE 
    name IN (
        'view_pets', 'create_pets', 'update_pets', 'delete_pets',
        'view_clinics', 'view_appointments', 'create_appointments', 'update_appointments', 'cancel_appointments',
        'view_products', 'view_orders', 'create_orders', 'update_orders', 'cancel_orders',
        'view_reviews', 'create_reviews', 'update_reviews', 'delete_reviews'
    );

-- Vendor role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'vendor'),
    id 
FROM 
    permissions 
WHERE 
    name IN (
        'view_clinics', 'create_clinics', 'update_clinics',
        'manage_services', 'manage_staff',
        'view_appointments', 'update_appointments', 'cancel_appointments',
        'view_products', 'create_products', 'update_products', 'delete_products',
        'manage_inventory',
        'view_orders', 'update_orders', 'process_orders',
        'view_reviews'
    );

-- Create default product categories
INSERT INTO product_categories (id, name, description, display_order) VALUES
(uuid_generate_v4(), 'Food', 'Pet food and nutritional products', 10),
(uuid_generate_v4(), 'Toys', 'Pet toys and entertainment items', 20),
(uuid_generate_v4(), 'Accessories', 'Pet accessories and wearables', 30),
(uuid_generate_v4(), 'Health', 'Health care and medical products', 40),
(uuid_generate_v4(), 'Grooming', 'Grooming and hygiene products', 50),
(uuid_generate_v4(), 'Beds', 'Pet beds and furniture', 60),
(uuid_generate_v4(), 'Training', 'Training supplies and equipment', 70);

-- Create subcategories
DO $$ 
DECLARE
    food_id UUID := (SELECT id FROM product_categories WHERE name = 'Food');
    health_id UUID := (SELECT id FROM product_categories WHERE name = 'Health');
    grooming_id UUID := (SELECT id FROM product_categories WHERE name = 'Grooming');
BEGIN
    -- Food subcategories
    INSERT INTO product_categories (id, name, description, parent_id, display_order) VALUES
    (uuid_generate_v4(), 'Dry Food', 'Dry kibble and food', food_id, 11),
    (uuid_generate_v4(), 'Wet Food', 'Canned and wet food options', food_id, 12),
    (uuid_generate_v4(), 'Treats', 'Pet treats and snacks', food_id, 13),
    (uuid_generate_v4(), 'Prescription Diets', 'Veterinary diet food', food_id, 14);
    
    -- Health subcategories
    INSERT INTO product_categories (id, name, description, parent_id, display_order) VALUES
    (uuid_generate_v4(), 'Medications', 'Over the counter medications', health_id, 41),
    (uuid_generate_v4(), 'Supplements', 'Nutritional supplements', health_id, 42),
    (uuid_generate_v4(), 'Dental Care', 'Dental hygiene products', health_id, 43),
    (uuid_generate_v4(), 'First Aid', 'First aid supplies for pets', health_id, 44);
    
    -- Grooming subcategories
    INSERT INTO product_categories (id, name, description, parent_id, display_order) VALUES
    (uuid_generate_v4(), 'Shampoos', 'Pet shampoos and conditioners', grooming_id, 51),
    (uuid_generate_v4(), 'Brushes', 'Grooming brushes and combs', grooming_id, 52),
    (uuid_generate_v4(), 'Nail Care', 'Nail trimmers and files', grooming_id, 53),
    (uuid_generate_v4(), 'Deodorizers', 'Pet deodorizing products', grooming_id, 54);
END $$;

-- Create default notification templates
INSERT INTO notification_templates (id, type, name, description, email_subject, email_body, push_title, push_body, sms_body, parameters, active) VALUES
(uuid_generate_v4(), 'appointment_reminder', 'Appointment Reminder', 'Sent before an upcoming appointment', 
'Reminder: Your pet''s appointment is tomorrow', 
'<p>Hello {{name}},</p><p>This is a reminder that {{pet_name}} has an appointment scheduled for tomorrow ({{date}}) at {{time}} with {{clinic}}.</p><p>If you need to reschedule, please contact us at least 24 hours in advance.</p>',
'Appointment Reminder',
'{{pet_name}} has an appointment tomorrow at {{time}}',
'Reminder: {{pet_name}}''s appointment at {{clinic}} is tomorrow at {{time}}',
'{"name": "Customer name", "pet_name": "Pet name", "date": "Appointment date", "time": "Appointment time", "clinic": "Clinic name"}',
true),

(uuid_generate_v4(), 'order_confirmation', 'Order Confirmation', 'Sent when an order is placed', 
'Your PetPro order #{{order_number}} has been confirmed', 
'<p>Hello {{name}},</p><p>Thank you for your order #{{order_number}}.</p><p>We''ve received your order and are processing it now. You will receive another email when your order ships.</p><p>Order Total: ${{total}}</p>',
'Order Confirmation',
'Your order #{{order_number}} for ${{total}} has been confirmed',
'Your PetPro order #{{order_number}} for ${{total}} has been confirmed and is being processed',
'{"name": "Customer name", "order_number": "Order number", "total": "Order total"}',
true),

(uuid_generate_v4(), 'order_shipped', 'Order Shipped', 'Sent when an order ships', 
'Your PetPro order has shipped!', 
'<p>Hello {{name}},</p><p>Great news! Your order #{{order_number}} has shipped and is on its way to you.</p><p>Tracking Number: {{tracking_number}}</p><p>Estimated Delivery: {{delivery_date}}</p>',
'Order Shipped',
'Your order #{{order_number}} has shipped! Tracking: {{tracking_number}}',
'Your PetPro order #{{order_number}} has shipped! Track: {{tracking_number}}. Est. delivery: {{delivery_date}}',
'{"name": "Customer name", "order_number": "Order number", "tracking_number": "Tracking number", "delivery_date": "Estimated delivery date"}',
true),

(uuid_generate_v4(), 'password_reset', 'Password Reset', 'Sent when a user requests a password reset', 
'PetPro Password Reset Request', 
'<p>Hello,</p><p>We received a request to reset your password. Click the link below to set a new password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>This link will expire in 30 minutes.</p><p>If you did not request a password reset, please ignore this email.</p>',
'Password Reset Request',
'Tap to reset your PetPro account password',
'Your PetPro password reset code is: {{reset_code}}. Valid for 30 minutes.',
'{"reset_link": "Password reset link", "reset_code": "Password reset code"}',
true),

(uuid_generate_v4(), 'account_verification', 'Account Verification', 'Sent when a new user registers', 
'Verify your PetPro account', 
'<p>Hello {{name}},</p><p>Welcome to PetPro! Please verify your email address by clicking the link below:</p><p><a href="{{verification_link}}">Verify Email</a></p>',
'Verify Your Account',
'Tap to verify your PetPro account email',
'Your PetPro verification code is: {{verification_code}}',
'{"name": "Customer name", "verification_link": "Email verification link", "verification_code": "Verification code"}',
true);

-- Create admin user (password: Admin123!)
INSERT INTO users (
    id, email, password_hash, user_type, email_verified, active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@petpro.example',
    crypt('Admin123!', gen_salt('bf', 10)),
    'admin',
    true,
    true
);

-- Create admin profile
INSERT INTO user_profiles (
    user_id, first_name, last_name, display_name
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'System',
    'Administrator',
    'Admin'
);

-- Assign admin role
INSERT INTO user_roles (user_id, role_id)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM roles WHERE name = 'admin')
);

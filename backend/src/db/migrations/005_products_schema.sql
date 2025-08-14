-- Products and E-commerce Schema for PetPro
-- Creates tables for products, inventory, orders, and shopping cart

-- Product Categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_categories IS 'Hierarchical categories for products';

-- Product Management
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    sale_price DECIMAL(10,2) CHECK (sale_price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    weight_kg DECIMAL(8,3),
    dimensions JSONB,
    attributes JSONB DEFAULT '{}'::jsonb,
    images TEXT[],
    thumbnail_url TEXT,
    average_rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_prescription BOOLEAN DEFAULT FALSE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE products IS 'Products available for sale';

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    variant_attributes JSONB NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_variants IS 'Product variations like size, color, etc.';

-- Inventory Management
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id UUID,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    reorder_threshold INTEGER,
    reorder_quantity INTEGER,
    location VARCHAR(100),
    lot_number VARCHAR(100),
    expiration_date DATE,
    last_count_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_item_uniqueness UNIQUE (product_id, variant_id, warehouse_id)
);

COMMENT ON TABLE inventory IS 'Product inventory tracking';

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL, -- 'receipt', 'sale', 'adjustment', 'transfer', 'return'
    quantity INTEGER NOT NULL,
    reference_id UUID, -- Order ID, transfer ID, etc.
    reference_type VARCHAR(50), -- 'order', 'transfer', 'adjustment'
    notes TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE inventory_transactions IS 'History of inventory changes';

-- Orders and Shopping Cart
CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

COMMENT ON TABLE shopping_carts IS 'User shopping carts';

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_item_uniqueness UNIQUE (cart_id, product_id, variant_id)
);

COMMENT ON TABLE cart_items IS 'Items in shopping carts';

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    billing_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    notes TEXT,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'USD',
    promotion_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT
);

COMMENT ON TABLE orders IS 'Customer orders';

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100),
    requires_shipping BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_items IS 'Individual items within an order';

CREATE TABLE order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    comment TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE order_history IS 'History of order status changes';

-- Promotions and Discounts
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, free_shipping
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2) DEFAULT 0.00,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    applies_to VARCHAR(20), -- all, products, categories
    applicable_items UUID[], -- product_ids or category_ids
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE promotions IS 'Discounts and promotional offers';

-- Create indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX idx_inventory_available_quantity ON inventory(available_quantity);

CREATE INDEX idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);

CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_shopping_carts_session_id ON shopping_carts(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_order_history_order_id ON order_history(order_id);

CREATE INDEX idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_promotions_active_dates ON promotions(is_active, starts_at, ends_at) 
    WHERE is_active = TRUE;

-- Set up automatic updated_at timestamp triggers
CREATE TRIGGER set_timestamp_product_categories
BEFORE UPDATE ON product_categories
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_product_variants
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_inventory
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_shopping_carts
BEFORE UPDATE ON shopping_carts
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_cart_items
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_promotions
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Set up audit triggers
CREATE TRIGGER audit_products_changes
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_inventory_changes
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_order_items_changes
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

-- Add foreign key constraint to orders
ALTER TABLE orders ADD CONSTRAINT fk_orders_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;

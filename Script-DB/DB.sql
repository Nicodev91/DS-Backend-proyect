-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS "dataSentinel-back";

-- NotificationChannel Table
CREATE TABLE "dataSentinel-back".notification_channel (
    channel_id INTEGER PRIMARY KEY,
    name VARCHAR(100)      -- WhatsApp, Email, SMS, etc.
);

-- OTP Table (One-Time Password)
CREATE TABLE "dataSentinel-back".otp (
    otp_id INTEGER PRIMARY KEY,
    code VARCHAR(10),
    expiration_date TIMESTAMP,
    status VARCHAR(20),
    creation_date TIMESTAMP,
    user_id INTEGER
    FOREIGN KEY (user_id) REFERENCES "dataSentinel-back".user(user_id)
);

-- TipoUsuario Table
CREATE TABLE "dataSentinel-back".user_type (
    user_type_id INTEGER PRIMARY KEY,
    nombre VARCHAR(100)
);

-- Usuario Table
CREATE TABLE "dataSentinel-back".user (
    user_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    rut VARCHAR(20),
    email VARCHAR(100),
    phone_number VARCHAR(20),
    user_type_id INTEGER,
    register_date TIMESTAMP
    FOREIGN KEY (user_type_id) REFERENCES "dataSentinel-back".user_type(user_type_id)
    FOREIGN KEY (rut) REFERENCES "dataSentinel-back".customer(rut)
);

-- Notification Table
CREATE TABLE "dataSentinel-back".notification (
    notification_id INTEGER PRIMARY KEY,
    rut integer,
    channel_id INTEGER,
    message VARCHAR(150),
    creation_date TIMESTAMP,
    sending_date TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (channel_id) REFERENCES "dataSentinel-back".notification_channel(channel_id)
    FOREIGN KEY (rut) REFERENCES "dataSentinel-back".customer(rut) ON DELETE SET NULL
);

-- Customer Table
CREATE TABLE "dataSentinel-back".customer (
    rut INTEGER PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255)
);

-- Supplier Table
CREATE TABLE "dataSentinel-back".supplier (
    rut INTEGER PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255)
);

-- Category Table
CREATE TABLE "dataSentinel-back".category (
    category_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255)
);

-- Product Table
CREATE TABLE "dataSentinel-back".product (
    product_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    rut_supplier INTEGER,
    price NUMERIC(10,2),
    stock INTEGER,
    description VARCHAR(255),
    category_id INTEGER,
    image_url VARCHAR(255),
    status BOOLEAN,
    FOREIGN KEY (rut_supplier) REFERENCES "dataSentinel-back".supplier(rut),
    FOREIGN KEY (category_id) REFERENCES "dataSentinel-back".category(category_id)
);

-- Order Table
CREATE TABLE "dataSentinel-back".order (
    order_id INTEGER PRIMARY KEY,
    rut INTEGER,
    order_date TIMESTAMP,
    total_amount NUMERIC(10,2),
    status VARCHAR(50),
    shipping_address VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (rut) REFERENCES "dataSentinel-back".customer(rut),
    FOREIGN KEY (user_id) REFERENCES "dataSentinel-back".user(user_id)
);

-- OrderDetail Table
CREATE TABLE "dataSentinel-back".order_detail (
    order_detail_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price NUMERIC(10,2),
    subtotal NUMERIC(10,2),
    FOREIGN KEY (order_id) REFERENCES "dataSentinel-back".order(order_id),
    FOREIGN KEY (product_id) REFERENCES "dataSentinel-back".product(product_id)
);

-- ProductImage Table
CREATE TABLE "dataSentinel-back".product_image (
    image_id INTEGER PRIMARY KEY,
    product_id INTEGER,
    image_url VARCHAR(255),
    is_main_image BOOLEAN,
    FOREIGN KEY (product_id) REFERENCES "dataSentinel-back".product(product_id)
);
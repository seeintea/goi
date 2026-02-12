-- Family Finance Management System - Database Initialization Script
-- Generated based on docs/architecture/database-schema.md

-- =============================================
-- 1. Authentication & Authorization (System Level)
-- =============================================

-- 1.1 Users Table
CREATE TABLE IF NOT EXISTS auth_user (
    user_id VARCHAR(32) PRIMARY KEY, -- Snowflake ID or UUID
    username VARCHAR(30) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL, -- Default: "User_{Suffix}" or "User"
    password VARCHAR(100) NOT NULL, -- Encrypted password (random for virtual users)
    salt VARCHAR(16) NOT NULL,
    email VARCHAR(50), -- Nullable for virtual users
    phone VARCHAR(11), -- Nullable for virtual users
    is_virtual BOOLEAN DEFAULT FALSE, -- Virtual account flag
    is_disabled BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 Roles Table
CREATE TABLE IF NOT EXISTS auth_role (
    role_id VARCHAR(32) PRIMARY KEY,
    family_id UUID, -- Null for system templates, Not Null for family instances
    role_code VARCHAR(30) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    is_disabled BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_role_code_family UNIQUE (role_code, family_id)
);

-- 1.3 Modules Table
CREATE TABLE IF NOT EXISTS auth_module (
    module_id VARCHAR(32) PRIMARY KEY,
    parent_id VARCHAR(32) REFERENCES auth_module(module_id),
    name VARCHAR(80) NOT NULL,
    route_path VARCHAR(200) NOT NULL UNIQUE,
    permission_code VARCHAR(80) NOT NULL UNIQUE,
    sort INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.4 Permissions Table
CREATE TABLE IF NOT EXISTS auth_permission (
    permission_id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    module_id VARCHAR(32) REFERENCES auth_module(module_id),
    is_disabled BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.5 Role-Permission Relation Table
CREATE TABLE IF NOT EXISTS auth_role_permission (
    role_id VARCHAR(32) REFERENCES auth_role(role_id),
    permission_id VARCHAR(32) REFERENCES auth_permission(permission_id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- =============================================
-- 2. Core Business: Families & Members
-- =============================================

-- 2.1 Families (Tenants/Books) Table
CREATE TABLE IF NOT EXISTS fin_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(32) REFERENCES auth_user(user_id),
    base_currency VARCHAR(10) DEFAULT 'CNY',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 Family Members Table
CREATE TABLE IF NOT EXISTS fin_family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    user_id VARCHAR(32) REFERENCES auth_user(user_id),
    role_id VARCHAR(32) REFERENCES auth_role(role_id),
    status VARCHAR(20) CHECK (status IN ('INVITED', 'ACTIVE', 'DISABLED')),
    joined_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 3. Finance Core
-- =============================================

-- 3.1 Accounts Table
CREATE TABLE IF NOT EXISTS fin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- CASH, BANK, CREDIT, INVESTMENT, LOAN
    balance DECIMAL(15, 2) DEFAULT 0,
    currency_code VARCHAR(10) DEFAULT 'CNY',
    credit_limit DECIMAL(15, 2),
    billing_day INTEGER,
    due_day INTEGER,
    exclude_from_stats BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.2 Categories Table
CREATE TABLE IF NOT EXISTS fin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('EXPENSE', 'INCOME')),
    parent_id UUID REFERENCES fin_categories(id),
    is_hidden BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    icon VARCHAR(255),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.3 Tags Table
CREATE TABLE IF NOT EXISTS fin_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. Transactions
-- =============================================

-- 4.1 Transactions Table
CREATE TABLE IF NOT EXISTS fin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    account_id UUID REFERENCES fin_accounts(id),
    to_account_id UUID REFERENCES fin_accounts(id), -- Only for TRANSFER
    category_id UUID REFERENCES fin_categories(id), -- Usually null for TRANSFER
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(20) CHECK (type IN ('EXPENSE', 'INCOME', 'TRANSFER')),
    occurred_at TIMESTAMP NOT NULL,
    description TEXT,
    created_by VARCHAR(32) REFERENCES auth_user(user_id), -- Can be virtual user ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4.2 Transaction-Tags Relation Table
CREATE TABLE IF NOT EXISTS fin_transaction_tags (
    transaction_id UUID REFERENCES fin_transactions(id),
    tag_id UUID REFERENCES fin_tags(id),
    PRIMARY KEY (transaction_id, tag_id)
);

-- =============================================
-- 5. Budgeting
-- =============================================

-- 5.1 Budgets Table
CREATE TABLE IF NOT EXISTS fin_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES fin_families(id),
    category_id UUID REFERENCES fin_categories(id), -- Null for total family budget
    amount DECIMAL(15, 2) NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('MONTHLY', 'YEARLY', 'ONE_OFF')),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 6. System Audit
-- =============================================

-- 6.1 Audit Log Table
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) REFERENCES auth_user(user_id), -- Actual Operator ID
    family_id UUID REFERENCES fin_families(id),
    action VARCHAR(50) NOT NULL, -- e.g., CREATE, UPDATE
    target_entity VARCHAR(50) NOT NULL, -- e.g., TRANSACTION
    target_id VARCHAR(50) NOT NULL, -- e.g., Transaction ID
    changes JSONB, -- Snapshot of changes
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance (Optional but recommended)
CREATE INDEX idx_transactions_family_occurred ON fin_transactions(family_id, occurred_at);
CREATE INDEX idx_transactions_account ON fin_transactions(account_id);
CREATE INDEX idx_audit_log_user ON sys_audit_log(user_id);
CREATE INDEX idx_audit_log_target ON sys_audit_log(target_entity, target_id);

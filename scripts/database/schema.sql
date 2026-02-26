-- Aurexia Database Schema
-- PostgreSQL 15+

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Merchants table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(2),
    kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    tier VARCHAR(50) DEFAULT 'basic', -- basic, standard, premium, enterprise
    monthly_limit BIGINT DEFAULT 10000000000000000000, -- 10,000 AURX in wei
    transaction_limit BIGINT DEFAULT 100000000000000000, -- 100 AURX in wei
    is_active BOOLEAN DEFAULT true,
    api_key_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    INDEX idx_wallet (wallet_address),
    INDEX idx_email (email),
    INDEX idx_kyc_status (kyc_status)
);

-- Payment intents table
CREATE TABLE payment_intents (
    id VARCHAR(255) PRIMARY KEY,
    client_secret VARCHAR(255) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount BIGINT NOT NULL,
    currency VARCHAR(10) DEFAULT 'AURX',
    description TEXT,
    customer_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, succeeded, failed
    payment_method VARCHAR(50),
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    payment_intent_id VARCHAR(255) REFERENCES payment_intents(id),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price BIGINT,
    fee_amount BIGINT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    transaction_hash VARCHAR(255) UNIQUE,
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    INDEX idx_from (from_address),
    INDEX idx_to (to_address),
    INDEX idx_tx_hash (transaction_hash)
);

-- Settlements table
CREATE TABLE settlements (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount BIGINT NOT NULL,
    fees BIGINT NOT NULL,
    net_amount BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (status),
    INDEX idx_period (period_start, period_end)
);

-- Refunds table
CREATE TABLE refunds (
    id VARCHAR(255) PRIMARY KEY,
    payment_intent_id VARCHAR(255) NOT NULL REFERENCES payment_intents(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount BIGINT NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_payment (payment_intent_id),
    INDEX idx_merchant (merchant_id)
);

-- Webhooks table
CREATE TABLE webhooks (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    url VARCHAR(2048) NOT NULL,
    secret VARCHAR(255),
    events TEXT ARRAY DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_merchant (merchant_id)
);

-- Webhook deliveries table
CREATE TABLE webhook_deliveries (
    id VARCHAR(255) PRIMARY KEY,
    webhook_id VARCHAR(255) NOT NULL REFERENCES webhooks(id),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, delivered, failed
    attempts INT DEFAULT 0,
    last_error TEXT,
    next_retry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    INDEX idx_webhook (webhook_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Validators table
CREATE TABLE validators (
    id VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    stake_amount BIGINT NOT NULL,
    commission_rate INT DEFAULT 100, -- basis points
    is_active BOOLEAN DEFAULT true,
    voting_power BIGINT,
    slashed_amount BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_address (wallet_address),
    INDEX idx_active (is_active)
);

-- Staking records table
CREATE TABLE staking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staker_address VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    lockup_period INT NOT NULL, -- days
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rewards_earned BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staker (staker_address),
    INDEX idx_status (status)
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY,
    recipient_address VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    status VARCHAR(50) DEFAULT 'unread', -- unread, read, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    INDEX idx_recipient (recipient_address),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_address VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_actor (actor_address),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20),
    name VARCHAR(255),
    is_live BOOLEAN DEFAULT false,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_merchant (merchant_id)
);

-- Disputes table
CREATE TABLE disputes (
    id VARCHAR(255) PRIMARY KEY,
    payment_intent_id VARCHAR(255) NOT NULL REFERENCES payment_intents(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    reason VARCHAR(255) NOT NULL,
    evidence_urls TEXT ARRAY,
    status VARCHAR(50) DEFAULT 'open', -- open, won_by_merchant, won_by_customer, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    INDEX idx_payment (payment_intent_id),
    INDEX idx_merchant (merchant_id)
);

-- Create indexes for performance
CREATE INDEX idx_payment_intents_merchant_created 
    ON payment_intents(merchant_id, created_at DESC);

CREATE INDEX idx_transactions_payment_intent 
    ON transactions(payment_intent_id);

CREATE INDEX idx_settlements_merchant_period 
    ON settlements(merchant_id, period_start, period_end);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON merchants TO aurexia;
GRANT SELECT, INSERT, UPDATE ON payment_intents TO aurexia;
GRANT SELECT, INSERT, UPDATE ON transactions TO aurexia;
GRANT SELECT, INSERT, UPDATE ON settlements TO aurexia;
GRANT SELECT, INSERT, UPDATE ON refunds TO aurexia;
GRANT SELECT, INSERT, UPDATE ON webhooks TO aurexia;
GRANT SELECT, INSERT, UPDATE ON webhook_deliveries TO aurexia;
GRANT SELECT, INSERT, UPDATE ON validators TO aurexia;
GRANT SELECT, INSERT, UPDATE ON staking_records TO aurexia;
GRANT SELECT, INSERT, UPDATE ON notifications TO aurexia;
GRANT SELECT, INSERT ON audit_logs TO aurexia;
GRANT SELECT, INSERT, UPDATE ON api_keys TO aurexia;
GRANT SELECT, INSERT, UPDATE ON disputes TO aurexia;

-- Add comments
COMMENT ON TABLE merchants IS 'Merchant account information and KYC status';
COMMENT ON TABLE payment_intents IS 'Stripe-like payment intents';
COMMENT ON TABLE transactions IS 'Blockchain transactions';
COMMENT ON TABLE settlements IS 'Merchant settlements';
COMMENT ON TABLE webhooks IS 'Webhook endpoints for event delivery';
COMMENT ON TABLE validators IS 'Blockchain validators';
COMMENT ON TABLE staking_records IS 'User staking information';

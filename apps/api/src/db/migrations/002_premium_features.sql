-- MirrorX Premium Features Migration
-- Version: 002
-- Date: 2025-01-25
-- Features: Compare Mode, Wishlist, Occasion Stylist, Fit Signals, Studio 2.0

-- ============================================
-- 1. ENHANCED TRYON_JOBS TABLE
-- ============================================

-- Add new columns to tryon_jobs for Studio 2.0
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'PART';
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS parent_job_id UUID REFERENCES tryon_jobs(id) ON DELETE SET NULL;
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS background_mode VARCHAR(20) DEFAULT 'ORIGINAL';
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS compare_eligible BOOLEAN DEFAULT true;
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS result_metadata JSONB;
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS fit_confidence DECIMAL(5,2);
ALTER TABLE tryon_jobs ADD COLUMN IF NOT EXISTS quality_tier VARCHAR(20) DEFAULT 'SD';

-- Create enum types if not exists
DO $$ BEGIN
    CREATE TYPE job_type_enum AS ENUM ('PART', 'FULL_FIT', 'GARMENT_ONLY_REGEN', 'OUTFIT_STEP', 'OUTFIT_FINAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE background_mode_enum AS ENUM ('ORIGINAL', 'STUDIO', 'BLUR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_tier_enum AS ENUM ('SD', 'HD', 'ULTRA_HD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Index for parent job lineage
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_parent ON tryon_jobs(parent_job_id) WHERE parent_job_id IS NOT NULL;

-- ============================================
-- 2. COMPARE SETS (Compare Mode Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS compare_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    description TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compare_sets_user ON compare_sets(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS compare_set_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compare_set_id UUID NOT NULL REFERENCES compare_sets(id) ON DELETE CASCADE,
    tryon_job_id UUID NOT NULL REFERENCES tryon_jobs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(compare_set_id, tryon_job_id)
);

CREATE INDEX IF NOT EXISTS idx_compare_set_items_set ON compare_set_items(compare_set_id, position);

-- ============================================
-- 3. WISHLIST SYSTEM
-- ============================================

DO $$ BEGIN
    CREATE TYPE platform_enum AS ENUM ('myntra', 'ajio', 'amazon', 'flipkart', 'meesho', 'nykaa', 'tatacliq', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL DEFAULT 'other',
    product_url TEXT NOT NULL,
    title VARCHAR(500),
    brand VARCHAR(200),
    image_url TEXT,
    current_price DECIMAL(12,2),
    original_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'INR',
    palette_match_score DECIMAL(5,2),
    size_recommendation VARCHAR(20),
    occasion_tags TEXT[],
    is_on_sale BOOLEAN DEFAULT false,
    last_price_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_url)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_platform ON wishlist_items(platform);
CREATE INDEX IF NOT EXISTS idx_wishlist_price ON wishlist_items(user_id, current_price);

-- Price check history
CREATE TABLE IF NOT EXISTS wishlist_price_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price DECIMAL(12,2),
    was_available BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'OK',
    error_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_checks_item ON wishlist_price_checks(wishlist_item_id, checked_at DESC);

-- ============================================
-- 4. OCCASION STYLIST
-- ============================================

DO $$ BEGIN
    CREATE TYPE occasion_enum AS ENUM (
        'office', 'interview', 'date_night', 'wedding_day', 'wedding_night',
        'festive', 'vacation', 'casual', 'college', 'party', 'formal', 'ethnic'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS stylist_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    occasion VARCHAR(50) NOT NULL,
    budget_min DECIMAL(12,2) DEFAULT 0,
    budget_max DECIMAL(12,2) DEFAULT 100000,
    style_slider_value INTEGER DEFAULT 50, -- 0=Modest, 100=Bold
    color_preferences TEXT[],
    use_style_dna BOOLEAN DEFAULT true,
    gender VARCHAR(10) DEFAULT 'female',
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_stylist_requests_user ON stylist_requests(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS stylist_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_request_id UUID NOT NULL REFERENCES stylist_requests(id) ON DELETE CASCADE,
    look_rank INTEGER NOT NULL DEFAULT 1,
    look_name VARCHAR(200),
    look_description TEXT,
    look_payload JSONB NOT NULL, -- items, rationale, palette match, etc.
    total_price DECIMAL(12,2),
    tryon_job_id UUID REFERENCES tryon_jobs(id) ON DELETE SET NULL,
    user_rating INTEGER, -- 1-5
    is_saved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stylist_results_request ON stylist_results(stylist_request_id, look_rank);

-- ============================================
-- 5. USER FIT SIGNALS (Size Learning)
-- ============================================

CREATE TABLE IF NOT EXISTS user_fit_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- tops, bottoms, dresses, shoes
    size_recommended VARCHAR(20),
    size_confirmed VARCHAR(20),
    fit_feedback VARCHAR(30), -- too_tight, slightly_tight, perfect, slightly_loose, too_loose
    confidence DECIMAL(5,2),
    source VARCHAR(50) DEFAULT 'prediction', -- prediction, user_input, purchase_feedback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brand, category)
);

CREATE INDEX IF NOT EXISTS idx_fit_signals_user ON user_fit_signals(user_id, brand);

-- ============================================
-- 6. OUTFIT BUILDER (Layered Outfits)
-- ============================================

CREATE TABLE IF NOT EXISTS outfit_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200),
    occasion VARCHAR(50),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
    final_tryon_job_id UUID REFERENCES tryon_jobs(id) ON DELETE SET NULL,
    total_price DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_builds_user ON outfit_builds(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS outfit_build_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_build_id UUID NOT NULL REFERENCES outfit_builds(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- top, bottom, footwear, accessory, outerwear
    product_url TEXT,
    product_image TEXT,
    title VARCHAR(500),
    brand VARCHAR(200),
    price DECIMAL(12,2),
    tryon_job_id UUID REFERENCES tryon_jobs(id) ON DELETE SET NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_build_items ON outfit_build_items(outfit_build_id, position);

-- ============================================
-- 7. NOTIFICATIONS SYSTEM
-- ============================================

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM (
        'PRICE_DROP', 'BACK_IN_STOCK', 'WEEKLY_DIGEST',
        'STYLE_TIP', 'NEW_FEATURE', 'CREDIT_LOW', 'SUBSCRIPTION_EXPIRING'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    payload JSONB,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    send_via VARCHAR(20) DEFAULT 'in_app', -- in_app, email, push
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    price_drop_alerts BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT true,
    style_tips BOOLEAN DEFAULT true,
    new_features BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    digest_day VARCHAR(10) DEFAULT 'monday', -- day of week for digest
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. ANALYTICS EVENTS TABLE (for internal tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB,
    session_id VARCHAR(100),
    device_type VARCHAR(50),
    platform VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name, created_at DESC);

-- Partition by month for better performance (optional)
-- CREATE INDEX IF NOT EXISTS idx_analytics_time ON analytics_events(created_at DESC);

-- ============================================
-- 9. UPDATE TRIGGERS
-- ============================================

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_compare_sets_updated_at ON compare_sets;
CREATE TRIGGER update_compare_sets_updated_at
    BEFORE UPDATE ON compare_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_fit_signals_updated_at ON user_fit_signals;
CREATE TRIGGER update_user_fit_signals_updated_at
    BEFORE UPDATE ON user_fit_signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outfit_builds_updated_at ON outfit_builds;
CREATE TRIGGER update_outfit_builds_updated_at
    BEFORE UPDATE ON outfit_builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. FEATURE FLAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0, -- 0-100
    allowed_user_ids UUID[],
    allowed_tiers TEXT[], -- FREE, PRO, ELITE
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, is_enabled, rollout_percentage, allowed_tiers) VALUES
    ('studio_v2_enabled', true, 100, ARRAY['FREE', 'PRO', 'ELITE']),
    ('compare_enabled', true, 100, ARRAY['FREE', 'PRO', 'ELITE']),
    ('background_modes_enabled', true, 100, ARRAY['PRO', 'ELITE']),
    ('regen_enabled', true, 100, ARRAY['PRO', 'ELITE']),
    ('wishlist_enabled', true, 100, ARRAY['FREE', 'PRO', 'ELITE']),
    ('occasion_stylist_enabled', true, 100, ARRAY['FREE', 'PRO', 'ELITE']),
    ('outfit_builder_enabled', true, 100, ARRAY['PRO', 'ELITE']),
    ('price_alerts_enabled', true, 100, ARRAY['PRO', 'ELITE']),
    ('hd_quality_enabled', true, 100, ARRAY['PRO', 'ELITE']),
    ('ultra_hd_quality_enabled', true, 100, ARRAY['ELITE'])
ON CONFLICT (flag_name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

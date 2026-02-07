-- Add social login fields to users table if it doesn't exist
-- First, let's check if users table exists, if not we'll handle it differently

-- Add columns for social authentication
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `social_provider` VARCHAR(50) NULL AFTER `status`,
ADD COLUMN IF NOT EXISTS `social_id` VARCHAR(255) NULL AFTER `social_provider`,
ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(500) NULL AFTER `social_id`,
ADD COLUMN IF NOT EXISTS `email_verified` BOOLEAN DEFAULT FALSE AFTER `avatar`;

-- Add index for faster social login lookups
CREATE INDEX IF NOT EXISTS `idx_social_provider_id` ON `users` (`social_provider`, `social_id`);

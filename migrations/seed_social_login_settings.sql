-- Seed social login settings into api_settings table
INSERT INTO `api_settings` (`key`, `value`, `group`) VALUES
('google_login_active', '0', 'social_login'),
('google_client_id', '', 'social_login'),
('google_client_secret', '', 'social_login'),
('facebook_login_active', '0', 'social_login'),
('facebook_client_id', '', 'social_login'),
('facebook_client_secret', '', 'social_login')
ON DUPLICATE KEY UPDATE `group` = 'social_login';

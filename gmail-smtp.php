<?php
// Configure PHP mail settings for Gmail
ini_set('SMTP', 'smtp.gmail.com');
ini_set('smtp_port', '587');
$smtpUser = getenv('MR_SPRINKLE_SMTP_USER');
$smtpPassword = getenv('MR_SPRINKLE_SMTP_PASSWORD');

if ($smtpUser && $smtpPassword) {
    ini_set('sendmail_from', $smtpUser);
    ini_set('auth_username', $smtpUser);
    ini_set('auth_password', $smtpPassword);
} else {
    error_log('Mr. Sprinkle SMTP is not configured in the server environment.');
}
?>
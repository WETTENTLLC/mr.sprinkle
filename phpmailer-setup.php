<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

function sendWelcomeEmail($email, $name, $code) {
    $smtpUser = getenv('MR_SPRINKLE_SMTP_USER');
    $smtpPassword = getenv('MR_SPRINKLE_SMTP_PASSWORD');
    if (!$smtpUser || !$smtpPassword) {
        error_log('Mr. Sprinkle SMTP is not configured in the server environment.');
        return false;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom($smtpUser, 'Mr. Sprinkle');
        $mail->addAddress($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to Mr. Sprinkle Ambassador Program!';
        
        $dashboardUrl = 'http://localhost/mr-sprinkle/ambassador-dashboard.php';
        $referralUrl = 'https://mrsprinklereno.com?ref=' . $code;
        
        $mail->Body = "
            <h2>Welcome to the Mr. Sprinkle Ambassador Program!</h2>
            <p>Hi $name,</p>
            <p>Your ambassador code: <strong>$code</strong></p>
            <p>Dashboard: <a href='$dashboardUrl'>$dashboardUrl</a></p>
            <p>Your referral link: <a href='$referralUrl'>$referralUrl</a></p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>
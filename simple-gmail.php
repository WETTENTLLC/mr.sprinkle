<?php
function sendGmailEmail($to, $subject, $message) {
    $from = 'mrsprinklereno@gmail.com';
    $password = 'ezym bvgj gsoa npse';
    
    // Simple email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Mr. Sprinkle <$from>\r\n";
    
    // Use wp_mail alternative - simple SMTP via fsockopen
    $smtp_server = 'smtp.gmail.com';
    $smtp_port = 587;
    
    $socket = fsockopen($smtp_server, $smtp_port, $errno, $errstr, 30);
    if (!$socket) {
        return false;
    }
    
    // SMTP conversation
    fgets($socket, 515);
    fputs($socket, "EHLO localhost\r\n");
    fgets($socket, 515);
    
    fputs($socket, "STARTTLS\r\n");
    fgets($socket, 515);
    
    // Enable crypto
    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    
    fputs($socket, "EHLO localhost\r\n");
    fgets($socket, 515);
    
    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 515);
    
    fputs($socket, base64_encode($from) . "\r\n");
    fgets($socket, 515);
    
    fputs($socket, base64_encode($password) . "\r\n");
    fgets($socket, 515);
    
    fputs($socket, "MAIL FROM: <$from>\r\n");
    fgets($socket, 515);
    
    fputs($socket, "RCPT TO: <$to>\r\n");
    fgets($socket, 515);
    
    fputs($socket, "DATA\r\n");
    fgets($socket, 515);
    
    fputs($socket, "Subject: $subject\r\n");
    fputs($socket, $headers);
    fputs($socket, "\r\n");
    fputs($socket, $message);
    fputs($socket, "\r\n.\r\n");
    fgets($socket, 515);
    
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    return true;
}
?>
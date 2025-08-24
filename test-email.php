<?php
// Test email sending
require_once 'gmail-smtp.php';

$test_email = 'mrsprinklereno@gmail.com'; // Send to yourself for testing
$test_name = 'Test Ambassador';
$test_code = 'TEST123';

$subject = 'Welcome to Mr. Sprinkle Ambassador Program!';
$message = "
    <h2>Welcome to the Mr. Sprinkle Ambassador Program!</h2>
    <p>Hi $test_name,</p>
    <p>Your ambassador code is: <strong>$test_code</strong></p>
    <p>This is a test email.</p>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: Mr. Sprinkle <mrsprinklereno@gmail.com>\r\n";

if (mail($test_email, $subject, $message, $headers)) {
    echo "Test email sent successfully!";
} else {
    echo "Failed to send test email.";
    echo "<br>Error: " . error_get_last()['message'];
}
?>
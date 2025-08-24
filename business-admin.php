<?php
session_start();

// Simple admin authentication
$admin_password = 'mrsprinkle2024';

if ($_POST['password'] ?? false) {
    if ($_POST['password'] === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        $error = 'Invalid password';
    }
}

if ($_GET['logout'] ?? false) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Database connection
$pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Include Gmail SMTP
require_once 'simple-gmail.php';

// Welcome email function
function sendWelcomeEmail($email, $name, $code) {
    $dashboardUrl = 'http://localhost/mr-sprinkle/ambassador-dashboard.php';
    $referralUrl = 'https://mrsprinklereno.com?ref=' . $code;
    
    $subject = 'Welcome to Mr. Sprinkle Ambassador Program!';
    $message = "
        <h2>Welcome to the Mr. Sprinkle Ambassador Program!</h2>
        <p>Hi $name,</p>
        <p>Congratulations! You've been approved as a Mr. Sprinkle Ambassador.</p>
        
        <h3>Your Ambassador Details:</h3>
        <ul>
            <li><strong>Ambassador Code:</strong> $code</li>
            <li><strong>Commission Rate:</strong> 10-20% (tiered based on performance)</li>
            <li><strong>Customer Discount:</strong> 5% off all services</li>
        </ul>
        
        <h3>Getting Started:</h3>
        <ol>
            <li><strong>Access Your Dashboard:</strong> <a href='$dashboardUrl'>$dashboardUrl</a></li>
            <li><strong>Login Code:</strong> $code</li>
            <li><strong>Your Referral Link:</strong> <a href='$referralUrl'>$referralUrl</a></li>
        </ol>
        
        <h3>How It Works:</h3>
        <p>Share your referral link with potential customers. When they book through your link:</p>
        <ul>
            <li>They get 5% off their service</li>
            <li>You earn commission based on your tier:</li>
            <ul>
                <li>Bronze (1-5 referrals): 10%</li>
                <li>Silver (6-10 referrals): 15%</li>
                <li>Gold (11+ referrals): 20%</li>
            </ul>
            <li>Bonus: $10 for every 5th referral each month</li>
        </ul>
        
        <h3>Mold Locations:</h3>
        <ul>
            <li><strong>Jack of All Fades:</strong> 5000 Smithridge Dr Suite C-7, Reno NV 89502 (Mondays)</li>
            <li><strong>Global Goods Shop:</strong> 1155 W 4th St Suite 119, Reno, NV 89503</li>
        </ul>
        
        <p>Questions? Contact us at mrsprinklereno@gmail.com or (530) 214-0676</p>
        
        <p>Welcome to the team!<br>
        Mr. Sprinkle</p>
    ";
    
    sendGmailEmail($email, $subject, $message);
}

// Handle actions
if ($_SESSION['admin_logged_in'] ?? false) {
    if ($_POST['action'] ?? false) {
        switch ($_POST['action']) {
            case 'add_ambassador':
                // Check if ambassador code already exists
                $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM ambassadors WHERE ambassador_code = ?");
                $checkStmt->execute([$_POST['code']]);
                
                if ($checkStmt->fetchColumn() > 0) {
                    $error = "Ambassador code '{$_POST['code']}' already exists. Please use a different code.";
                } else {
                    $stmt = $pdo->prepare("INSERT INTO ambassadors (ambassador_code, name, email, phone) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$_POST['code'], $_POST['name'], $_POST['email'], $_POST['phone']]);
                    
                    // Email temporarily disabled - send manually
                    $welcomeText = "
🎉 WELCOME TO MR. SPRINKLE AMBASSADOR PROGRAM! 🎉

Hi {$_POST['name']},

Congratulations! You're now an official Mr. Sprinkle Ambassador!

📋 YOUR AMBASSADOR DETAILS:
• Ambassador Code: {$_POST['code']}
• Commission Rate: 10-20% (tiered based on performance)
• Customer Discount: 5% off all services

🚀 HOW TO GET STARTED:
1. Your Referral Link: https://mrsprinklereno.com?ref={$_POST['code']}
2. Track earnings: We'll send monthly commission reports via email
3. Login Code: {$_POST['code']} (save this for future dashboard access!)

💰 COMMISSION STRUCTURE:
• Bronze (1-5 referrals): 10% commission
• Silver (6-10 referrals): 15% commission  
• Gold (11+ referrals): 20% commission
• BONUS: $10 for every 5th referral each month!

📍 MOLD LOCATIONS:
• Jack of All Fades: 5000 Smithridge Dr Suite C-7, Reno NV 89502 (Mondays)
• Global Goods Shop: 1155 W 4th St Suite 119, Reno, NV 89503

💎 SERVICES & PRICING:
• Single Tooth Fully Iced: $180
• 3 Teeth Fully Iced: $540
• 8 Teeth Fully Iced: $1,440
• Gap Filler + 2 Back Clips: $300
• Consultation: $50

📞 QUESTIONS? Contact us:
• Phone: (530) 214-0676
• Email: mrsprinklereno@gmail.com

Welcome to the team!
Mr. Sprinkle - Custom Grillz Since 2002
                    ";
                    
                    $success = "Ambassador added! Copy this complete welcome message and send to {$_POST['email']}: <br><pre style='background:#333;padding:15px;border-radius:8px;color:#fff;font-size:12px;'>" . htmlspecialchars($welcomeText) . "</pre>";
                }
                break;
                
            case 'pay_commission':
                $stmt = $pdo->prepare("UPDATE ambassador_referrals SET status = 'paid', paid_date = NOW() WHERE id = ?");
                $stmt->execute([$_POST['referral_id']]);
                $success = "Commission marked as paid";
                break;
                
            case 'delete_ambassador':
                $stmt = $pdo->prepare("DELETE FROM ambassadors WHERE ambassador_code = ?");
                $stmt->execute([$_POST['ambassador_code']]);
                $success = "Ambassador deleted successfully";
                break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Admin - Mr. Sprinkle</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #1a1a1a, #333); color: #fff; min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 2.5em; font-weight: bold; background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: #FFD700; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 2px solid rgba(255, 215, 0, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; }
        .btn { padding: 12px 24px; background: linear-gradient(45deg, #FFD700, #FFA500); color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-right: 10px; }
        .btn:hover { transform: translateY(-2px); }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(255, 215, 0, 0.2); }
        .table th { background: rgba(255, 215, 0, 0.1); color: #FFD700; }
        .status-pending { background: #FFA500; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
        .status-paid { background: #4CAF50; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
        .login-form { max-width: 400px; margin: 100px auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    </style>
</head>
<body>
    <?php if (!($_SESSION['admin_logged_in'] ?? false)): ?>
        <div class="container">
            <div class="header">
                <div class="logo">Mr. Sprinkle</div>
                <div style="color: #ccc; font-size: 1.2em;">Business Admin Portal</div>
            </div>
            
            <form method="POST" class="card login-form">
                <div class="form-group">
                    <label for="password">Admin Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <?php if (isset($error)): ?>
                    <div style="color: #f44336; text-align: center; margin-bottom: 20px;"><?= $error ?></div>
                <?php endif; ?>
                
                <button type="submit" class="btn" style="width: 100%;">Login</button>
            </form>
        </div>
    <?php else: ?>
        <div class="container">
            <div class="header">
                <div class="logo">Mr. Sprinkle</div>
                <div style="color: #ccc; font-size: 1.2em;">Business Admin Portal</div>
                <div style="margin-top: 10px;">
                    <a href="?logout=1" style="color: #FFD700; text-decoration: none;">Logout</a>
                </div>
            </div>
            
            <?php if (isset($success)): ?>
                <div style="background: #4CAF50; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                    <?= $success ?>
                </div>
            <?php endif; ?>
            
            <div class="grid">
                <!-- Add New Ambassador -->
                <div class="card">
                    <h3 style="color: #FFD700; margin-bottom: 20px;">Add New Ambassador</h3>
                    <form method="POST">
                        <input type="hidden" name="action" value="add_ambassador">
                        <div class="form-group">
                            <label>Ambassador Code</label>
                            <input type="text" name="code" required placeholder="e.g., JOHN2024">
                        </div>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" name="phone">
                        </div>
                        <button type="submit" class="btn">Add Ambassador</button>
                    </form>
                </div>
                
                <!-- Quick Stats -->
                <div class="card">
                    <h3 style="color: #FFD700; margin-bottom: 20px;">Quick Stats</h3>
                    <?php
                    $stats = $pdo->query("
                        SELECT 
                            COUNT(DISTINCT a.id) as total_ambassadors,
                            COUNT(DISTINCT b.id) as total_bookings,
                            SUM(CASE WHEN ar.status = 'pending' THEN ar.commission_amount ELSE 0 END) as pending_commissions,
                            SUM(CASE WHEN ar.status = 'paid' THEN ar.commission_amount ELSE 0 END) as paid_commissions
                        FROM ambassadors a
                        LEFT JOIN bookings b ON a.ambassador_code = b.ambassador_code
                        LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
                    ")->fetch(PDO::FETCH_ASSOC);
                    ?>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: bold;"><?= $stats['total_ambassadors'] ?></div>
                            <div style="color: #ccc;">Ambassadors</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: bold;"><?= $stats['total_bookings'] ?></div>
                            <div style="color: #ccc;">Bookings</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5em; font-weight: bold;">$<?= number_format($stats['pending_commissions'], 2) ?></div>
                            <div style="color: #ccc;">Pending</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5em; font-weight: bold;">$<?= number_format($stats['paid_commissions'], 2) ?></div>
                            <div style="color: #ccc;">Paid</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Pending Commissions -->
            <div class="card">
                <h3 style="color: #FFD700; margin-bottom: 20px;">Pending Commissions</h3>
                <?php
                $pending = $pdo->query("
                    SELECT ar.*, a.name, b.customer_name, b.service_type, b.final_price
                    FROM ambassador_referrals ar
                    JOIN ambassadors a ON ar.ambassador_code = a.ambassador_code
                    JOIN bookings b ON ar.booking_id = b.id
                    WHERE ar.status = 'pending'
                    ORDER BY ar.created_at DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                ?>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Ambassador</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Sale Amount</th>
                            <th>Commission</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pending as $commission): ?>
                            <tr>
                                <td><?= htmlspecialchars($commission['name']) ?></td>
                                <td><?= htmlspecialchars($commission['customer_name']) ?></td>
                                <td><?= ucfirst(str_replace('_', ' ', $commission['service_type'])) ?></td>
                                <td>$<?= number_format($commission['final_price'], 2) ?></td>
                                <td>$<?= number_format($commission['commission_amount'], 2) ?></td>
                                <td><?= date('M j, Y', strtotime($commission['created_at'])) ?></td>
                                <td>
                                    <form method="POST" style="display: inline;">
                                        <input type="hidden" name="action" value="pay_commission">
                                        <input type="hidden" name="referral_id" value="<?= $commission['id'] ?>">
                                        <button type="submit" class="btn" style="padding: 6px 12px; font-size: 0.9em;">Mark Paid</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- All Ambassadors -->
            <div class="card">
                <h3 style="color: #FFD700; margin-bottom: 20px;">All Ambassadors</h3>
                <?php
                $ambassadors = $pdo->query("
                    SELECT a.*, 
                           COUNT(DISTINCT ar.id) as total_referrals,
                           SUM(CASE WHEN ar.status = 'paid' THEN ar.commission_amount ELSE 0 END) as paid_commission,
                           SUM(CASE WHEN ar.status = 'pending' THEN ar.commission_amount ELSE 0 END) as pending_commission
                    FROM ambassadors a
                    LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
                    GROUP BY a.id
                    ORDER BY a.created_at DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                ?>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Referrals</th>
                            <th>Paid Commission</th>
                            <th>Pending Commission</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($ambassadors as $ambassador): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($ambassador['ambassador_code']) ?></strong></td>
                                <td><?= htmlspecialchars($ambassador['name']) ?></td>
                                <td><?= htmlspecialchars($ambassador['email']) ?></td>
                                <td><?= $ambassador['total_referrals'] ?></td>
                                <td>$<?= number_format($ambassador['paid_commission'], 2) ?></td>
                                <td>$<?= number_format($ambassador['pending_commission'], 2) ?></td>
                                <td>
                                    <span class="status-<?= $ambassador['status'] ?>"><?= ucfirst($ambassador['status']) ?></span>
                                </td>
                                <td>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this ambassador?')">
                                        <input type="hidden" name="action" value="delete_ambassador">
                                        <input type="hidden" name="ambassador_code" value="<?= $ambassador['ambassador_code'] ?>">
                                        <button type="submit" class="btn" style="background: #f44336; padding: 6px 12px; font-size: 0.9em;">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>
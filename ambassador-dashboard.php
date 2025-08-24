<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ambassador Dashboard - Mr. Sprinkle</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #333);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .card h3 {
            color: #FFD700;
            margin-bottom: 20px;
            font-size: 1.5em;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #fff;
            margin-bottom: 10px;
        }

        .stat-label {
            color: #ccc;
            font-size: 0.9em;
        }

        .qr-section {
            text-align: center;
        }

        .qr-code {
            background: white;
            padding: 20px;
            border-radius: 15px;
            display: inline-block;
            margin: 20px 0;
        }

        .referral-link {
            background: rgba(255, 215, 0, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .copy-btn {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
            transition: all 0.3s ease;
        }

        .copy-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }

        .recent-referrals {
            grid-column: 1 / -1;
        }

        .referrals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .referrals-table th,
        .referrals-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }

        .referrals-table th {
            background: rgba(255, 215, 0, 0.1);
            color: #FFD700;
            font-weight: bold;
        }

        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-pending {
            background: #FFA500;
            color: #000;
        }

        .status-paid {
            background: #4CAF50;
            color: #fff;
        }

        .login-form {
            max-width: 400px;
            margin: 100px auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #FFD700;
            font-weight: bold;
        }

        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 16px;
        }

        .form-group input:focus {
            outline: none;
            border-color: #FFD700;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .login-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
        }

        @media (max-width: 768px) {
            body { padding: 10px; }
            .container { max-width: 100%; }
            .dashboard-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .card { padding: 20px; }
            .referrals-table {
                font-size: 0.8em;
                overflow-x: auto;
                display: block;
                white-space: nowrap;
            }
            .referrals-table th,
            .referrals-table td {
                padding: 8px 4px;
                min-width: 80px;
            }
            .logo { font-size: 2rem; }
            .stat-value { font-size: 2rem; }
        }
        
        @media (max-width: 480px) {
            body { padding: 5px; }
            .card { padding: 15px; }
            .logo { font-size: 1.8rem; }
            .stat-value { font-size: 1.8rem; }
            .login-form { padding: 20px; margin: 50px auto; }
        }
    </style>
</head>
<body>
    <?php
    session_start();
    
    // Database connection
    $host = 'localhost';
    $dbname = 'mr_sprinkle_db';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch(PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
    
    // Handle login
    if ($_POST['ambassador_code'] ?? false) {
        $code = $_POST['ambassador_code'];
        $stmt = $pdo->prepare("SELECT * FROM ambassadors WHERE ambassador_code = ? AND status = 'active'");
        $stmt->execute([$code]);
        $ambassador = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($ambassador) {
            $_SESSION['ambassador_code'] = $code;
            $_SESSION['ambassador_name'] = $ambassador['name'];
        } else {
            $error = "Invalid ambassador code";
        }
    }
    
    // Handle logout
    if ($_GET['logout'] ?? false) {
        session_destroy();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
    
    $ambassadorCode = $_SESSION['ambassador_code'] ?? null;
    
    if (!$ambassadorCode) {
        // Show login form
        ?>
        <div class="container">
            <div class="header">
                <div class="logo">Mr. Sprinkle</div>
                <div style="color: #ccc; font-size: 1.2em;">Ambassador Dashboard</div>
            </div>
            
            <form method="POST" class="login-form">
                <div class="form-group">
                    <label for="ambassador_code">Ambassador Code</label>
                    <input type="text" id="ambassador_code" name="ambassador_code" required placeholder="Enter your ambassador code">
                </div>
                
                <?php if (isset($error)): ?>
                    <div style="color: #f44336; text-align: center; margin-bottom: 20px;">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>
                
                <button type="submit" class="login-btn">Access Dashboard</button>
            </form>
        </div>
        <?php
    } else {
        // Get ambassador stats
        $stmt = $pdo->prepare("
            SELECT a.*, 
                   COUNT(DISTINCT ar.id) as total_referrals,
                   SUM(CASE WHEN ar.status = 'paid' THEN ar.commission_amount ELSE 0 END) as paid_commission,
                   SUM(CASE WHEN ar.status = 'pending' THEN ar.commission_amount ELSE 0 END) as pending_commission,
                   COUNT(DISTINCT av.id) as total_visits
            FROM ambassadors a
            LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
            LEFT JOIN ambassador_visits av ON a.ambassador_code = av.ambassador_code
            WHERE a.ambassador_code = ?
            GROUP BY a.id
        ");
        $stmt->execute([$ambassadorCode]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get recent referrals
        $stmt = $pdo->prepare("
            SELECT ar.*, b.customer_name, b.service_type, b.final_price, b.created_at as booking_date
            FROM ambassador_referrals ar
            JOIN bookings b ON ar.booking_id = b.id
            WHERE ar.ambassador_code = ?
            ORDER BY ar.created_at DESC
            LIMIT 10
        ");
        $stmt->execute([$ambassadorCode]);
        $recentReferrals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $referralLink = "https://mrsprinklereno.com/mold-form.html?ref=" . $ambassadorCode;
        $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($referralLink);
        ?>
        
        <div class="container">
            <div class="header">
                <div class="logo">Mr. Sprinkle</div>
                <div style="color: #ccc; font-size: 1.2em;">Welcome back, <?= htmlspecialchars($_SESSION['ambassador_name']) ?>!</div>
                <div style="margin-top: 10px;">
                    <a href="?logout=1" style="color: #FFD700; text-decoration: none; font-size: 0.9em;">Logout</a>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <h3>💰 Total Earnings</h3>
                    <div class="stat-value">$<?= number_format($stats['paid_commission'] + $stats['pending_commission'], 2) ?></div>
                    <div class="stat-label">Lifetime Commission</div>
                </div>
                
                <div class="card">
                    <h3>✅ Paid Commission</h3>
                    <div class="stat-value">$<?= number_format($stats['paid_commission'], 2) ?></div>
                    <div class="stat-label">Available for Withdrawal</div>
                </div>
                
                <div class="card">
                    <h3>⏳ Pending Commission</h3>
                    <div class="stat-value">$<?= number_format($stats['pending_commission'], 2) ?></div>
                    <div class="stat-label">Awaiting Payment</div>
                </div>
                
                <div class="card">
                    <h3>👥 Total Referrals</h3>
                    <div class="stat-value"><?= $stats['total_referrals'] ?></div>
                    <div class="stat-label">Successful Bookings</div>
                    <?php 
                    $tier = $stats['total_referrals'] >= 11 ? 'Gold (20%)' : ($stats['total_referrals'] >= 6 ? 'Silver (15%)' : 'Bronze (10%)');
                    $tierColor = $stats['total_referrals'] >= 11 ? '#FFD700' : ($stats['total_referrals'] >= 6 ? '#C0C0C0' : '#CD7F32');
                    ?>
                    <div style="margin-top: 10px; padding: 8px 15px; background: rgba(255,255,255,0.1); border-radius: 20px; display: inline-block;">
                        <span style="color: <?= $tierColor ?>; font-weight: bold;"><?= $tier ?> Tier</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>👀 Website Visits</h3>
                    <div class="stat-value"><?= $stats['total_visits'] ?></div>
                    <div class="stat-label">Through Your Link</div>
                </div>
                
                <div class="card qr-section">
                    <h3>📱 Your QR Code</h3>
                    <div class="qr-code">
                        <img src="<?= $qrCodeUrl ?>" alt="QR Code" style="width: 200px; height: 200px;">
                    </div>
                    <div style="font-size: 0.9em; color: #ccc;">Perfect for business cards!</div>
                </div>
                
                <div class="card">
                    <h3>🔗 Your Referral Link</h3>
                    <div class="referral-link" id="referralLink"><?= $referralLink ?></div>
                    <button class="copy-btn" onclick="copyLink()">Copy Link</button>
                    <div style="margin-top: 15px; font-size: 0.9em; color: #ccc;">
                        Share this link to earn 10-20% commission on every booking!
                    </div>
                </div>
                
                <div class="card">
                    <h3>📱 Promotional Materials</h3>
                    <div style="margin-bottom: 15px;">
                        <button class="copy-btn" onclick="copyPromoText('story')">Copy Instagram Story Text</button>
                        <button class="copy-btn" onclick="copyPromoText('post')">Copy Post Caption</button>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <button class="copy-btn" onclick="copyPromoText('tiktok')">Copy TikTok Caption</button>
                        <button class="copy-btn" onclick="copyPromoText('text')">Copy Text Message</button>
                    </div>
                    <div style="font-size: 0.9em; color: #ccc;">
                        Ready-to-use promotional content for all platforms!
                    </div>
                </div>
                
                <div class="card recent-referrals">
                    <h3>📊 Recent Referrals</h3>
                    <?php if (empty($recentReferrals)): ?>
                        <div style="text-align: center; color: #ccc; padding: 40px;">
                            No referrals yet. Start sharing your link to earn commissions!
                        </div>
                    <?php else: ?>
                        <table class="referrals-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recentReferrals as $referral): ?>
                                    <tr>
                                        <td><?= date('M j, Y', strtotime($referral['booking_date'])) ?></td>
                                        <td><?= htmlspecialchars($referral['customer_name']) ?></td>
                                        <td><?= ucfirst(str_replace('_', ' ', $referral['service_type'])) ?></td>
                                        <td>$<?= number_format($referral['final_price'], 2) ?></td>
                                        <td>$<?= number_format($referral['commission_amount'], 2) ?></td>
                                        <td>
                                            <span class="status-badge status-<?= $referral['status'] ?>">
                                                <?= ucfirst($referral['status']) ?>
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <script>
            const promoTexts = {
                story: `💎 Get 5% OFF custom grillz at Mr. Sprinkle! 💎\n\nReno's #1 grillz expert since 2002 ✨\nMedical-grade dental gold ✅\n0% tarnish guarantee 🔥\n\nUse my link: <?= $referralLink ?>\n\n#MrSprinkle #RenoGrillz #CustomGold #GrillzLife`,
                
                post: `👑 GRILLZ GAME STRONG with Mr. Sprinkle! 👑\n\nY'all know I only rep the BEST, and Mr. Sprinkle is Reno's #1 custom grillz expert since 2002! 🔥\n\n✨ Medical-grade dental gold\n✨ 0% tarnish guarantee\n✨ Safe for eating/drinking/smoking\n✨ Custom designs & diamonds available\n\nGet 5% OFF when you use my link! 💎\n<?= $referralLink ?>\n\nDM me your grillz pics when you get yours! 📸\n\n#MrSprinkle #RenoGrillz #CustomGold #GrillzLife #Ambassador #RenoNevada #LakeTahoe`,
                
                tiktok: `POV: You found Reno's best grillz spot 💎 Mr. Sprinkle been doing this since 2002! Medical grade gold, 0% tarnish 🔥 Get 5% off with my link: <?= $referralLink ?> #MrSprinkle #RenoGrillz #CustomGold #GrillzTok #Nevada`,
                
                text: `Hey! 💎 I found the BEST grillz spot in Reno - Mr. Sprinkle! They've been doing custom gold grillz since 2002 with medical-grade dental gold. Get 5% off with my link: <?= $referralLink ?> 🔥`
            };
            
            function copyLink() {
                const linkElement = document.getElementById('referralLink');
                copyToClipboard(linkElement.textContent, event.target);
            }
            
            function copyPromoText(type) {
                copyToClipboard(promoTexts[type], event.target);
            }
            
            function copyToClipboard(text, button) {
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.background = '#4CAF50';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                    }, 2000);
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.background = '#4CAF50';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                    }, 2000);
                });
            }
            
            // Auto-refresh stats every 5 minutes
            setInterval(() => {
                location.reload();
            }, 300000);
        </script>
        <?php
    }
    ?>
</body>
</html>
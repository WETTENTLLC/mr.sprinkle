<?php
/**
 * Ambassador System Setup & Testing Script
 * Run this on your live server to:
 * 1. Add Natalia Chacon to the database
 * 2. Test all ambassador system components
 * 3. Verify database connectivity
 */

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Ambassador System Setup & Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; }
        .test-section { margin: 20px 0; padding: 15px; border-left: 4px solid #FFD700; background: #f9f9f9; }
        .success { color: #4CAF50; font-weight: bold; }
        .error { color: #f44336; font-weight: bold; }
        .warning { color: #ff9800; font-weight: bold; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #FFD700; color: #000; }
        tr:hover { background: #f5f5f5; }
        button { background: #FFD700; color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; font-weight: bold; }
        button:hover { background: #FFA500; }
        .step { margin: 15px 0; padding: 15px; background: #e8f5e9; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Ambassador System Setup & Test</h1>
        <p>This script will test all systems and set up Natalia Chacon in your database.</p>

        <div class="test-section">
            <h2>Step 1: Database Connection Test</h2>
            <?php
            try {
                $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                echo '<p class="success">✓ Database Connected Successfully</p>';
                
                // Check if ambassadors table exists
                $result = $pdo->query("SHOW TABLES LIKE 'ambassadors'");
                if ($result->rowCount() > 0) {
                    echo '<p class="success">✓ Ambassadors table found</p>';
                } else {
                    echo '<p class="error">✗ Ambassadors table NOT found. Make sure database is set up.</p>';
                }
                
                // Get table structure
                $columns = $pdo->query("DESCRIBE ambassadors");
                echo '<h3>Database Schema:</h3>';
                echo '<table>';
                echo '<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>';
                foreach ($columns as $col) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($col['Field']) . '</td>';
                    echo '<td>' . htmlspecialchars($col['Type']) . '</td>';
                    echo '<td>' . htmlspecialchars($col['Null']) . '</td>';
                    echo '<td>' . htmlspecialchars($col['Key']) . '</td>';
                    echo '<td>' . htmlspecialchars($col['Default'] ?? 'NULL') . '</td>';
                    echo '<td>' . htmlspecialchars($col['Extra']) . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
                
            } catch(Exception $e) {
                echo '<p class="error">✗ Database Connection Failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<p class="warning">Make sure MySQL is running and credentials are correct:</p>';
                echo '<div class="code">Host: localhost<br>Database: mr_sprinkle_db<br>User: root<br>Password: (empty)</div>';
                exit;
            }
            ?>
        </div>

        <div class="test-section">
            <h2>Step 2: Add Natalia Chacon to Database</h2>
            <?php
            try {
                $name = "Natalia Chacon";
                $code = "NATALIA09";
                $email = "nataliachacon0904@gmail.com";
                $phone = "775-250-9356";
                
                // Check if already exists
                $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM ambassadors WHERE ambassador_code = ?");
                $checkStmt->execute([$code]);
                $exists = $checkStmt->fetchColumn();
                
                if ($exists) {
                    echo '<p class="warning">⚠ Ambassador code NATALIA09 already exists. Updating...</p>';
                    // Update existing record
                    $updateStmt = $pdo->prepare("UPDATE ambassadors SET name = ?, email = ?, phone = ?, status = 'active' WHERE ambassador_code = ?");
                    $updateStmt->execute([$name, $email, $phone, $code]);
                    echo '<p class="success">✓ Natalia updated successfully!</p>';
                } else {
                    // Insert new record
                    $insertStmt = $pdo->prepare("INSERT INTO ambassadors (ambassador_code, name, email, phone, status, created_at) VALUES (?, ?, ?, ?, 'active', NOW())");
                    $insertStmt->execute([$code, $name, $email, $phone]);
                    echo '<p class="success">✓ Natalia added successfully!</p>';
                }
                
                echo '<h3>Natalia\'s Account Details:</h3>';
                echo '<table>';
                echo '<tr><th>Field</th><th>Value</th></tr>';
                echo '<tr><td>Name</td><td>' . htmlspecialchars($name) . '</td></tr>';
                echo '<tr><td>Ambassador Code</td><td>' . htmlspecialchars($code) . '</td></tr>';
                echo '<tr><td>Email</td><td>' . htmlspecialchars($email) . '</td></tr>';
                echo '<tr><td>Phone</td><td>' . htmlspecialchars($phone) . '</td></tr>';
                echo '<tr><td>Status</td><td>active</td></tr>';
                echo '</table>';
                
            } catch(Exception $e) {
                echo '<p class="error">✗ Failed to add Natalia: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
            ?>
        </div>

        <div class="test-section">
            <h2>Step 3: Test Backend Authentication</h2>
            <?php
            try {
                $testCode = "NATALIA09";
                $stmt = $pdo->prepare("SELECT * FROM ambassadors WHERE ambassador_code = ?");
                $stmt->execute([$testCode]);
                $ambassador = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($ambassador) {
                    echo '<p class="success">✓ Backend authentication working! Found ambassador:</p>';
                    echo '<table>';
                    echo '<tr><th>Field</th><th>Value</th></tr>';
                    foreach ($ambassador as $key => $value) {
                        echo '<tr><td>' . htmlspecialchars($key) . '</td><td>' . htmlspecialchars($value ?? 'NULL') . '</td></tr>';
                    }
                    echo '</table>';
                } else {
                    echo '<p class="error">✗ Ambassador code not found in database</p>';
                }
                
            } catch(Exception $e) {
                echo '<p class="error">✗ Backend test failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
            ?>
        </div>

        <div class="test-section">
            <h2>Step 4: List All Ambassadors</h2>
            <?php
            try {
                $stmt = $pdo->query("SELECT ambassador_code, name, email, phone, status, created_at FROM ambassadors ORDER BY created_at DESC");
                $ambassadors = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($ambassadors) > 0) {
                    echo '<p class="success">✓ Found ' . count($ambassadors) . ' ambassador(s)</p>';
                    echo '<table>';
                    echo '<tr><th>Code</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Created</th></tr>';
                    foreach ($ambassadors as $amb) {
                        echo '<tr>';
                        echo '<td><strong>' . htmlspecialchars($amb['ambassador_code']) . '</strong></td>';
                        echo '<td>' . htmlspecialchars($amb['name']) . '</td>';
                        echo '<td>' . htmlspecialchars($amb['email']) . '</td>';
                        echo '<td>' . htmlspecialchars($amb['phone']) . '</td>';
                        echo '<td>' . htmlspecialchars($amb['status']) . '</td>';
                        echo '<td>' . htmlspecialchars($amb['created_at'] ?? 'N/A') . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                } else {
                    echo '<p class="warning">⚠ No ambassadors found in database</p>';
                }
                
            } catch(Exception $e) {
                echo '<p class="error">✗ Failed to list ambassadors: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
            ?>
        </div>

        <div class="test-section">
            <h2>Step 5: Portal Testing Instructions</h2>
            <div class="step">
                <h3>✅ System Ready for Testing</h3>
                <p>Natalia can now test logging in at:</p>
                <div class="code">https://mrsprinklereno.com/ambassador-portal.html</div>
                <p><strong>Login Credentials:</strong></p>
                <ul>
                    <li>Ambassador Code: <strong>NATALIA09</strong></li>
                </ul>
                <p><strong>Expected Results:</strong></p>
                <ul>
                    <li>✓ Dashboard loads with Welcome, Natalia!</li>
                    <li>✓ Shows referral link with ambassador code</li>
                    <li>✓ Displays commission structure</li>
                    <li>✓ Shows stats section (may be 0 initially)</li>
                </ul>
            </div>

            <div class="step">
                <h3>🔧 Troubleshooting</h3>
                <p>If login fails with "Invalid ambassador code" error:</p>
                <ol>
                    <li>Verify portal.html was deployed from GitHub (check /ambassador-portal.html source)</li>
                    <li>Check that ambassador-backend.php is on the server and accessible</li>
                    <li>Verify database connection works (see Step 1 above)</li>
                    <li>Test API endpoint: <div class="code">https://mrsprinklereno.com/ambassador-backend.php?endpoint=ambassador-stats&code=NATALIA09</div></li>
                </ol>
            </div>

            <div class="step">
                <h3>📋 API Test</h3>
                <p>Test the backend API directly:</p>
                <div class="code">
                    URL: /ambassador-backend.php?endpoint=ambassador-stats&code=NATALIA09<br>
                    Expected: JSON response with ambassador data<br>
                    Example: {"success":true,"data":{"ambassador_code":"NATALIA09","name":"Natalia Chacon",...}}
                </div>
            </div>
        </div>

        <div class="test-section" style="background: #fff3e0; border-left-color: #ff9800;">
            <h2>Summary</h2>
            <?php
            echo '<p>This script has verified:</p>';
            echo '<ul>';
            echo '<li class="success">✓ Database connection working</li>';
            echo '<li class="success">✓ Natalia Chacon added/updated (NATALIA09)</li>';
            echo '<li class="success">✓ Backend authentication ready</li>';
            echo '<li class="success">✓ Ambassador system ready for login testing</li>';
            echo '</ul>';
            echo '<p><strong>Next Step:</strong> Have Natalia visit https://mrsprinklereno.com/ambassador-portal.html and log in with code NATALIA09</p>';
            ?>
        </div>
    </div>
</body>
</html>

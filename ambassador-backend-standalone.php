<?php
/**
 * Ambassador Backend API
 * Deploy this file to your PHP hosting
 * 
 * This handles all ambassador database queries
 * Supports the ambassador portal and admin dashboard
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // ============================================
    // CONFIGURATION - UPDATE THESE VARIABLES
    // ============================================
    
    // Database credentials
    $DB_HOST = 'localhost';      // Your database host
    $DB_USER = 'root';           // Your database user
    $DB_PASS = '';               // Your database password
    $DB_NAME = 'mr_sprinkle_db'; // Your database name
    
    // ============================================
    // DATABASE CONNECTION
    // ============================================
    
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // ============================================
    // ROUTE HANDLING
    // ============================================
    
    $endpoint = $_GET['endpoint'] ?? $_POST['endpoint'] ?? null;
    
    switch ($endpoint) {
        case 'ambassador-stats':
            handleAmbassadorStats($pdo);
            break;
            
        case 'all-ambassadors':
            handleAllAmbassadors($pdo);
            break;
            
        case 'add-ambassador':
            handleAddAmbassador($pdo);
            break;
            
        case 'update-ambassador':
            handleUpdateAmbassador($pdo);
            break;
            
        case 'delete-ambassador':
            handleDeleteAmbassador($pdo);
            break;
            
        case 'test':
            handleTest($pdo);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid endpoint. Use: ambassador-stats, all-ambassadors, add-ambassador, test'
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

// ============================================
// ENDPOINT HANDLERS
// ============================================

/**
 * Get ambassador stats by code
 * GET /ambassador-backend.php?endpoint=ambassador-stats&code=NATALIA09
 */
function handleAmbassadorStats($pdo) {
    $code = $_GET['code'] ?? null;
    
    if (!$code) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code parameter required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                id,
                ambassador_code,
                name,
                email,
                phone,
                status,
                total_referrals,
                paid_commission,
                pending_commission,
                created_at,
                last_referral_date
            FROM ambassadors
            WHERE ambassador_code = ?
            LIMIT 1
        ");
        
        $stmt->execute([$code]);
        $ambassador = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($ambassador) {
            echo json_encode([
                'success' => true,
                'data' => $ambassador
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Ambassador code not found'
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

/**
 * Get all ambassadors
 * GET /ambassador-backend.php?endpoint=all-ambassadors
 */
function handleAllAmbassadors($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                id,
                ambassador_code,
                name,
                email,
                phone,
                status,
                total_referrals,
                paid_commission,
                pending_commission,
                created_at
            FROM ambassadors
            ORDER BY created_at DESC
        ");
        
        $ambassadors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'count' => count($ambassadors),
            'data' => $ambassadors
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

/**
 * Add new ambassador
 * POST /ambassador-backend.php
 * Body: {endpoint: 'add-ambassador', name, email, phone, code, status}
 */
function handleAddAmbassador($pdo) {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $code = $data['code'] ?? null;
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;
    $phone = $data['phone'] ?? null;
    $status = $data['status'] ?? 'pending';
    
    if (!$code || !$name || !$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code, name, and email required']);
        return;
    }
    
    try {
        // Check if code exists
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM ambassadors WHERE ambassador_code = ?");
        $checkStmt->execute([$code]);
        
        if ($checkStmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ambassador code already exists']);
            return;
        }
        
        // Insert new ambassador
        $stmt = $pdo->prepare("
            INSERT INTO ambassadors 
            (ambassador_code, name, email, phone, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([$code, $name, $email, $phone, $status]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Ambassador added successfully',
            'code' => $code
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

/**
 * Update ambassador
 * POST /ambassador-backend.php
 * Body: {endpoint: 'update-ambassador', code, name, email, phone, status}
 */
function handleUpdateAmbassador($pdo) {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $code = $data['code'] ?? null;
    
    if (!$code) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code parameter required']);
        return;
    }
    
    try {
        $updates = [];
        $params = [];
        
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
        }
        if (isset($data['email'])) {
            $updates[] = "email = ?";
            $params[] = $data['email'];
        }
        if (isset($data['phone'])) {
            $updates[] = "phone = ?";
            $params[] = $data['phone'];
        }
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = $data['status'];
        }
        
        if (empty($updates)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $params[] = $code;
        
        $stmt = $pdo->prepare("
            UPDATE ambassadors
            SET " . implode(', ', $updates) . "
            WHERE ambassador_code = ?
        ");
        
        $stmt->execute($params);
        
        echo json_encode([
            'success' => true,
            'message' => 'Ambassador updated successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

/**
 * Delete ambassador
 * POST /ambassador-backend.php
 * Body: {endpoint: 'delete-ambassador', code}
 */
function handleDeleteAmbassador($pdo) {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $code = $data['code'] ?? null;
    
    if (!$code) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code parameter required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM ambassadors WHERE ambassador_code = ?");
        $stmt->execute([$code]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Ambassador deleted successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

/**
 * Test database connection
 * GET /ambassador-backend.php?endpoint=test
 */
function handleTest($pdo) {
    try {
        // Test connection
        $pdo->query("SELECT 1");
        
        // Get table info
        $stmt = $pdo->query("DESCRIBE ambassadors");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Count ambassadors
        $count = $pdo->query("SELECT COUNT(*) FROM ambassadors")->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'ambassadorCount' => $count,
            'databaseColumns' => $columns
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>

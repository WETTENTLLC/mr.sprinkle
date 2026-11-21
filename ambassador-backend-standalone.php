<?php
/**
 * Ambassador Backend API
 * Deploy this file to your PHP hosting
 * 
 * This handles all ambassador database queries
 * Supports the ambassador portal and admin dashboard
 */

header('Content-Type: application/json');
require_once __DIR__ . '/database-connection.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = mrSprinkleDatabase();
    
    // ============================================
    // ROUTE HANDLING
    // ============================================
    
    $endpoint = $_GET['endpoint'] ?? $_POST['endpoint'] ?? null;

    if (in_array($endpoint, ['all-ambassadors', 'add-ambassador', 'update-ambassador', 'delete-ambassador', 'test'], true)) {
        mrSprinkleRequireAdminApiToken();
    }
    
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
        'message' => 'The ambassador service is temporarily unavailable.'
    ]);
}

// ============================================
// ENDPOINT HANDLERS
// ============================================

/**
 * Get ambassador stats by code
 * GET /ambassador-backend-standalone.php?endpoint=ambassador-stats&code=<ambassador-code>
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
                ambassador_code,
                name,
                status,
                total_referrals,
                paid_commission,
                pending_commission
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to load ambassador stats.']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to add ambassador.']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to update ambassador.']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to delete ambassador.']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to delete ambassador.']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to test the ambassador service.']);
    }
}
?>

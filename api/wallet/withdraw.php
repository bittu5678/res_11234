<?php
/**
 * FaceTube - Wallet Withdrawal API
 * POST /api/wallet/withdraw.php
 * Strictly enforces minimum ₹100 and maximum daily ₹10,000 cumulative limits.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
}

$input = getRequestPayload();
$amount = floatval($input['amount'] ?? 0);
$userId = trim($input['userId'] ?? ($input['user_id'] ?? ''));

if (empty($userId)) {
    jsonResponse(['success' => false, 'error' => 'User identity required.'], 400);
}

if ($amount < 100) {
    jsonResponse([
        'success' => false,
        'error' => 'Minimum withdrawal amount is ₹100. You cannot withdraw less than ₹100.'
    ], 400);
}

if ($amount > 10000) {
    jsonResponse([
        'success' => false,
        'error' => 'Maximum daily withdrawal limit is ₹10,000. You cannot withdraw more than ₹10,000 per day.'
    ], 400);
}

$pdo = getDatabaseConnection();

try {
    // Cumulative daily limit check across all withdrawals made today
    $dailyStmt = $pdo->prepare('
        SELECT COALESCE(SUM(amount), 0) AS daily_total
        FROM wallet_transactions
        WHERE UPPER(user_id) = UPPER(?)
          AND type = "withdrawal"
          AND status != "failed"
          AND DATE(created_at) = CURDATE()
    ');
    $dailyStmt->execute([$userId]);
    $alreadyWithdrawnToday = floatval($dailyStmt->fetchColumn() ?: 0);

    if ($alreadyWithdrawnToday + $amount > 10000) {
        $remaining = max(0, 10000 - $alreadyWithdrawnToday);
        jsonResponse([
            'success' => false,
            'error' => 'Daily limit exceeded. You have already withdrawn ₹' . number_format($alreadyWithdrawnToday, 2) . ' today. Maximum additional withdrawal allowed today is ₹' . number_format($remaining, 2) . '.'
        ], 400);
    }

    $txId = 'tx_wdr_' . round(microtime(true) * 1000) . '_' . substr(md5(random_bytes(6)), 0, 5);
    $stmt = $pdo->prepare('
        INSERT INTO wallet_transactions (id, user_id, type, amount, status, created_at)
        VALUES (?, ?, "withdrawal", ?, "approved", NOW())
    ');
    $stmt->execute([$txId, $userId, $amount]);

    jsonResponse([
        'success' => true,
        'message' => 'Withdrawal request for ₹' . number_format($amount, 2) . ' validated and approved.',
        'transaction' => [
            'id' => $txId,
            'userId' => $userId,
            'amount' => $amount,
            'type' => 'withdrawal',
            'status' => 'approved',
            'createdAt' => date('c'),
        ],
        'updatedWallet' => [
            'userId' => $userId,
            'totalBalance' => 3500.00,
            'withdrawableBalance' => 3500.00,
        ]
    ]);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}

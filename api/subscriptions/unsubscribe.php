<?php
/**
 * FaceTube - Channel Unsubscribe API
 * POST /api/subscriptions/unsubscribe.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
}

$pdo = getDatabaseConnection();
$authUser = getAuthUser($pdo);

$payload = getRequestPayload();
$channelHandle = trim($payload['channelHandle'] ?? ($payload['channel_handle'] ?? ($payload['handle'] ?? '')));
$clientUserId = trim($payload['userId'] ?? ($payload['user_id'] ?? ''));

$userId = $authUser ? $authUser['user_id'] : $clientUserId;

if (empty($userId)) {
    jsonResponse(['success' => false, 'error' => 'Authentication required.'], 401);
}

if (empty($channelHandle)) {
    jsonResponse(['success' => false, 'error' => 'Channel handle is required.'], 400);
}

if (substr($channelHandle, 0, 1) !== '@') {
    $channelHandle = '@' . $channelHandle;
}

try {
    $stmt = $pdo->prepare('DELETE FROM subscriptions WHERE UPPER(user_id) = UPPER(?) AND LOWER(channel_handle) = LOWER(?)');
    $stmt->execute([$userId, $channelHandle]);

    // Get remaining subscriber count
    $cntStmt = $pdo->prepare('SELECT COUNT(*) FROM subscriptions WHERE LOWER(channel_handle) = LOWER(?)');
    $cntStmt->execute([$channelHandle]);
    $subscriberCount = intval($cntStmt->fetchColumn() ?: 0);

    jsonResponse([
        'success' => true,
        'message' => "Unsubscribed from {$channelHandle}.",
        'isSubscribed' => false,
        'handle' => $channelHandle,
        'subscriberCount' => $subscriberCount,
    ]);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}

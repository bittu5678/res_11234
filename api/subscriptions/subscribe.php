<?php
/**
 * FaceTube - Channel Subscription API
 * POST /api/subscriptions/subscribe.php
 * Subscribes user to a channel (100% Free, zero payment required)
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
$channelName = trim($payload['channelName'] ?? ($payload['channel_name'] ?? ($payload['name'] ?? '')));
$channelInitials = trim($payload['channelInitials'] ?? ($payload['initials'] ?? ''));
$notificationMode = trim($payload['notificationMode'] ?? ($payload['notifications'] ?? 'all'));
$clientUserId = trim($payload['userId'] ?? ($payload['user_id'] ?? ''));

$userId = $authUser ? $authUser['user_id'] : $clientUserId;

if (empty($userId)) {
    jsonResponse(['success' => false, 'error' => 'Authentication required to subscribe to channels.'], 401);
}

if (empty($channelHandle)) {
    jsonResponse(['success' => false, 'error' => 'Channel handle is required.'], 400);
}

if (empty($channelName)) {
    $channelName = ltrim($channelHandle, '@');
}

if (empty($channelInitials)) {
    $channelInitials = strtoupper(substr($channelName, 0, 2));
}

if (!in_array($notificationMode, ['all', 'personalized', 'none'], true)) {
    $notificationMode = 'all';
}

// Normalize handle to start with @
if (substr($channelHandle, 0, 1) !== '@') {
    $channelHandle = '@' . $channelHandle;
}

try {
    $stmt = $pdo->prepare('
        INSERT INTO subscriptions (user_id, channel_handle, channel_name, channel_initials, notification_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
            channel_name = VALUES(channel_name),
            notification_mode = VALUES(notification_mode),
            updated_at = NOW()
    ');
    $stmt->execute([$userId, $channelHandle, $channelName, $channelInitials, $notificationMode]);

    // Get current total subscriber count for channel
    $cntStmt = $pdo->prepare('SELECT COUNT(*) FROM subscriptions WHERE LOWER(channel_handle) = LOWER(?)');
    $cntStmt->execute([$channelHandle]);
    $subscriberCount = intval($cntStmt->fetchColumn() ?: 1);

    jsonResponse([
        'success' => true,
        'message' => "Successfully subscribed to {$channelName}.",
        'isSubscribed' => true,
        'subscription' => [
            'userId' => $userId,
            'handle' => $channelHandle,
            'name' => $channelName,
            'initials' => $channelInitials,
            'notifications' => $notificationMode,
            'subscriberCount' => $subscriberCount,
        ]
    ]);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}

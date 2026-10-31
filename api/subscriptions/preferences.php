<?php
/**
 * FaceTube - Subscription Notification Preferences API
 * POST /api/subscriptions/preferences.php
 * Sets notification preferences: 'all' | 'personalized' | 'none'
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
$notificationMode = trim($payload['notificationMode'] ?? ($payload['notifications'] ?? 'all'));
$clientUserId = trim($payload['userId'] ?? ($payload['user_id'] ?? ''));

$userId = $authUser ? $authUser['user_id'] : $clientUserId;

if (empty($userId)) {
    jsonResponse(['success' => false, 'error' => 'Authentication required.'], 401);
}

if (empty($channelHandle)) {
    jsonResponse(['success' => false, 'error' => 'Channel handle is required.'], 400);
}

if (!in_array($notificationMode, ['all', 'personalized', 'none'], true)) {
    jsonResponse(['success' => false, 'error' => 'Notification mode must be all, personalized, or none.'], 400);
}

if (substr($channelHandle, 0, 1) !== '@') {
    $channelHandle = '@' . $channelHandle;
}

try {
    $stmt = $pdo->prepare('
        UPDATE subscriptions 
        SET notification_mode = ?, updated_at = NOW() 
        WHERE UPPER(user_id) = UPPER(?) AND LOWER(channel_handle) = LOWER(?)
    ');
    $stmt->execute([$notificationMode, $userId, $channelHandle]);

    jsonResponse([
        'success' => true,
        'message' => "Notification preference updated to {$notificationMode}.",
        'handle' => $channelHandle,
        'notifications' => $notificationMode
    ]);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}

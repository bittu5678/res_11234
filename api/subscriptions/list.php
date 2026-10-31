<?php
/**
 * FaceTube - Subscriptions Listing API
 * GET /api/subscriptions/list.php
 * Returns channels subscribed to by the authenticated user
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
}

$pdo = getDatabaseConnection();
$authUser = getAuthUser($pdo);

$requestedUserId = trim($_GET['userId'] ?? ($_GET['user_id'] ?? ''));
$userId = $authUser ? $authUser['user_id'] : $requestedUserId;

if (empty($userId)) {
    // Unauthenticated visitor: return empty list
    jsonResponse([
        'success' => true,
        'subscriptions' => [],
        'count' => 0,
        'message' => 'Sign in to access synchronized channel subscriptions.'
    ]);
}

try {
    $stmt = $pdo->prepare('
        SELECT 
            s.id, 
            s.user_id, 
            s.channel_handle AS handle, 
            s.channel_name AS name, 
            s.channel_initials AS initials, 
            s.notification_mode AS notifications, 
            s.created_at,
            (
                SELECT COUNT(*) 
                FROM subscriptions sub 
                WHERE LOWER(sub.channel_handle) = LOWER(s.channel_handle)
            ) AS subscriber_count
        FROM subscriptions s
        WHERE UPPER(s.user_id) = UPPER(?)
        ORDER BY s.created_at DESC
    ');
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $formatted = array_map(function($r) {
        $count = intval($r['subscriber_count'] ?? 1);
        $subStr = $count >= 1000000 
            ? round($count / 1000000, 1) . 'M'
            : ($count >= 1000 ? round($count / 1000, 1) . 'K' : $count);
        return [
            'id' => $r['id'],
            'userId' => $r['user_id'],
            'handle' => $r['handle'],
            'name' => $r['name'],
            'initials' => $r['initials'] ?: strtoupper(substr($r['name'], 0, 2)),
            'notifications' => $r['notifications'] ?: 'all',
            'subscribers' => $subStr . ' subscribers',
            'subscriberCount' => $count,
            'createdAt' => $r['created_at']
        ];
    }, $rows);

    jsonResponse([
        'success' => true,
        'userId' => $userId,
        'subscriptions' => $formatted,
        'count' => count($formatted)
    ]);
} catch (PDOException $e) {
    jsonResponse([
        'success' => true,
        'subscriptions' => [],
        'count' => 0,
        'fallback' => true,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

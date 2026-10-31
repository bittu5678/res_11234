<?php
/**
 * FaceTube - Admin Category Management API
 * POST /api/categories/admin-crud.php
 * Strictly restricted to administrators. Supports create, update, toggle_status, and soft-delete.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
}

$pdo = getDatabaseConnection();
$authUser = getAuthUser($pdo);

if (!$authUser) {
    jsonResponse(['success' => false, 'error' => 'Authentication required.'], 401);
}

if (!isset($authUser['role']) || $authUser['role'] !== 'admin') {
    jsonResponse(['success' => false, 'error' => 'Access denied: Administrator privileges required.'], 403);
}

$payload = getRequestPayload();
$action = trim($payload['action'] ?? '');

if (empty($action)) {
    jsonResponse(['success' => false, 'error' => 'Action required (create, update, toggle_status, delete).'], 400);
}

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    return strtolower($text ?: 'category-' . time());
}

try {
    switch ($action) {
        case 'create':
            $name = trim($payload['name'] ?? '');
            if (empty($name)) {
                jsonResponse(['success' => false, 'error' => 'Category name is required.'], 400);
            }
            $slug = trim($payload['slug'] ?? '') ?: slugify($name);
            $icon = trim($payload['icon'] ?? 'LayoutGrid');
            $isActive = isset($payload['isActive']) ? ($payload['isActive'] ? 1 : 0) : 1;
            $sortOrder = intval($payload['sortOrder'] ?? 0);

            // Check if slug already exists
            $checkStmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ?');
            $checkStmt->execute([$slug]);
            if ($checkStmt->fetch()) {
                $slug = $slug . '-' . time();
            }

            $stmt = $pdo->prepare('
                INSERT INTO categories (name, slug, icon, is_active, sort_order, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ');
            $stmt->execute([$name, $slug, $icon, $isActive, $sortOrder]);
            $newId = $pdo->lastInsertId();

            jsonResponse([
                'success' => true,
                'message' => "Category '{$name}' created successfully.",
                'category' => [
                    'id' => intval($newId),
                    'name' => $name,
                    'slug' => $slug,
                    'icon' => $icon,
                    'is_active' => $isActive,
                    'sort_order' => $sortOrder
                ]
            ]);
            break;

        case 'update':
            $id = intval($payload['id'] ?? 0);
            $name = trim($payload['name'] ?? '');
            if ($id <= 0 || empty($name)) {
                jsonResponse(['success' => false, 'error' => 'Valid category ID and name are required.'], 400);
            }
            $slug = trim($payload['slug'] ?? '') ?: slugify($name);
            $icon = trim($payload['icon'] ?? 'LayoutGrid');
            $isActive = isset($payload['isActive']) ? ($payload['isActive'] ? 1 : 0) : 1;
            $sortOrder = intval($payload['sortOrder'] ?? 0);

            $stmt = $pdo->prepare('
                UPDATE categories 
                SET name = ?, slug = ?, icon = ?, is_active = ?, sort_order = ?, updated_at = NOW() 
                WHERE id = ?
            ');
            $stmt->execute([$name, $slug, $icon, $isActive, $sortOrder, $id]);

            jsonResponse([
                'success' => true,
                'message' => "Category '{$name}' updated successfully.",
                'category' => [
                    'id' => $id,
                    'name' => $name,
                    'slug' => $slug,
                    'icon' => $icon,
                    'is_active' => $isActive,
                    'sort_order' => $sortOrder
                ]
            ]);
            break;

        case 'toggle_status':
            $id = intval($payload['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Valid category ID is required.'], 400);
            }
            $isActive = !empty($payload['isActive']) ? 1 : 0;

            $stmt = $pdo->prepare('UPDATE categories SET is_active = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$isActive, $id]);

            jsonResponse([
                'success' => true,
                'message' => "Category status updated to " . ($isActive ? 'active' : 'inactive') . ".",
                'id' => $id,
                'is_active' => $isActive
            ]);
            break;

        case 'delete':
            $id = intval($payload['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Valid category ID is required.'], 400);
            }

            // Soft-delete to preserve historical video category associations safely
            $stmt = $pdo->prepare('UPDATE categories SET is_active = 0, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$id]);

            jsonResponse([
                'success' => true,
                'message' => 'Category deactivated/soft-deleted successfully without affecting existing video assignments.',
                'id' => $id
            ]);
            break;

        default:
            jsonResponse(['success' => false, 'error' => "Unknown action '{$action}'."], 400);
    }
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}

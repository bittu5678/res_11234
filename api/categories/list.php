<?php
/**
 * FaceTube - Video Categories Listing API
 * GET /api/categories/list.php
 * Returns active categories for users, or all categories for administrators (?all=1)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
}

$pdo = getDatabaseConnection();

$includeAll = isset($_GET['all']) && $_GET['all'] === '1';
$isAdmin = false;

if ($includeAll) {
    $authUser = getAuthUser($pdo);
    if ($authUser && isset($authUser['role']) && $authUser['role'] === 'admin') {
        $isAdmin = true;
    }
}

try {
    if ($isAdmin && $includeAll) {
        $stmt = $pdo->query('
            SELECT id, name, slug, icon, is_active, sort_order, created_at, updated_at 
            FROM categories 
            ORDER BY sort_order ASC, name ASC
        ');
    } else {
        $stmt = $pdo->query('
            SELECT id, name, slug, icon, is_active, sort_order, created_at, updated_at 
            FROM categories 
            WHERE is_active = 1 
            ORDER BY sort_order ASC, name ASC
        ');
    }

    $rows = $stmt->fetchAll();
    
    // Fallback seed if table is currently empty
    if (empty($rows)) {
        $defaultCategories = [
            ['id' => 1, 'name' => 'Gaming', 'slug' => 'gaming', 'icon' => 'Gamepad2', 'is_active' => 1, 'sort_order' => 1],
            ['id' => 2, 'name' => 'Travel', 'slug' => 'travel', 'icon' => 'Plane', 'is_active' => 1, 'sort_order' => 2],
            ['id' => 3, 'name' => 'AI', 'slug' => 'ai', 'icon' => 'Cpu', 'is_active' => 1, 'sort_order' => 3],
            ['id' => 4, 'name' => 'IIT', 'slug' => 'iit', 'icon' => 'GraduationCap', 'is_active' => 1, 'sort_order' => 4],
            ['id' => 5, 'name' => 'Cartoon', 'slug' => 'cartoon', 'icon' => 'Smile', 'is_active' => 1, 'sort_order' => 5],
            ['id' => 6, 'name' => 'Agriculture', 'slug' => 'agriculture', 'icon' => 'Sprout', 'is_active' => 1, 'sort_order' => 6],
            ['id' => 7, 'name' => 'Motivational', 'slug' => 'motivational', 'icon' => 'Sparkles', 'is_active' => 1, 'sort_order' => 7],
            ['id' => 8, 'name' => 'Comedy', 'slug' => 'comedy', 'icon' => 'Laugh', 'is_active' => 1, 'sort_order' => 8],
            ['id' => 9, 'name' => 'Blog', 'slug' => 'blog', 'icon' => 'BookOpen', 'is_active' => 1, 'sort_order' => 9],
            ['id' => 10, 'name' => 'Movie', 'slug' => 'movie', 'icon' => 'Film', 'is_active' => 1, 'sort_order' => 10],
            ['id' => 11, 'name' => 'Entertainment', 'slug' => 'entertainment', 'icon' => 'Tv', 'is_active' => 1, 'sort_order' => 11],
            ['id' => 12, 'name' => 'Cooking', 'slug' => 'cooking', 'icon' => 'Utensils', 'is_active' => 1, 'sort_order' => 12],
            ['id' => 13, 'name' => 'Finance', 'slug' => 'finance', 'icon' => 'Wallet', 'is_active' => 1, 'sort_order' => 13],
            ['id' => 14, 'name' => 'Share Market', 'slug' => 'share-market', 'icon' => 'TrendingUp', 'is_active' => 1, 'sort_order' => 14],
            ['id' => 15, 'name' => 'Business', 'slug' => 'business', 'icon' => 'Briefcase', 'is_active' => 1, 'sort_order' => 15],
            ['id' => 16, 'name' => 'Crypto', 'slug' => 'crypto', 'icon' => 'Coins', 'is_active' => 1, 'sort_order' => 16],
            ['id' => 17, 'name' => 'Coding', 'slug' => 'coding', 'icon' => 'Code', 'is_active' => 1, 'sort_order' => 17]
        ];
        $rows = $defaultCategories;
    }

    jsonResponse([
        'success' => true,
        'categories' => $rows,
        'count' => count($rows),
    ]);
} catch (PDOException $e) {
    // If categories table not yet migrated, gracefully return standard defaults
    $defaultCategories = [
        ['id' => 1, 'name' => 'Gaming', 'slug' => 'gaming', 'icon' => 'Gamepad2', 'is_active' => 1, 'sort_order' => 1],
        ['id' => 2, 'name' => 'Travel', 'slug' => 'travel', 'icon' => 'Plane', 'is_active' => 1, 'sort_order' => 2],
        ['id' => 3, 'name' => 'AI', 'slug' => 'ai', 'icon' => 'Cpu', 'is_active' => 1, 'sort_order' => 3],
        ['id' => 4, 'name' => 'IIT', 'slug' => 'iit', 'icon' => 'GraduationCap', 'is_active' => 1, 'sort_order' => 4],
        ['id' => 5, 'name' => 'Cartoon', 'slug' => 'cartoon', 'icon' => 'Smile', 'is_active' => 1, 'sort_order' => 5],
        ['id' => 6, 'name' => 'Agriculture', 'slug' => 'agriculture', 'icon' => 'Sprout', 'is_active' => 1, 'sort_order' => 6],
        ['id' => 7, 'name' => 'Motivational', 'slug' => 'motivational', 'icon' => 'Sparkles', 'is_active' => 1, 'sort_order' => 7],
        ['id' => 8, 'name' => 'Comedy', 'slug' => 'comedy', 'icon' => 'Laugh', 'is_active' => 1, 'sort_order' => 8],
        ['id' => 9, 'name' => 'Blog', 'slug' => 'blog', 'icon' => 'BookOpen', 'is_active' => 1, 'sort_order' => 9],
        ['id' => 10, 'name' => 'Movie', 'slug' => 'movie', 'icon' => 'Film', 'is_active' => 1, 'sort_order' => 10],
        ['id' => 11, 'name' => 'Entertainment', 'slug' => 'entertainment', 'icon' => 'Tv', 'is_active' => 1, 'sort_order' => 11],
        ['id' => 12, 'name' => 'Cooking', 'slug' => 'cooking', 'icon' => 'Utensils', 'is_active' => 1, 'sort_order' => 12],
        ['id' => 13, 'name' => 'Finance', 'slug' => 'finance', 'icon' => 'Wallet', 'is_active' => 1, 'sort_order' => 13],
        ['id' => 14, 'name' => 'Share Market', 'slug' => 'share-market', 'icon' => 'TrendingUp', 'is_active' => 1, 'sort_order' => 14],
        ['id' => 15, 'name' => 'Business', 'slug' => 'business', 'icon' => 'Briefcase', 'is_active' => 1, 'sort_order' => 15],
        ['id' => 16, 'name' => 'Crypto', 'slug' => 'crypto', 'icon' => 'Coins', 'is_active' => 1, 'sort_order' => 16],
        ['id' => 17, 'name' => 'Coding', 'slug' => 'coding', 'icon' => 'Code', 'is_active' => 1, 'sort_order' => 17]
    ];
    jsonResponse([
        'success' => true,
        'categories' => $defaultCategories,
        'count' => count($defaultCategories),
        'notice' => 'Using standard category defaults (database query bypassed)'
    ]);
}

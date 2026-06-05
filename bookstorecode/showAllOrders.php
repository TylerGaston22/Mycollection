<?php
// -------------------------------------------------------------------------
// File name: header.php
// Author: Sydney and Tyler
// Date: 4/18/26
// Class: CS445
// Assignment: BookstoreDB PHP Front End
// Purpose: Shared <head> styles + sticky top nav (included by every
//          presentation page except index.html)
// -------------------------------------------------------------------------

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Send no-cache headers so the browser does not show a stale page when
// the user clicks Back. Without these, after Cart -> Clear -> Books,
// hitting Back can re-render the cached cart page with the old badge
// number even though the cart is empty server-side.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$vUsername  = isset($_SESSION['username']) ? $_SESSION['username'] : '';
// Prefer the real "First Last" name set by userAuth.php on login.
// Fall back to the login username if displayName isn't in the session
// (e.g. user logged in before this change was deployed).
$vDisplayName = isset($_SESSION['displayName']) && $_SESSION['displayName'] !== ''
    ? $_SESSION['displayName']
    : $vUsername;

// Recompute cartCount from the database on every page render rather than
// trusting whatever happens to be in the session. Action handlers
// (addToCart, clearCart, updateCart, checkout) also write to the session
// for snappier UI, but this is the source of truth.
$vCartCount = 0;
if (!empty($_SESSION['userID'])) {
    try {
        require_once(__DIR__ . '/connDB.php');
        require_once(__DIR__ . '/getCart.php');
        $vHdrDbh    = db_connect();
        $vCartCount = getCartCount($vHdrDbh, (int)$_SESSION['userID']);
        db_close($vHdrDbh);
    } catch (PDOException $e) {
        error_log('header cartCount failed: ' . $e->getMessage());
        // Fall back to whatever was in the session
        $vCartCount = isset($_SESSION['cartCount'])
            ? (int)$_SESSION['cartCount'] : 0;
    }
}
$_SESSION['cartCount'] = $vCartCount;

$vSelf      = basename($_SERVER['PHP_SELF']);

// Map current file -> nav key for .active highlight
$vNavKey = '';
if ($vSelf === 'showAllBooks.php' || $vSelf === 'showOneBook.php') {
    $vNavKey = 'books';
} elseif ($vSelf === 'showCart.php') {
    $vNavKey = 'cart';
} elseif ($vSelf === 'showAllOrders.php' || $vSelf === 'showOrder.php') {
    $vNavKey = 'orders';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BookstoreDB</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Work+Sans:wght@400;500&display=swap');

:root {
    --bg: hsl(36,33%,97%);
    --fg: hsl(28,18%,18%);
    --card: #ffffff;
    --primary: hsl(28,19%,38%);
    --primary-fg: hsl(36,33%,97%);
    --secondary: hsl(33,35%,92%);
    --muted: hsl(33,30%,94%);
    --muted-fg: hsl(28,12%,42%);
    --accent: hsl(36,30%,70%);
    --border: hsl(32,22%,86%);
    --destructive: hsl(0,65%,48%);
    --radius: 0.625rem;
    --grad: linear-gradient(135deg, hsl(28,19%,38%), hsl(36,28%,58%));
    --shadow-card: 0 6px 24px -12px hsl(28 18% 20% / 0.15);
    --shadow-elegant: 0 20px 60px -20px hsl(28 19% 30% / 0.18);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Work Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
    min-height: 100vh;
}

h1, h2, h3, .font-display {
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    letter-spacing: -0.01em;
}

a { color: inherit; text-decoration: none; }

nav.site-nav {
    position: sticky; top: 0; z-index: 40;
    border-bottom: 1px solid var(--border);
    background: rgba(250,248,245,0.85);
    backdrop-filter: blur(8px);
}
.nav-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px; padding: 0 1.25rem;
}
.nav-logo {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    color: var(--fg);
}
.nav-icon {
    width: 36px; height: 36px; border-radius: var(--radius);
    background: var(--grad); display: grid; place-items: center;
    box-shadow: var(--shadow-elegant);
}
.nav-icon svg { width: 18px; height: 18px; color: var(--primary-fg); }
.nav-brand {
    font-family: 'Instrument Serif', serif;
    font-size: 1.35rem; line-height: 1;
}
.nav-links { display: flex; align-items: center; gap: 2px; }
.nav-link {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--radius);
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    color: hsl(28,18%,35%); border: none; background: none;
    transition: background 0.15s; font-family: inherit;
}
.nav-link:hover { background: var(--muted); color: var(--fg); }
.nav-link.active { background: var(--secondary); color: var(--fg); }
.nav-link svg { width: 15px; height: 15px; flex-shrink: 0; }
.cart-badge {
    background: var(--primary); color: var(--primary-fg);
    border-radius: 999px; font-size: 0.7rem; padding: 1px 7px; margin-left: 2px;
}
.nav-divider { width: 1px; height: 24px; background: var(--border); margin: 0 8px; }
.nav-user { font-size: 0.8rem; color: var(--muted-fg); }

.btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: var(--radius);
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    border: 1px solid var(--border); background: var(--card); color: var(--fg);
    transition: background 0.15s, border-color 0.15s;
    font-family: inherit; text-decoration: none;
}
.btn:hover { background: var(--muted); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary {
    background: var(--grad); color: var(--primary-fg); border-color: transparent;
}
.btn-primary:hover { opacity: 0.88; background: var(--grad); }
.btn-sm { padding: 5px 12px; font-size: 0.8rem; }
.btn-icon { padding: 6px; width: 32px; height: 32px; justify-content: center; }
.btn-ghost { border-color: transparent; background: none; }
.btn-ghost:hover { background: var(--muted); }
.btn-destructive { border-color: transparent; background: var(--destructive); color: #fff; }

.card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-card);
}

main.site-main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem; }

input, select, textarea {
    font-family: inherit; font-size: 0.85rem;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--card); color: var(--fg);
    padding: 7px 12px; width: 100%;
    outline: none; transition: border-color 0.15s;
}
input:focus, select:focus, textarea:focus { border-color: var(--primary); }
label {
    font-size: 0.8rem; color: var(--muted-fg);
    display: block; margin-bottom: 4px;
}

.stars { color: hsl(36,80%,55%); font-size: 14px; letter-spacing: 1px; }
.muted { color: var(--muted-fg); }
.mono  { font-family: monospace; font-size: 0.75rem; }

.section-header { margin-bottom: 1.5rem; }
.section-header h1 { font-size: 2.2rem; }
.section-header p {
    color: var(--muted-fg); font-size: 0.9rem; margin-top: 4px;
}

.empty-state {
    padding: 3rem; text-align: center;
    color: var(--muted-fg); font-size: 0.9rem;
}

.tag {
    display: inline-block; font-size: 0.72rem;
    background: var(--secondary); border: 1px solid var(--border);
    border-radius: 999px; padding: 2px 10px; color: var(--muted-fg);
}

.back-link {
    font-size: 0.82rem; color: var(--muted-fg);
    cursor: pointer; display: inline-block; margin-bottom: 1rem;
}
.back-link:hover { color: var(--fg); }

/* showAllBooks — ported from Frontend/src/styles/main.css */
.search-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 1.5rem;
}
.search-grid label {
    display: block;
    font-size: 0.82rem;
    color: var(--muted-fg);
    margin-bottom: 4px;
}
.search-grid input,
.search-grid select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    color: var(--fg);
    font-family: inherit;
    font-size: 0.9rem;
}
.book-list { display: flex; flex-direction: column; gap: 10px; }
.book-row {
    display: grid;
    grid-template-columns: 160px 1fr auto;
    align-items: center;
    gap: 1.25rem;
    padding: 1.1rem 1.25rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-decoration: none;
    color: inherit;
}
.book-row:hover {
    border-color: hsl(28, 19%, 55%);
    background: hsl(33, 35%, 98%);
}
.book-row .isbn {
    font-family: monospace;
    font-size: 0.82rem;
    color: var(--muted-fg);
}
.book-row .title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    line-height: 1.1;
    margin: 0 0 4px 0;
}
.book-row .byline {
    font-size: 0.88rem;
    color: var(--muted-fg);
}
.book-row .right {
    text-align: right;
}
.book-row .price {
    font-size: 1.15rem;
    font-weight: 600;
}
.book-row .stock {
    font-size: 0.78rem;
    color: var(--muted-fg);
    margin-top: 2px;
}
.pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 1.5rem;
    justify-content: flex-end;
    flex-wrap: wrap;
}
.page-info { font-size: 0.82rem; color: var(--muted-fg); flex: 1; }
.empty-state {
    padding: 3rem;
    text-align: center;
    color: var(--muted-fg);
    font-size: 0.9rem;
}
</style>
<script>
// Defeat Chrome's back/forward cache (bfcache). Cache-Control headers
// alone do not always evict the bfcache snapshot, so when the user clicks
// the browser Back button after clearing the cart, the cached page can
// re-appear with the old badge count. The 'pageshow' event fires every
// time a page is displayed including bfcache restores; the 'persisted'
// flag tells us it was a bfcache restore (not a fresh load), and we
// force a reload so header.php re-runs and recomputes the cart count.
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});
</script>
</head>
<body>
<nav class="site-nav">
    <div class="nav-inner">
        <a href="showAllBooks.php" class="nav-logo">
            <div class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <span class="nav-brand">BookstoreDB</span>
        </a>
        <div class="nav-links">
            <a class="nav-link<?php echo $vNavKey === 'books' ? ' active' : ''; ?>" href="showAllBooks.php">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                All Books
            </a>
            <a class="nav-link<?php echo $vNavKey === 'cart' ? ' active' : ''; ?>" href="showCart.php">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Cart
                <span class="cart-badge"><?php echo $vCartCount; ?></span>
            </a>
            <a class="nav-link<?php echo $vNavKey === 'orders' ? ' active' : ''; ?>" href="showAllOrders.php">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                My Orders
            </a>
            <div class="nav-divider"></div>
            <?php if ($vDisplayName !== ''): ?>
                <span class="nav-user">Hi, <?php echo htmlspecialchars($vDisplayName); ?></span>
            <?php endif; ?>
            <a class="btn btn-sm" href="logout.php" style="margin-left:6px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
            </a>
        </div>
    </div>
</nav>
<main class="site-main">
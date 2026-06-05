<?php
// -------------------------------------------------------------------------
// File name: authHelper.php
// Author:    Sydney and Tyler
// Date:      4/18/26
// Class:     CS445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Session guard. Include this at the top of every protected
//            page. If the current session is not authenticated, the
//            user is sent back to index.html.
//
// Pattern taken from authHelper.php in cs445_php_web.pdf (slide 42).
// -------------------------------------------------------------------------

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['VALID']) || $_SESSION['VALID'] != 1) {
    header('Location: index.html');
    exit;
}
?>

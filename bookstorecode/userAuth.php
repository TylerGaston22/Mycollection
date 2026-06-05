<?php
// -------------------------------------------------------------------------
// File name: logout.php
// Author:    Sydney and Tyler
// Date:      4/18/26
// Class:     CS445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Clear the session and send the user back to index.html.
//
// Linked from the Logout button in header.php (required on every page
// per CS445S26_BookstoreDB_A5.pdf).
// -------------------------------------------------------------------------

require_once('connDB.php');
require_once('basicErrorHandling.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Unset the specific auth keys explicitly, then wipe the session
// storage and destroy it. Belt and suspenders so a stale session
// cookie cannot leave VALID/userID behind.
unset($_SESSION['VALID']);
unset($_SESSION['userID']);
unset($_SESSION['username']);
$_SESSION = array();
session_destroy();

header('Location: index.html');
exit;
?>

<?php
// -------------------------------------------------------------------------
// File name: userAuth.php
// Author:    Sydney and Tyler
// Date:      4/18/26
// Class:     CS445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Handle the login form POST from index.html. Validate the
//            submitted credentials against the Customer table via
//            queryValidUser(). On success, set the session flags and
//            redirect to showAllBooks.php. On failure, send the user
//            back to index.html.
//
// Pattern taken from userAuth.php in cs445_php_web.pdf (slide 38).
// The POST field names (txtUser, txtPassword) and the $_SESSION['VALID']
// session flag match that slide.
// -------------------------------------------------------------------------

require_once('connDB.php');
require_once('basicErrorHandling.php');
require_once('queryValidUser.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION['VALID'] = 0;

if (isset($_POST['txtUser']) && isset($_POST['txtPassword'])) {

    $vUser = filter_input(INPUT_POST, 'txtUser');
    $vPass = filter_input(INPUT_POST, 'txtPassword');

    $vUID = false;
    try {
        $vDbh = db_connect();
        $vUID = queryValidUser($vDbh, $vUser, $vPass);
        db_close($vDbh);
    } catch (PDOException $e) {
        error_log('userAuth failed: ' . $e->getMessage());
        $vUID = false;
    }

    if ($vUID !== false) {
        // Look up the customer's real first + last name from Person.
        // Customer.CustomerID === Person.PersonID by design (inheritance).
        // We store the joined name in $_SESSION['displayName'] so the nav
        // bar can show "Hi, Emerald Wilkerson" (with a space) instead of
        // the login username "EmeraldWilkerson". $_SESSION['username']
        // stays as the login string for any code that needs to match
        // against Customer.Username.
        $vDisplayName = $vUser; // safe fallback
        try {
            $vDbh2  = db_connect();
            $vStmt2 = $vDbh2->prepare(
                'SELECT GetCustomerName(:uid) AS FullName');
            $vStmt2->bindValue(':uid', (int)$vUID, PDO::PARAM_INT);
            $vStmt2->execute();
            $vNameRow = $vStmt2->fetch(PDO::FETCH_ASSOC);
            $vStmt2->closeCursor();
            db_close($vDbh2);

            if ($vNameRow && !empty(trim($vNameRow['FullName'] ?? ''))) {
                $vDisplayName = trim($vNameRow['FullName']);
            }
        } catch (PDOException $e) {
            error_log('displayName lookup failed: ' . $e->getMessage());
        }

        $_SESSION['VALID']       = 1;
        $_SESSION['userID']      = (int)$vUID;
        $_SESSION['username']    = $vUser;
        $_SESSION['displayName'] = $vDisplayName;
        header('Location: showAllBooks.php');
        exit;
    }
}

header('Location: index.html?err=1');
exit;
?>
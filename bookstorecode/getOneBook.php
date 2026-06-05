<?php
// -------------------------------------------------------------------------
// File name: clearCart.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Action handler — Clear Cart button on showCart.php. Calls
//            ClearCart_NoPurchase stored procedure to restore inventory
//            and empty the cart. Resets $_SESSION['cartCount'] to 0.
//            Redirects back to showCart.php.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');

$vUID = (int)$_SESSION['userID'];

try {
    $vDbh  = db_connect();
    $vStmt = $vDbh->prepare('CALL ClearCart_NoPurchase(:uid)');
    $vStmt->bindValue(':uid', $vUID, PDO::PARAM_INT);
    $vStmt->execute();
    $vStmt->closeCursor();
    $_SESSION['cartCount'] = 0;
    unset($_SESSION['shippingID']);
    db_close($vDbh);
} catch (PDOException $e) {
    error_log('clearCart failed: ' . $e->getMessage());
}

header('Location: showCart.php');
exit;
?>
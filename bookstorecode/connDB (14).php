<?php
// -------------------------------------------------------------------------
// File name: updateCart.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Action handler — handles qty +/-, discount change, and
//            shipping change from showCart.php. Calls stored procedures
//            as appropriate. Updates $_SESSION['cartCount'] for nav badge.
//            Redirects back to showCart.php.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');
require_once(__DIR__ . '/getCart.php');

$vUID    = (int)$_SESSION['userID'];
$vAction = filter_input(INPUT_POST, 'action', FILTER_DEFAULT) ?? '';

$vError = '';

try {
    $vDbh = db_connect();

    if ($vAction === 'discount') {
        // ---------------------------------------------------------------
        // Change discount on cart Order record
        // ---------------------------------------------------------------
        $vDiscountID = filter_input(
            INPUT_POST, 'discountID', FILTER_VALIDATE_INT);

        $vStmt = $vDbh->prepare(
            'CALL SetCartDiscount(:uid, :discountID)');
        $vStmt->bindValue(':uid', $vUID, PDO::PARAM_INT);
        $vStmt->bindValue(
            ':discountID',
            ($vDiscountID > 0) ? $vDiscountID : null,
            ($vDiscountID > 0) ? PDO::PARAM_INT : PDO::PARAM_NULL
        );
        $vStmt->execute();
        $vStmt->closeCursor();

    } elseif ($vAction === 'shipping') {
        // ---------------------------------------------------------------
        // Store shipping choice in session for checkout
        // ---------------------------------------------------------------
        $vShippingID = filter_input(
            INPUT_POST, 'shippingID', FILTER_VALIDATE_INT);
        if ($vShippingID > 0) {
            $_SESSION['shippingID'] = (int)$vShippingID;
        }

    } else {
        // ---------------------------------------------------------------
        // Qty change — call AlterBookEditionQtyInCart
        // ---------------------------------------------------------------
        $vBookID    = filter_input(
            INPUT_POST, 'bookID',    FILTER_VALIDATE_INT);
        $vEditionID = filter_input(
            INPUT_POST, 'editionID', FILTER_VALIDATE_INT);
        $vQty       = filter_input(
            INPUT_POST, 'qty',       FILTER_VALIDATE_INT);

        if ($vBookID && $vEditionID && $vQty) {
            $vStmt = $vDbh->prepare(
                'CALL AlterBookEditionQtyInCart(
                    :uid, :bookID, :editionID, :qty)');
            $vStmt->bindValue(':uid',       $vUID,       PDO::PARAM_INT);
            $vStmt->bindValue(':bookID',    $vBookID,    PDO::PARAM_INT);
            $vStmt->bindValue(':editionID', $vEditionID, PDO::PARAM_INT);
            $vStmt->bindValue(':qty',       $vQty,       PDO::PARAM_INT);
            $vStmt->execute();
            $vStmt->closeCursor();
        }
    }

    // Update cart count in session for nav badge
    $_SESSION['cartCount'] = getCartCount($vDbh, $vUID);

    db_close($vDbh);
} catch (PDOException $e) {
    error_log('updateCart failed: ' . $e->getMessage());
    $vError = urlencode($e->getMessage());
}

$vRedirect = 'showCart.php';
if ($vError !== '') {
    $vRedirect .= '?cartError=' . $vError;
}

header('Location: ' . $vRedirect);
exit;
?>
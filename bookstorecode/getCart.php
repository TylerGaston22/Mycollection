<?php
// -------------------------------------------------------------------------
// File name: checkout.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Action handler — Checkout button on showCart.php. Creates a
//            new Sale + Order record, moves CartContains rows to
//            SaleContains, updates TotalCost, then clears the cart of
//            items, discount, and shipping. Redirects to showAllOrders.php.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');

$vUID        = (int)$_SESSION['userID'];
$vShippingID = isset($_SESSION['shippingID'])
    ? (int)$_SESSION['shippingID'] : 0;

if ($vShippingID === 0) {
    header('Location: showCart.php?cartError='
        . urlencode('Please select a shipping method.'));
    exit;
}

try {
    $vDbh = db_connect();

    // ------------------------------------------------------------------
    // The Checkout stored procedure handles the entire transaction:
    // create Order + Sale, copy CartContains -> SaleContains, run
    // updateSaleTotal, then clear the cart's items and discount. It
    // returns the new SaleID via OUT param, or 0 if the cart is empty
    // or missing.
    // ------------------------------------------------------------------
    $vStmt = $vDbh->prepare(
        'CALL Checkout(:uid, :shippingID, @saleID)');
    $vStmt->bindValue(':uid',        $vUID,        PDO::PARAM_INT);
    $vStmt->bindValue(':shippingID', $vShippingID, PDO::PARAM_INT);
    $vStmt->execute();
    $vStmt->closeCursor();

    $vSaleRow = $vDbh->query('SELECT @saleID AS SaleID')
                     ->fetch(PDO::FETCH_ASSOC);
    $vOrderID = isset($vSaleRow['SaleID']) ? (int)$vSaleRow['SaleID'] : 0;

    if ($vOrderID === 0) {
        // Cart was empty or missing — bounce back to cart page.
        db_close($vDbh);
        header('Location: showCart.php');
        exit;
    }

    unset($_SESSION['shippingID']);
    $_SESSION['cartCount'] = 0;
    db_close($vDbh);

} catch (PDOException $e) {
    error_log('checkout failed: ' . $e->getMessage());
    header('Location: showCart.php?cartError='
        . urlencode('Checkout failed: ' . $e->getMessage()));
    exit;
}

header('Location: showAllOrders.php');
exit;
?>
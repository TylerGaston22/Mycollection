<?php
// -------------------------------------------------------------------------
// File name: addToCart.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Action handler — adds a book edition to the logged-in user's
//            cart by calling AlterBookEditionQtyInCart with a positive qty.
//            Updates $_SESSION['cartCount'] for the nav badge.
//            Optional 'returnTo' POST field controls where the user lands
//            after the add. Defaults to showOneBook.php so the standard
//            "Add to Cart" button on the book detail page keeps working
//            unchanged. The recommended-book ad on showCart.php passes
//            returnTo=showCart.php so the user stays on the cart page.
// -------------------------------------------------------------------------

require_once('connDB.php');
require_once('basicErrorHandling.php');
require_once('authHelper.php');
require_once('getCart.php');

$vBookID    = filter_input(INPUT_POST, 'bookID',    FILTER_VALIDATE_INT);
$vEditionID = filter_input(INPUT_POST, 'editionID', FILTER_VALIDATE_INT);
$vQty       = filter_input(INPUT_POST, 'qty',       FILTER_VALIDATE_INT);
$vUID       = (int)$_SESSION['userID'];

if (!$vBookID || !$vEditionID) {
    header('Location: showAllBooks.php');
    exit;
}
if (!$vQty || $vQty < 1) {
    $vQty = 1;
}

$vError = '';

try {
    $vDbh = db_connect();

    // AlterBookEditionQtyInCart adds the qty delta. We always pass +qty
    // here because addToCart only adds; updateCart handles +/- changes.
    $vStmt = $vDbh->prepare(
        'CALL AlterBookEditionQtyInCart(:uid, :bookID, :editionID, :qty)');
    $vStmt->bindValue(':uid',       $vUID,       PDO::PARAM_INT);
    $vStmt->bindValue(':bookID',    $vBookID,    PDO::PARAM_INT);
    $vStmt->bindValue(':editionID', $vEditionID, PDO::PARAM_INT);
    $vStmt->bindValue(':qty',       $vQty,       PDO::PARAM_INT);
    $vStmt->execute();
    $vStmt->closeCursor();

    // Update cart count in session for nav badge
    $_SESSION['cartCount'] = getCartCount($vDbh, $vUID);

    db_close($vDbh);
} catch (PDOException $e) {
    error_log('addToCart failed: ' . $e->getMessage());
    $vError = urlencode($e->getMessage());
}

// -------------------------------------------------------------------------
// Decide where to redirect after the add-to-cart action.
// Callers may post an optional 'returnTo' field (whitelisted) to override
// the default. e.g. the recommended-book ad on showCart.php passes
// 'showCart.php' so the user stays on the cart page after clicking it.
// -------------------------------------------------------------------------
$vReturnTo = filter_input(INPUT_POST, 'returnTo', FILTER_DEFAULT);
$vAllowedReturns = ['showCart.php', 'showOneBook.php', 'showAllBooks.php'];
if (!in_array($vReturnTo, $vAllowedReturns, true)) {
    $vReturnTo = 'showOneBook.php';
}

if ($vReturnTo === 'showOneBook.php') {
    $vRedirect = 'showOneBook.php?bookID=' . $vBookID
               . '&editionID=' . $vEditionID;
} else {
    $vRedirect = $vReturnTo;
}

if ($vError !== '') {
    $vRedirect .= (strpos($vRedirect, '?') === false ? '?' : '&')
                . 'cartError=' . $vError;
}

header('Location: ' . $vRedirect);
exit;
?>
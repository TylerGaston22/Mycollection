<?php
// -------------------------------------------------------------------------
// File name: getAllOrders.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Query file for showAllOrders.php. Returns all past orders
//            for the logged-in user, newest first.
//              - getUserOrders($dbh, $uid)
//
// Pattern taken from queryFunctionCall.php in cs445_php_web.pdf (slide 26).
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');

// -------------------------------------------------------------------------
// Function: getUserOrders
// Purpose:  Return all past orders for a user, newest first. Joins Sale
//           to Shipping and Discount for display. Calculates total qty
//           from SaleContains.
// Input:    $p_dbh - open PDO handle
//           $p_uid - Customer.CustomerID from session
// Return:   array of rows (empty on failure)
// -------------------------------------------------------------------------
function getUserOrders($p_dbh, $p_uid)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare('CALL GetUserOrders(:uid)');
        $vStmt->bindValue(':uid', (int)$p_uid, PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('getUserOrders failed: ' . $e->getMessage());
    }

    return $vRows;
}
?>
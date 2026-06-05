<?php
// -------------------------------------------------------------------------
// File name: getOneOrder.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Query file for showOrder.php. Returns full detail for one
//            past order including items, subtotal, discount, shipping,
//            and total.
//              - getOneOrder($dbh, $saleID, $uid)
//              - getOrderItems($dbh, $saleID)
//
// Pattern taken from queryFunctionCall.php in cs445_php_web.pdf (slide 26).
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');

// -------------------------------------------------------------------------
// Function: getOneOrder
// Purpose:  Return header info for a single Sale: timestamp, shipping,
//           discount, total cost. Verifies the order belongs to the user.
// Input:    $p_dbh    - open PDO handle
//           $p_saleID - Sale.SaleID
//           $p_uid    - Customer.CustomerID (ownership check)
// Return:   associative row or empty array if not found / not owned
// -------------------------------------------------------------------------
function getOneOrder($p_dbh, $p_saleID, $p_uid)
{
    $vRow = array();

    try {
        $vStmt = $p_dbh->prepare('CALL GetSaleHeader(:saleID, :uid)');
        $vStmt->bindValue(':saleID', (int)$p_saleID, PDO::PARAM_INT);
        $vStmt->bindValue(':uid',    (int)$p_uid,    PDO::PARAM_INT);
        $vStmt->execute();
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();

        if ($vRow === false) {
            $vRow = array();
        }
    } catch (PDOException $e) {
        error_log('getOneOrder failed: ' . $e->getMessage());
    }

    return $vRow;
}

// -------------------------------------------------------------------------
// Function: getOrderItems
// Purpose:  Return all items in a sale with book/edition detail and
//           line totals (pre-discount, using RetailPrice * Quantity).
// Input:    $p_dbh    - open PDO handle
//           $p_saleID - Sale.SaleID
// Return:   array of rows (empty on failure)
// -------------------------------------------------------------------------
function getOrderItems($p_dbh, $p_saleID)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare('CALL GetSaleItems(:saleID)');
        $vStmt->bindValue(':saleID', (int)$p_saleID, PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('getOrderItems failed: ' . $e->getMessage());
    }

    return $vRows;
}
?>
<?php
// -------------------------------------------------------------------------
// File name: connDB.php
// Author: Sydney and Tyler
// Date: 4/18/26
// Class: CS445
// Assignment: BookstoreDB PHP Front End
// Purpose: Open and close PDO connections to the MariaDB database
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Function: db_connect
// Purpose:  Open a PDO connection to the named database using db.ini
// Input:    $p_dbName - optional database name override
// Return:   PDO connection handle
// -------------------------------------------------------------------------
function db_connect($p_dbName = null)
{
    $vConfig = parse_ini_file(__DIR__ . "/../db.ini", true);

    $vHost = $vConfig['client']['host'];
    $vPort = $vConfig['client']['port'];
    $vUser = $vConfig['client']['user'];
    $vPass = $vConfig['client']['password'];
    $vDB   = $p_dbName ?: $vConfig['client']['database'];

    $vConnStr = "mysql:host=$vHost;port=$vPort;dbname=$vDB";
    $vDbh = new PDO($vConnStr, $vUser, $vPass);
    $vDbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $vDbh;
}

// -------------------------------------------------------------------------
// Function: db_close
// Purpose:  Close an open PDO handle
// Input:    $p_dbh - PDO handle (by reference)
// Return:   none
// Note:     Named db_close (not closeDB) to match the class convention
//           shown in skeleton.php / queryFunctionCall.php
//           (cs445_php_web.pdf slides 21, 26).
// -------------------------------------------------------------------------
function db_close(&$p_dbh)
{
    $p_dbh = null;
}
?>

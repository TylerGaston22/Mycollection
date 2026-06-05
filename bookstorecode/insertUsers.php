<?php
  // Author: 	    Sydney and Tyler
  // File: 		  	connDB.php
  // Date:		    April 19, 2026
  // Class:		    CS 445	
  // Project: 	  BookstoreDB
  // Description: establihs connecton with mariadb

function db_connect($db = null)
{
	$config = parse_ini_file(__DIR__ . "/../../db.ini", true);

	if (null == $db) {
		$db = $config['client']['database'];
	}
	$host = $config['client']['host'];
	$port = $config['client']['port'];
	$user = $config['client']['user'];
	$password = $config['client']['password'];

	$connectStr = "mysql:host={$host};port={$port};dbname={$db}";
	$dbh = new PDO($connectStr, $user, $password);
	return $dbh;
}

function db_close (&$dbh) 
{
	$dbh = NULL;
}

?>
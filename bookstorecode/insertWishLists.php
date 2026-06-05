
<?php
  // Author: 	    Sydney and Tyler
  // File: 		  	insertAuthors.php
  // Date:		    April 19, 2026
  // Class:		    CS 445	
  // Project: 	  BookstoreDB
  // Description: insert authors from reading a file

require_once __DIR__ . "/connDB.php";

$conn = db_connect();

if ($argc < 2) {
	exit ("Error: missing file\n");
}

if (($handle = fopen($argv[1], "r")) !== FALSE) {
	while (($data = fgetcsv($handle, 1000, ",", escape:"\\")) !== FALSE) {

		$sqlString = "CALL addAuthor (:fname, :lname)";

		$sth = $conn->prepare($sqlString);

		$sth->bindValue(":fname", $data[0]);
		$sth->bindValue(":lname", $data[1]);

		$sth->execute();
	}
	fclose($handle);
}

db_close($conn);

?>
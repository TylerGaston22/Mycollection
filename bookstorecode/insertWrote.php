<?php
  // Author: 	    Sydney and Tyler
  // File: 		  	insertBookEdition.php
  // Date:		    April 19, 2026
  // Class:		    CS 445	
  // Project: 	  BookstoreDB
  // Description: insert bookeditions from reading a file

require_once __DIR__ . "/connDB.php";

$conn = db_connect();

if ($argc < 2) {
	exit ("Error: missing file\n");
}

if (($handle = fopen($argv[1], "r")) !== FALSE) {
	fgetcsv($handle, 1000, ",", escape:"\\");

	while (($data = fgetcsv($handle, 1000, ",", escape:"\\")) !== FALSE) {

		$forwardFName = null;
		$forwardLName = null;

		if (isset($data[11]) && isset($data[12]) &&
			$data[11] !== "0" && $data[12] !== "0") {
			$forwardFName = $data[11];
			$forwardLName = $data[12];
		}

		$sqlString = "CALL addBookEdition (:coverImageURL, :title, :authorFName,
			:authorLName, :editionName, :publisherName, :publishedDate, :isbn,
			:quantity, :wholesalePrice, :retailPrice, :forwardFName,
			:forwardLName)";

		$sth = $conn->prepare($sqlString);

		$sth->bindValue(":coverImageURL", $data[0]);
		$sth->bindValue(":title", $data[1]);
		$sth->bindValue(":authorFName", $data[2]);
		$sth->bindValue(":authorLName", $data[3]);
		$sth->bindValue(":editionName", $data[4]);
		$sth->bindValue(":publisherName", $data[5]);
		$sth->bindValue(":publishedDate", $data[6]);
		$sth->bindValue(":isbn", $data[7]);
		$sth->bindValue(":quantity", $data[8]);
		$sth->bindValue(":wholesalePrice", $data[9]);
		$sth->bindValue(":retailPrice", $data[10]);
		$sth->bindValue(":forwardFName", $forwardFName);
		$sth->bindValue(":forwardLName", $forwardLName);

		$sth->execute();
	}
	fclose($handle);
}

db_close($conn);

?>
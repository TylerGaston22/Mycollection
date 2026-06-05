<?php
// -------------------------------------------------------------------------
// File name: insertReviewAgreeDisagree.php
// Author:    Sydney and Tyler
// Date:      4/19/26
// Class:     CS 445
// Assignment: BookstoreDB
// Purpose:   CLI loader. Reads an agree/disagree CSV produced by
//            generateRandomReviewAgreeDisagree.php and pushes each
//            entry into the corresponding review document's agree[] or
//            disagree[] array in MongoDB. Resolves names to IDs via
//            GetBookIDByTitle and GetCustomerIDByName stored functions.
//            Skips rows where the voter is the same as the reviewer or
//            where the same voter has already voted that way on the
//            same review. Usage: php insertReviewAgreeDisagree.php file.csv
// -------------------------------------------------------------------------

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/connMongo.php';
require_once __DIR__ . '/../BookstoreDB/php/connDB.php';

if ($argc < 2) {
	exit("Usage: php insertReviewAgreeDisagree.php file.csv\n");
}

$client = mongo_connect();
$collection = $client->books_Team5->reviews;

$conn = db_connect();

$handle = fopen($argv[1], "r");
if ($handle === false) {
	exit("Error: could not open file\n");
}

fgetcsv($handle, 1000, ",", escape: "\\");

while (($data = fgetcsv($handle, 1000, ",", escape: "\\")) !== false) {

	$title = trim($data[0]);
	$reviewerFName = trim($data[1]);
	$reviewerLName = trim($data[2]);
	$voteType = strtoupper(trim($data[3]));
	$voterFName = trim($data[4]);
	$voterLName = trim($data[5]);
	$timestamp = intval(trim($data[6]));

	if ($voteType !== 'AGREE' && $voteType !== 'DISAGREE') {
		continue;
	}

	if ($reviewerFName === $voterFName && $reviewerLName === $voterLName) {
		continue;
	}

	$sql = "SELECT GetBookIDByTitle(:title) AS BookID";
	$sth = $conn->prepare($sql);
	$sth->bindValue(":title", $title);
	$sth->execute();
	$bookRow = $sth->fetch(PDO::FETCH_ASSOC);
	$sth->closeCursor();

	$sql = "SELECT GetCustomerIDByName(:fName, :lName) AS CustomerID";
	$sth = $conn->prepare($sql);
	$sth->bindValue(":fName", $reviewerFName);
	$sth->bindValue(":lName", $reviewerLName);
	$sth->execute();
	$reviewerRow = $sth->fetch(PDO::FETCH_ASSOC);
	$sth->closeCursor();

	$sql = "SELECT GetCustomerIDByName(:fName, :lName) AS CustomerID";
	$sth = $conn->prepare($sql);
	$sth->bindValue(":fName", $voterFName);
	$sth->bindValue(":lName", $voterLName);
	$sth->execute();
	$voterRow = $sth->fetch(PDO::FETCH_ASSOC);
	$sth->closeCursor();

	if (
		!$bookRow || !$reviewerRow || !$voterRow ||
		$bookRow['BookID'] === null ||
		$reviewerRow['CustomerID'] === null ||
		$voterRow['CustomerID'] === null
	) {
		continue;
	}

	$bid = intval($bookRow['BookID']);
	$reviewerUID = intval($reviewerRow['CustomerID']);
	$voterUID = intval($voterRow['CustomerID']);

	// determine array
	$field = ($voteType === 'AGREE') ? 'agree' : 'disagree';

	$existing = $collection->findOne([
		'bid' => $bid,
		'uid' => $reviewerUID,
		"{$field}.uid" => $voterUID
	]);

	if ($existing !== null) {
		continue;
	}

	$collection->updateOne(
		[
			'bid' => $bid,
			'uid' => $reviewerUID
		],
		[
			'$push' => [
				$field => [
					'uid' => $voterUID,
					'timestamp' => new MongoDB\BSON\UTCDateTime($timestamp)
				]
			]
		]
	);
}

fclose($handle);

<?php
// -------------------------------------------------------------------------
// File name: getReviews.php
// Author:    Sydney and Tyler
// Date:      4/19/26
// Class:     CS 445
// Assignment: BookstoreDB
// Purpose:   CLI tool. Given a book title as the first argument, look up
//            its BookID via the GetBookIDByTitle stored function, fetch
//            every review document for that book from MongoDB, and print
//            each one with the reviewer's full name (resolved via
//            GetCustomerName), the timestamp converted to America/
//            Los_Angeles time, and the review text.
// -------------------------------------------------------------------------

require_once 'vendor/autoload.php';
require_once __DIR__ . "/connMongo.php";
require_once __DIR__ . "/../BookstoreDB/php/connDB.php";

$client = mongo_connect();
$conn = db_connect();
$collection = $client->books_Team5->reviews;

if ($argc < 2) {
	exit("Usage: php getReviews.php TITLE\n");
}

$title = $argv[1];
$sql = "SELECT GetBookIDByTitle(:title) AS BookID";
$sth = $conn->prepare($sql);
$sth->bindValue(":title", $title);
$sth->execute();
$bookRow = $sth->fetch(PDO::FETCH_ASSOC);
$sth->closeCursor();

if (!$bookRow || $bookRow['BookID'] === null) {
	exit("Book not found: $title\n");
}

$recvdData = $collection->find(['bid' => (int)$bookRow['BookID']]);

foreach ($recvdData as $review) {

	$sql = "SELECT GetCustomerName(:uid) AS UID";
	$sth = $conn->prepare($sql);
	$sth->bindValue(":uid", $review["uid"]);
	$sth->execute();
	$fullNameRow = $sth->fetch(PDO::FETCH_ASSOC);
	$sth->closeCursor();

	$timestamp = $review["timestamp"]->toDateTime();
	$timestamp->setTimezone(new DateTimeZone ('America/Los_Angeles'));

	print ("Title: " . $title . "\n");
	print ("Reviewer: " . $fullNameRow['UID'] . "\n");
	print ("Timestamp: " . $timestamp->format("M d Y :: h:i:s a") . "\n");
	print ("Review: " . $review['review'] . "\n");
}

?>
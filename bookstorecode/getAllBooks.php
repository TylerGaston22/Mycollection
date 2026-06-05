<?php
// -------------------------------------------------------------------------
// File name: avgStars.php
// Author:    Sydney and Tyler
// Date:      4/19/26
// Class:     CS 445
// Assignment: BookstoreDB
// Purpose:   CLI tool. Given a book title as the first argument, look up
//            its BookID via the GetBookIDByTitle stored function, fetch
//            every review document for that book from the MongoDB
//            books_Team5.reviews collection, and print the average star
//            rating. Prints "No Reviews" if the book has none.
// -------------------------------------------------------------------------

require_once 'vendor/autoload.php';
require_once __DIR__ . "/connMongo.php";
require_once __DIR__ . "/../BookstoreDB/php/connDB.php";

$client = mongo_connect();
$conn = db_connect();
$collection = $client->books_Team5->reviews;

if ($argc < 2) {
	exit("Error: missing file\n");
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

$sumOfStars = 0;
$numOfReviews = 0;
foreach ($recvdData as $review) {
	$sumOfStars += $review["stars"];
	$numOfReviews += 1;
}

if ($numOfReviews != 0) {
	print($sumOfStars / $numOfReviews . "\n");
} else {
	print ("\nNo Reviews\n");
}
?>
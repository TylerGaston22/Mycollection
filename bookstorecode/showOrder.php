<?php
// -------------------------------------------------------------------------
// File name: insertBookReviews.php
// Author:    Sydney and Tyler
// Date:      4/19/26
// Class:     CS 445
// Assignment: BookstoreDB
// Purpose:   CLI loader. Drops and recreates the books_Team5.reviews
//            collection, then reads a reviews CSV and inserts one
//            document per row into MongoDB. Each row is mapped from
//            (title, fName, lName) to (bid, uid) by calling the
//            GetBookIDByTitle and GetCustomerIDByName stored functions
//            on the MariaDB side. Skips rows whose title or user can't
//            be resolved. Usage: php insertBookReviews.php reviews.csv
// -------------------------------------------------------------------------

require_once 'vendor/autoload.php';
require_once __DIR__ . "/connMongo.php";
require_once __DIR__ . "/../BookstoreDB/php/connDB.php";

// connect to mongo
$client = mongo_connect();
$client->books_Team5->drop();
$client->books_Team5->createCollection("reviews");
$collection = $client->books_Team5->reviews;

// connect to mariadb
$conn = db_connect();

if ($argc < 2) {
    exit("Error: missing file\n");
}

if (($handle = fopen($argv[1], "r")) !== false) {

    // skip header
    fgetcsv($handle, 1000, ",", escape: "\\");

    while (($data = fgetcsv($handle, 1000, ",", escape: "\\")) !== false) {

        $title = $data[0];
        $fName = $data[1];
        $lName = $data[2];
        $review = $data[3];
        $stars = intval($data[4]);
        $timestamp = intval($data[5]);

        $sql = "SELECT GetBookIDByTitle(:title) AS BookID";
        $sth = $conn->prepare($sql);
        $sth->bindValue(":title", $title);
        $sth->execute();
        $bookRow = $sth->fetch(PDO::FETCH_ASSOC);
        $sth->closeCursor();

        $sql = "SELECT GetCustomerIDByName(:fName, :lName) AS CustomerID";
        $sth = $conn->prepare($sql);
        $sth->bindValue(":fName", $fName);
        $sth->bindValue(":lName", $lName);
        $sth->execute();
        $userRow = $sth->fetch(PDO::FETCH_ASSOC);
        $sth->closeCursor();

        if (!$bookRow || !$userRow || 
            $bookRow['BookID'] === null || 
            $userRow['CustomerID'] === null) {
            continue;
        }

        $collection->insertOne([
            'bid' => (int)$bookRow['BookID'],
            'uid' => (int)$userRow['CustomerID'],
            'timestamp' => new MongoDB\BSON\UTCDateTime($timestamp),
            'stars' => $stars,
            'review' => $review
        ]);
    }

    fclose($handle);
}
?>
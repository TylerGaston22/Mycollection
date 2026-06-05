<?php
// -------------------------------------------------------------------------
// File name: generateRandomReviewAgreeDisagree.php
// Author:    Sydney and Tyler
// Date:      4/19/26
// Class:     CS 445
// Assignment: BookstoreDB
// Purpose:   CLI tool. Reads an input reviews CSV and writes an agree/
//            disagree CSV. For each input review, picks 0-2 random
//            eligible customers (excluding the reviewer themselves and
//            avoiding duplicates within the same vote type) and assigns
//            each as either an AGREE or DISAGREE voter. Customer pool
//            comes from the GetAllCustomerNames stored procedure.
//            Usage: php generateRandomReviewAgreeDisagree.php IN.csv OUT.csv
// -------------------------------------------------------------------------

require_once __DIR__ . '/../BookstoreDB/php/connDB.php';

if ($argc < 3) {
    exit("Usage: php generateRandomReviewAgreeDisagree.php inputReviews.csv outputAgreeDisagree.csv\n");
}

// files
$inputFile = $argv[1];
$outputFile = $argv[2];

// connect to MariaDB
$conn = db_connect();

// get all users
$sth = $conn->prepare("CALL GetAllCustomerNames()");
$sth->execute();

$users = [];
while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
    $users[] = [
        'FName' => $row['FName'],
        'LName' => $row['LName']
    ];
}
$sth->closeCursor();

if (count($users) < 2) {
    exit("Error: not enough users\n");
}

// open files
$inHandle = fopen($inputFile, "r");
if ($inHandle === false) {
    exit("Error: could not open input file\n");
}

$outHandle = fopen($outputFile, "w");
if ($outHandle === false) {
    fclose($inHandle);
    exit("Error: could not open output file\n");
}

// write header (FIXED fputcsv)
fputcsv($outHandle, [
    'title',
    'reviewer_fname',
    'reviewer_lname',
    'AGREE/DISAGREE',
    'fname',
    'lname',
    'timestamp'
], ",", '"', "\\");

// skip input header
fgetcsv($inHandle, 1000, ",", escape: "\\");

while (($data = fgetcsv($inHandle, 1000, ",", escape: "\\")) !== false) {

    $title = trim($data[0]);
    $reviewerFName = trim($data[1]);
    $reviewerLName = trim($data[2]);

    $numVotes = rand(0, 2);

    $usedAgree = [];
    $usedDisagree = [];

    for ($i = 0; $i < $numVotes; $i++) {

        $voteType = (rand(0, 1) === 0) ? 'AGREE' : 'DISAGREE';

        $eligibleUsers = [];

        foreach ($users as $user) {
            $fName = $user['FName'];
            $lName = $user['LName'];
            $fullName = $fName . '|' . $lName;

            // reviewer cannot vote on their own review
            if ($fName === $reviewerFName && $lName === $reviewerLName) {
                continue;
            }

            // prevent duplicates in same vote type
            if ($voteType === 'AGREE' && isset($usedAgree[$fullName])) {
                continue;
            }

            if ($voteType === 'DISAGREE' && isset($usedDisagree[$fullName])) {
                continue;
            }

            $eligibleUsers[] = $user;
        }

        if (count($eligibleUsers) === 0) {
            continue;
        }

        $pickedUser = $eligibleUsers[array_rand($eligibleUsers)];
        $pickedFName = $pickedUser['FName'];
        $pickedLName = $pickedUser['LName'];
        $pickedFullName = $pickedFName . '|' . $pickedLName;

        // track duplicates
        if ($voteType === 'AGREE') {
            $usedAgree[$pickedFullName] = true;
        } else {
            $usedDisagree[$pickedFullName] = true;
        }

        // timestamp in ms
        $timestamp = round(microtime(true) * 1000) + rand(1, 1000000);

        // write row (FIXED fputcsv)
        fputcsv($outHandle, [
            $title,
            $reviewerFName,
            $reviewerLName,
            $voteType,
            $pickedFName,
            $pickedLName,
            $timestamp
        ], ",", '"', "\\");
    }
}

fclose($inHandle);
fclose($outHandle);
?>
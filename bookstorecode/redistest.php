<?php
// -------------------------------------------------------------------------
// File name: voteReview.php
// Author:    Sydney and Tyler
// Date:      4/24/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Action handler — called via POST from the agree/disagree
//            buttons on each review card in showOneBook.php. Updates the
//            MongoDB review document's agree[] or disagree[] array.
//
// Rules enforced (same as insertReviewAgreeDisagree.php):
//   1. The logged-in user cannot vote on their own review.
//   2. The same user cannot vote the same way on the same review twice.
//   3. If the user already voted the opposite way, remove that vote
//      first, then record the new vote. (Toggle behavior.)
//   4. If the user clicks the same button they already chose, remove
//      their vote entirely. (Un-vote.)
//
// MongoDB document shape for a review (from insertBookReviews.php +
// insertReviewAgreeDisagree.php):
//   { bid: <int>, uid: <int>, stars: <int>, review: <string>,
//     timestamp: <UTCDateTime>,
//     agree:    [ { uid: <int>, timestamp: <UTCDateTime> }, ... ],
//     disagree: [ { uid: <int>, timestamp: <UTCDateTime> }, ... ] }
//
// On success or failure, redirects back to showOneBook.php with the
// original bookID + editionID preserved.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');
require_once(__DIR__ . '/vendor/autoload.php');
require_once(__DIR__ . '/connMongo.php');

// -------------------------------------------------------------------------
// Read and validate POST params
// -------------------------------------------------------------------------
$vBookID      = filter_input(INPUT_POST, 'bookID',      FILTER_VALIDATE_INT);
$vEditionID   = filter_input(INPUT_POST, 'editionID',   FILTER_VALIDATE_INT);
$vReviewerUID = filter_input(INPUT_POST, 'reviewerUID', FILTER_VALIDATE_INT);
$vVote        = filter_input(INPUT_POST, 'vote',        FILTER_DEFAULT);
$vVoterUID    = isset($_SESSION['userID'])
    ? (int)$_SESSION['userID'] : 0;

// Whitelist the vote value
if ($vVote !== 'agree' && $vVote !== 'disagree') {
    header('Location: showAllBooks.php');
    exit;
}

// Validate IDs. editionID is preserved for the redirect only; the Mongo
// review document is keyed on (bid, uid) per the A5 insert script.
if (!$vBookID || !$vEditionID || !$vReviewerUID || !$vVoterUID) {
    header('Location: showAllBooks.php');
    exit;
}

// Rule 1: can't vote on your own review.
if ($vReviewerUID === $vVoterUID) {
    $vRedirect = 'showOneBook.php?bookID=' . $vBookID
               . '&editionID=' . $vEditionID
               . '&voteErr=self';
    header('Location: ' . $vRedirect);
    exit;
}

// -------------------------------------------------------------------------
// Apply the vote to MongoDB
// -------------------------------------------------------------------------
try {
    $vClient     = mongo_connect();
    $vCollection = $vClient->books_Team5->reviews;

    $vNow        = new MongoDB\BSON\UTCDateTime(
        (int)(microtime(true) * 1000));
    $vReviewKey  = ['bid' => $vBookID, 'uid' => $vReviewerUID];

    // Check the current state of the voter for this review.
    $vExisting = $vCollection->findOne($vReviewKey);
    if ($vExisting === null) {
        // Review doesn't exist; nothing to vote on.
        header('Location: showOneBook.php?bookID=' . $vBookID
             . '&editionID=' . $vEditionID);
        exit;
    }

    // Does the voter already have an entry in agree[] or disagree[]?
    $vExistingDoc = (array)$vExisting;
    $vAgreeArr    = isset($vExistingDoc['agree'])
        ? (array)$vExistingDoc['agree']    : [];
    $vDisagreeArr = isset($vExistingDoc['disagree'])
        ? (array)$vExistingDoc['disagree'] : [];

    $vAlreadyAgreed    = false;
    $vAlreadyDisagreed = false;
    foreach ($vAgreeArr as $vEntry) {
        $vEntryArr = (array)$vEntry;
        if ((int)($vEntryArr['uid'] ?? 0) === $vVoterUID) {
            $vAlreadyAgreed = true;
            break;
        }
    }
    foreach ($vDisagreeArr as $vEntry) {
        $vEntryArr = (array)$vEntry;
        if ((int)($vEntryArr['uid'] ?? 0) === $vVoterUID) {
            $vAlreadyDisagreed = true;
            break;
        }
    }

    // Rule 4: clicking the same button you already chose un-votes you.
    if ($vVote === 'agree' && $vAlreadyAgreed) {
        $vCollection->updateOne(
            $vReviewKey,
            ['$pull' => ['agree' => ['uid' => $vVoterUID]]]
        );
    } elseif ($vVote === 'disagree' && $vAlreadyDisagreed) {
        $vCollection->updateOne(
            $vReviewKey,
            ['$pull' => ['disagree' => ['uid' => $vVoterUID]]]
        );
    } else {
        // Rule 3: if you had the opposite vote, remove it first.
        if ($vVote === 'agree' && $vAlreadyDisagreed) {
            $vCollection->updateOne(
                $vReviewKey,
                ['$pull' => ['disagree' => ['uid' => $vVoterUID]]]
            );
        } elseif ($vVote === 'disagree' && $vAlreadyAgreed) {
            $vCollection->updateOne(
                $vReviewKey,
                ['$pull' => ['agree' => ['uid' => $vVoterUID]]]
            );
        }

        // Now push the new vote. Same shape as insertReviewAgreeDisagree.
        $vCollection->updateOne(
            $vReviewKey,
            ['$push' => [
                $vVote => [
                    'uid'       => $vVoterUID,
                    'timestamp' => $vNow,
                ],
            ]]
        );
    }
} catch (Exception $e) {
    error_log('voteReview failed: ' . $e->getMessage());
}

// -------------------------------------------------------------------------
// Redirect back to the book page
// -------------------------------------------------------------------------
$vRedirect = 'showOneBook.php?bookID=' . $vBookID
           . '&editionID=' . $vEditionID;
header('Location: ' . $vRedirect);
exit;
?>
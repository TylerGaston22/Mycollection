<?php
// -------------------------------------------------------------------------
// File name: getOneBook.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Query file for showOneBook.php. Defines functions that wrap
//            stored procedures and external APIs for book detail display.
//              - getOneBook($dbh, $bookID, $editionID)
//              - getBookAuthors($dbh, $bookID)
//              - getOpenLibraryURL($isbn, $authorName, $redis)
//              - getBookReviews($dbh, $bookID, $sortBy, $searchText, $voterUID)
//              - getAverageStars($bookID)
//
// Pattern taken from queryFunctionCall.php in cs445_php_web.pdf (slide 26):
// query file contains functions only, no output, no session logic.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
require_once(__DIR__ . '/authHelper.php');
require_once(__DIR__ . '/vendor/autoload.php');
require_once(__DIR__ . '/connMongo.php');

// -------------------------------------------------------------------------
// Function: getOneBook
// Purpose:  Return all detail fields for one book edition via the
//           GetBookEditionInfo stored procedure.
// Input:    $p_dbh      - open PDO handle
//           $p_bookID   - BookEdition.BookID
//           $p_editionID - BookEdition.EditionID
// Return:   associative row array or empty array on failure
// -------------------------------------------------------------------------
function getOneBook($p_dbh, $p_bookID, $p_editionID)
{
    $vRow = array();

    try {
        $vStmt = $p_dbh->prepare(
            'CALL GetBookEditionInfo(:bookID, :editionID)');
        $vStmt->bindValue(':bookID',    (int)$p_bookID,    PDO::PARAM_INT);
        $vStmt->bindValue(':editionID', (int)$p_editionID, PDO::PARAM_INT);
        $vStmt->execute();
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();

        if ($vRow === false) {
            $vRow = array();
        }
    } catch (PDOException $e) {
        error_log('getOneBook failed: ' . $e->getMessage());
    }

    return $vRow;
}

// -------------------------------------------------------------------------
// Function: getBookAuthors
// Purpose:  Return all authors for a given BookID from WrittenBy + Person.
//           Used to display author names and build OpenLibrary links.
// Input:    $p_dbh    - open PDO handle
//           $p_bookID - Book.BookID
// Return:   array of rows with AuthorID, FName, LName (empty on failure)
// -------------------------------------------------------------------------
function getBookAuthors($p_dbh, $p_bookID)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare(
            'CALL GetBookAuthors(:bookID)');
        $vStmt->bindValue(':bookID', (int)$p_bookID, PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('getBookAuthors failed: ' . $e->getMessage());
    }

    return $vRows;
}

// -------------------------------------------------------------------------
// Function: getOpenLibraryURL
// Purpose:  Look up an author's OpenLibrary page URL using the book ISBN.
//           Only called for ISBNs that start with the digit 9 per A5 spec.
//           Uses file_get_contents() + json_decode() per the class PDF.
//           If the author name does not match exactly, returns empty string.
//
//           Redis Bonus: cache the lookup under
//             Team_5:author:FNAME_LNAME:link
//           A cached value of "NONE" means OpenLibrary has no page for
//           that author; we return '' without re-querying. Per the
//           assignment spec, Redis data does not persist between
//           Codespace sessions, so cache rebuilds on each session.
// Input:    $p_isbn       - ISBN string (only call if starts with '9')
//           $p_authorName - full name string "FName LName" to match
//           $p_redis      - optional Redis handle from redis_connect();
//                           if null, the cache step is skipped.
// Return:   URL string or empty string if not found
// -------------------------------------------------------------------------
function getOpenLibraryURL($p_isbn, $p_authorName, $p_redis = null)
{
    if (strpos($p_isbn, '9') !== 0) {
        return '';
    }

    // Build the team-namespaced Redis key from the author's name.
    // Spaces -> underscores so the key matches the spec format.
    $vNameKey = str_replace(' ', '_', trim($p_authorName));
    $vCacheKey = 'Team_5:author:' . $vNameKey . ':link';

    if ($p_redis instanceof Redis) {
        try {
            $vCached = $p_redis->get($vCacheKey);
            if ($vCached !== false) {
                return ($vCached === 'NONE') ? '' : $vCached;
            }
        } catch (RedisException $e) {
            error_log('Redis get failed: ' . $e->getMessage());
        }
    }

    $vUrl = 'https://openlibrary.org/api/books?bibkeys=ISBN:'
          . urlencode($p_isbn)
          . '&format=json&jscmd=data';

    $vJson = @file_get_contents($vUrl);
    if ($vJson === false) {
        return '';
    }

    $vData = json_decode($vJson, true);
    if (empty($vData)) {
        return '';
    }

    $vKey   = 'ISBN:' . $p_isbn;
    $vFound = '';
    if (isset($vData[$vKey]['authors'])) {
        foreach ($vData[$vKey]['authors'] as $vAuthor) {
            $vOLName = isset($vAuthor['name']) ? $vAuthor['name'] : '';
            if (strcasecmp(trim($vOLName), trim($p_authorName)) === 0) {
                $vFound = isset($vAuthor['url']) ? $vAuthor['url'] : '';
                break;
            }
        }
    }

    if ($p_redis instanceof Redis) {
        try {
            $p_redis->set($vCacheKey, $vFound === '' ? 'NONE' : $vFound);
        } catch (RedisException $e) {
            error_log('Redis set failed: ' . $e->getMessage());
        }
    }

    return $vFound;
}

// -------------------------------------------------------------------------
// Function: getBookReviews
// Purpose:  Return MongoDB reviews for a book, optionally filtered by
//           partial text match and sorted by timestamp or stars.
//           Looks up reviewer FName + LName from Person table using uid.
//           Also computes agree/disagree counts and the usefulness metric
//           [agree - (disagree / 2)] from the MongoDB bonus arrays, and
//           reports whether the current logged-in user has voted on each
//           review (so the UI can highlight the active button).
//           Uses intval() on bid per MongoDB PHP class slides.
// Input:    $p_dbh       - open PDO handle (for reviewer name lookup)
//           $p_bookID    - Book.BookID integer
//           $p_sortBy    - 'newest' | 'oldest' | 'stars_desc' | 'stars_asc'
//           $p_search    - partial text filter string (empty = no filter)
//           $p_voterUID  - CustomerID of the logged-in user (0 = none)
// Return:   array of review documents with added fields:
//             'reviewer'      - full name string
//             'reviewerUID'   - int, the review author's PersonID
//             'agreeCount'    - int, size of the agree[] array
//             'disagreeCount' - int, size of the disagree[] array
//             'usefulMetric'  - float, agree - (disagree / 2)
//             'myVote'        - 'agree' | 'disagree' | '' for the voter
// -------------------------------------------------------------------------
function getBookReviews($p_dbh, $p_bookID, $p_sortBy, $p_search,
                        $p_voterUID = 0)
{
    $vReviews = array();

    try {
        $vClient     = mongo_connect();
        $vCollection = $vClient->books_Team5->reviews;

        $vFilter = ['bid' => intval($p_bookID)];
        if (!empty(trim($p_search))) {
            $vFilter['review'] = [
                '$regex'   => $p_search,
                '$options' => 'i',
            ];
        }

        switch ($p_sortBy) {
            case 'oldest':
                $vSort = ['timestamp' => 1];
                break;
            case 'stars_desc':
                $vSort = ['stars' => -1];
                break;
            case 'stars_asc':
                $vSort = ['stars' => 1];
                break;
            default:
                $vSort = ['timestamp' => -1];
        }

        $vCursor = $vCollection->find(
            $vFilter,
            ['sort' => $vSort]
        );

        foreach ($vCursor as $vDoc) {
            $vDocArr = (array)$vDoc;

            // Look up reviewer name from Person table using uid
            $vReviewerName = 'Anonymous';
            $vUID = intval($vDocArr['uid'] ?? 0);
            if ($vUID > 0) {
                try {
                    $vStmt = $p_dbh->prepare(
                        'SELECT GetCustomerName(:uid) AS FullName');
                    $vStmt->bindValue(':uid', $vUID, PDO::PARAM_INT);
                    $vStmt->execute();
                    $vPerson = $vStmt->fetch(PDO::FETCH_ASSOC);
                    $vStmt->closeCursor();
                    if ($vPerson
                        && !empty(trim($vPerson['FullName'] ?? ''))) {
                        $vReviewerName = trim($vPerson['FullName']);
                    }
                } catch (PDOException $e) {
                    error_log('reviewer lookup failed: '
                        . $e->getMessage());
                }
            }

            // Compute agree/disagree counts + usefulness metric.
            // MongoDB stores these as BSON arrays; cast and count.
            // Metric per A5 spec: agree - (disagree / 2) since
            // people tend to be overly negative.
            $vAgreeArr    = isset($vDocArr['agree'])
                ? (array)$vDocArr['agree']    : [];
            $vDisagreeArr = isset($vDocArr['disagree'])
                ? (array)$vDocArr['disagree'] : [];
            $vAgreeCount    = count($vAgreeArr);
            $vDisagreeCount = count($vDisagreeArr);
            $vMetric = $vAgreeCount - ($vDisagreeCount / 2);

            // Determine whether the logged-in user has voted on this
            // review, so the UI can highlight the active button.
            $vMyVote = '';
            if ($p_voterUID > 0) {
                foreach ($vAgreeArr as $vEntry) {
                    $vEntryArr = (array)$vEntry;
                    if ((int)($vEntryArr['uid'] ?? 0) === $p_voterUID) {
                        $vMyVote = 'agree';
                        break;
                    }
                }
                if ($vMyVote === '') {
                    foreach ($vDisagreeArr as $vEntry) {
                        $vEntryArr = (array)$vEntry;
                        if ((int)($vEntryArr['uid'] ?? 0) === $p_voterUID) {
                            $vMyVote = 'disagree';
                            break;
                        }
                    }
                }
            }

            $vDocArr['reviewer']       = $vReviewerName;
            $vDocArr['reviewerUID']    = $vUID;
            $vDocArr['agreeCount']     = $vAgreeCount;
            $vDocArr['disagreeCount']  = $vDisagreeCount;
            $vDocArr['usefulMetric']   = $vMetric;
            $vDocArr['myVote']         = $vMyVote;
            $vReviews[] = $vDocArr;
        }
    } catch (Exception $e) {
        error_log('getBookReviews failed: ' . $e->getMessage());
    }

    return $vReviews;
}

// -------------------------------------------------------------------------
// Function: getAverageStars
// Purpose:  Calculate average star rating across all reviews for a book.
// Input:    $p_bookID - Book.BookID integer
// Return:   float average (0.0 if no reviews)
// -------------------------------------------------------------------------
function getAverageStars($p_bookID)
{
    $vAvg = 0.0;

    try {
        $vClient     = mongo_connect();
        $vCollection = $vClient->books_Team5->reviews;

        $vCursor = $vCollection->find(['bid' => intval($p_bookID)]);

        $vTotal = 0;
        $vCount = 0;
        foreach ($vCursor as $vDoc) {
            $vTotal += intval($vDoc['stars']);
            $vCount++;
        }

        if ($vCount > 0) {
            $vAvg = $vTotal / $vCount;
        }
    } catch (Exception $e) {
        error_log('getAverageStars failed: ' . $e->getMessage());
    }

    return (float)$vAvg;
}
?>
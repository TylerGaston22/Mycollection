<?php
// -------------------------------------------------------------------------
// File name: getAllBooks.php
// Author:    Sydney and Tyler
// Date:      4/20/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Query file for showAllBooks.php. Defines functions that wrap
//            the stored procedures — the presentation file includes this
//            file, calls the functions, and renders the result.
//              - getAllBooks($dbh, $start, $num)
//              - countAllBookEditions($dbh)
//              - searchBooksByTitle($dbh, $title, $start, $num)
//              - countBooksByTitle($dbh, $title)
//              - getAllAuthors($dbh)
//              - searchBooksByAuthor($dbh, $authorID, $start, $num)
//              - countBooksByAuthor($dbh, $authorID)
//
// Pattern taken from queryFunctionCall.php in cs445_php_web.pdf (slide 26):
// query file contains functions only, no output, no session logic.
// -------------------------------------------------------------------------

require_once(__DIR__ . '/connDB.php');
require_once(__DIR__ . '/basicErrorHandling.php');
// Session guard — redirects to index.html if not logged in.
// Pattern: authHelper.php from cs445_php_web.pdf (slide 42).
require_once(__DIR__ . '/authHelper.php');

// -------------------------------------------------------------------------
// Function: getAllBooks
// Purpose:  Return one page of book editions (BookID, EditionID, ISBN,
//           Title, EditionName, Quantity, Authors). Stored proc
//           GetBookEditions sorts by ISBN DESC and applies LIMIT.
// Input:    $p_dbh   - open PDO handle
//           $p_start - zero-based start index for LIMIT
//           $p_num   - number of rows to fetch (4 per the A5 spec)
// Return:   array of associative rows (empty array on failure)
// -------------------------------------------------------------------------
function getAllBooks($p_dbh, $p_start, $p_num)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare('CALL GetBookEditions(:startIndex, :num)');
        $vStmt->bindValue(':startIndex', (int)$p_start, PDO::PARAM_INT);
        $vStmt->bindValue(':num',        (int)$p_num,   PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('getAllBooks failed: ' . $e->getMessage());
    }

    return $vRows;
}

// -------------------------------------------------------------------------
// Function: countAllBookEditions
// Purpose:  Return the total number of BookEdition rows, used to compute
//           the start index for the "Last 4" pagination button.
// Input:    $p_dbh - open PDO handle
// Return:   int total (0 on failure)
// -------------------------------------------------------------------------
function countAllBookEditions($p_dbh)
{
    $vTotal = 0;

    try {
        $vStmt = $p_dbh->prepare('CALL GetBookEditionsCount()');
        $vStmt->execute();
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();

        if (isset($vRow['Total'])) {
            $vTotal = (int)$vRow['Total'];
        }
    } catch (PDOException $e) {
        error_log('countAllBookEditions failed: ' . $e->getMessage());
    }

    return $vTotal;
}

// -------------------------------------------------------------------------
// Function: searchBooksByTitle
// Purpose:  Return one page of book editions whose title contains p_title
//           (partial match via LIKE in SearchBooksByTitle stored proc).
// Input:    $p_dbh   - open PDO handle
//           $p_title - search string
//           $p_start - zero-based start index
//           $p_num   - page size
// Return:   array of associative rows (empty array on failure)
// -------------------------------------------------------------------------
function searchBooksByTitle($p_dbh, $p_title, $p_start, $p_num)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare(
            'CALL SearchBooksByTitle(:title, :startIndex, :num)');
        $vStmt->bindValue(':title',      $p_title,       PDO::PARAM_STR);
        $vStmt->bindValue(':startIndex', (int)$p_start,  PDO::PARAM_INT);
        $vStmt->bindValue(':num',        (int)$p_num,    PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('searchBooksByTitle failed: ' . $e->getMessage());
    }

    return $vRows;
}

// -------------------------------------------------------------------------
// Function: countBooksByTitle
// Purpose:  Return the total number of editions matching a title search.
// Input:    $p_dbh   - open PDO handle
//           $p_title - search string
// Return:   int total (0 on failure)
// -------------------------------------------------------------------------
function countBooksByTitle($p_dbh, $p_title)
{
    $vTotal = 0;

    try {
        $vStmt = $p_dbh->prepare('CALL SearchBooksByTitleCount(:title)');
        $vStmt->bindValue(':title', $p_title, PDO::PARAM_STR);
        $vStmt->execute();
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();

        if (isset($vRow['Total'])) {
            $vTotal = (int)$vRow['Total'];
        }
    } catch (PDOException $e) {
        error_log('countBooksByTitle failed: ' . $e->getMessage());
    }

    return $vTotal;
}

// -------------------------------------------------------------------------
// Function: getAllAuthors
// Purpose:  Return all authors for the filter dropdown on showAllBooks.php.
//           Sorted by last name via GetAllAuthors stored proc.
// Input:    $p_dbh - open PDO handle
// Return:   array of associative rows with AuthorID and AuthorName
// -------------------------------------------------------------------------
function getAllAuthors($p_dbh)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare('CALL GetAllAuthors()');
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('getAllAuthors failed: ' . $e->getMessage());
    }

    return $vRows;
}

// -------------------------------------------------------------------------
// Function: searchBooksByAuthor
// Purpose:  Return one page of book editions written by a specific author.
//           Filters via WrittenBy in SearchBooksByAuthor stored proc.
// Input:    $p_dbh      - open PDO handle
//           $p_authorID - Author.AuthorID to filter by
//           $p_start    - zero-based start index
//           $p_num      - page size
// Return:   array of associative rows (empty array on failure)
// -------------------------------------------------------------------------
function searchBooksByAuthor($p_dbh, $p_authorID, $p_start, $p_num)
{
    $vRows = array();

    try {
        $vStmt = $p_dbh->prepare(
            'CALL SearchBooksByAuthor(:authorID, :startIndex, :num)');
        $vStmt->bindValue(':authorID',   (int)$p_authorID, PDO::PARAM_INT);
        $vStmt->bindValue(':startIndex', (int)$p_start,    PDO::PARAM_INT);
        $vStmt->bindValue(':num',        (int)$p_num,      PDO::PARAM_INT);
        $vStmt->execute();
        $vRows = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();
    } catch (PDOException $e) {
        error_log('searchBooksByAuthor failed: ' . $e->getMessage());
    }

    return $vRows;
}

// -------------------------------------------------------------------------
// Function: countBooksByAuthor
// Purpose:  Return total editions written by a specific author, used for
//           pagination in author-filter mode.
// Input:    $p_dbh      - open PDO handle
//           $p_authorID - Author.AuthorID to filter by
// Return:   int total (0 on failure)
// -------------------------------------------------------------------------
function countBooksByAuthor($p_dbh, $p_authorID)
{
    $vTotal = 0;

    try {
        $vStmt = $p_dbh->prepare('CALL SearchBooksByAuthorCount(:authorID)');
        $vStmt->bindValue(':authorID', (int)$p_authorID, PDO::PARAM_INT);
        $vStmt->execute();
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        $vStmt->closeCursor();

        if (isset($vRow['Total'])) {
            $vTotal = (int)$vRow['Total'];
        }
    } catch (PDOException $e) {
        error_log('countBooksByAuthor failed: ' . $e->getMessage());
    }

    return $vTotal;
}
?>

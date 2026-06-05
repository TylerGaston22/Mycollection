<?php
// -------------------------------------------------------------------------
// File name: showOneBook.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Presentation page — single book edition detail. Shows cover,
//            ISBN, title, authors with OpenLibrary links, retail price,
//            quantity in stock, Add to Cart button, MongoDB reviews with
//            sort and partial-text filter, average star rating, and
//            clickable agree/disagree buttons that POST to voteReview.php.
//            All DB work lives in getOneBook.php per the A5 query/
//            presentation split requirement.
// -------------------------------------------------------------------------

require_once('connDB.php');
require_once('connRedis.php');
require_once('basicErrorHandling.php');
require_once('authHelper.php');
require_once('getOneBook.php');

// -------------------------------------------------------------------------
// Read and validate GET params
// -------------------------------------------------------------------------
$vBookID    = filter_input(INPUT_GET, 'bookID',    FILTER_VALIDATE_INT);
$vEditionID = filter_input(INPUT_GET, 'editionID', FILTER_VALIDATE_INT);

if (!$vBookID || !$vEditionID) {
    header('Location: showAllBooks.php');
    exit;
}

// -------------------------------------------------------------------------
// Review sort + filter params
// -------------------------------------------------------------------------
$vSortBy = filter_input(INPUT_GET, 'sort', FILTER_DEFAULT);
$vAllowedSorts = ['newest', 'oldest', 'stars_desc', 'stars_asc'];
if (!in_array($vSortBy, $vAllowedSorts, true)) {
    $vSortBy = 'newest';
}

$vSearchText = filter_input(INPUT_GET, 'reviewSearch', FILTER_DEFAULT);
if ($vSearchText === null || $vSearchText === false) {
    $vSearchText = '';
}
$vSearchText = trim($vSearchText);

// -------------------------------------------------------------------------
// Load book data from MariaDB
// -------------------------------------------------------------------------
$vBook    = array();
$vAuthors = array();
$vReviews = array();
$vAvgStars = 0.0;
$vVoterUID = isset($_SESSION['userID']) ? (int)$_SESSION['userID'] : 0;

try {
    $vDbh     = db_connect();
    $vBook    = getOneBook($vDbh, $vBookID, $vEditionID);
    $vAuthors = getBookAuthors($vDbh, $vBookID);

    if (empty($vBook)) {
        db_close($vDbh);
        header('Location: showAllBooks.php');
        exit;
    }

    // OpenLibrary URLs — only for ISBNs starting with 9.
    // Open one Redis handle per request so all authors share the cache.
    // If Redis is unreachable we still fall through to OpenLibrary.
    $vISBN   = $vBook['ISBN'] ?? '';
    $vOLUrls = array();
    $vRedis  = null;
    try {
        $vRedis = redis_connect();
    } catch (Exception $e) {
        error_log('redis_connect failed: ' . $e->getMessage());
        $vRedis = null;
    }
    foreach ($vAuthors as $vA) {
        $vFullName  = trim(
            ($vA['FName'] ?? '') . ' ' . ($vA['LName'] ?? ''));
        $vAuthorID  = (int)($vA['AuthorID'] ?? 0);
        $vOLUrls[$vAuthorID] = getOpenLibraryURL(
            $vISBN, $vFullName, $vRedis);
    }
    redis_close($vRedis);

    // Load reviews — pass $vDbh so reviewer names can be looked up,
    // and pass the voter's UID so each review reports whether the
    // logged-in user has already voted on it.
    $vReviews  = getBookReviews(
        $vDbh, $vBookID, $vSortBy, $vSearchText, $vVoterUID);
    $vAvgStars = getAverageStars($vBookID);

    db_close($vDbh);
} catch (PDOException $e) {
    error_log('showOneBook DB failed: ' . $e->getMessage());
}

// -------------------------------------------------------------------------
// Helper: render star icons
// -------------------------------------------------------------------------
function renderStars($p_count)
{
    $vOut = '';
    for ($i = 1; $i <= 5; $i++) {
        $vOut .= ($i <= round($p_count)) ? '&#9733;' : '&#9734;';
    }
    return $vOut;
}

// Preserve current GET params for sort/filter links
$vBaseQS = 'bookID=' . $vBookID . '&editionID=' . $vEditionID;

require_once('header.php');
?>

<a class="back-link" href="showAllBooks.php">&larr; Back to all books</a>

<div style="display:grid;grid-template-columns:260px 1fr;gap:2.5rem;">

    <!-- Cover -->
    <div>
        <div style="border-radius:var(--radius);
                    border:1px solid var(--border);
                    overflow:hidden;
                    box-shadow:var(--shadow-card);
                    background:var(--secondary);
                    aspect-ratio:2/3;
                    display:grid;
                    place-items:center;">
            <?php if (!empty($vBook['CoverImageURL'])): ?>
                <img src="<?php
                        echo htmlspecialchars($vBook['CoverImageURL']); ?>"
                     alt="Cover of <?php
                        echo htmlspecialchars($vBook['Title'] ?? ''); ?>"
                     style="width:100%;height:100%;object-fit:cover;">
            <?php else: ?>
                <p style="font-family:'Instrument Serif',serif;
                          font-size:1.1rem;
                          text-align:center;
                          padding:1rem;
                          color:var(--muted-fg);">
                    <?php echo htmlspecialchars($vBook['Title'] ?? ''); ?>
                </p>
            <?php endif; ?>
        </div>
    </div>

    <!-- Details -->
    <div>
        <p style="font-family:monospace;font-size:0.75rem;
                  color:var(--muted-fg);">
            <?php echo htmlspecialchars($vISBN); ?>
        </p>

        <h1 style="font-size:2.8rem;line-height:1.1;margin-top:4px;">
            <?php echo htmlspecialchars($vBook['Title'] ?? ''); ?>
        </h1>

        <p style="margin-top:8px;color:var(--muted-fg);font-size:0.9rem;">
            <?php foreach ($vAuthors as $vIdx => $vA):
                $vFullName = htmlspecialchars(
                    trim(($vA['FName'] ?? '') . ' ' . ($vA['LName'] ?? ''))
                );
                $vAID  = (int)($vA['AuthorID'] ?? 0);
                $vAUrl = $vOLUrls[$vAID] ?? '';
                if ($vAUrl !== ''): ?>
                    <a href="<?php echo htmlspecialchars($vAUrl); ?>"
                       target="_blank"
                       style="text-decoration:underline;
                              text-underline-offset:3px;">
                        <?php echo $vFullName; ?>
                    </a>
                <?php else: ?>
                    <?php echo $vFullName; ?>
                <?php endif;
                if ($vIdx < count($vAuthors) - 1) echo ', ';
            endforeach; ?>
            &middot;
            <?php echo htmlspecialchars($vBook['EditionName'] ?? ''); ?>
        </p>

        <!-- Stars + review count -->
        <div style="display:flex;align-items:center;
                    gap:10px;margin-top:12px;">
            <span style="color:hsl(36,80%,55%);font-size:16px;">
                <?php echo renderStars($vAvgStars); ?>
            </span>
            <span style="font-size:0.85rem;color:var(--muted-fg);">
                <?php echo number_format($vAvgStars, 1); ?> avg
                &middot; <?php echo count($vReviews); ?> reviews
            </span>
        </div>

        <!-- Price + Add to Cart -->
        <div style="display:flex;align-items:center;
                    gap:1.5rem;margin-top:1.5rem;">
            <div>
                <div style="font-size:2rem;font-weight:500;">
                    $<?php echo number_format(
                        (float)($vBook['RetailPrice'] ?? 0), 2); ?>
                </div>
                <div style="font-size:0.8rem;color:var(--muted-fg);">
                    <?php echo (int)($vBook['Quantity'] ?? 0); ?> in stock
                </div>
            </div>

            <form method="POST" action="addToCart.php">
                <input type="hidden" name="bookID"
                       value="<?php echo $vBookID; ?>">
                <input type="hidden" name="editionID"
                       value="<?php echo $vEditionID; ?>">
                <input type="hidden" name="qty" value="1">
                <button type="submit"
                        class="btn btn-primary"
                        style="font-size:0.9rem;padding:10px 20px;">
                    <svg viewBox="0 0 24 24" width="16" height="16"
                         fill="none" stroke="currentColor"
                         stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61
                                 h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                </button>
            </form>
        </div>

        <!-- Reviews section -->
        <section style="margin-top:2.5rem;">

            <div style="display:flex;
                        align-items:center;
                        justify-content:space-between;
                        flex-wrap:wrap;
                        gap:10px;
                        margin-bottom:1rem;">
                <h2 style="font-size:1.8rem;">Reviews</h2>

                <!-- Sort + filter controls -->
                <form method="GET"
                      action="showOneBook.php"
                      style="display:flex;gap:8px;flex-wrap:wrap;">
                    <input type="hidden" name="bookID"
                           value="<?php echo $vBookID; ?>">
                    <input type="hidden" name="editionID"
                           value="<?php echo $vEditionID; ?>">
                    <input type="text"
                           name="reviewSearch"
                           placeholder="Search reviews&hellip;"
                           style="width:170px;"
                           value="<?php
                               echo htmlspecialchars($vSearchText); ?>">
                    <select name="sort"
                            onchange="this.form.submit()"
                            style="width:160px;">
                        <option value="newest"
                            <?php echo $vSortBy==='newest'
                                ?'selected':''; ?>>
                            Newest first
                        </option>
                        <option value="oldest"
                            <?php echo $vSortBy==='oldest'
                                ?'selected':''; ?>>
                            Oldest first
                        </option>
                        <option value="stars_desc"
                            <?php echo $vSortBy==='stars_desc'
                                ?'selected':''; ?>>
                            Highest rated
                        </option>
                        <option value="stars_asc"
                            <?php echo $vSortBy==='stars_asc'
                                ?'selected':''; ?>>
                            Lowest rated
                        </option>
                    </select>
                    <button type="submit" class="btn btn-sm">Filter</button>
                </form>
            </div>

            <?php if (empty($vReviews)): ?>
                <div class="card empty-state">No reviews match.</div>
            <?php else: ?>
                <?php foreach ($vReviews as $vR):
                    $vReviewer  = htmlspecialchars(
                        ($vR['reviewer'] ?? 'Anonymous'));
                    $vReviewTxt = htmlspecialchars(
                        ($vR['review']   ?? ''));
                    $vStars     = intval($vR['stars'] ?? 0);

                    // A5 bonus fields — agree/disagree counts + metric.
                    // Metric is agree - (disagree / 2) per the spec.
                    $vAgree       = intval($vR['agreeCount']    ?? 0);
                    $vDisagree    = intval($vR['disagreeCount'] ?? 0);
                    $vMetric      = (float)($vR['usefulMetric'] ?? 0);

                    // For the voting form: which review this is
                    // (keyed by bid+reviewerUID), whether the current
                    // user can vote on it, and which way they voted.
                    $vReviewerUID = (int)($vR['reviewerUID'] ?? 0);
                    $vMyVote      = $vR['myVote'] ?? '';
                    $vCanVote     = ($vVoterUID > 0
                                     && $vReviewerUID !== $vVoterUID);

                    // Format timestamp from MongoDB UTCDateTime
                    $vTs = '';
                    if (isset($vR['timestamp'])) {
                        $vDt = $vR['timestamp']->toDateTime();
                        $vDt->setTimezone(
                            new DateTimeZone('America/Los_Angeles'));
                        $vTs = $vDt->format('M j, Y g:i a');
                    }
                ?>
                    <div class="card"
                         style="padding:1rem 1.25rem;
                                margin-bottom:10px;">
                        <div style="display:flex;
                                    justify-content:space-between;
                                    align-items:flex-start;
                                    margin-bottom:8px;">
                            <div>
                                <p style="font-weight:500;
                                          font-size:0.9rem;">
                                    <?php echo $vReviewer; ?>
                                </p>
                                <p style="font-size:0.75rem;
                                          color:var(--muted-fg);">
                                    <?php echo $vTs; ?>
                                </p>
                            </div>
                            <span style="color:hsl(36,80%,55%);
                                         font-size:14px;">
                                <?php echo renderStars($vStars); ?>
                            </span>
                        </div>
                        <p style="font-size:0.88rem;line-height:1.6;">
                            <?php echo $vReviewTxt; ?>
                        </p>

                        <!-- Agree/Disagree buttons + usefulness metric.
                             Buttons POST to voteReview.php which writes
                             to MongoDB and redirects back here. The user
                             cannot vote on their own review. Clicking
                             the same button twice un-votes; clicking the
                             opposite button switches. -->
                        <div style="display:flex;
                                    align-items:center;
                                    gap:0.75rem;
                                    margin-top:12px;
                                    padding-top:10px;
                                    border-top:1px solid var(--border);
                                    font-size:0.78rem;
                                    color:var(--muted-fg);">

                            <?php if ($vCanVote): ?>
                                <form method="POST"
                                      action="voteReview.php"
                                      style="display:inline;">
                                    <input type="hidden" name="bookID"
                                        value="<?php echo $vBookID; ?>">
                                    <input type="hidden" name="editionID"
                                        value="<?php echo $vEditionID; ?>">
                                    <input type="hidden" name="reviewerUID"
                                        value="<?php echo $vReviewerUID; ?>">
                                    <input type="hidden" name="vote"
                                           value="agree">
                                    <button type="submit"
                                        title="<?php echo $vMyVote==='agree'
                                            ? 'Click again to remove your vote'
                                            : 'Click to agree'; ?>"
                                        style="cursor:pointer;
                                               background:<?php echo
                                                 $vMyVote==='agree'
                                                 ? 'var(--primary)'
                                                 : 'transparent'; ?>;
                                               color:<?php echo
                                                 $vMyVote==='agree'
                                                 ? 'var(--primary-fg)'
                                                 : 'inherit'; ?>;
                                               border:1px solid
                                                 var(--border);
                                               padding:4px 10px;
                                               border-radius:4px;
                                               font-size:0.78rem;">
                                        &#9650;
                                        <?php echo $vAgree; ?> agree
                                    </button>
                                </form>

                                <form method="POST"
                                      action="voteReview.php"
                                      style="display:inline;">
                                    <input type="hidden" name="bookID"
                                        value="<?php echo $vBookID; ?>">
                                    <input type="hidden" name="editionID"
                                        value="<?php echo $vEditionID; ?>">
                                    <input type="hidden" name="reviewerUID"
                                        value="<?php echo $vReviewerUID; ?>">
                                    <input type="hidden" name="vote"
                                           value="disagree">
                                    <button type="submit"
                                        title="<?php echo $vMyVote==='disagree'
                                            ? 'Click again to remove your vote'
                                            : 'Click to disagree'; ?>"
                                        style="cursor:pointer;
                                               background:<?php echo
                                                 $vMyVote==='disagree'
                                                 ? 'var(--destructive)'
                                                 : 'transparent'; ?>;
                                               color:<?php echo
                                                 $vMyVote==='disagree'
                                                 ? 'var(--primary-fg)'
                                                 : 'inherit'; ?>;
                                               border:1px solid
                                                 var(--border);
                                               padding:4px 10px;
                                               border-radius:4px;
                                               font-size:0.78rem;">
                                        &#9660;
                                        <?php echo $vDisagree; ?> disagree
                                    </button>
                                </form>
                            <?php else: ?>
                                <!-- Read-only counts (own review or
                                     no user session). -->
                                <span title="Number of users who agreed">
                                    &#9650; <?php echo $vAgree; ?> agree
                                </span>
                                <span title="Number of users who disagreed">
                                    &#9660;
                                    <?php echo $vDisagree; ?> disagree
                                </span>
                            <?php endif; ?>

                            <span title="agree - (disagree / 2)"
                                  style="margin-left:auto;
                                         font-family:monospace;">
                                metric:
                                <?php echo number_format($vMetric, 1); ?>
                            </span>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>

        </section>
    </div>
</div>

</main>
</body>
</html>
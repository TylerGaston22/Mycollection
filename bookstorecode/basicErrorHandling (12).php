<?php
// -------------------------------------------------------------------------
// File name: showCart.php
// Author:    Sydney and Tyler
// Date:      4/22/26
// Class:     CS 445
// Assignment: BookstoreDB PHP Front End
// Purpose:   Presentation page — cart items with cover, ISBN, title,
//            edition, authors, retail price, qty, line total. Shows
//            current discount and discounted total. Allows user to change
//            discount (valid only, or keep expired), change qty (+1/-1),
//            clear cart, choose shipping and checkout. Shows ad for
//            MostPopularBookInCarts if not already in cart.
// -------------------------------------------------------------------------

require_once('connDB.php');
require_once('basicErrorHandling.php');
require_once('authHelper.php');
require_once('getCart.php');

$vUID = (int)$_SESSION['userID'];

// -------------------------------------------------------------------------
// Load all data
// -------------------------------------------------------------------------
$vCartItems    = array();
$vDiscounts    = array();
$vShipping     = array();
$vCartTotal    = 0.0;
$vCurrentDiscID = null;
$vRecommended  = array();

try {
    $vDbh = db_connect();

    $vCartItems     = getCartItems($vDbh, $vUID);
    $vCurrentDiscID = getCartDiscount($vDbh, $vUID);
    $vDiscounts     = getValidDiscounts($vDbh, $vCurrentDiscID);
    $vShipping      = getAllShipping($vDbh);
    $vCartTotal     = getCartCost($vDbh, $vUID);
    $vRecommended   = getMostPopularBook($vDbh);

    db_close($vDbh);
} catch (PDOException $e) {
    error_log('showCart failed: ' . $e->getMessage());
}

// -------------------------------------------------------------------------
// Subtotal (pre-discount) for display
// -------------------------------------------------------------------------
$vSubtotal = 0.0;
foreach ($vCartItems as $vItem) {
    $vSubtotal += (float)($vItem['LineTotal'] ?? 0);
}

// -------------------------------------------------------------------------
// Check if recommended book is already in cart
// -------------------------------------------------------------------------
$vShowAd = false;
if (!empty($vRecommended)) {
    $vShowAd = true;
    foreach ($vCartItems as $vItem) {
        if ((int)$vItem['BookID']    === (int)$vRecommended['BookID']
        &&  (int)$vItem['EditionID'] === (int)$vRecommended['EditionID']) {
            $vShowAd = false;
            break;
        }
    }
}

// -------------------------------------------------------------------------
// Cart error message from addToCart/updateCart redirect
// -------------------------------------------------------------------------
$vCartError = '';
if (isset($_GET['cartError'])) {
    $vCartError = htmlspecialchars(
        filter_input(INPUT_GET, 'cartError') ?? '');
}

require_once('header.php');
?>

<div class="section-header">
    <h1>Your Cart</h1>
    <?php if ($vCartError !== ''): ?>
        <p style="color:var(--destructive);font-size:0.88rem;
                  margin-top:6px;">
            <?php echo $vCartError; ?>
        </p>
    <?php endif; ?>
</div>

<?php if (empty($vCartItems)): ?>
    <div class="card empty-state">
        Your cart is empty.
        <a href="showAllBooks.php"
           style="color:var(--primary);text-decoration:underline;
                  margin-left:4px;">
            Browse books
        </a>
    </div>
<?php else: ?>

<div style="display:grid;grid-template-columns:1fr 320px;gap:2rem;">

    <!-- Cart items -->
    <div>
        <?php foreach ($vCartItems as $vItem):
            $vBookID    = (int)$vItem['BookID'];
            $vEditionID = (int)$vItem['EditionID'];
            $vISBN      = htmlspecialchars($vItem['ISBN']        ?? '');
            $vTitle     = htmlspecialchars($vItem['Title']       ?? '');
            $vEdition   = htmlspecialchars($vItem['EditionName'] ?? '');
            $vAuthors   = htmlspecialchars($vItem['Authors']     ?? '');
            $vCover     = htmlspecialchars($vItem['CoverImageURL'] ?? '');
            $vPrice     = (float)($vItem['RetailPrice'] ?? 0);
            $vQty       = (int)($vItem['Quantity'] ?? 0);
            $vLine      = (float)($vItem['LineTotal'] ?? 0);
            $vDetailUrl = 'showOneBook.php?bookID=' . $vBookID
                        . '&editionID=' . $vEditionID;
        ?>
            <div class="card"
                 style="display:grid;
                        grid-template-columns:70px 1fr auto;
                        align-items:center;gap:1rem;
                        padding:1rem 1.1rem;margin-bottom:10px;">

                <!-- Cover -->
                <div style="aspect-ratio:2/3;width:70px;
                            border-radius:calc(var(--radius) - 2px);
                            background:var(--secondary);
                            display:grid;place-items:center;
                            overflow:hidden;">
                    <?php if ($vCover !== ''): ?>
                        <img src="<?php echo $vCover; ?>"
                             alt="Cover"
                             style="width:100%;height:100%;
                                    object-fit:cover;">
                    <?php else: ?>
                        <span style="font-family:'Instrument Serif',serif;
                                     font-size:0.6rem;text-align:center;
                                     color:var(--muted-fg);padding:4px;">
                            <?php echo $vTitle; ?>
                        </span>
                    <?php endif; ?>
                </div>

                <!-- Details -->
                <div>
                    <p style="font-family:monospace;font-size:0.75rem;
                               color:var(--muted-fg);">
                        <?php echo $vISBN; ?>
                    </p>
                    <a href="<?php echo $vDetailUrl; ?>"
                       style="font-family:'Instrument Serif',serif;
                              font-size:1.3rem;line-height:1.2;
                              color:inherit;">
                        <?php echo $vTitle; ?>
                    </a>
                    <p style="font-size:0.82rem;color:var(--muted-fg);">
                        <?php echo $vAuthors; ?>
                        &middot; <?php echo $vEdition; ?>
                    </p>
                    <p style="font-size:0.82rem;margin-top:4px;">
                        $<?php echo number_format($vPrice, 2); ?> each
                    </p>
                </div>

                <!-- Qty controls + line total -->
                <div style="display:flex;flex-direction:column;
                            align-items:flex-end;gap:8px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <form method="POST" action="updateCart.php">
                            <input type="hidden" name="bookID"
                                   value="<?php echo $vBookID; ?>">
                            <input type="hidden" name="editionID"
                                   value="<?php echo $vEditionID; ?>">
                            <input type="hidden" name="qty" value="-1">
                            <button type="submit"
                                    class="btn btn-sm btn-icon"
                                    title="Remove one">
                                &#8722;
                            </button>
                        </form>
                        <span style="width:28px;text-align:center;
                                     font-weight:500;">
                            <?php echo $vQty; ?>
                        </span>
                        <form method="POST" action="updateCart.php">
                            <input type="hidden" name="bookID"
                                   value="<?php echo $vBookID; ?>">
                            <input type="hidden" name="editionID"
                                   value="<?php echo $vEditionID; ?>">
                            <input type="hidden" name="qty" value="1">
                            <button type="submit"
                                    class="btn btn-sm btn-icon"
                                    title="Add one">
                                &#43;
                            </button>
                        </form>
                    </div>
                    <div style="font-weight:500;">
                        $<?php echo number_format($vLine, 2); ?>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Order summary sidebar -->
    <aside>
        <div class="card" style="padding:1.25rem;">
            <h2 style="font-size:1.5rem;margin-bottom:1rem;">
                Order summary
            </h2>

            <!-- Discount dropdown -->
            <form method="POST" action="updateCart.php"
                  style="margin-bottom:1rem;">
                <input type="hidden" name="action" value="discount">
                <label for="discount-select">Discount</label>
                <select id="discount-select"
                        name="discountID"
                        onchange="this.form.submit()"
                        style="margin-top:4px;">
                    <?php foreach ($vDiscounts as $vD):
                        $vDID   = (int)$vD['DiscountID'];
                        $vDName = htmlspecialchars(
                            $vD['DiscountName'] ?? '');
                        $vSel   = ($vDID === $vCurrentDiscID
                            || ($vCurrentDiscID === null
                                && strtolower($vDName) === 'none'))
                            ? 'selected' : '';
                    ?>
                        <option value="<?php echo $vDID; ?>"
                                <?php echo $vSel; ?>>
                            <?php echo $vDName; ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </form>

            <!-- Shipping dropdown -->
            <form method="POST" action="updateCart.php"
                  style="margin-bottom:1rem;">
                <input type="hidden" name="action" value="shipping">
                <label for="shipping-select">Shipping</label>
                <select id="shipping-select"
                        name="shippingID"
                        onchange="this.form.submit()"
                        style="margin-top:4px;">
                    <option value="0">Select shipping&hellip;</option>
                    <?php
                    $vSessionShipping = isset($_SESSION['shippingID'])
                        ? (int)$_SESSION['shippingID'] : 0;
                    $vShippingCost = 0.0;
                    foreach ($vShipping as $vS):
                        $vSID  = (int)$vS['ShippingID'];
                        $vSSel = ($vSID === $vSessionShipping)
                            ? 'selected' : '';
                        if ($vSID === $vSessionShipping) {
                            $vShippingCost = (float)$vS['ShippingCost'];
                        }
                    ?>
                        <option value="<?php echo $vSID; ?>"
                                <?php echo $vSSel; ?>>
                            <?php echo htmlspecialchars(
                                $vS['ShippingName']); ?>
                            &mdash;
                            $<?php echo number_format(
                                (float)$vS['ShippingCost'], 2); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </form>

            <!-- Totals -->
            <div style="font-size:0.85rem;border-top:1px solid var(--border);
                        padding-top:10px;margin-top:6px;">
                <div style="display:flex;justify-content:space-between;
                            padding:4px 0;">
                    <span style="color:var(--muted-fg);">Subtotal</span>
                    <span>$<?php echo number_format($vSubtotal, 2); ?></span>
                </div>
                <div style="display:flex;justify-content:space-between;
                            padding:4px 0;">
                    <span style="color:var(--muted-fg);">
                        After discount
                    </span>
                    <span>$<?php echo number_format($vCartTotal, 2); ?></span>
                </div>
                <div style="display:flex;justify-content:space-between;
                            padding:4px 0;">
                    <span style="color:var(--muted-fg);">Shipping</span>
                    <span>$<?php echo number_format($vShippingCost, 2); ?></span>
                </div>
                <div style="display:flex;justify-content:space-between;
                            padding:4px 0;
                            border-top:1px solid var(--border);
                            padding-top:8px;margin-top:4px;
                            font-weight:500;font-size:0.95rem;">
                    <span>Total</span>
                    <span>$<?php echo number_format(
                        $vCartTotal + $vShippingCost, 2); ?></span>
                </div>
            </div>

            <!-- Action buttons -->
            <div style="display:flex;flex-direction:column;
                        gap:8px;margin-top:1rem;">
                <form method="POST" action="checkout.php">
                    <button type="submit" class="btn btn-primary"
                            style="width:100%;justify-content:center;">
                        Checkout
                    </button>
                </form>
                <form method="POST" action="clearCart.php">
                    <button type="submit" class="btn"
                            style="width:100%;justify-content:center;">
                        <svg viewBox="0 0 24 24" width="14" height="14"
                             fill="none" stroke="currentColor"
                             stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8
                                     a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                        Clear Cart
                    </button>
                </form>
            </div>
        </div>

        <!-- Recommended book ad -->
        <?php if ($vShowAd && !empty($vRecommended)):
            $vRecBookID    = (int)$vRecommended['BookID'];
            $vRecEditionID = (int)$vRecommended['EditionID'];
            $vRecTitle     = htmlspecialchars(
                $vRecommended['Title'] ?? '');
            $vRecAuthors   = htmlspecialchars(
                $vRecommended['Authors'] ?? '');
            $vRecPrice     = (float)($vRecommended['RetailPrice'] ?? 0);
            $vRecCover     = htmlspecialchars(
                $vRecommended['CoverImageURL'] ?? '');
            $vRecUrl       = 'showOneBook.php?bookID=' . $vRecBookID
                           . '&editionID=' . $vRecEditionID;
        ?>
            <div class="card" style="padding:1.1rem;margin-top:1rem;">
                <p style="font-size:0.7rem;text-transform:uppercase;
                          letter-spacing:0.08em;color:var(--muted-fg);
                          margin-bottom:10px;">
                    Recommended for you
                </p>
                <div style="display:flex;gap:10px;">
                    <div style="aspect-ratio:2/3;width:56px;flex-shrink:0;
                                border-radius:calc(var(--radius)-2px);
                                background:var(--secondary);
                                display:grid;place-items:center;">
                        <?php if ($vRecCover !== ''): ?>
                            <img src="<?php echo $vRecCover; ?>"
                                 style="width:100%;height:100%;
                                        object-fit:cover;">
                        <?php else: ?>
                            <span style="font-family:'Instrument Serif',
                                         serif;font-size:0.5rem;
                                         text-align:center;
                                         color:var(--muted-fg);
                                         padding:3px;">
                                <?php echo $vRecTitle; ?>
                            </span>
                        <?php endif; ?>
                    </div>
                    <div>
                        <a href="<?php echo $vRecUrl; ?>"
                           style="font-family:'Instrument Serif',serif;
                                  font-size:1rem;line-height:1.2;
                                  color:inherit;">
                            <?php echo $vRecTitle; ?>
                        </a>
                        <p style="font-size:0.75rem;
                                  color:var(--muted-fg);">
                            <?php echo $vRecAuthors; ?>
                        </p>
                        <p style="font-size:0.82rem;margin-top:2px;">
                            $<?php echo number_format($vRecPrice, 2); ?>
                        </p>
                        <form method="POST" action="addToCart.php"
                              style="margin-top:6px;">
                            <input type="hidden" name="bookID"
                                   value="<?php echo $vRecBookID; ?>">
                            <input type="hidden" name="editionID"
                                   value="<?php echo $vRecEditionID; ?>">
                            <input type="hidden" name="qty" value="1">
                            <input type="hidden" name="returnTo"
                                   value="showCart.php">
                            <button type="submit"
                                    class="btn btn-primary btn-sm">
                                Add to Cart
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </aside>
</div>
<?php endif; ?>

</main>
</body>
</html>
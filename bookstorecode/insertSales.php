-- -----------------------------------------------------------------------------
-- File name:  Stored.sql
-- Author:     Sydney and Tyler
-- Date:       4/17/26
-- Class:      CS445
-- Assignment: BookstoreDB
-- Purpose:    To create stored procedures for BookstoreDB
-- -----------------------------------------------------------------------------

-- USE BookstoreDB_Team5;

DELIMITER $$

-- helper functions

-- -----------------------------------------------------------------------------
-- Function description: To get the FName and LName by customerID
-- Input:  CustomerID
-- Return: FName, LName
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetCustomerName
(p_CustomerID INT)
RETURNS VARCHAR (100)
DETERMINISTIC
BEGIN
	DECLARE	vFName VARCHAR(50);
	DECLARE vLName VARCHAR(50);
	DECLARE vFullName VARCHAR(100);

	SELECT FName, LName INTO vFName, vLName
	FROM Person, Customer
	WHERE Person.PersonID = Customer.CustomerID
	AND Customer.CustomerID = p_CustomerID;

	SET vFullName = CONCAT(vFName, ' ', vLName);
	return vFullName;
END $$

-- -----------------------------------------------------------------------------
-- Function description: To get the customerID by their first and last name
-- Input:  FName, LName
-- Return: Int - the customerID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetCustomerIDByName
(p_FName VARCHAR(50), p_LName VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE vCustomerID INT;

	SELECT Customer.CustomerID INTO vCustomerID
	FROM Person, Customer
	WHERE Customer.CustomerID = Person.PersonID
	AND Person.FName = p_FName
	AND Person.LName = p_LName
	LIMIT 1;

	RETURN vCustomerID;
END $$

-- -----------------------------------------------------------------------------
-- Function description: To get the bookID by its title
-- Input:  Title
-- Return: Int - the bookID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetBookIDByTitle
(p_Title VARCHAR(250))
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE vBookID INT;

	SELECT BookID INTO vBookID
	FROM Book
	WHERE Title = p_Title
	LIMIT 1;

	RETURN vBookID;
END $$

-- -----------------------------------------------------------------------------
-- Function description: To get the editionID by its edition name
-- Input:  EditionName
-- Return: Int - the editionID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetEditionIDByName
(p_EditionName VARCHAR(100))
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE vEditionID INT;

	SELECT EditionID INTO vEditionID
	FROM Edition
	WHERE EditionName = p_EditionName
	LIMIT 1;

	RETURN vEditionID;
END $$

-- -----------------------------------------------------------------------------
-- Function description: To get the cartID for a customer
-- Input:  CustomerID
-- Return: Int - the cartID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetCartIDByCustomerID
(p_CustomerID INT)
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE vCartID INT;

	SELECT CartID INTO vCartID
	FROM Customer
	WHERE CustomerID = p_CustomerID;

	RETURN vCartID;
END $$

-- -----------------------------------------------------------------------------
-- Function description: Total quantity of items in a customer's cart.
--                       Used by the nav badge on every page.
-- Input:  CustomerID
-- Return: Int - sum of CartContains.Quantity for the customer's cart, 0 if empty
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetCartCount
(p_CustomerID INT)
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE vCount INT;

	SELECT COALESCE(SUM(CartContains.Quantity), 0) INTO vCount
	FROM CartContains
	JOIN Customer ON Customer.CartID = CartContains.CartID
	WHERE Customer.CustomerID = p_CustomerID;

	RETURN vCount;
END $$

-- insertAuthors.php

-- -----------------------------------------------------------------------------
-- Procedure description: To add an author and person record if needed
-- Input:  FName, LName
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addAuthor 
	(p_FName VARCHAR(50), p_LName VARCHAR(50))
BEGIN
	DECLARE vPersonID INT;
	DECLARE VAuthorID INT;
	SELECT PersonID INTO vPersonID
	FROM Person
	WHERE FName = p_FName
	AND LName = p_LName;

	IF vPersonID IS NULL THEN
		INSERT INTO Person (FName, LName) VALUES (p_FName, p_LName);
		SET vPersonID = LAST_INSERT_ID();
	END IF;

	SELECT AuthorID INTO vAuthorID
  FROM Author
  WHERE AuthorID = vPersonID;

  IF vAuthorID IS NULL THEN
    INSERT INTO Author (AuthorID) VALUES (vPersonID);
  END IF;
END $$

-- insertUsers.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add a customer along with their order, cart, 
--                        and wishlist
-- Input: FName, LName, Username, HashedPasswd, Salt, JoinDate, Email
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addCustomer
	(p_FName VARCHAR(50), p_LName VARCHAR(50),
  p_Username VARCHAR(50), p_HashedPasswd VARCHAR(255),
	p_Salt VARCHAR(255), p_JoinDate DATETIME,
	p_Email VARCHAR(150))
BEGIN
	DECLARE vOrderID INT;
	DECLARE vPersonID INT;

	INSERT INTO Person (FName, LName) VALUES (p_FName, p_LName);
	SET vPersonID = LAST_INSERT_ID();

	INSERT INTO `Order` (DiscountID) VALUES (NULL);
	SET vOrderID = LAST_INSERT_ID(); 

	INSERT INTO Cart (CartID) VALUES (vOrderID);

	INSERT INTO Customer (CustomerID, CartID, Username, PasswordHash, Salt,
		JoinDate, EmailAddress) VALUES (vPersonID, vOrderID, p_Username, 
		p_HashedPasswd, p_Salt, p_JoinDate, p_Email);

	INSERT INTO WishList (WishListName, CustomerID)
		VALUES (CONCAT(p_FName, ' ', p_LName, '''s Wish List'), vPersonID);
END $$

-- insertBookEditions.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add a book edition with associated book, publisher,
-- and optional forward author
-- Input: CoverImageURL, Title, AuthorFName, AuthorLName, EditionName, 
--        PublisherName, PublishedDate, ISBN, Quantity, WholesalePrice, 
--        RetailPrice, ForwardFName, ForwardLName
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addBookEdition 
	(p_CoverImageURL VARCHAR(500), p_Title VARCHAR(100), p_AuthorFName VARCHAR(50),
	p_AuthorLName VARCHAR(50), p_EditionName VARCHAR(100), 
	p_PublisherName VARCHAR(100), p_PublishedDate DATETIME, p_ISBN VARCHAR(13), 
	p_Quantity INT, p_WholesalePrice DECIMAL(15,4), p_RetailPrice DECIMAL(15,4),
	p_ForwardFName VARCHAR(50), p_ForwardLName VARCHAR(50)
)

BEGIN
	DECLARE vBookID INT;
	DECLARE vEditionID INT;
	DECLARE vPublisherID INT;
	DECLARE vForwardPersonID INT;
	DECLARE vForwardAuthorID INT;
	SET vForwardAuthorID = NULL;

	-- Book
	SELECT BookID INTO vBookID FROM Book WHERE Title = p_Title LIMIT 1;
	IF vBookID IS NULL THEN
		INSERT INTO Book (Title) VALUES (p_Title);
		SET vBookID = LAST_INSERT_ID();
	END IF;

	-- Edition
	SELECT EditionID INTO vEditionID 
	FROM Edition 
	WHERE EditionName = p_EditionName LIMIT 1;
	IF vEditionID IS NULL THEN
		INSERT INTO Edition (EditionName) VALUES (p_EditionName);
		SET vEditionID = LAST_INSERT_ID();
	END IF;

	-- Publisher
	SELECT PublisherID INTO vPublisherID 
	FROM Publisher 
	WHERE PublisherName = p_PublisherName LIMIT 1;
	IF vPublisherID IS NULL THEN
		INSERT INTO Publisher (PublisherName)
		VALUES (p_PublisherName);
		SET vPublisherID = LAST_INSERT_ID();
	END IF;

	-- Optional forward author
	IF p_ForwardFName IS NOT NULL AND p_ForwardLName IS NOT NULL
	  AND p_ForwardFName <> '0' AND p_ForwardLName <> '0' THEN

		SELECT Person.PersonID INTO vForwardPersonID FROM Person 
		WHERE Person.FName = p_ForwardFName AND Person.LName = p_ForwardLName
		LIMIT 1;

		IF vForwardPersonID IS NULL THEN
			CALL addAuthor(p_ForwardFName, p_ForwardLName);

			SELECT Person.PersonID INTO vForwardPersonID FROM Person 
			WHERE Person.FName = p_ForwardFName AND Person.LName = p_ForwardLName
			LIMIT 1;
		END IF;

		SET vForwardAuthorID = vForwardPersonID;
	END IF;

	INSERT INTO BookEdition (BookID, EditionID, PublisherID, ForwardAuthorID,
		ISBN, CoverImageURL, PublishedDate, WholesalePrice, RetailPrice, Quantity)
	VALUES (vBookID, vEditionID, vPublisherID, vForwardAuthorID, p_ISBN,
		p_CoverImageURL, p_PublishedDate, p_WholesalePrice, p_RetailPrice, 
		p_Quantity);
END $$

-- insertWrote.php
-- -----------------------------------------------------------------------------
-- Procedure description: To associate an author with a book through WrittenBy
-- Input: FName, LName, Title
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addWrittenBy
(p_FName VARCHAR(50), p_LName VARCHAR(50), p_Title VARCHAR(100))

BEGIN
	DECLARE vAuthorID INT;
	DECLARE vBookID INT;

	SELECT AuthorID INTO vAuthorID 
	FROM Person, Author
	WHERE Author.`AuthorID` = Person.`PersonID`
	AND Person.FName = p_FName
	AND Person.LName = p_LName;

	SELECT BookID INTO vBookID
	FROM Book
	WHERE Title = p_Title;

	IF vAuthorID IS NOT NULL AND vBookID IS NOT NULL THEN
		INSERT IGNORE INTO WrittenBy (AuthorID, BookID) VALUES (vAuthorID, vBookID);
	END IF;
END $$

-- insertShipping.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add a shipping method
-- Input: ShippingName, Speed, ShippingCost
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addShipping
(p_ShippingName VARCHAR(100), p_Speed VARCHAR(50), 
p_ShippingCost DECIMAL(15,4))

BEGIN
INSERT INTO Shipping (ShippingName, `ShippingSpeed`, `ShippingCost`)
	VALUES (p_ShippingName, p_Speed, p_ShippingCost);
END $$

-- insertDiscount.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add a discount offer
-- Input: DiscountName, StartDate, EndDate, DollarAmount, PercentageAmount
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addDiscount
(p_DiscountName VARCHAR(100), p_StartDate DATETIME,
	p_EndDate DATETIME, p_DollarAmount DECIMAL(15,4),
	p_PercentageAmount DECIMAL(15,4))

	BEGIN
	INSERT INTO Discount (DiscountName, StartDate, EndDate,
		DollarAmount, PercentageAmount)
	VALUES (p_DiscountName, p_StartDate, p_EndDate,
		p_DollarAmount, p_PercentageAmount);
		
END $$

-- insertSales.php
-- -----------------------------------------------------------------------------
-- Procedure description: To create a sale and associated order record
-- Input: FName, LName, DiscountName, SaleDate, SaleTime, ShippingName
-- Output: OUT SaleID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addSale
(p_FName VARCHAR(50), p_LName VARCHAR(50), 
p_DiscountName VARCHAR(100), p_SaleDate DATE,
p_SaleTime TIME, p_ShippingName VARCHAR(100), 
OUT p_SaleID INT)

BEGIN
	DECLARE vCustomerID INT;
	DECLARE vDiscountID INT;
	DECLARE vShippingID INT;
	DECLARE vSaleTimestamp DATETIME;
	DECLARE vOrderID INT;

	SET vDiscountID = NULL;

	SET vCustomerID = GetCustomerIDByName(p_FName, p_LName);

	IF p_DiscountName IS NOT NULL AND TRIM(p_DiscountName) <> '' THEN
		SELECT Discount.DiscountID INTO vDiscountID
		FROM Discount
		WHERE Discount.DiscountName = p_DiscountName;
	END IF;

	SELECT Shipping.ShippingID INTO vShippingID
	FROM Shipping
	WHERE Shipping.ShippingName = p_ShippingName;

	SET vSaleTimestamp = TIMESTAMP(p_SaleDate, p_SaleTime);

	INSERT INTO `Order` (DiscountID)
	VALUES (vDiscountID);

	SET vOrderID = LAST_INSERT_ID();

	INSERT INTO Sale (SaleID, ShippingID, CustomerID, TimeStamp, TotalCost)
	VALUES (vOrderID, vShippingID, vCustomerID, vSaleTimestamp, 0.0000);

	SET p_SaleID = vOrderID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: To add an item to a sale order
-- Input: SaleID, Title, EditionName, Quantity
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addSaleItem
(p_SaleID INT, p_Title VARCHAR(100), 
p_EditionName VARCHAR(100), p_Quantity INT)

BEGIN
	DECLARE vBookID INT;
	DECLARE vEditionID INT;

	SET vBookID = GetBookIDByTitle(p_Title);

	SET vEditionID = GetEditionIDByName(p_EditionName);

	IF vBookID IS NOT NULL AND vEditionID IS NOT NULL THEN
		INSERT INTO SaleContains (SaleID, BookID, EditionID, Quantity)
		VALUES (p_SaleID, vBookID, vEditionID, p_Quantity);

	END IF;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: To calculate and update a sales total cost
-- Input: SaleID
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE updateSaleTotal
(p_SaleID INT)

BEGIN
	DECLARE vSubtotal DECIMAL(15,4);
	DECLARE vShippingCost DECIMAL(15,4);
	DECLARE vDollarAmount DECIMAL(15,4);
	DECLARE vPercentageAmount DECIMAL(15,4);
	DECLARE vTotalCost DECIMAL(15,4);

	SELECT SUM(BookEdition.RetailPrice * SaleContains.Quantity) INTO vSubtotal
	FROM SaleContains, BookEdition
	WHERE SaleContains.BookID = BookEdition.BookID
	AND SaleContains.EditionID = BookEdition.EditionID
	AND SaleContains.SaleID = p_SaleID;

	IF vSubtotal IS NULL THEN
		SET vSubtotal = 0.0000;
	END IF;

	SELECT Shipping.ShippingCost INTO vShippingCost
	FROM Sale, Shipping
	WHERE Sale.ShippingID = Shipping.ShippingID
	AND Sale.SaleID = p_SaleID;

	SELECT Discount.DollarAmount, Discount.PercentageAmount
	INTO vDollarAmount, vPercentageAmount
	FROM `Order`
	LEFT JOIN Discount
	ON `Order`.DiscountID = Discount.DiscountID
	WHERE `Order`.OrderID = p_SaleID;

	SET vTotalCost = vSubtotal;

	IF vDollarAmount IS NOT NULL THEN
		SET vTotalCost = vTotalCost - vDollarAmount;
	ELSEIF vPercentageAmount IS NOT NULL THEN
		SET vTotalCost = vTotalCost - (vSubtotal * vPercentageAmount);
	END IF;

	IF vTotalCost < 0 THEN
		SET vTotalCost = 0.0000;
	END IF;

	SET vTotalCost = vTotalCost + vShippingCost;

	UPDATE Sale
		SET TotalCost = vTotalCost
	WHERE SaleID = p_SaleID;
END $$


-- insertCart.php
-- -----------------------------------------------------------------------------
-- Procedure description: To apply a discount to a customers cart
-- Input: FName, LName, DiscountName
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addCartDiscount
(p_FName VARCHAR(50), p_LName VARCHAR(50),
p_DiscountName VARCHAR(100))

BEGIN
	DECLARE vCartID INT;
	DECLARE vDiscountID INT;
	DECLARE vCustomerID INT;

	SET vDiscountID = NULL;

	SET vCustomerID = GetCustomerIDByName(p_FName, p_LName);

	SET vCartID = GetCartIDByCustomerID(vCustomerID);

	IF p_DiscountName IS NOT NULL AND TRIM(p_DiscountName) <> '' THEN
		SELECT Discount.DiscountID INTO vDiscountID
		FROM Discount
		WHERE Discount.DiscountName = p_DiscountName;
	END IF;

	UPDATE `Order`
	SET DiscountID = vDiscountID
	WHERE OrderID = vCartID;
END $$

-- insertCart.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add an item to a customers cart
-- Input: FName, LName, Title, EditionName, Quantity
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addCartItem
(p_FName VARCHAR(50), p_LName VARCHAR(50),
p_Title VARCHAR(100), p_EditionName VARCHAR(100),
p_Quantity INT)

BEGIN
	DECLARE vCartID INT;
	DECLARE vBookID INT;
	DECLARE vEditionID INT;
	DECLARE vCustomerID INT;

	SET vCustomerID = GetCustomerIDByName(p_FName, p_LName);

	SET vCartID = GetCartIDByCustomerID(vCustomerID);

	SET vBookID = GetBookIDByTitle(p_Title);

	SET vEditionID = GetEditionIDByName(p_EditionName);

	IF vCartID IS NOT NULL AND vBookID IS NOT NULL AND vEditionID IS NOT NULL THEN
		INSERT INTO CartContains (CartID, BookID, EditionID, Quantity)
		VALUES (vCartID, vBookID, vEditionID, p_Quantity)
		ON DUPLICATE KEY UPDATE Quantity = Quantity + p_Quantity;

	END IF;
END $$

-- insertWishLists.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add a wishlist for a customer
-- Input: FName, LName, WishListName
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addWishList
(p_FName VARCHAR(50), p_LName VARCHAR(50),
p_WishListName VARCHAR(50))

BEGIN
	DECLARE vCustomerID INT;

	SET vCustomerID = GetCustomerIDByName(p_FName, p_LName);

	IF vCustomerID IS NOT NULL THEN
		INSERT IGNORE INTO WishList (WishListName, CustomerID)
		VALUES (p_WishListName, vCustomerID);
	END IF;
END $$

-- insertWishLists.php
-- -----------------------------------------------------------------------------
-- Procedure description: To add or update an item in a wishlist
-- Input: FName, LName, WishListName, Title, EditionName, Quantity, Note
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE addWishListItem
(p_FName VARCHAR(50), p_LName VARCHAR(50),
p_WishListName VARCHAR(50), p_Title VARCHAR(100),
p_EditionName VARCHAR(100), p_Quantity INT,
p_Note VARCHAR(255))

BEGIN
	DECLARE vWishListID INT;
	DECLARE vBookID INT;
	DECLARE vEditionID INT;
	DECLARE vCustomerID INT;

	SET vCustomerID = GetCustomerIDByName(p_FName, p_LName);

	SELECT WishList.WishListID INTO vWishListID
	FROM WishList
	WHERE WishList.CustomerID = vCustomerID
	AND WishList.WishListName = p_WishListName;

	SET vBookID = GetBookIDByTitle(p_Title);

	SET vEditionID = GetEditionIDByName(p_EditionName);

	IF vWishListID IS NOT NULL
	AND vBookID IS NOT NULL
	AND vEditionID IS NOT NULL THEN
		INSERT INTO WishListContains
		(WishListID, BookID, EditionID, Quantity, Note)
		VALUES (vWishListID, vBookID, vEditionID, p_Quantity, p_Note)
		ON DUPLICATE KEY UPDATE
			Quantity = p_Quantity,
			Note = p_Note;
	END IF;
END $$

-- insertBookReviews.php
-- -----------------------------------------------------------------------------
-- Procedure description: To return a bookID by title
-- Input: Title
-- Output: SELECT BookID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE getBookID (p_Title VARCHAR(250))
BEGIN
	SELECT BookID
	FROM Book
	WHERE Title = p_Title;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: To return a user ID by first and last name
-- Input: fName, lName
-- Output: SELECT PersonID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE getUserID (p_fName VARCHAR(50), p_lName VARCHAR(50))
BEGIN
	SELECT PersonID
	FROM Person
	WHERE FName = p_fName 
	AND LName = p_lName;
END $$

-- Stored Procedure Assignments

-- Query 1: Update User's Email(IN: UID, IN: email)
-- -----------------------------------------------------------------------------
-- Procedure description: To update a customers email address
-- Input: CID, Email
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE UpdateUserEmail (p_CID INT, p_Email VARCHAR(150))
BEGIN
	UPDATE `Customer` 
	SET `EmailAddress` = p_Email
	WHERE CustomerID = p_CID;
END $$

-- Query 2: GetUser (IN: UID, OUT: ????) 
-- -----------------------------------------------------------------------------
-- Procedure description: To retrieve customer user information
-- Input: UID
-- Output: FName, LName, Username, JoinDate, EmailAddress
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetUserInfo (p_CID INT) 
BEGIN
	SELECT FName, LName, Username, JoinDate, EmailAddress
	FROM Person, Customer
	WHERE PersonID = CustomerID
	AND CustomerID = p_CID;
END $$

-- Query 3: GetBookEditions(IN: StartIndex, IN: Number)
-- -----------------------------------------------------------------------------
-- Procedure description: Paged list of book editions for showAllBooks.php.
--                        Returns BookID and EditionID so each row can link
--                        through to showOneBook.php; Authors is built with
--                        GROUP_CONCAT over WrittenBy/Author/Person so the
--                        presentation layer fills the grid with one query.
--                        CoverImageURL included for thumbnail display.
-- Input:  startIndex, Num
-- Output: BookID, EditionID, ISBN, Title, EditionName, Quantity,
--         RetailPrice, CoverImageURL, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookEditions (p_startIndex INT, p_Num INT)
BEGIN
	SELECT
		Book.BookID,
		Edition.EditionID,
		BookEdition.ISBN,
		Book.Title,
		Edition.EditionName,
		BookEdition.Quantity,
		BookEdition.RetailPrice,
		BookEdition.CoverImageURL,
		(SELECT GROUP_CONCAT(CONCAT(Person.FName, ' ', Person.LName)
		                     ORDER BY Person.LName SEPARATOR ', ')
		 FROM WrittenBy
		 JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
		 JOIN Person ON Person.PersonID = Author.AuthorID
		 WHERE WrittenBy.BookID = Book.BookID) AS Authors
	FROM Book, Edition, BookEdition
	WHERE Book.BookID = BookEdition.BookID
	AND BookEdition.EditionID = Edition.EditionID
	ORDER BY BookEdition.ISBN DESC
	LIMIT p_startIndex, p_Num;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Total count of BookEdition rows. Used by
--                        showAllBooks.php to compute the start index for
--                        the "Last 4" pagination button.
-- Input:  none
-- Output: Total (INT)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookEditionsCount ()
BEGIN
	SELECT COUNT(*) AS Total
	FROM BookEdition;
END $$

-- Query 4: GetBookEditionInfo(IN: BookID, IN: EditionID, OUT:???) 
-- -----------------------------------------------------------------------------
-- Procedure description: To retrieve detailed information for a specific book edition
-- Input: BookID, EditionID
-- Output: Title, EditionName, ISBN, Quantity, RetailPrice, PublisherName,
--         CoverImageURL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookEditionInfo (p_BookID INT, p_EditionID INT)
BEGIN
    SELECT Title, EditionName, ISBN, Quantity, RetailPrice,
           PublisherName, BookEdition.CoverImageURL
    FROM Book, BookEdition, Edition, Publisher
    WHERE Book.BookID = BookEdition.BookID
    AND BookEdition.EditionID = Edition.EditionID
    AND BookEdition.PublisherID = Publisher.PublisherID
    AND BookEdition.BookID = p_BookID
    AND BookEdition.EditionID = p_EditionID;
END $$

-- Query 5: AlterBookEditionQtyInWishlist
-- (IN: UID, IN: BookID, IN: EditionID, IN: Qty, IN: Note, IN: WishListID)
-- -----------------------------------------------------------------------------
-- Procedure description: To add or update quantity and note for a wishlist item
-- Input: CustomerID, BookID, EditionID, Qty, Note, WishListID
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE AlterBookEditionQtyInWishlist 
(p_CustomerID INT, p_BookID INT, p_EditionID INT, p_Qty INT, 
	p_Note VARCHAR(255), p_WishListID INT)
BEGIN
	DECLARE vCount INT;
	DECLARE vNewQty INT;

	SELECT COUNT(*)
	INTO vCount
	FROM WishListContains, WishList
	WHERE WishList.WishListID = WishListContains.WishListID
	AND WishList.CustomerID = p_CustomerID
	AND WishList.WishListID = p_WishListID 
	AND BookID = p_BookID
	AND EditionID = p_EditionID;

	IF vCount > 0 THEN
		SELECT Quantity + p_Qty
		INTO vNewQty
		FROM WishListContains
		WHERE WishListID = p_WishListID 
		AND BookID = p_BookID
		AND EditionID = p_EditionID;

		IF vNewQty > 0 THEN
			UPDATE WishListContains 
			SET Quantity = vNewQty, Note = p_Note
			WHERE WishListID = p_WishListID 
			AND BookID = p_BookID
			AND EditionID = p_EditionID;
		ELSE
			DELETE FROM WishListContains
			WHERE WishListID = p_WishListID 
			AND BookID = p_BookID
			AND EditionID = p_EditionID;
		END IF;
	ELSE 
		IF p_Qty > 0 THEN
			INSERT INTO WishListContains (WishListID, BookID, EditionID, Quantity, Note)
			VALUES (p_WishListID, p_BookID, p_EditionID, p_Qty, p_Note);
		END IF;
	END IF;
END $$

-- Query 6: AlterBookEditionQtyInCart(IN: UID, IN: BookID, IN: EditionID, IN: Qty)
-- -----------------------------------------------------------------------------
-- Procedure description: To adjust a cart items quantity and maintain 
--                        inventory stock
-- Input: CustomerID, BookID, EditionID, Qty
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE AlterBookEditionQtyInCart 
(p_CustomerID INT, p_BookID INT, p_EditionID INT, p_Qty INT)
BEGIN
  DECLARE vCartID INT;
  DECLARE vStoreQty INT;
  DECLARE vCartQty INT DEFAULT 0;
  DECLARE vCount INT DEFAULT 0;

  START TRANSACTION;

	-- get users cart
	SET vCartID = GetCartIDByCustomerID(p_CustomerID);

	-- get store stock 
  SELECT Quantity INTO vStoreQty
  FROM BookEdition
  WHERE BookID = p_BookID
	AND EditionID = p_EditionID;

	-- check if book is in cart
  SELECT COUNT(*) INTO vCount
  FROM CartContains
  WHERE CartContains.CartID = vCartID
  AND BookID = p_BookID
  AND EditionID = p_EditionID;

  IF vCount > 0 THEN
    SELECT Quantity INTO vCartQty
    FROM CartContains
    WHERE CartContains.CartID = vCartID
    AND BookID = p_BookID
    AND EditionID = p_EditionID;
  END IF;

	-- user adding to cart 
  IF p_Qty > 0 THEN
    IF vStoreQty < p_Qty THEN
      ROLLBACK;
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Not enough stock';
    END IF;

    UPDATE BookEdition
    SET Quantity = Quantity - p_Qty
    WHERE BookID = p_BookID
    AND EditionID = p_EditionID;

    IF vCount = 0 THEN
      INSERT INTO CartContains (CartID, BookID, EditionID, Quantity)
        VALUES (vCartID, p_BookID, p_EditionID, p_Qty);
    ELSE
      UPDATE CartContains
      SET Quantity = Quantity + p_Qty
      WHERE CartContains.CartID = vCartID
      AND BookID = p_BookID
      AND EditionID = p_EditionID;
    END IF;
  END IF;

	-- removing from cart
  IF p_Qty < 0 THEN
    IF vCartQty < ABS(p_Qty) THEN
      ROLLBACK;
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot remove more than cart contains';
    END IF;

  	UPDATE BookEdition
  	SET Quantity = Quantity + ABS(p_Qty)
  	WHERE BookID = p_BookID
  	AND EditionID = p_EditionID;

    IF vCartQty = ABS(p_Qty) THEN
      DELETE FROM CartContains
      WHERE CartContains.CartID = vCartID
      AND BookID = p_BookID
      AND EditionID = p_EditionID;
    ELSE
      UPDATE CartContains
      SET Quantity = Quantity - ABS(p_Qty)
      WHERE CartContains.CartID = vCartID
      AND BookID = p_BookID
      AND EditionID = p_EditionID;
    END IF;
  END IF;

    COMMIT;
END $$

-- Query7: MostPopularBookInCarts(OUT: BookID, OUT: EditionID)
-- -----------------------------------------------------------------------------
-- Procedure description: To find the most popular book edition in carts
-- Input: none
-- Output: OUT BookID, OUT EditionID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE MostPopularBookInCarts
(OUT p_BookID INT, OUT p_EditionID INT)
BEGIN
	SELECT CartContains.BookID, CartContains.EditionID INTO p_BookID, p_EditionID
	FROM CartContains, BookEdition
	WHERE CartContains.BookID = BookEdition.BookID
	AND CartContains.EditionID = BookEdition.EditionID
	GROUP BY CartContains.BookID, CartContains.EditionID, BookEdition.ISBN
	ORDER BY COUNT(*) DESC, BookEdition.ISBN DESC
	LIMIT 1;
END $$

-- Query8: GetCartCost(IN: UID, OUT: TotalCost)
-- -----------------------------------------------------------------------------
-- Procedure description: To calculate the total cost of a customers cart 
--                        including discounts
-- Input: Customer
-- Output: OUT TotalCost
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetCartCost (p_Customer INT, OUT p_TotalCost DECIMAL(15,4))
BEGIN
	DECLARE CartID INT;
	DECLARE Subtotal DECIMAL(15,4);
	DECLARE DiscountID INT;
	DECLARE DollarAmount DECIMAL(15,4);
	DECLARE PercentageAmount DECIMAL(15,4);

	SELECT Customer.CartID INTO CartID
	FROM Customer
	WHERE CustomerID = p_Customer;

	SELECT SUM(BookEdition.RetailPrice * CartContains.Quantity) INTO Subtotal
	FROM CartContains, BookEdition
	WHERE CartContains.BookID = BookEdition.BookID
	AND CartContains.EditionID = BookEdition.EditionID
	AND CartContains.CartID = CartID;

	IF Subtotal IS NULL THEN
		SET Subtotal = 0.0000;
	END IF;

	SELECT `Order`.DiscountID INTO DiscountID
	FROM `Order`
	WHERE OrderID = CartID;

	SET p_TotalCost = Subtotal;

	IF DiscountID IS NOT NULL THEN
		SELECT Discount.DollarAmount, Discount.PercentageAmount
		INTO DollarAmount, PercentageAmount
		FROM Discount
		WHERE Discount.DiscountID = DiscountID;

		IF DollarAmount IS NOT NULL THEN
			SET p_TotalCost = p_TotalCost - DollarAmount;
		ELSEIF PercentageAmount IS NOT NULL THEN
			SET p_TotalCost = p_TotalCost - (p_TotalCost * PercentageAmount);
		END IF;
	END IF;

	IF p_TotalCost < 0 THEN
		SET p_TotalCost = 0.0000;
	END IF;
END $$

-- Query9: ClearCart_NoPurchase(IN: UID)
-- -----------------------------------------------------------------------------
-- Procedure description: To clear a customers cart and restore stock without 
--                        purchase
-- Input: UID
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE ClearCart_NoPurchase (p_UID INT)
BEGIN
	DECLARE vCartID INT;
	DECLARE vBookID INT;
	DECLARE vEditionID INT;
	DECLARE vQty INT;
	DECLARE done INT DEFAULT 0;

	DECLARE cart_cursor CURSOR FOR
		SELECT CartContains.BookID, CartContains.EditionID, Quantity
		FROM CartContains
		WHERE CartContains.CartID = vCartID;

	DECLARE CONTINUE HANDLER FOR NOT FOUND
		SET done = 1;

	SET vCartID = GetCartIDByCustomerID(p_UID);

	OPEN cart_cursor;

	read_loop: LOOP
		FETCH cart_cursor INTO vBookID, vEditionID, vQty;

		IF done = 1 THEN
			LEAVE read_loop;
		END IF;

		UPDATE BookEdition
		SET Quantity = Quantity + vQty
		WHERE BookEdition.BookID = vBookID
		AND BookEdition.EditionID = vEditionID;
	END LOOP;

	CLOSE cart_cursor;

	DELETE FROM CartContains
	WHERE CartContains.CartID = vCartID;

	UPDATE `Order`
	SET DiscountID = NULL
	WHERE OrderID = vCartID;
END $$

-- Query10: CreateAccount(IN: all account info, including salt and hashed password)
-- -----------------------------------------------------------------------------
-- Procedure description: To create a new customer account using addCustomer
-- Input: FName, LName, Username, HashedPasswd, Salt, JoinDate, Email
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE CreateAccount
(p_FName VARCHAR(50), p_LName VARCHAR(50), p_Username VARCHAR(50),
p_HashedPasswd VARCHAR(255), p_Salt VARCHAR(255), p_JoinDate DATETIME, 
p_Email VARCHAR(150))
BEGIN
	CALL addCustomer (p_FName, p_LName, p_Username, p_HashedPasswd, p_Salt,
		p_JoinDate, p_Email);
END $$


-- -----------------------------------------------------------------------------
-- showAllBooks search procedures
-- -----------------------------------------------------------------------------
-- Procedure description: Paged title search for showAllBooks.php.
--                        Partial match on Book.Title using LIKE.
--                        Returns same columns as GetBookEditions.
-- Input:  p_Title — search string (wrapped in % on both sides inside proc)
--         p_startIndex, p_Num — pagination
-- Output: BookID, EditionID, ISBN, Title, EditionName, Quantity,
--         RetailPrice, CoverImageURL, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SearchBooksByTitle
(p_Title VARCHAR(250), p_startIndex INT, p_Num INT)
BEGIN
    SELECT
        Book.BookID,
        Edition.EditionID,
        BookEdition.ISBN,
        Book.Title,
        Edition.EditionName,
        BookEdition.Quantity,
        BookEdition.RetailPrice,
        BookEdition.CoverImageURL,
        (SELECT GROUP_CONCAT(CONCAT(Person.FName, ' ', Person.LName)
                             ORDER BY Person.LName SEPARATOR ', ')
         FROM WrittenBy
         JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
         JOIN Person ON Person.PersonID = Author.AuthorID
         WHERE WrittenBy.BookID = Book.BookID) AS Authors
    FROM Book, Edition, BookEdition
    WHERE Book.BookID = BookEdition.BookID
    AND BookEdition.EditionID = Edition.EditionID
    AND Book.Title LIKE CONCAT('%', p_Title, '%')
    ORDER BY BookEdition.ISBN DESC
    LIMIT p_startIndex, p_Num;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Count of BookEdition rows matching a title search.
-- Input:  p_Title — search string
-- Output: Total
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SearchBooksByTitleCount (p_Title VARCHAR(250))
BEGIN
    SELECT COUNT(*) AS Total
    FROM Book, BookEdition
    WHERE Book.BookID = BookEdition.BookID
    AND Book.Title LIKE CONCAT('%', p_Title, '%');
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: All authors for the showAllBooks dropdown.
--                        Returns AuthorID and full name sorted by last name.
-- Input:  none
-- Output: AuthorID, AuthorName
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetAllAuthors ()
BEGIN
    SELECT Author.AuthorID,
           CONCAT(Person.FName, ' ', Person.LName) AS AuthorName
    FROM Author
    JOIN Person ON Person.PersonID = Author.AuthorID
    ORDER BY Person.LName, Person.FName;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Paged author filter for showAllBooks.php.
--                        Filters by AuthorID through WrittenBy.
--                        Returns same columns as GetBookEditions.
-- Input:  p_AuthorID — Author.AuthorID to filter by
--         p_startIndex, p_Num — pagination
-- Output: BookID, EditionID, ISBN, Title, EditionName, Quantity,
--         RetailPrice, CoverImageURL, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SearchBooksByAuthor
(p_AuthorID INT, p_startIndex INT, p_Num INT)
BEGIN
    SELECT
        Book.BookID,
        Edition.EditionID,
        BookEdition.ISBN,
        Book.Title,
        Edition.EditionName,
        BookEdition.Quantity,
        BookEdition.RetailPrice,
        BookEdition.CoverImageURL,
        (SELECT GROUP_CONCAT(CONCAT(Person.FName, ' ', Person.LName)
                             ORDER BY Person.LName SEPARATOR ', ')
         FROM WrittenBy
         JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
         JOIN Person ON Person.PersonID = Author.AuthorID
         WHERE WrittenBy.BookID = Book.BookID) AS Authors
    FROM Book
    JOIN BookEdition ON BookEdition.BookID = Book.BookID
    JOIN Edition     ON Edition.EditionID  = BookEdition.EditionID
    JOIN WrittenBy AS wb ON wb.BookID = Book.BookID
    WHERE wb.AuthorID = p_AuthorID
    ORDER BY BookEdition.ISBN DESC
    LIMIT p_startIndex, p_Num;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Count of BookEdition rows for a given author.
-- Input:  p_AuthorID — Author.AuthorID to filter by
-- Output: Total
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SearchBooksByAuthorCount (p_AuthorID INT)
BEGIN
    SELECT COUNT(*) AS Total
    FROM BookEdition
    JOIN WrittenBy ON WrittenBy.BookID = BookEdition.BookID
    WHERE WrittenBy.AuthorID = p_AuthorID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return all authors for a given BookID.
--                        Used by showOneBook.php to display author names
--                        and build OpenLibrary links.
-- Input:  p_BookID - Book.BookID
-- Output: AuthorID, FName, LName
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookAuthors (p_BookID INT)
BEGIN
    SELECT Author.AuthorID, Person.FName, Person.LName
    FROM WrittenBy
    JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
    JOIN Person ON Person.PersonID = Author.AuthorID
    WHERE WrittenBy.BookID = p_BookID
    ORDER BY Person.LName, Person.FName;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Look up login row for a username. Returns the
--                        CustomerID, stored PasswordHash, and Salt so PHP
--                        can run password_verify() on the application side.
-- Input:  p_Username
-- Output: CustomerID, PasswordHash, Salt
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetCustomerLogin (p_Username VARCHAR(150))
BEGIN
    SELECT CustomerID, PasswordHash, Salt
    FROM Customer
    WHERE Username = p_Username
    LIMIT 1;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return the FName + LName of every customer.
--                        Used by the CLI script that generates random
--                        agree/disagree votes for review seed data.
-- Input:  none
-- Output: FName, LName
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetAllCustomerNames ()
BEGIN
    SELECT Person.FName, Person.LName
    FROM Person
    JOIN Customer ON Customer.CustomerID = Person.PersonID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Set (or clear) the discount on a customer's cart.
--                        Pass NULL for p_DiscountID to clear.
-- Input:  p_CustomerID, p_DiscountID (nullable)
-- Output: none
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SetCartDiscount
    (p_CustomerID INT, p_DiscountID INT)
BEGIN
    UPDATE `Order`
    JOIN Customer ON Customer.CartID = `Order`.OrderID
    SET `Order`.DiscountID = p_DiscountID
    WHERE Customer.CustomerID = p_CustomerID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return all past sales (orders) for a customer,
--                        newest first. Joins shipping + discount for display
--                        and computes total qty from SaleContains.
-- Input:  p_CustomerID
-- Output: SaleID, TimeStamp, TotalCost, ShippingName, ShippingCost,
--         DiscountName, DollarAmount, PercentageAmount, TotalQty
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetUserOrders (p_CustomerID INT)
BEGIN
    SELECT
        Sale.SaleID,
        Sale.TimeStamp,
        Sale.TotalCost,
        Shipping.ShippingName,
        Shipping.ShippingCost,
        IFNULL(Discount.DiscountName, 'None') AS DiscountName,
        Discount.DollarAmount,
        Discount.PercentageAmount,
        (SELECT SUM(Quantity)
         FROM SaleContains
         WHERE SaleContains.SaleID = Sale.SaleID) AS TotalQty
    FROM Sale
    JOIN Shipping ON Shipping.ShippingID = Sale.ShippingID
    JOIN `Order`  ON `Order`.OrderID     = Sale.SaleID
    LEFT JOIN Discount ON Discount.DiscountID = `Order`.DiscountID
    WHERE Sale.CustomerID = p_CustomerID
    ORDER BY Sale.TimeStamp DESC;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return header info for one Sale, with ownership
--                        check by CustomerID.
-- Input:  p_SaleID, p_CustomerID
-- Output: SaleID, TimeStamp, TotalCost, ShippingName, ShippingCost,
--         DiscountName, DollarAmount, PercentageAmount
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetSaleHeader (p_SaleID INT, p_CustomerID INT)
BEGIN
    SELECT
        Sale.SaleID,
        Sale.TimeStamp,
        Sale.TotalCost,
        Shipping.ShippingName,
        Shipping.ShippingCost,
        IFNULL(Discount.DiscountName, 'None') AS DiscountName,
        Discount.DollarAmount,
        Discount.PercentageAmount
    FROM Sale
    JOIN Shipping ON Shipping.ShippingID = Sale.ShippingID
    JOIN `Order`  ON `Order`.OrderID     = Sale.SaleID
    LEFT JOIN Discount ON Discount.DiscountID = `Order`.DiscountID
    WHERE Sale.SaleID     = p_SaleID
    AND   Sale.CustomerID = p_CustomerID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return all line items in a sale with full book
--                        and edition detail, including a comma-separated
--                        list of authors per book.
-- Input:  p_SaleID
-- Output: BookID, EditionID, ISBN, Title, EditionName, CoverImageURL,
--         RetailPrice, Quantity, LineTotal, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetSaleItems (p_SaleID INT)
BEGIN
    SELECT
        BookEdition.BookID,
        BookEdition.EditionID,
        BookEdition.ISBN,
        Book.Title,
        Edition.EditionName,
        BookEdition.CoverImageURL,
        BookEdition.RetailPrice,
        SaleContains.Quantity,
        (BookEdition.RetailPrice * SaleContains.Quantity) AS LineTotal,
        (SELECT GROUP_CONCAT(
            CONCAT(Person.FName, ' ', Person.LName)
            ORDER BY Person.LName SEPARATOR ', ')
         FROM WrittenBy
         JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
         JOIN Person ON Person.PersonID = Author.AuthorID
         WHERE WrittenBy.BookID = Book.BookID) AS Authors
    FROM SaleContains
    JOIN BookEdition
        ON BookEdition.BookID     = SaleContains.BookID
        AND BookEdition.EditionID = SaleContains.EditionID
    JOIN Book    ON Book.BookID       = BookEdition.BookID
    JOIN Edition ON Edition.EditionID = BookEdition.EditionID
    WHERE SaleContains.SaleID = p_SaleID
    ORDER BY Book.Title ASC;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return all line items in a customer's cart, with
--                        full book detail and a comma-separated author list.
-- Input:  p_CustomerID
-- Output: BookID, EditionID, ISBN, Title, EditionName, CoverImageURL,
--         RetailPrice, Quantity, LineTotal, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetCartItems (p_CustomerID INT)
BEGIN
    SELECT
        BookEdition.BookID,
        BookEdition.EditionID,
        BookEdition.ISBN,
        Book.Title,
        Edition.EditionName,
        BookEdition.CoverImageURL,
        BookEdition.RetailPrice,
        CartContains.Quantity,
        (BookEdition.RetailPrice * CartContains.Quantity) AS LineTotal,
        (SELECT GROUP_CONCAT(
            CONCAT(Person.FName, ' ', Person.LName)
            ORDER BY Person.LName SEPARATOR ', ')
         FROM WrittenBy
         JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
         JOIN Person ON Person.PersonID = Author.AuthorID
         WHERE WrittenBy.BookID = Book.BookID) AS Authors
    FROM CartContains
    JOIN BookEdition
        ON BookEdition.BookID    = CartContains.BookID
        AND BookEdition.EditionID = CartContains.EditionID
    JOIN Book     ON Book.BookID       = BookEdition.BookID
    JOIN Edition  ON Edition.EditionID = BookEdition.EditionID
    JOIN Customer ON Customer.CustomerID = p_CustomerID
    WHERE CartContains.CartID = Customer.CartID
    ORDER BY Book.Title ASC;
END $$

-- -----------------------------------------------------------------------------
-- Function description: Return the DiscountID currently applied to a
--                       customer's cart Order, or NULL if no discount.
-- Input:  p_CustomerID
-- Return: Int DiscountID (or NULL)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetCartDiscountID (p_CustomerID INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE vDiscountID INT;

    SELECT `Order`.DiscountID INTO vDiscountID
    FROM Customer
    JOIN `Order` ON `Order`.OrderID = Customer.CartID
    WHERE Customer.CustomerID = p_CustomerID;

    RETURN vDiscountID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return discounts valid today (StartDate <= NOW
--                        <= EndDate). If p_CurrentDiscountID is non-null,
--                        also include that discount even if expired (per
--                        A5 spec: a cart that already holds an expired
--                        discount may keep using it). The "None"
--                        placeholder discount has NULL dates so it is
--                        always included; it is sorted to the top.
-- Input:  p_CurrentDiscountID (nullable)
-- Output: DiscountID, DiscountName, DollarAmount, PercentageAmount
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetValidDiscounts (p_CurrentDiscountID INT)
BEGIN
    SELECT DiscountID, DiscountName, DollarAmount, PercentageAmount
    FROM Discount
    WHERE (
            (StartDate IS NULL OR StartDate <= NOW())
        AND (EndDate   IS NULL OR EndDate   >= NOW())
    )
    OR (p_CurrentDiscountID IS NOT NULL
        AND DiscountID = p_CurrentDiscountID)
    ORDER BY CASE WHEN DiscountName = 'None' THEN 0 ELSE 1 END,
             DiscountName ASC;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return all shipping methods, cheapest first.
-- Input:  none
-- Output: ShippingID, ShippingName, ShippingSpeed, ShippingCost
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetAllShipping ()
BEGIN
    SELECT ShippingID, ShippingName, ShippingSpeed, ShippingCost
    FROM Shipping
    ORDER BY ShippingCost ASC;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Return one BookEdition row with full display
--                        detail (title, edition, ISBN, cover, price) and a
--                        comma-separated author list. Used by the cart-page
--                        ad ("most popular book") after MostPopularBookInCarts
--                        produces the BookID + EditionID.
-- Input:  p_BookID, p_EditionID
-- Output: BookID, EditionID, ISBN, Title, EditionName, CoverImageURL,
--         RetailPrice, Authors
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE GetBookEditionDetailWithAuthors
    (p_BookID INT, p_EditionID INT)
BEGIN
    SELECT
        Book.BookID,
        BookEdition.EditionID,
        BookEdition.ISBN,
        Book.Title,
        Edition.EditionName,
        BookEdition.CoverImageURL,
        BookEdition.RetailPrice,
        (SELECT GROUP_CONCAT(
            CONCAT(Person.FName, ' ', Person.LName)
            ORDER BY Person.LName SEPARATOR ', ')
         FROM WrittenBy
         JOIN Author ON Author.AuthorID = WrittenBy.AuthorID
         JOIN Person ON Person.PersonID = Author.AuthorID
         WHERE WrittenBy.BookID = Book.BookID) AS Authors
    FROM Book
    JOIN BookEdition ON BookEdition.BookID    = Book.BookID
    JOIN Edition     ON Edition.EditionID     = BookEdition.EditionID
    WHERE Book.BookID            = p_BookID
    AND   BookEdition.EditionID  = p_EditionID;
END $$

-- -----------------------------------------------------------------------------
-- Procedure description: Atomic cart checkout. Creates a new Order +
--                        Sale for the customer, copies CartContains rows
--                        into SaleContains, calls updateSaleTotal to
--                        compute TotalCost from line items + shipping +
--                        discount, then clears the cart's items and
--                        removes the discount from the cart's Order
--                        record. Returns the new SaleID via OUT param,
--                        or 0 if the cart is empty / not found.
-- Input:  p_CustomerID, p_ShippingID
-- Output: OUT p_SaleID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE Checkout
    (p_CustomerID INT, p_ShippingID INT, OUT p_SaleID INT)
BEGIN
    DECLARE vCartID     INT DEFAULT NULL;
    DECLARE vDiscountID INT DEFAULT NULL;
    DECLARE vItemCount  INT DEFAULT 0;
    DECLARE vOrderID    INT;

    SET p_SaleID = 0;

    SELECT Customer.CartID, `Order`.DiscountID
    INTO vCartID, vDiscountID
    FROM Customer
    JOIN `Order` ON `Order`.OrderID = Customer.CartID
    WHERE Customer.CustomerID = p_CustomerID;

    IF vCartID IS NULL THEN
        -- No cart found for this customer; bail out.
        SET p_SaleID = 0;
    ELSE
        SELECT COUNT(*) INTO vItemCount
        FROM CartContains
        WHERE CartID = vCartID;

        IF vItemCount = 0 THEN
            SET p_SaleID = 0;
        ELSE
            INSERT INTO `Order` (DiscountID) VALUES (vDiscountID);
            SET vOrderID = LAST_INSERT_ID();

            INSERT INTO Sale
                (SaleID, ShippingID, CustomerID, TimeStamp, TotalCost)
            VALUES
                (vOrderID, p_ShippingID, p_CustomerID, NOW(), 0.0000);

            INSERT INTO SaleContains (SaleID, BookID, EditionID, Quantity)
            SELECT vOrderID, BookID, EditionID, Quantity
            FROM CartContains
            WHERE CartID = vCartID;

            CALL updateSaleTotal(vOrderID);

            DELETE FROM CartContains WHERE CartID = vCartID;

            UPDATE `Order`
            SET DiscountID = NULL
            WHERE OrderID = vCartID;

            SET p_SaleID = vOrderID;
        END IF;
    END IF;
END $$

DELIMITER ;
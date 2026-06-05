-- -----------------------------------------------------------------------------
-- File name:  Queries.sql
-- Author:     Sydney and Tyler
-- Date:       4/17/26
-- Class:      CS445
-- Assignment: BookstoreDB
-- Purpose:    To creqte queries to find data in our bookstore
-- -----------------------------------------------------------------------------
USE BookstoreDB_Team5;

-- Query 1: List all customers first and last names
-- -----------------------------------------------------------------------------
-- Query Description: list all the customers and first and last names
-- Output:  FName, LName
-- Sorted:  None
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT FName, LName
FROM Person, Customer
WHERE PersonID = CustomerID;

-- Query 2: List all Books (Title, ISBN, EditionName)
-- -----------------------------------------------------------------------------
-- Query Description: list all the books
-- Output:  Title, ISBN, EditionName
-- Sorted:  None
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT Title, ISBN, EditionName
FROM Book, BookEdition, Edition
WHERE Book.BookID = BookEdition.BookID 
AND BookEdition.EditionID = Edition.EditionID;

-- Query 3: List the Name of all customers that have been with the company 
-- 			    since before October 10, 2023 and the Books they purchased 
-- 					(First Name, Last Name, Title, Edition, account creation date).
-- -----------------------------------------------------------------------------
-- Query Description: list all customers who have been with the company before
--                    2023
-- Output:  FName, LName, Title, EditionName, JoinDate
-- Sorted:  None
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT FName, LName, Title, EditionName, JoinDate
FROM Person, Customer, Sale, SaleContains, BookEdition, Book, Edition
WHERE PersonID = Customer.CustomerID 
AND Customer.CustomerID = Sale.CustomerID 
AND Sale.SaleID = SaleContains.SaleID 
AND SaleContains.BookID = BookEdition.BookID 
AND SaleContains.EditionID = BookEdition.EditionID 
AND BookEdition.BookID = Book.BookID 
AND BookEdition.EditionID = Edition.EditionID 
AND JoinDate < '2023-10-10';

-- Query 4: Average total cost for all Sales
-- -----------------------------------------------------------------------------
-- Query Description: average of total costs
-- Output:  Average Total Cost
-- Sorted:  None
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT AVG(Sale.TotalCost) AS 'Average Total Cost'
FROM Sale;

-- Query 5: Find the customer that saved the most by applying a discount to one sale.
-- 					(FName, LName, sale timestamp, amount saved). 
--          (Break ties with earlier timestamp).
-- -----------------------------------------------------------------------------
-- Query Description: the customer who saved the most by applying a discount
-- Output:  FName, LName, TimeStamp
-- Sorted:  Amount saved, timestamp
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT FName, LName, Sale.TimeStamp,
  CASE
    WHEN Discount.DollarAmount IS NOT NULL THEN Discount.DollarAmount
    	ELSE ROUND(
        (Sale.TotalCost - Shipping.ShippingCost)
        / NULLIF(1 - Discount.PercentageAmount, 0)
        * Discount.PercentageAmount, 4)
  END AS `Amount Saved`
FROM Person, Customer, Sale, `Order`, Discount, Shipping
WHERE Person.PersonID = Customer.CustomerID
AND Customer.CustomerID = Sale.CustomerID
AND Sale.SaleID = `Order`.OrderID
AND `Order`.DiscountID = Discount.DiscountID
AND Sale.ShippingID = Shipping.ShippingID
ORDER BY `Amount Saved` DESC, Sale.TimeStamp ASC
LIMIT 1;

-- Query 6: Find all users (FName, LName, email) that purchased any Edition of 
-- "All Systems Red"
-- -----------------------------------------------------------------------------
-- Query Description: find users who have bought a specific edition
-- Output:  FName, LName, EmailAddress
-- Sorted:  None
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT DISTINCT FName, LName, EmailAddress
FROM Person, Customer, Sale, SaleContains, BookEdition, Book
WHERE Person.PersonID = Customer.CustomerID
AND Customer.CustomerID = Sale.CustomerID
AND Sale.SaleID = SaleContains.SaleID
AND SaleContains.BookID = BookEdition.BookID
AND SaleContains.EditionID = BookEdition.EditionID
AND BookEdition.BookID = Book.BookID
AND Book.Title = 'All Systems Red';

-- Query 7: Find the user that has spent the most money in the year 2023.
-- 					(FName, LName, total amount spent) (break ties with Fname, Lname 
--          sorted A-Z).
-- -----------------------------------------------------------------------------
-- Query Description: user who spend the most in 2023
-- Output:  FName, LName, TotalCost
-- Sorted:  TotalCost, FName, LName
-- Grouped: CustomerID
-- -----------------------------------------------------------------------------
SELECT FName, LName, SUM(Sale.TotalCost) AS 'Total Cost'
FROM Person, Customer, Sale
WHERE Person.PersonID = Customer.CustomerID
AND Customer.CustomerID = Sale.CustomerID
AND Sale.TimeStamp >= '2023-01-01'
AND Sale.TimeStamp < '2024-01-01'
GROUP BY Customer.CustomerID, FName, LName
ORDER BY `Total Cost` DESC, FName ASC, LName ASC
LIMIT 1;

-- Query 8: Find all the Editions of the book "All Systems Red"
-- 					(ISBN, Edition Name, Retail Price). Sort by ISBN low to high.
-- -----------------------------------------------------------------------------
-- Query Description: find all editions of a specific book 
-- Output:  ISBN, EditionName, RetailPrice
-- Sorted:  ISBN
-- Grouped: None
-- -----------------------------------------------------------------------------
SELECT ISBN, EditionName, RetailPrice
FROM Book, BookEdition, Edition
WHERE Book.BookID = BookEdition.BookID
AND BookEdition.EditionID = Edition.EditionID
AND Book.Title = 'All Systems Red'
ORDER BY ISBN ASC;

-- Query 9: Find how many orders each user has made in the year 2023.
-- 					(FName, LName, number of orders) Sort by number of orders, high to low.
-- 					Then by LName, FName in A-Z order.
-- -----------------------------------------------------------------------------
-- Query Description: orders each user made in 2023
-- Output:  FName, LName, Sale (count)
-- Sorted:  NumOfOrders, LName, FName
-- Grouped: CustomerID
-- -----------------------------------------------------------------------------
SELECT FName, LName, COUNT(Sale.SaleID) AS 'Number of Sales'
FROM Person, Customer, Sale
WHERE Person.PersonID = Customer.CustomerID
AND Customer.CustomerID = Sale.CustomerID
AND Sale.TimeStamp >= '2023-01-01'
AND Sale.TimeStamp < '2024-01-01'
GROUP BY Customer.CustomerID, FName, LName
ORDER BY `Number of Sales` DESC, LName ASC, FName ASC;

-- Query 10: Find all the users that made more than the average number of 
--           orders in the year 2023 (FName, LName, number of orders) Sort by 
--           number of orders, high to low. Then by LName, FName in A-Z order.
-- -----------------------------------------------------------------------------
-- Query Description: users who made more orders than the average in 2023
-- Output:  FName, LName, Sale (count)
-- Sorted:  NumOfOrders, LName, FName
-- Grouped: CustomerID
-- -----------------------------------------------------------------------------
SELECT FName, LName, COUNT(Sale.SaleID) AS 'Number of Sales'
FROM Person, Customer, Sale
WHERE Person.PersonID = Customer.CustomerID
AND Customer.CustomerID = Sale.CustomerID
AND Sale.TimeStamp >= '2023-01-01'
AND Sale.TimeStamp < '2024-01-01'
GROUP BY Customer.CustomerID, FName, LName
HAVING `Number of Sales` >
(
    SELECT AVG(OrderCount)
    FROM
    (
        SELECT COUNT(Sale.SaleID) AS OrderCount
        FROM Sale
        WHERE Sale.TimeStamp >= '2023-01-01'
				AND Sale.TimeStamp < '2024-01-01'
        GROUP BY Sale.CustomerID
    ) OrderCounts
)
ORDER BY `Number of Sales` DESC, LName ASC, FName ASC;

-- Query 11: Find the 10 most purchased books for 2023
-- 				   (ISBN, Title, Edition, total quantity purchased) Sort by total 
--           quantity purchased, high to low. Then by Title then by Edition in 
--           A-Z order.
-- -----------------------------------------------------------------------------
-- Query Description: top 10 most purchased books in 2023
-- Output:  FName, LName, Title, EditionName, JoinDate
-- Sorted:  Total quantity, title, edition
-- Grouped: BookEditionID
-- -----------------------------------------------------------------------------
SELECT ISBN, Title, EditionName,
  SUM(SaleContains.Quantity) AS 'Total Quantity Purchased'
FROM Book, BookEdition, Edition, SaleContains, Sale
WHERE Book.BookID = BookEdition.BookID
AND BookEdition.EditionID = Edition.EditionID
AND SaleContains.BookID = BookEdition.BookID
AND SaleContains.EditionID = BookEdition.EditionID
AND SaleContains.SaleID = Sale.SaleID
AND Sale.TimeStamp >= '2023-01-01'
AND Sale.TimeStamp < '2024-01-01'
GROUP BY BookEdition.BookID, BookEdition.EditionID, BookEdition.ISBN, Book.Title, Edition.EditionName
ORDER BY `Total Quantity Purchased` DESC, Book.Title ASC, Edition.EditionName ASC
LIMIT 10;

-- Query 12: Find the 10 most profitable books for 2023
-- 			 (ISBN, Title, Edition, total profit) Sort by total profit, high to low.
-- 			 Then by Title then by Edition in A-Z order.
-- -----------------------------------------------------------------------------
-- Query Description: top 10 most profitable books 
-- Output:  ISIBN, Title, EditionName, total profit
-- Sorted:  Total profit, title, edition
-- Grouped: BookID
-- -----------------------------------------------------------------------------
SELECT ISBN, Title, EditionName,
       SUM((RetailPrice - WholesalePrice) * SaleContains.Quantity) 
			 AS 'Total Profit'
FROM Book, BookEdition, Edition, SaleContains, Sale
WHERE Book.BookID = BookEdition.BookID
AND BookEdition.EditionID = Edition.EditionID
AND SaleContains.BookID = BookEdition.BookID
AND SaleContains.EditionID = BookEdition.EditionID
AND SaleContains.SaleID = Sale.SaleID
AND Sale.TimeStamp >= '2023-01-01'
AND Sale.TimeStamp < '2024-01-01'
GROUP BY BookEdition.BookID, BookEdition.EditionID, ISBN, Book.Title, EditionName
ORDER BY `Total Profit` DESC, Book.Title ASC, Edition.EditionName ASC
LIMIT 10;

-- Query 13: How many of each type of Edition have been purchased?
-- 					 Sort by the count, high to low then by Edition name Z-A order.
-- -----------------------------------------------------------------------------
-- Query Description: how many of each edition been purchased
-- Output:  FName, LName, Title, EditionName, JoinDate
-- Sorted:  EditionName, Count
-- Grouped: EditionID
-- -----------------------------------------------------------------------------
SELECT EditionName, SUM(SaleContains.Quantity) AS 'Count'
FROM Edition, BookEdition, SaleContains
WHERE Edition.EditionID = BookEdition.EditionID
AND BookEdition.BookID = SaleContains.BookID
AND BookEdition.EditionID = SaleContains.EditionID
GROUP BY Edition.EditionID, Edition.EditionName
ORDER BY `Count` DESC, Edition.EditionName DESC;

-- Query 14: Find the 10 least profitable (most money losing) book editions.
-- 					 Sort by total profit, low to high. Then by Title then by Edition in
--           A-Z order.
-- -----------------------------------------------------------------------------
-- Query Description: top 10 least profitable book editions
-- Output:  ISBN, Title, EditionName, total profit
-- Sorted:  total profit, title, edition
-- Grouped: BookID
-- -----------------------------------------------------------------------------
SELECT ISBN, Title, EditionName,
  SUM((BookEdition.RetailPrice - BookEdition.WholesalePrice) * 
	SaleContains.Quantity) AS 'Total Profit'
FROM Book, BookEdition, Edition, SaleContains, Sale
WHERE Book.BookID = BookEdition.BookID
AND BookEdition.EditionID = Edition.EditionID
AND SaleContains.BookID = BookEdition.BookID
AND SaleContains.EditionID = BookEdition.EditionID
AND SaleContains.SaleID = Sale.SaleID
GROUP BY BookEdition.BookID, BookEdition.EditionID, BookEdition.ISBN, Book.Title,
 Edition.EditionName
ORDER BY `Total Profit` ASC, Book.Title ASC, Edition.EditionName ASC
LIMIT 10;
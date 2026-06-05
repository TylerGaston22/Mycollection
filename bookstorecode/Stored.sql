-- Active: 1777519591239@@127.0.0.1@3306
-- -----------------------------------------------------------------------------
-- File name:  Create.sql
-- Author:     Sydney and Tyler
-- Date:       4/17/26
-- Class:      CS445
-- Assignment: BookstoreDB
-- Purpose:    To create tables for bookstoreDB
-- -----------------------------------------------------------------------------

DROP DATABASE IF EXISTS BookstoreDB_Team5;
CREATE DATABASE BookstoreDB_Team5;
USE BookstoreDB_Team5;

DROP TABLE IF EXISTS SaleContains;
DROP TABLE IF EXISTS Sale;
DROP TABLE IF EXISTS CartContains;
DROP TABLE IF EXISTS WishListContains;
DROP TABLE IF EXISTS WishList;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Shipping;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS Discount;
DROP TABLE IF EXISTS WrittenBy;
DROP TABLE IF EXISTS BookEdition;
DROP TABLE IF EXISTS Publisher;
DROP TABLE IF EXISTS Edition;
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Author;
DROP TABLE IF EXISTS Person;


CREATE OR REPLACE TABLE Person (
	PersonID int(11) NOT NULL AUTO_INCREMENT,
	FName varchar(50) NOT NULL,
	LName varchar(50) DEFAULT NULL,
	CONSTRAINT Person_PK PRIMARY KEY (PersonID)
) Engine=InnoDB CHARACTER SET=utf8 COLLATE=utf8_bin;

CREATE OR REPLACE TABLE Author (
	AuthorID int(11) NOT NULL,
	CONSTRAINT Author_PK PRIMARY KEY (AuthorID),
	CONSTRAINT Author_Person_FK FOREIGN KEY (AuthorID) REFERENCES Person (PersonID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Book (
	BookID int(11) NOT NULL AUTO_INCREMENT,
	Title varchar(100) NOT NULL,
	CONSTRAINT Book_PK PRIMARY KEY (BookID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Edition (
	EditionID int(11) NOT NULL AUTO_INCREMENT,
	EditionName varchar(100) NOT NULL,
	CONSTRAINT Edition_PK PRIMARY KEY (EditionID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Publisher (
	PublisherID int(11) NOT NULL AUTO_INCREMENT,
	PublisherName varchar(100) NOT NULL,
	CONSTRAINT Publisher_PK PRIMARY KEY (PublisherID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE BookEdition (
	BookID int(11) NOT NULL,
	EditionID int(11) NOT NULL,
	PublisherID int(11) NOT NULL,
	ForwardAuthorID int(11) DEFAULT NULL,
	ISBN varchar(13) NOT NULL,
	CoverImageURL varchar(500) NOT NULL,
	PublishedDate datetime NOT NULL,
	WholesalePrice DECIMAL(15,4) NOT NULL,
	RetailPrice DECIMAL(15,4) NOT NULL,
	Quantity int(11) NOT NULL,
	CONSTRAINT BookEdition_PK PRIMARY KEY (BookID, EditionID),
	CONSTRAINT BookEdition_Book_FK FOREIGN KEY (BookID) REFERENCES Book (BookID),
	CONSTRAINT BookEdition_Edition_FK FOREIGN KEY (EditionID) REFERENCES Edition (EditionID),
	CONSTRAINT BookEdition_Publisher_FK FOREIGN KEY (PublisherID) REFERENCES Publisher (PublisherID),
	CONSTRAINT BookEdition_Author_FK FOREIGN KEY (ForwardAuthorID) REFERENCES Author (AuthorID),
	CONSTRAINT BookEdition_ISBN_UN UNIQUE (ISBN),
	CONSTRAINT BookEdition_ISBN_CK CHECK (LENGTH(ISBN) = 10 OR LENGTH(ISBN) = 13),
	CONSTRAINT BookEdition_Qty_CK CHECK (Quantity >= 0),
	CONSTRAINT BookEdition_WholesalePrice_CK CHECK (WholesalePrice >= 0),
	CONSTRAINT BookEdition_RetailPrice_CK CHECK (RetailPrice >= 0)
) Engine=InnoDB;

CREATE OR REPLACE TABLE WrittenBy (
	AuthorID int(11) NOT NULL,
	BookID int(11) NOT NULL,
	CONSTRAINT WrittenBy_PK PRIMARY KEY (AuthorID, BookID),
	CONSTRAINT WrittenBy_Author_FK FOREIGN KEY (AuthorID) REFERENCES Author (AuthorID),
	CONSTRAINT WrittenBy_Book_FK FOREIGN KEY (BookID) REFERENCES Book (BookID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Discount (
	DiscountID int(11) NOT NULL AUTO_INCREMENT,
	DiscountName varchar(100) NOT NULL,
	StartDate datetime DEFAULT NULL,
	EndDate datetime DEFAULT NULL,
	DollarAmount DECIMAL(15,4) DEFAULT NULL CHECK (DollarAmount >= 0),
	PercentageAmount DECIMAL(15,4) DEFAULT NULL CHECK (PercentageAmount >= 0 AND PercentageAmount <= 1),
	CONSTRAINT Discount_PK PRIMARY KEY (DiscountID),
	CONSTRAINT Discount_Amount_CHECK CHECK (
		(DollarAmount IS NOT NULL AND PercentageAmount IS NULL) OR
		(DollarAmount IS NULL AND PercentageAmount IS NOT NULL)
	)
) Engine=InnoDB;

CREATE OR REPLACE TABLE `Order` (
	OrderID int(11) NOT NULL AUTO_INCREMENT,
	DiscountID int(11) DEFAULT NULL,
	CONSTRAINT Order_PK PRIMARY KEY (OrderID),
	CONSTRAINT Order_Discount_FK FOREIGN KEY (DiscountID) REFERENCES Discount (DiscountID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Shipping (
	ShippingID int(11) NOT NULL AUTO_INCREMENT,
	ShippingName varchar(100) NOT NULL,
	ShippingSpeed varchar(50) NOT NULL,
	ShippingCost DECIMAL(15,4) NOT NULL,
	CONSTRAINT Shipping_PK PRIMARY KEY (ShippingID),
	CONSTRAINT Shipping_Cost_CK CHECK (ShippingCost >= 0)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Cart (
	CartID int(11) NOT NULL,
	CONSTRAINT Cart_PK PRIMARY KEY (CartID),
	CONSTRAINT Cart_Order_FK FOREIGN KEY (CartID) REFERENCES `Order` (OrderID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Customer (
	CustomerID int(11) NOT NULL AUTO_INCREMENT,
	CartID int(11) NOT NULL,
	Username varchar(50) NOT NULL,
	PasswordHash varchar(255) NOT NULL,
	Salt VARCHAR (255) NOT NULL,
	JoinDate datetime NOT NULL,
	EmailAddress varchar(150) NOT NULL,
	CONSTRAINT Customer_PK PRIMARY KEY (CustomerID),
	CONSTRAINT Customer_Person_FK FOREIGN KEY (CustomerID) REFERENCES Person (PersonID),
	CONSTRAINT Customer_Cart_FK FOREIGN KEY (CartID) REFERENCES Cart (CartID),
	CONSTRAINT Customer_Username_UN UNIQUE (Username),
	CONSTRAINT Customer_Email_UN UNIQUE (EmailAddress),
	CONSTRAINT Customer_Cart_UN UNIQUE (CartID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE WishList (
	WishListID int(11) NOT NULL AUTO_INCREMENT,
	WishListName varchar(50) NOT NULL,
	CustomerID int(11) NOT NULL,
	CONSTRAINT WishList_PK PRIMARY KEY (WishListID),
	CONSTRAINT WishList_Customer_FK FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE WishListContains (
	WishListID  int(11) NOT NULL,
	BookID      int(11) NOT NULL,
	EditionID   int(11) NOT NULL,
	Quantity    int(11) NOT NULL,
	Note        varchar(255) DEFAULT NULL,
	CONSTRAINT WishListContains_PK PRIMARY KEY (WishListID, BookID, EditionID),
	CONSTRAINT WishListContains_WishList_FK
		FOREIGN KEY (WishListID) REFERENCES WishList (WishListID),
	CONSTRAINT WishListContains_BookEdition_FK
		FOREIGN KEY (BookID, EditionID) REFERENCES BookEdition (BookID, EditionID),
	CONSTRAINT WishListContains_Qty_CK CHECK (Quantity >= 0)
) Engine=InnoDB;

CREATE OR REPLACE TABLE CartContains (
	CartID int(11) NOT NULL,
	BookID int(11) NOT NULL,
	EditionID int(11) NOT NULL,
	Quantity int(11) NOT NULL,
	CONSTRAINT CartContains_PK PRIMARY KEY (CartID, BookID, EditionID),
	CONSTRAINT CartContains_Cart_FK FOREIGN KEY (CartID) REFERENCES Cart(CartID),
	CONSTRAINT CartContains_BookEdition_FK FOREIGN KEY (BookID, EditionID) REFERENCES BookEdition(BookID, EditionID),
	CONSTRAINT CartContains_Qty_CK CHECK (Quantity >= 0)
) Engine=InnoDB;

CREATE OR REPLACE TABLE Sale (
	SaleID int(11) NOT NULL,
	ShippingID int(11) NOT NULL,
	CustomerID int(11) NOT NULL,
	TimeStamp datetime NOT NULL,
	TotalCost DECIMAL(15,4) NOT NULL,
	CONSTRAINT Sale_PK PRIMARY KEY (SaleID),
	CONSTRAINT Sale_TotalCost_CK CHECK (TotalCost >= 0),
	CONSTRAINT Sale_Order_FK FOREIGN KEY (SaleID) REFERENCES `Order` (OrderID),
	CONSTRAINT Sale_Customer_FK FOREIGN KEY (CustomerID) REFERENCES Customer (CustomerID),
	CONSTRAINT Sale_Shipping_FK FOREIGN KEY (ShippingID) REFERENCES Shipping (ShippingID)
) Engine=InnoDB;

CREATE OR REPLACE TABLE SaleContains (
	SaleID int(11) NOT NULL,
	BookID int(11) NOT NULL,
	EditionID int(11) NOT NULL,
	Quantity int(11) NOT NULL,
	CONSTRAINT SaleContains_PK PRIMARY KEY (SaleID, BookID, EditionID),
	CONSTRAINT SaleContains_Sale_FK FOREIGN KEY (SaleID) REFERENCES Sale(SaleID),
	CONSTRAINT SaleContains_BookEdition_FK FOREIGN KEY (BookID, EditionID) REFERENCES BookEdition(BookID, EditionID),
	CONSTRAINT SaleContains_Qty_CK CHECK (Quantity > 0)
) Engine=InnoDB;

CREATE INDEX Book_Title_IDX ON Book (Title);
CREATE INDEX Discount_Dates_IDX ON Discount (StartDate, EndDate);
CREATE INDEX Sale_TimeStamp_IDX ON Sale (TimeStamp);
CREATE INDEX Person_LName_IDX ON Person (LName);
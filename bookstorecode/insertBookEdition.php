#***************************************************************************
# File name:   Makefile
# Class:       CS 445
# Assignment:  BookstoreDB
# Purpose:     Build database, run PHP inserts, and generate PDFs.
#***************************************************************************

DBINI=../db.ini
DATA=../BookstoreDB_Data

ENSCRIPT_FLAGS_SQL=-C -T 2 -p - -M Letter --color -Esql -fCourier8
ENSCRIPT_FLAGS_PHP=-C -T 2 -p - -M Letter --color -fCourier8

INSERT:
	cp ../db_local.ini ../db.ini
	mariadb --defaults-file=$(DBINI) --skip-ssl < Create.sql
	mariadb --defaults-file=$(DBINI) --skip-ssl < Stored.sql
	php ./php/insertAuthors.php $(DATA)/CS445_BookStoreData_Authors.csv
	php ./php/insertBookEdition.php $(DATA)/CS445_BookStoreData_BookEditions.csv
	php ./php/insertUsers.php $(DATA)/CS445_BookStoreData_Users.csv
	php ./php/insertWrote.php $(DATA)/CS445_BookStoreData_Wrote.csv
	php ./php/insertShipping.php $(DATA)/CS445_BookStoreData_Shipping.csv
	php ./php/insertDiscount.php $(DATA)/CS445_BookStoreData_Discounts.csv
	php ./php/insertSales.php $(DATA)/CS445_BookStoreData_Sales.csv
	php ./php/insertCarts.php $(DATA)/CS445_BookStoreData_Carts.csv
	php ./php/insertWishLists.php $(DATA)/CS445_BookStoreData_WishLists.csv
	cd ../html; \
	composer install; \
	php insertBookReviews.php \
	../BookstoreDB_Data/CS445_BookStoreData_BookReviews.csv; \
	php insertReviewAgreeDisagree.php \
	../BookstoreDB_Data/CS445_BookStoreData_ReviewAgreeDisagree.csv

INSERT_REMOTE:
	cp ../db_remote.ini ../db.ini
	mariadb --defaults-file=$(DBINI) < Create.sql
	mariadb --defaults-file=$(DBINI) < Stored.sql
	php ./php/insertAuthors.php $(DATA)/CS445_BookStoreData_Authors.csv
	php ./php/insertBookEdition.php $(DATA)/CS445_BookStoreData_BookEditions.csv
	php ./php/insertUsers.php $(DATA)/CS445_BookStoreData_Users.csv
	php ./php/insertWrote.php $(DATA)/CS445_BookStoreData_Wrote.csv
	php ./php/insertShipping.php $(DATA)/CS445_BookStoreData_Shipping.csv
	php ./php/insertDiscount.php $(DATA)/CS445_BookStoreData_Discounts.csv
	php ./php/insertSales.php $(DATA)/CS445_BookStoreData_Sales.csv
	php ./php/insertCarts.php $(DATA)/CS445_BookStoreData_Carts.csv
	php ./php/insertWishLists.php $(DATA)/CS445_BookStoreData_WishLists.csv
	cd ../html; \
	composer install; \
	php insertBookReviews.php \
	../BookstoreDB_Data/CS445_BookStoreData_BookReviews.csv; \
	php insertReviewAgreeDisagree.php \
	../BookstoreDB_Data/CS445_BookStoreData_ReviewAgreeDisagree.csv

createPDF:
	enscript $(ENSCRIPT_FLAGS_SQL) Create.sql | ps2pdf - Create.sql.pdf

storedPDF:
	enscript $(ENSCRIPT_FLAGS_SQL) Stored.sql | ps2pdf - Stored.sql.pdf

queriesPDF:
	enscript $(ENSCRIPT_FLAGS_SQL) Queries.sql | ps2pdf - Queries.sql.pdf

mongoPDF:
	enscript $(ENSCRIPT_FLAGS_PHP) \
	../html/connMongo.php \
	../html/connDB.php \
	../html/insertBookReviews.php \
	../html/insertReviewAgreeDisagree.php \
	../html/generateRandomReviewAgreeDisagree.php \
	../html/avgStars.php \
	../html/getReviews.php \
	../html/searchReviews.php \
	| ps2pdf - Mongo.php.pdf

webpagePDF:
	enscript $(ENSCRIPT_FLAGS_PHP) \
	../html/index.html \
	../html/userAuth.php \
	../html/queryValidUser.php \
	../html/logout.php \
	../html/authHelper.php \
	../html/basicErrorHandling.php \
	../html/connDB.php \
	../html/connMongo.php \
	../html/header.php \
	../html/showAllBooks.php \
	../html/getAllBooks.php \
	../html/showOneBook.php \
	../html/getOneBook.php \
	../html/showCart.php \
	../html/getCart.php \
	../html/addToCart.php \
	../html/updateCart.php \
	../html/clearCart.php \
	../html/checkout.php \
	../html/showAllOrders.php \
	../html/getAllOrders.php \
	../html/showOrder.php \
	../html/getOneOrder.php \
	../html/voteReview.php \
	| ps2pdf - WebPage.php.pdf

PHP:
	head -v -n -0 php/*.php | enscript $(ENSCRIPT_FLAGS_PHP) | ps2pdf - Inserts.php.pdf

CoPilot.pdf: CoPilot.txt
	cat CoPilot.txt | enscript -C -T 2 -p - -M Letter -fCourier8 | ps2pdf - CoPilot.pdf

clean:
	rm -f *.pdf
#############################################################################
# File name:  Makefile
# Author:     chadd williams
# Date:       Jan 26, 2024
# Class:      CS445
# Assignment: SoftwareDB
# Purpose:    build PDF files
#############################################################################


all:  # do nothing. You must specify a target

ENSCRIPT_FLAGS=-C -T 2 -p - -M Letter -Esql --color -fCourier8


dbPDF: 
	enscript ${ENSCRIPT_FLAGS} Create.sql  | ps2pdf - Create.sql.pdf
	enscript ${ENSCRIPT_FLAGS} Insert.sql  | ps2pdf - Insert.sql.pdf
	enscript ${ENSCRIPT_FLAGS} Queries.sql  | ps2pdf - Queries.sql.pdf

storedPDF:
	enscript ${ENSCRIPT_FLAGS} Stored.sql  | ps2pdf - Stored.sql.pdf

backupDB:
	mysqldump -u root -p -e --create-options --databases SoftwareDB > Full.sql

clean:
	rm *.pdf

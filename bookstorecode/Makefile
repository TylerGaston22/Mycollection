# AI Journal — BookstoreDB

A running log of every task Tyler or Sydney asked the AI to do on this project, kept in response to the `BookstoreDB/CoPilot.txt` reflection requirement from `CS445S26_Bookstore_PHP_AI.pdf`. Each entry lists the request, what the AI produced, which files were touched, and the rationale.

Newest entries go at the bottom.

---

## Session: April 17–18, 2026

### 1. PHP stub scaffold (html/)
**Ask:** Create empty PHP stubs for every required page in `html/` — connDB, header, login, logout, showAllBooks, showOneBook, showCart, showAllOrders, showOrder, plus query files in `html/php/`. Each stub: file header comment, `require_once` for connDB + basicErrorHandling, session check redirecting to `index.html` if not logged in. No real logic.

**Produced:**
- `html/connDB.php` — `db_connect($dbName)` reading `../db.ini`, `closeDB(&$dbh)` (later renamed `db_close`)
- `html/basicErrorHandling.php` — `display_errors` on, `E_ALL`
- `html/header.php` — shared nav + design-system CSS (colors, fonts) ported from `html/mockup.html`
- `html/login.php`, `html/logout.php` — auth stubs
- `html/showAllBooks.php`, `showOneBook.php`, `showCart.php`, `showAllOrders.php`, `showOrder.php` — presentation stubs that `require_once('header.php')` and show empty states
- `html/getAllBooks.php`, `searchBooksByTitle.php`, `searchBooksByAuthor.php`, `getOneBook.php`, `addToCart.php`, `getCart.php`, `updateCart.php`, `clearCart.php`, `checkout.php`, `getAllOrders.php`, `getOneOrder.php` — query file stubs with TODOs naming the stored procs they will CALL
- Replaced placeholder `html/index.html` (was `<H1>hi</H1>`) with the mockup-styled login card

**Other changes required:**
- Removed the `html/php` symlink (pointed to `pdoExamples/`) and replaced with a real directory so query files live at `html/php/*.php`
- Created root `package.json` with `npm run dev` for the PHP built-in server
- Installed Node 20 via NodeSource (wasn't in the container)

**Committed as:** `c404a20` on branch `Tyler`.

---

### 2. Revert of accidental upload
**Ask:** Pull the repo; an accidental "Add files via upload" commit on GitHub dumped 80+ React/TypeScript files to the repo root. Delete them.

**Produced:** `git revert 93a7f4f` — clean revert commit `da0ae76`, restored `README.md` and `package.json` to their scaffold-commit state, deleted all the stray `.tsx` files. Pushed.

---

### 3. Frontend (React) design reference
**Ask:** The `FrontEnd/` folder Tyler uploaded contained scrambled filenames — file contents didn't match their names. Wipe it and scaffold a clean React + Vite + TypeScript app in `Frontend/` that shows the intended visual design of the site. Organized folders. No mock data anywhere. `npm run dev` should show the styled-but-empty site.

**Produced:**
- Wiped the scrambled `FrontEnd/` contents
- Scaffolded Vite + React 18 + TypeScript + `react-router-dom@6.26` in `Frontend/` (case-corrected)
- `Frontend/src/styles/main.css` — all design tokens and component classes ported verbatim from `html/mockup.html` so the React preview and the PHP pages share one design system
- `Frontend/src/components/Nav.tsx`, `Frontend/src/layouts/AppLayout.tsx`
- Seven pages in `Frontend/src/pages/`: `Login`, `ShowAllBooks`, `ShowOneBook`, `ShowCart`, `ShowAllOrders`, `ShowOrder`, `NotFound` — each an empty skeleton with `// TODO:` markers where PHP data will plug in
- Ran `npm install` (installed 223 packages)
- Updated root `package.json`: `npm run dev` now runs the Frontend preview; old PHP server command preserved as `npm run dev:php` (not deleted)
- Verified dev server returns HTTP 200 on `/`

**Committed as:** `f54b587` on branch `Tyler`.

---

### 4. Frontend connection guide (Frontend/README.md)
**Ask:** Create a readme in `/Frontend/` that explains what everything is, how to connect React pages to their PHP counterparts, and where each page's data comes from.

**Produced:** `Frontend/README.md` with:
- Quick-start commands
- Folder layout
- How to port a React page into its PHP file
- Page-by-page connection map (React page → PHP file → query files → stored procs → owner Tyler/Sydney)
- Design-token cheat sheet pointing at `src/styles/main.css`
- Submission reminder matching the A5 PDF (tag `PHP`, release `PHP`, three submission PDFs)

**Follow-up ask:** "make the page-by-page connection map easier to read" — replaced the dense 5-column table with one labeled-bullets section per page. Same information, scannable layout.

---

### 5. `showAllBooks` reference implementation
**Ask:** Add a reference implementation of one of Tyler's pages (`showAllBooks`) at the bottom of `Frontend/README.md`, following all the PDF rules exactly. Something the team can model their real PHP off of.

**Produced:** A `## Reference implementation: showAllBooks` section at the bottom of `Frontend/README.md`. Shows:
- `html/getAllBooks.php` — query file calling `CALL GetBookEditions(:startIndex, :num)` with prepared statement + `bindValue`, wrapped in `try/catch(PDOException)`, closing the cursor and calling the close function
- `html/showAllBooks.php` — presentation file with session-gate, `filter_input()` on the `?start=` GET param, 4-per-page pagination, `htmlspecialchars()` on every DB value, mockup CSS classes
- Requirement-traceability table mapping each PDF rule to the line of code that satisfies it
- Known follow-ups (authors, BookID/EditionID for links, title/author search procs, total-row count for the Last button)

---

### 6. Class-pattern refactor of html/ stubs
**Ask:** Everything should match the class PDFs as closely as possible. Follow the CoPilot.txt rubric. User initially asked for a dev stub auth so any username/password would work; mid-session changed mind to "set things up officially, no fake login" — final state uses real DB-backed auth.

**Completed:**
- `html/connDB.php` — renamed `closeDB` → `db_close` to match `skeleton.php` and `queryFunctionCall.php` from `cs445_php_web.pdf` (slides 21, 26)
- `html/authHelper.php` — new file, pattern from `cs445_php_web.pdf` slide 42. Included at the top of every protected page; redirects to `index.html` if `$_SESSION['VALID']` is not 1.
- `html/userAuth.php` — new file, pattern from `cs445_php_web.pdf` slide 38. Replaces the generic `login.php` stub. **Real DB auth** — calls `queryValidUser()` which uses `password_verify()` against the `Customer` row; sets `$_SESSION['VALID']=1`, `userID`, `username` on success; redirects to `index.html?err=1` on failure. No dev stub.
- `html/queryValidUser.php` — new file. Function `queryValidUser($dbh, $user, $passwd)` returns the `CustomerID` on success or `false` on failure, using `bindValue` + `password_verify($input . $salt, $hash)`. Left as a raw `SELECT` for now with a `TODO` to replace with a `GetCustomerLogin` stored proc once that's added to `Stored.sql`. Non-deterministic `password_hash` means verification has to happen PHP-side, not inside a class-style `ChkPasswd` proc.
- `html/index.html` — form `action="userAuth.php"`, input `name`s `txtUser` / `txtPassword` (matches `cs445_php_web.pdf` slide 41 `login.html`)
- All five presentation files (`showAllBooks`, `showOneBook`, `showCart`, `showAllOrders`, `showOrder`) + all eleven query files in `html/php/` — inline `if (!isset($_SESSION['userID']))` session block replaced with `require_once('authHelper.php')` (or `require_once(__DIR__ . '/../authHelper.php')` from `html/php/`), matching the class pattern of a single shared guard include. `queryValidUser.php` is intentionally the one query file that does **not** include `authHelper.php`, since it runs before login.
- `html/logout.php` — explicitly unsets `VALID`, `userID`, `username`, then wipes `$_SESSION` and calls `session_destroy()`; redirects to `index.html`.
- Deleted `html/login.php` (superseded by `userAuth.php` per class pattern)

**Rationale for each file change is captured inline as a comment near the top of the file, citing which PDF slide the pattern came from.**

**Also in this session:**
- Appended class-pattern login reference to `Frontend/README.md` (separate from the `showAllBooks` reference already there): four-file architecture (`index.html` → `userAuth.php` → `queryValidUser.php` → `authHelper.php`, plus `logout.php`), full code samples, and a suggested `GetCustomerLogin` stored procedure for `Stored.sql`
- Created this `AIJournal.md`

**Not touched:**
- `BookstoreDB/Stored.sql` — not modified. The login reference notes the `GetCustomerLogin` proc the team would want to add, but the add itself is a Tyler TODO, not done by the AI.
- Sydney's ownership areas (`showCart`, `showAllOrders`, `showOneOrder` presentation files and their query files) — only the session-guard line is refactored in those files; no logic added.

**To log in once the DB is loaded:** use any real row from `BookstoreDB_Data/CS445_BookStoreData_Users.csv` — e.g. `EmeraldWilkerson` / `dWilkerson09!@#$%^&.` (plaintext password; the loader hashes it into the `Customer` row with salt).

---

## Session: April 20, 2026

### 7. `showAllBooks` page — pagination, correct data, per-row link to `showOneBook`
**Ask:** Start on the A5 showAllBooks rubric rows (page-through-4, show correct data, common header, link to showCart). Use the class PDF coding style and the A5 rule that "PHP files must be broken into query and presentation files".

**Decisions made along the way (iterated with Tyler):**
- First tried to modify the `GetBookEditions` stored proc in place. Rejected — "can you just call ones already made?"
- Then tried to add *new* procs in a separate file `BookstoreDB/showAllBooks.sql`. Rejected — "i dont need to create new folders".
- Landed on option **C**: `CREATE OR REPLACE` the existing `GetBookEditions` in `BookstoreDB/Stored.sql` (non-destructive, no other callers) and add a new `GetBookEditionsCount` proc directly below it. Kept inside `Stored.sql` because the assignment submits one `Stord.sql.pdf`. Dropped the "Query 3b" numbering idea — the `Query 1–10` numbers in `Stored.sql` correspond to the ten required queries from the original assignment, so new PHP-front-end procs just use a plain descriptive header.

**Produced:**
- `BookstoreDB/Stored.sql` — `GetBookEditions` now returns `BookID, EditionID, ISBN, Title, EditionName, Quantity, Authors` (Authors via `GROUP_CONCAT` over `WrittenBy`/`Author`/`Person`). New `GetBookEditionsCount()` returns the row total for the "Last 4" button. Both loaded into MariaDB successfully (`392` total editions).
- `html/getAllBooks.php` — query file per class PDF slide 26 (`queryFunctionCall.php`). Two functions: `getAllBooks($dbh, $start, $num)` and `countAllBookEditions($dbh)`. Each wraps `$dbh->prepare` + `bindValue` (`PDO::PARAM_INT` for the LIMIT binds) + `try/catch (PDOException)` + `closeCursor`. No output, no HTML.
- `html/showAllBooks.php` — presentation only. `filter_input(INPUT_GET, 'start', FILTER_VALIDATE_INT)` with a clamp to zero; `db_connect` → call functions → `db_close`; renders a 4-row `.card` table with ISBN, Title, Edition, Authors. Every DB value goes through `htmlspecialchars`. Title cell links to `showOneBook.php?bookID=X&editionID=Y`. Pagination buttons (First 4, Back 4, Forward 4, Last 4) disable inert-style when at the ends.

**End-to-end verified via curl:** login → page 1 "Showing 1–4 of 392", page 2 "Showing 5–8 of 392", last page "Showing 389–392 of 392", First/Back disabled on page 1, Forward/Last disabled on last page, unauthenticated request `302 → index.html`.

**CoPilot.txt rubric items covered in this slice (from CoPilot.txt §2.4 checklist):**

| Rubric item | Where it appears |
|---|---|
| `isset()` | `getAllBooks.php` — guards `$vRow['Total']` before cast |
| `try/catch (PDOException)` | both functions in `getAllBooks.php`; connection block in `showAllBooks.php` |
| `db_close()` | `showAllBooks.php` after the two function calls |
| Prepared statements + `bindValue()` | `getAllBooks.php` — binds `:startIndex` and `:num` with `PDO::PARAM_INT` |
| `htmlspecialchars()` | `showAllBooks.php` — every `echo` of a DB value |
| `filter_input()` | `showAllBooks.php` — `FILTER_VALIDATE_INT` on `?start=` |
| `require_once('basicErrorHandling.php')` | both files |
| `require_once('connDB.php')` | both files |
| `db_connect('BookstoreDB_Team5')` | `showAllBooks.php` |
| **Existing stored procs used** | `GetBookEditions` (modified in place, non-destructive) |
| **New stored procs written** | `GetBookEditionsCount` |
| Query/presentation separation | query = `html/getAllBooks.php`, presentation = `html/showAllBooks.php` |

**Still open on `showAllBooks`:** title search (partial text match), author dropdown. Both need new stored procs; planned as the next slice.

---

### 8. Fix broken `require_once` paths after query files moved from `html/php/` to `html/`

**Ask:** After getting the site running, PHP threw `Failed to open stream` errors on `connDB.php`, `basicErrorHandling.php`, and `authHelper.php`. All the query files used `__DIR__ . '/../...'` paths because they originally lived in `html/php/` (one level down). PR #2 moved them directly into `html/`, making those `/../` paths point to the project root instead of `html/`.

**Produced:**
- `sed` batch-replace across 12 query files: `'/../connDB.php'` → `'/connDB.php'`, `'/../basicErrorHandling.php'` → `'/basicErrorHandling.php'`
- Second pass across 11 files: `'/../authHelper.php'` → `'/authHelper.php'`
- Paths pointing to `/../BookstoreDB/php/connDB.php` (MongoDB/review files) and `/../db.ini` (connDB.php, connMongo.php) were left alone — those targets exist at the project root and the paths are correct.

**Committed as:** `522d428` on branch `main`.

---

### 9. Create `db.ini` and load the database

**Ask:** After path fixes, login failed with `parse_ini_file` warnings — `db.ini` had never been committed (it's gitignored for security).

**What was done:**
- Created `/workspaces/bookstoredb-team-5/db.ini` with MariaDB credentials from `docker-compose.yml`. File is in `.gitignore`; every new clone must recreate it manually (credentials documented in README.md).
- Database `BookstoreDB_Team5` did not exist. Created it as root and granted access to the `mariadb` user.
- Loaded `BookstoreDB/Create.sql` → `BookstoreDB/Stored.sql` → `BookstoreDB/Insert.sql` in that order.
- Ran all nine PHP insert scripts in `BookstoreDB/php/` against the CSVs in `BookstoreDB_Data/`. Scripts require the CSV path as a CLI argument (`$argv[1]`) and call stored procedures, so `Stored.sql` must be loaded first.
- Verified `EmeraldWilkerson` exists in `Customer` table; login succeeded.

**Setup steps documented in:** `README.md` (new "Getting Started" section).

---

### 10. README and markdown update

**Ask:** Add setup instructions to README and update all tracking `.md` files to reflect the work done in session April 20.

**Files updated:** `README.md`, `AIJournal.md` (this entry), `Questions.md`.

---

### 11. Fix `index.html` form action — Apache path confusion

**Ask:** After getting the login page to render, submitting the form landed on `/index.html/userAuth` (404) instead of `/userAuth.php`. Apache was treating `index.html` as a directory when resolving relative URLs, so the relative action `userAuth.php` resolved to `index.html/userAuth.php` instead of `/userAuth.php`.

**Fix:** Changed `action="userAuth.php"` → `action="/userAuth.php"` (absolute path) in `html/index.html`.

**Committed as:** `f3b88c1` on branch `main`.

---

### 12. Remove `Frontend/` React app

**Ask:** The `Frontend/` folder contained a full Vite + React + TypeScript app that was a duplicate of the PHP pages — same design, same CSS, same pages. The professor expects the frontend to live inside the PHP files, which it already did. No reason to keep a separate React app.

**Produced:**
- Deleted `Frontend/` directory entirely (20 files removed)
- Cleaned up `package.json`: removed `dev`, `build`, `install:frontend` scripts and updated description. Only `dev:php` remains.

**Committed as:** `822e7ef` on branch `main`.

---

### 14. `showAllBooks` — title search and author filter

**Ask:** Complete the two remaining showAllBooks rubric items: search by title (partial text match) and filter by author (dropdown).

**Produced:**
- `BookstoreDB/Stored.sql` — 5 new stored procs: `SearchBooksByTitle`, `SearchBooksByTitleCount`, `GetAllAuthors`, `SearchBooksByAuthor`, `SearchBooksByAuthorCount`. All follow the same SELECT shape as `GetBookEditions` so the presentation layer handles all three modes identically.
- `html/getAllBooks.php` — 5 new query functions, one per stored proc, all following the class PDF `bindValue` + `try/catch (PDOException)` + `closeCursor` pattern.
- `html/showAllBooks.php` — search form with title text input and author dropdown. Search modes are mutually exclusive (title takes priority). Pagination links carry `q=` or `authorID=` params so filters persist across page turns. Clear button resets to unfiltered view.

**Committed as:** `24b3e82` on branch `main`.

---

### 13. Session preferences

- Auto-commit and auto-push turned off for this session — Tyler approves commits manually going forward.
- `AssignmentNotes/` designated as the directory for future coding notes and scratch work.

---

## Required reflection: `BookstoreDB/CoPilot.txt`

Per `CS445S26_Bookstore_PHP_AI.pdf`, the team owes a file `BookstoreDB/CoPilot.txt` answering these questions. Each teammate writes their own Process and Personal Reflection answers; the team writes one shared Code Review and Documentation section. The AI cannot answer these for the team — they are reflective questions about **your** experience — but this journal is the raw material they draw from.

### 1. Process (each teammate answers)
1.1 How did you use the AI? (autocomplete, Chat prompts to build/fix files, write by hand and have AI fix, have AI debug?)

### 2. Code Review (the team answers together)
Inspect the AI-written code. Did the AI build quality code?
2.1 Did the AI use any PHP syntax or idioms you were unfamiliar with? Which ones?
2.2 How readable is the code? How are the variable names?
2.3 How efficient is the code? How much repeated code is there?
2.4 Did the AI use the following correctly (or at all)?
  - `isset()`, `try/catch`, `closeDB()` / `db_close()`, prepared statements + `bindValue()`, `htmlspecialchars()`, `filter_input()`
  - `require_once('basicErrorHandling.php')` / `require_once('connDB.php')`
  - `db_connect('BookstoreDB')`
  - Were existing stored procedures/functions used? Were new ones written?
  - Were functions used appropriately?

### 3. Documentation (the team answers together)
3.1 How well did the AI comment each function/page?
3.2 How well can the AI explain how each subsystem (Orders, Cart, Authentication) works?
3.3 Could you hand this code off to a teammate or return to it in six months and still understand/edit it?

### 4. Personal Reflection (each teammate answers)
4.1 How did you find using CoPilot on this project? Overall experience?
4.2 How would you describe this experience in a job interview?
4.3 Was it satisfying? Did it feel helpful? Did it speed up development? More/less confident in the code? Would you use an AI dev companion going forward?
4.4 Main benefits?
4.5 Main downsides?

**Where the evidence lives for answering §2–3:**
- Sessions §1–§13 above describe every AI-built file and the rationale.
- Rubric-item table in §7 shows concrete spots where `bindValue`/`filter_input`/`htmlspecialchars` etc. land in the code.
- Every PHP file has a top-of-file comment citing which class PDF slide the pattern came from, which makes the "subsystems" (Auth / Books / Cart) easy to trace.

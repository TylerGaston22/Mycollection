1. PROCESS (each teammate answers separately)
How did I use the AI? (autocomplete, Chat prompts to build/fix files,
write by hand and have the AI fix, have the AI debug my code?)

Sydney:
I used the copilot extension for the PHP front end implementation. I had
it build files and to use the format from other files in the project that
way it keeps the same pattern and layout. When I wrote some of the code by
myself, I used inline to help speed up the process. I then asked AI chat
to help me debug my code. Using the inline was easier since I could see
the mistakes it made on variable naming conventions when it does it line
by line.

Tyler:
I used the Claude Code extension for the PHP front end implementation. I
started by giving it guidelines on how to interact with the database,
including where to pull data from and where to store it, based on patterns
from our earlier assignments so the new code would look consistent with
what we had already built. Each new file started from a base skeleton that
I had already wired up to the database, and the AI extended it from there.
When errors came up I would paste the error message and ask the AI if it
recognized the cause rather than debugging it cold by myself first. My
usage did not really shift over the course of the project. I generally
trust the AI's output, but I make sure to test everything that comes out
of it before moving on. The main place I pushed back was on style. I
reviewed every variable name to make sure it was readable and made sense
in context, and I made sure the AI never used the ternary operator
anywhere in the code, since that is a class coding standard.

2. CODE REVIEW (the team answers together)
Did the AI build quality code?

Overall - yes, with caveats.
The AI was strongest on boilerplate patterns straight out of the class
PDFs (prepared statements, try/catch, the query/presentation split) and
weakest on project-specific decisions like which stored procedure to reuse
vs. write new.

Did the AI use any PHP syntax or idioms you were unfamiliar with? Which
ones?

Yes. The three we noticed most:

The null-coalescing operator (??) in expressions like:

$vStars = intval($vR['stars'] ?? 0);

This replaces what we would have written as an isset() ternary.

filter_input(INPUT_GET, 'bookID', FILTER_VALIDATE_INT) returning either an
int, false for invalid input, or null for missing input.
The AI showed us how to distinguish missing vs invalid input.

MongoDB BSON UTCDateTime → PHP DateTime conversion:

$vDt = $vR['timestamp']->toDateTime();
$vDt->setTimezone(new DateTimeZone('America/Los_Angeles'));
How readable is the code? How are the variable names?

The code is readable because we enforced class coding standards rather
than letting the AI choose its own style.

Consistency the AI got right:

All local variables use the v-prefix convention (vBookID, vCartID, vStmt)
Stored procedure parameters use colon-prefix (:bookID, :startIndex)
Every file includes a header comment block
Indentation is consistent (4-space)

What we had to correct:

Repeated session checks → moved to authHelper.php
Inline styling was verbose → kept as a tradeoff
How efficient is the code? How much repeated code is there?

Efficiency is acceptable for an assignment, not optimized.

Good patterns:

Query/presentation split reduces duplication
Shared rendering logic across modes
Centralized auth handling

Known inefficiencies:

N+1 queries for reviews
No caching for OpenLibrary API
Separate MongoDB connections in one request
Did the AI use the following correctly (or at all)?
isset() — YES
try/catch — YES
db_close() — YES
prepared statements + bindValue() — YES
htmlspecialchars() — YES
filter_input() — YES
require_once files — YES

Stored procedures:

Reused existing ones — YES
Added new ones — YES

Structure:

Query files contain functions only
Presentation files contain no SQL
Were functions used appropriately?

Sometimes functions were used appropriately. There were times that it made
a good function for clean separation. However, there were a lot of times
where there are duplicate functions or even functions that never get
called that the AI created. The biggest thing was reusability.

3. DOCUMENTATION (the team answers together)
How well did the AI add appropriate comments to each function / PHP page?

Very well.

Consistent Purpose / Input / Return blocks
File-level headers everywhere
Comments explain “why,” not just “what”
References to class slides

Minor issue: leftover TODO comments needed cleanup.

How well can the AI explain how each subsystem functions? (Orders, Cart,
Authentication)

Authentication:

userAuth.php validates user and sets session
authHelper.php protects pages
logout clears session

Books:

Pagination and filters handled in showAllBooks.php
Uses stored procedures
showOneBook loads details and reviews

Cart:

Cart + CartContains tables
Checkout moves items to Sale tables

Orders:

showAllOrders lists sales
showOrder shows details
Same query/presentation split
Could we hand this code off or return later?

Yes, with minor setup.

What helps:

Clear file headers
AIJournal tracks changes
Clean separation of logic

Setup needed:

db.ini setup
composer install
MongoDB data reload
4. PERSONAL REFLECTION (each teammate answers separately)
How did you find using CoPilot on this project? What was your overall
experience?

Sydney:
My experience was very positive. There are parts of the code that get very
repetitive and boring to write out but with AI and the inline it made it
easy and a lot faster. Not only that but it helped with some basic error
checking. I had trouble with the timestamp format since this was new
syntax but the AI chatbox was able to explain it to me and help me
implement it correctly.

Tyler:
Overall my experience was positive. The Claude Code extension worked best
when I wanted to check or confirm something I had written, or when I
needed help diagnosing an error message. The biggest strength was how easy
it was to use inline in my editor. The most frustrating part was response
time. What surprised me most was how different the extension felt compared
to normal chat tools.

How would you describe this experience in a job interview?

Sydney:
Using AI really helped me speed up the process in building. What would
have taken me 3 minutes to type up, takes the AI about 3 seconds. The
downside is that you have to be careful as the AI doesn’t always guess
correctly. There were times I accepted the inline or the chatbox but still
had to go back in and fix things.

Tyler:
I have used AI on a few projects. It is strong at writing code but still
needs supervision. On this project we built a PHP front end on a
relational database. The biggest value was using AI as a second set of
eyes for reviewing and debugging code.

Was it satisfying? Did it feel helpful? Did it speed up development? Do
you feel more or less confident in your code? Would you use AI going
forward?

Sydney:
It was actually very satisfying and very helpful. It sped up development
however, I do feel like I am less confident in my code as I don’t
completely understand what it is doing. I felt like I was playing catch up
with the AI. I definitely want to use AI in the future but I want to
understand every line that it writes and try to aim for more of the inline
usage of it.

Tyler:
The satisfaction was mixed. The AI did most of the writing, and I focused
on understanding and verifying it. It was very helpful for getting
started. Development was much faster (weeks → about one week). I feel
more confident in the code because I had a second voice checking my work.
I would use AI again.

What were the main benefits you found?

Sydney:

Faster development
Help debugging errors
Explaining code

Tyler:

Ease of use
Getting unstuck
Code review and ideas
Speed
Commit messages
What were the main downsides you found?

Sydney:

Incorrect function calls
Does not follow coding standards
Repetitive

Tyler:

Slow response time
Poor variable naming by default
Overconfident incorrect answers
Didn’t always reuse stored procedures
Style didn’t match class conventions
<!--
    -------------------------------------------------------------------------
    File name: index.html
    Author:    Sydney and Tyler
    Date:      4/18/26
    Class:     CS 445
    Assignment: BookstoreDB PHP Front End
    Purpose:   Landing page. Renders the sign-in card with username +
               password fields. Submits via POST to userAuth.php using
               input names txtUser and txtPassword (per login.html in
               cs445_php_web.pdf slide 41). On a failed attempt
               userAuth.php redirects back here with ?err=1 and the
               page shows an inline error message.
    -------------------------------------------------------------------------
-->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BookstoreDB &mdash; Sign in</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Work+Sans:wght@400;500&display=swap');

:root {
    --bg: hsl(36,33%,97%);
    --fg: hsl(28,18%,18%);
    --card: #ffffff;
    --primary: hsl(28,19%,38%);
    --primary-fg: hsl(36,33%,97%);
    --secondary: hsl(33,35%,92%);
    --muted: hsl(33,30%,94%);
    --muted-fg: hsl(28,12%,42%);
    --border: hsl(32,22%,86%);
    --destructive: hsl(0,65%,48%);
    --radius: 0.625rem;
    --grad: linear-gradient(135deg, hsl(28,19%,38%), hsl(36,28%,58%));
    --shadow-card: 0 6px 24px -12px hsl(28 18% 20% / 0.15);
    --shadow-elegant: 0 20px 60px -20px hsl(28 19% 30% / 0.18);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Work Sans', system-ui, sans-serif;
    color: var(--fg);
    min-height: 100vh;
    background: linear-gradient(135deg, hsl(36,33%,97%), hsl(33,35%,90%));
    display: grid;
    place-items: center;
    padding: 2rem 1.25rem;
}
h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    letter-spacing: -0.01em;
}
.card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-card);
}
.login-card {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    box-shadow: var(--shadow-elegant);
}
.login-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.5rem;
}
.login-icon {
    width: 44px; height: 44px;
    border-radius: var(--radius);
    background: var(--grad);
    display: grid; place-items: center;
    box-shadow: var(--shadow-elegant);
}
.muted { color: var(--muted-fg); }
.form-group { margin-bottom: 1rem; }
label {
    font-size: 0.8rem;
    color: var(--muted-fg);
    display: block;
    margin-bottom: 4px;
}
input {
    font-family: inherit;
    font-size: 0.85rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--fg);
    padding: 7px 12px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
}
input:focus { border-color: var(--primary); }
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: var(--radius);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    font-family: inherit;
}
.btn-primary {
    background: var(--grad);
    color: var(--primary-fg);
    width: 100%;
    margin-top: 4px;
}
.btn-primary:hover { opacity: 0.88; }
.error-msg {
    font-size: 0.8rem;
    color: var(--destructive);
    margin-bottom: 0.75rem;
}
</style>
</head>
<body>
<!--
    Form posts to userAuth.php and uses input names txtUser / txtPassword
    to match login.html in cs445_php_web.pdf (slide 41).
-->
<form class="card login-card" name="frmLogin" method="POST" action="userAuth.php">
    <div class="login-logo">
        <div class="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="22" height="22"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div>
            <h1 style="font-size:1.8rem;line-height:1;">BookstoreDB</h1>
            <p class="muted" style="font-size:0.82rem;margin-top:2px;">Sign in to continue</p>
        </div>
    </div>
    <div class="form-group">
        <label for="inp-user">Username</label>
        <input id="inp-user" name="txtUser" type="text" placeholder="reader" required>
    </div>
    <div class="form-group">
        <label for="inp-pass">Password</label>
        <input id="inp-pass" name="txtPassword" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required>
    </div>
    <button class="btn btn-primary" name="btnLogin" type="submit">Log in</button>
</form>
</body>
</html>

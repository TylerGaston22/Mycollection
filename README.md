
  # Movie Tracker Website

  This is a code bundle for Movie Tracker Website. The original project is available at https://www.figma.com/design/P1DjW8MdZrO9bS97QGRbhu/Movie-Tracker-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Testing on your phone (ngrok)

  In one terminal, start the dev server:

  ```
  npm run dev
  ```

  In a second terminal, open a public tunnel:

  ```
  npm run ngrok
  ```

  ngrok prints a public `https://….ngrok-free.app` URL — open that on your phone to load the dev site. Both terminals must stay running; Ctrl+C in either one shuts that piece down.

  If Vite logs a port other than 5173 (it picks the next free port when 5173 is busy), edit the `ngrok` script in `package.json` to match, or run `ngrok http <port>` directly.
  </content>

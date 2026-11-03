## How to run

Create `.env` and `./src/secret.txt`, put the application port in format `APP_PORT={port}` into `.env`
and the restcountries API key into `secret.txt` (just paste it in).

Run `docker-compose --env-file .env up --build`, go to `localhost:5000` in the browser, enjoy.
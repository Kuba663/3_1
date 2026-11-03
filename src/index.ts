import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import exit from 'node:process'
import {type Country} from '@yusifaliyevpro/countries';
import {type Server} from 'node:http';

const originalConsoleLog = console.log;
const originalConsoleErr = console.error;

const today: string = new Date().toISOString().replace(':','ː');
const log: string = `./logs/3_1-${today}.log`;

fs.writeFileSync(log, "");

console.log = function(...data: any[]) {
    const date = new Date().toISOString();
    originalConsoleLog(date, ...data);
    fs.appendFileSync(log, `[LOG][${date}] ${data.join(' ')}\n`)
}

console.error = function(...data: any[]) {
    const date = new Date().toISOString();
    originalConsoleErr(date, ...data);
    fs.appendFileSync(log, `[ERROR][${date}] ${data.join(' ')}\n`)
}

type CountryResponse = {
    data: {
        objects: Country[];
    }
};

type CountryError = {
    errors: {
        message: string;
        code: string;
    }[]
};

let index: Buffer;
let API_KEY: string;

console.log("Reading HTML file");
fs.readFile("./index.html", (err: Error | null, data: Buffer<ArrayBufferLike>) => {
    if (err != null) {
        console.error(err.message);
        exit.exit('-1');
    }
    index = data;
    console.log("HTML file read");
});

console.log("Reading API key");
fs.readFile("/run/secrets/api_key", (err: Error | null, data: Buffer<ArrayBufferLike>) => {
    if (err != null) {
        console.error(err.message);
        exit.exit('-1');
    }
    API_KEY = data.toString();
    console.log("API Key read");
});

const app: Express = express();

const myLogger = function (req: Request, res: Response, next: NextFunction) {
  console.log(req.method, req.ip, req.url);
  next();
};

app.use(express.static("static"));
app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['Access-Control-Allow-Origin'] = "*";
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).contentType('html').send(index);
});

app.get('/country/:country', (req: Request, res: Response) => {
    const country: string = req.params.country as string;
    getCountryData(country).then((rslt) => {
        res.status(200).contentType('application/json').json({countries: rslt});
    }).catch((err) => {
        console.error(err);
        res.status(500).contentType('application/json').json(err);
    });
});

async function getCountryData(country: string): Promise<Country[]> {
    return new Promise((resolve, reject) => {
        var options = { headers: { Authorization: "Bearer " + API_KEY }, method: "GET" };
        fetch(`https://api.restcountries.com/countries/v5?q=${country}`,
            options
        ).then(
            (response) => {
                response.json().then((json: CountryResponse | CountryError) => {
                    if ((json as CountryResponse).data)
                        resolve((json as CountryResponse).data.objects);
                    else if ((json as CountryError).errors)
                        reject((json as CountryError).errors);
                }).catch((reason) => reject(reason));
            }
        ).catch((reason) => reject(reason));
    });
}

app.use(myLogger);

const server: Server = app.listen(process.env.APP_PORT, () => {
    console.log("Listening on:", server.address());
});

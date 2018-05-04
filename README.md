# google-finance-data
Real-time stock quotes and data from Google Finance for Node.js

## Install
```
$ npm install google-finance-data --save
```

## Usage
```javascript
var google = require("google-finance-data");

google.getSymbol("msft")
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.stack ? err.stack : err));

/*
{
  "symbol": "MSFT",
  "companyName": "Microsoft Corporation",
  "ticker": "NASDAQ:MSFT",
  "last": 95.16,
  "open": 93.32,
  "high": 95.37,
  "low": 92.92,
  "marketCap": "726.78B",
  "peRatio": 26.42,
  "yield": 1.77,
  "prevClose": 94.07,
  "high52week": 97.9,
  "low52week": 67.14
}
*/
```

## License
MIT license; see [LICENSE](./LICENSE).

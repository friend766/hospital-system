const http = require('http');

http.get('http://localhost:3000/api/organizations', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("HTTP STATUS:", res.statusCode);
    console.log("RESPONSE FROM LOCAL API:", data);
  });
}).on('error', (err) => {
  console.error("HTTP GET ERROR:", err.message);
});

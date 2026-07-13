const http = require('http');

http.get('http://localhost:5000/uploads/1783675952521-344285257.webp', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (err) => console.error(err));

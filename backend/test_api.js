const http = require('http');

http.get('http://localhost:5000/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('Products:', JSON.stringify(products.slice(0, 1), null, 2));
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (err) => console.error(err));

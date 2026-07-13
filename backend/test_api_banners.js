const http = require('http');

http.get('http://localhost:5000/api/homepage', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Banners:', JSON.stringify(result.heroBanners, null, 2));
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (err) => console.error(err));

async function testApi() {
  try {
    const res = await fetch('http://localhost:5000/api/templates?status=published');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testApi();

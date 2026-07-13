async function testPost() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@pandp.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const res = await fetch('http://localhost:5000/api/hero-banners', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Test Banner',
        panel_position: 'left',
        image: 'https://via.placeholder.com/400',
        cta_label: '',
        cta_link: '',
        subtitle_links: null,
        sort_order: 0,
        is_active: true
      })
    });
    
    if (!res.ok) {
        console.error('Error response:', await res.text());
    } else {
        console.log('Success:', await res.json());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
testPost();

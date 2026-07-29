async function testUpdate() {
  try {
    const res = await fetch('http://localhost:5000/api/templates?status=published');
    const templates = await res.json();
    
    const tshirt = templates.find(t => t.name === 'TSHirt');
    if (!tshirt) return console.log('TSHirt not found');
    
    const newFaces = [
      ...tshirt.faces,
      {
        id: 'new-face',
        name: 'Face 2',
        baseImageUrl: tshirt.baseImageUrl,
        printArea: tshirt.printArea,
        constraints: tshirt.constraints,
        shadingMapUrl: ''
      }
    ];
    
    const updateRes = await fetch(`http://localhost:5000/api/templates/${tshirt.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
        // might need auth? I will just check if we can update it without auth, 
        // template.routes.js says protect, admin for PATCH.
      },
      body: JSON.stringify({ faces: newFaces })
    });
    
    if (updateRes.status === 401) {
      console.log('Unauthorized, cannot test update via script without token');
    } else {
      console.log('Updated successfully');
    }
  } catch (err) {
    console.error(err);
  }
}

testUpdate();

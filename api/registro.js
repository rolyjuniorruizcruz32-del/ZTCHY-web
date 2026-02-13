export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, nombre } = req.body;
    
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    // Por ahora solo devolver éxito para probar
    return res.status(200).json({ 
      success: true,
      email: email.toLowerCase().trim(),
      message: 'Test OK'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error interno',
      details: error.message 
    });
  }
}

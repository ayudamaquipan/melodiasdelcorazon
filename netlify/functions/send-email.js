// netlify/functions/send-email.js
const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Solo permite método POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }
  
  try {
    const data = JSON.parse(event.body);
    
    // Configura el transportador de correo
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Formatea los datos del formulario para el correo
    const packageMap = {
      'basic': 'Canción Básica - €99',
      'premium': 'Canción Premium - €149',
      'deluxe': 'Canción Deluxe - €249',
      'mother-special': 'Especial Día de la Madre - €84'
    };
    
    const occasionMap = {
      'mother': 'Día de la Madre',
      'birthday': 'Cumpleaños',
      'anniversary': 'Aniversario',
      'wedding': 'Boda',
      'valentine': 'San Valentín',
      'other': 'Otra ocasión'
    };
    
    const styleMap = {
      'ballad': 'Balada',
      'pop': 'Pop',
      'rock': 'Rock suave',
      'folk': 'Folk/Acústico',
      'latinpop': 'Pop Latino',
      'rnb': 'R&B',
      'other': 'Otro estilo'
    };
    
    // Construye el cuerpo del correo
    const emailBody = `
      <h2>Nueva solicitud de canción personalizada</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone || 'No proporcionado'}</p>
      <p><strong>Ocasión:</strong> ${occasionMap[data.occasion] || data.occasion}</p>
      <p><strong>Estilo musical:</strong> ${styleMap[data.style] || data.style}</p>
      <p><strong>Paquete:</strong> ${packageMap[data.package] || data.package}</p>
      <p><strong>Fecha requerida:</strong> ${data.deadline}</p>
      <h3>Historia para la canción:</h3>
      <p>${data.description.replace(/\n/g, '<br>')}</p>
      ${data.additional ? `<h3>Información adicional:</h3><p>${data.additional.replace(/\n/g, '<br>')}</p>` : ''}
      <hr>
      <p><small>Este mensaje se ha generado automáticamente desde el formulario de contacto de MelodíasDelCorazón.</small></p>
    `;
    
    // Opciones del correo
    let mailOptions = {
      from: `"MelodíasDelCorazón" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nueva solicitud: ${packageMap[data.package] || data.package} - ${data.name}`,
      html: emailBody
    };
    
    // Envía el correo
    await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Correo enviado correctamente' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al enviar el correo', details: error.message })
    };
  }
};

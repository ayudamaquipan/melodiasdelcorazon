// netlify/functions/create-preference.js
const axios = require('axios');

exports.handler = async function(event, context) {
  // Solo permitir método POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    // Obtener los datos del cuerpo de la solicitud
    const data = JSON.parse(event.body);
    const { title, price, quantity, email, description } = data;

    // Configurar la solicitud a la API de MercadoPago
    const url = 'https://api.mercadopago.com/checkout/preferences';
    
    // Los datos para crear la preferencia
    const preference = {
      items: [
        {
          title: title,
          unit_price: Number(price),
          quantity: Number(quantity) || 1,
        }
      ],
      payer: {
        email: email,
      },
      // Permitir pagos como invitado (sin cuenta de MercadoPago)
      binary_mode: true,
      // Configuración para mostrar todos los métodos de pago disponibles
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: `${process.env.URL}/success`,
        failure: `${process.env.URL}/failure`,
        pending: `${process.env.URL}/pending`,
      },
      auto_return: "approved",
      statement_descriptor: "MelodiasDelCorazon",
      metadata: {
        description: description
      }
    };

    // Realizar la solicitud a MercadoPago
    const response = await axios.post(url, preference, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    });

    // Devolver la respuesta al cliente
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: response.data.id,
        init_point: response.data.init_point
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al crear la preferencia de pago', details: error.message })
    };
  }
};

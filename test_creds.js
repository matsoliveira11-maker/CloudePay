const fetch = require('node-fetch'); // If not available, use built-in fetch in newer Node.js

async function testCreds() {
  const response = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: "2675275609146715",
      client_secret: "BQ45Qwu6IMr0AVUhjQTrrSsiKXlqGQRi",
      grant_type: "authorization_code",
      code: "fake_code",
      redirect_uri: "https://cloudepay.vercel.app/auth/callback"
    })
  });
  const data = await response.json();
  console.log(data);
}

testCreds();

const axios = require('axios');

async function test() {
  try {
    const res = await axios.post("https://pay.moneyfusion.net/api/v2/links/init-payment", {
       id: "6a07c1723e8ed1397e29e0da",
       montant: "2500",
       name: "Parfait loua",
       phone: "0140814162",
       customerEmail: "parfaitloua@gmail.com",
       countryCode: "+225"
    }, {
       headers: { "Content-Type": "application/json" }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();

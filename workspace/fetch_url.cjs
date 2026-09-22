const axios = require('axios');
axios.get('https://my.moneyfusion.net/6a07c1723e8ed1397e29e0da')
  .then(res => {
     console.log(res.data.substring(0, 1500));
  });

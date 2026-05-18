const url = "https://payin.moneyfusion.net/payment/6a0a72ca95a060327ff13c11/5000/Parfait228";
const parts = url.split('/');
parts[parts.length - 1] = encodeURIComponent("Adela Mining");
console.log(parts.join('/'));

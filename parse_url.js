const url1 = 'https://my.moneyfusion.net/6a4cad8644eafb83a0614894';
const url2 = 'https://payin.moneyfusion.net/payment/6a0a72ca95a060327ff13c11';
function transformUrl(baseUrl) {
  const match = baseUrl.match(/([a-f0-9]{24})/i);
  if (match) {
    return `https://payin.moneyfusion.net/payment/${match[1]}`;
  }
  return baseUrl;
}
console.log(transformUrl(url1));
console.log(transformUrl(url2));

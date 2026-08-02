const { URLSearchParams } = require('url');
const url = 'http://localhost:3000/register?ref=ABCD';
const searchParams = new URLSearchParams(url.split('?')[1]);
console.log(searchParams.get('ref'));

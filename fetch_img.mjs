import fs from 'fs';

async function run() {
  const res = await fetch('https://imgur.com/a/iu8I0PT');
  const text = await res.text();
  
  // Look for og:image
  const match = text.match(/<meta property="og:image" content="(.*?)"/);
  if (match && match[1]) {
    let imgUrl = match[1];
    // sometimes it adds ?fb to the end
    imgUrl = imgUrl.split('?')[0];
    console.log('Downloading', imgUrl);
    
    const imgRes = await fetch(imgUrl);
    const buffer = await imgRes.arrayBuffer();
    fs.writeFileSync('public/app_icon.png', Buffer.from(buffer));
    console.log('Saved public/app_icon.png');
  } else {
    console.log('Not found');
  }
}
run();

const fruits = ['kiwi', 'lemon'];
const images = [];
for (const f of fruits) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${f}&per_page=1`, {
    headers: { Authorization: "563492ad6f917000010000018f6734efeb104fef94c6b81a704f5e04" }
  });
  const data = await res.json();
  if (data.photos && data.photos.length > 0) {
    images.push({ fruit: f, url: data.photos[0].src.large });
  }
}
console.log(images);

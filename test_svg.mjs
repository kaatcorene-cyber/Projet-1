const getFruitImage = (emoji, color1, color2) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g)" />
    <text y="55%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="55">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
console.log(getFruitImage('🍓', '#ff9a9e', '#fecfef'));

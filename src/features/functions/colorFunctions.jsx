export function parseColorToRGB(color) {
  if (!color) return { r: 255, g: 255, b: 255 };

  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g)?.map(Number) || [255, 255, 255];
    return { r: nums[0], g: nums[1], b: nums[2] };
  }

  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return { r: 255, g: 255, b: 255 };
  }

  return { r, g, b };
}

export function getRelativeLuminance({ r, g, b }) {
  const toLinear = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function lightenColor(color, amount = 0.35) {
  if (!color) return "#ffffff";

  // rgb(...) -> rgb(...) (lighten)
  if (color.startsWith("rgb")) {
    const { r, g, b } = parseColorToRGB(color);
    if (r > 245 && g > 245 && b > 245) return "rgb(255, 255, 255)";
    const nr = Math.round(r + (255 - r) * amount);
    const ng = Math.round(g + (255 - g) * amount);
    const nb = Math.round(b + (255 - b) * amount);
    return `rgb(${nr}, ${ng}, ${nb})`;
  }

  // hex -> rgb(...) (lighten)
  const { r, g, b } = parseColorToRGB(color);
  if (r > 245 && g > 245 && b > 245) return "#ffffff";

  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);

  return `rgb(${nr}, ${ng}, ${nb})`;
}

export function getReadableTextColor(bgColor) {
  const rgb = parseColorToRGB(bgColor);
  const luminance = getRelativeLuminance(rgb);
  return luminance > 0.5 ? "#111827" : "#ffffff";
}
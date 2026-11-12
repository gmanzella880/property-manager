/**
 * Reads the optional layout fields (bedrooms, bathrooms, squareFeet) from a
 * request body. A field that is absent is left out (so an update leaves it
 * alone); a blank or invalid value clears it. Bedrooms 0 means a studio.
 */
export function unitDetailsFrom(body) {
  const data = {};
  const read = (key, parse) => {
    if (!(key in body)) return;
    const n = body[key] === "" || body[key] == null ? NaN : parse(body[key]);
    data[key] = Number.isFinite(n) && n >= 0 ? n : null;
  };
  read("bedrooms", (v) => parseInt(v));
  read("bathrooms", (v) => parseFloat(v));
  read("squareFeet", (v) => parseInt(v));
  return data;
}

/** "2 bed · 1 bath · 880 sq ft" (only the parts that are filled in). */
export function formatUnitDetails(unit) {
  const parts = [];
  if (unit.bedrooms != null) parts.push(unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} bed`);
  if (unit.bathrooms != null) parts.push(`${unit.bathrooms} bath`);
  if (unit.squareFeet != null) parts.push(`${unit.squareFeet.toLocaleString("en-US")} sq ft`);
  return parts.join(" · ");
}

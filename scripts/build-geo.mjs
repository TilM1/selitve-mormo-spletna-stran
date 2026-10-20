// Builds the data behind the route map. Run once with `npm run geo`, commit the output.
//
// Sources (all open data):
//   Outline   geoBoundaries gbOpen SVN ADM0 (simplified), public domain
//   Towns     OpenStreetMap Nominatim geocoder, © OpenStreetMap contributors (ODbL)
//   Distances OSRM driving table on OpenStreetMap roads, © OpenStreetMap contributors (ODbL)
//   Roads     OSRM driving routes between motorway end points (real road geometry, simplified)
//
// Writes:
//   data/places.json     towns with projected map coordinates
//   data/distances.json  road distance in km between every pair of towns
//   data/map.json        outline and road paths for the SVG

import { writeFile, mkdir } from "node:fs/promises";

const OUTLINE_URL =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/SVN/ADM0/geoBoundaries-SVN-ADM0_simplified.geojson";
const OSRM = "https://router.project-osrm.org";
const UA = "selitve-mormo-site-build/1.0 (map data, one-off)";

// [id, name, label always visible on the map]
const PLACES = [
  ["ljubljana", "Ljubljana", true],
  ["grosuplje", "Grosuplje", false],
  ["skofljica", "Škofljica", false],
  ["ivancna-gorica", "Ivančna Gorica", false],
  ["domzale", "Domžale", false],
  ["kamnik", "Kamnik", false],
  ["medvode", "Medvode", false],
  ["skofja-loka", "Škofja Loka", false],
  ["vrhnika", "Vrhnika", false],
  ["logatec", "Logatec", false],
  ["litija", "Litija", false],
  ["kranj", "Kranj", true],
  ["radovljica", "Radovljica", false],
  ["bled", "Bled", false],
  ["jesenice", "Jesenice", false],
  ["idrija", "Idrija", false],
  ["postojna", "Postojna", false],
  ["ilirska-bistrica", "Ilirska Bistrica", false],
  ["kocevje", "Kočevje", false],
  ["ribnica", "Ribnica", false],
  ["novo-mesto", "Novo mesto", true],
  ["crnomelj", "Črnomelj", false],
  ["metlika", "Metlika", false],
  ["krsko", "Krško", false],
  ["brezice", "Brežice", false],
  ["trbovlje", "Trbovlje", false],
  ["celje", "Celje", true],
  ["velenje", "Velenje", false],
  ["slovenj-gradec", "Slovenj Gradec", false],
  ["maribor", "Maribor", true],
  ["ptuj", "Ptuj", false],
  ["murska-sobota", "Murska Sobota", true],
  ["lendava", "Lendava", false],
  ["koper", "Koper", true],
  ["izola", "Izola", false],
  ["piran", "Piran", false],
  ["sezana", "Sežana", false],
  ["nova-gorica", "Nova Gorica", true],
  ["ajdovscina", "Ajdovščina", false],
  ["tolmin", "Tolmin", false],
];

// Motorway corridors, routed over real roads between their end points.
const ROADS = [
  ["A1", ["koper", "ljubljana"]],
  ["A1", ["ljubljana", "celje", "maribor"]],
  ["A2", ["jesenice", "kranj", "ljubljana"]],
  ["A2", ["ljubljana", "novo-mesto", "brezice"]],
  ["A4", ["maribor", "ptuj"]],
  ["A5", ["maribor", "murska-sobota", "lendava"]],
  ["H4", ["postojna", "ajdovscina", "nova-gorica"]],
  ["A3", ["sezana", "postojna"]],
];

// Equirectangular projection, scaled for latitude 46.1°. Good enough for a country this small.
const LON0 = 13.35;
const LAT0 = 46.9;
const K = Math.cos((46.1 * Math.PI) / 180);
const S = 441;
const project = ([lon, lat]) => [(lon - LON0) * K * S, (LAT0 - lat) * S];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (n) => Math.round(n * 10) / 10;

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Douglas-Peucker on projected points.
function simplify(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const toPath = (pts, close) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join("") + (close ? "Z" : "");

async function main() {
  await mkdir("data", { recursive: true });

  // Outline
  const outline = await getJson(OUTLINE_URL);
  const ring = outline.features[0].geometry.coordinates[0].map(project);
  // A closed ring starts and ends on the same point, which Douglas-Peucker cannot split; do each half.
  const half = Math.floor(ring.length / 2);
  const outlinePts = [...simplify(ring.slice(0, half + 1), 0.7), ...simplify(ring.slice(half), 0.7).slice(1, -1)];
  const outlinePath = toPath(outlinePts, true);

  // Towns
  const places = [];
  for (const [id, name, major] of PLACES) {
    const q = new URLSearchParams({ q: name, countrycodes: "si", format: "json", limit: "1", featureType: "settlement" });
    const [hit] = await getJson(`https://nominatim.openstreetmap.org/search?${q}`);
    if (!hit) throw new Error(`Not found: ${name}`);
    const lon = Number(hit.lon);
    const lat = Number(hit.lat);
    const [x, y] = project([lon, lat]);
    places.push({ id, name, major, lat: Number(lat.toFixed(5)), lon: Number(lon.toFixed(5)), x: r1(x), y: r1(y) });
    console.log("geocoded", name, lat, lon);
    await sleep(1100); // Nominatim usage policy: max 1 request per second
  }

  // Distance table (metres → km)
  const coords = places.map((p) => `${p.lon},${p.lat}`).join(";");
  const table = await getJson(`${OSRM}/table/v1/driving/${coords}?annotations=distance`);
  if (table.code !== "Ok") throw new Error(`OSRM table: ${table.code}`);
  const km = table.distances.map((row) => row.map((m) => (m == null ? null : Math.round(m / 1000))));
  // OSRM routes A→B and B→A separately; one-way streets make them differ slightly. Show one number per pair.
  for (let i = 0; i < km.length; i++)
    for (let j = i + 1; j < km.length; j++) {
      const a = km[i][j];
      const b = km[j][i];
      const v = a != null && b != null ? Math.round((a + b) / 2) : (a ?? b);
      km[i][j] = km[j][i] = v;
    }

  // Roads
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));
  const roads = [];
  for (const [ref, via] of ROADS) {
    const c = via.map((id) => `${byId[id].lon},${byId[id].lat}`).join(";");
    const route = await getJson(`${OSRM}/route/v1/driving/${c}?overview=full&geometries=geojson`);
    if (route.code !== "Ok") throw new Error(`OSRM route ${ref}: ${route.code}`);
    const pts = simplify(route.routes[0].geometry.coordinates.map(project), 1.2);
    roads.push({ ref, d: toPath(pts, false) });
    await sleep(500);
  }

  const meta = {
    generated: new Date().toISOString().slice(0, 10),
    viewBox: "0 0 1000 662",
    sources: [
      "Meja: geoBoundaries (gbOpen SVN ADM0), javna domena",
      "Kraji, ceste in razdalje: © OpenStreetMap contributors (ODbL), geokodiranje Nominatim, usmerjanje OSRM",
    ],
  };

  await writeFile("data/places.json", JSON.stringify(places, null, 1) + "\n");
  await writeFile("data/distances.json", JSON.stringify({ ...meta, ids: places.map((p) => p.id), km }) + "\n");
  await writeFile("data/map.json", JSON.stringify({ ...meta, outline: outlinePath, roads }) + "\n");
  console.log(`Done: ${places.length} places, ${roads.length} road paths.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

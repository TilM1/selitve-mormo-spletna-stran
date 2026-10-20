import placesData from "@/data/places.json";
import distanceData from "@/data/distances.json";

export type Place = (typeof placesData)[number];

export const places: Place[] = placesData;
export const ABROAD_ID = "tujina";
export const ABROAD_LABEL = "Tujina";

const fold = (s: string) =>
  s
    .toLocaleLowerCase("sl")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function placeById(id: string | null | undefined) {
  return id ? places.find((p) => p.id === id) : undefined;
}

// "ljubljana", "Ljubljana ", "LJUBLJANA" all match Ljubljana. A full address does not, on purpose.
export function matchPlace(text: string): Place | undefined {
  const f = fold(text);
  return f ? places.find((p) => fold(p.name) === f) : undefined;
}

export function isAbroad(text: string) {
  return fold(text) === fold(ABROAD_LABEL);
}

const index = new Map(distanceData.ids.map((id, i) => [id, i]));

/** Road distance in km from the OSM/OSRM table, or null when the pair is not in the data. */
export function roadKm(fromId: string | undefined, toId: string | undefined): number | null {
  if (!fromId || !toId || fromId === toId) return null;
  const i = index.get(fromId);
  const j = index.get(toId);
  if (i == null || j == null) return null;
  return distanceData.km[i]?.[j] ?? null;
}

export type DistanceInfo =
  | { kind: "km"; km: number }
  | { kind: "abroad" }
  | { kind: "unknown" }
  | { kind: "none" };

export function describeDistance(from: { id?: string; text: string }, to: { id?: string; text: string }): DistanceInfo {
  if (!from.text.trim() || !to.text.trim()) return { kind: "none" };
  if (isAbroad(from.text) || isAbroad(to.text)) return { kind: "abroad" };
  const km = roadKm(from.id ?? matchPlace(from.text)?.id, to.id ?? matchPlace(to.text)?.id);
  return km == null ? { kind: "unknown" } : { kind: "km", km };
}

export function distanceLabel(d: DistanceInfo) {
  switch (d.kind) {
    case "km":
      return `približno ${d.km} km po cesti`;
    case "abroad":
      return "Kilometri po dogovoru.";
    case "unknown":
      return "Razdaljo preverimo ob pripravi ponudbe.";
    default:
      return "";
  }
}

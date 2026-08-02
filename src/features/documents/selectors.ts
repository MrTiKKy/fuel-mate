import type { DocumentType, VehicleDocument } from "@/types";

export type DocumentSort =
  | "newest"
  | "expiry"
  | "type"
  | "vehicle";

export type DocumentFilters = {
  vehicleId: string | "all";
  type: DocumentType | "all";
  query: string;
  sort: DocumentSort;
};

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  vehicleId: "all",
  type: "all",
  query: "",
  sort: "newest",
};

export function filterAndSortDocuments(
  documents: VehicleDocument[],
  filters: DocumentFilters,
): VehicleDocument[] {
  const query = filters.query.trim().toLowerCase();

  let list = documents.filter((doc) => {
    if (filters.vehicleId !== "all" && doc.vehicleId !== filters.vehicleId) {
      return false;
    }
    if (filters.type !== "all" && doc.type !== filters.type) {
      return false;
    }
    if (query) {
      const haystack = [
        doc.title,
        doc.issuer ?? "",
        doc.notes ?? "",
        doc.type,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    switch (filters.sort) {
      case "expiry": {
        const aExp = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const bExp = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return aExp - bExp;
      }
      case "type":
        return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
      case "vehicle":
        return (
          a.vehicleId.localeCompare(b.vehicleId) ||
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "newest":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  return list;
}

export function groupDocumentsByVehicle(
  documents: VehicleDocument[],
): Map<string, VehicleDocument[]> {
  const map = new Map<string, VehicleDocument[]>();
  for (const doc of documents) {
    const list = map.get(doc.vehicleId) ?? [];
    list.push(doc);
    map.set(doc.vehicleId, list);
  }
  return map;
}

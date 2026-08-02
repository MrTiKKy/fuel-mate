import type {
  CreateDocumentInput,
  DocumentAttachment,
  DocumentFileBlob,
  DocumentReminder,
  DocumentType,
  UpdateDocumentInput,
  VehicleDocument,
} from "@/types";
import { getDatabase, STORES } from "@/lib/db";
import { createId } from "@/features/cars/utils";
import {
  DOCUMENT_DUE_SOON_DAYS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_UPCOMING_DAYS,
} from "@/features/documents/constants";

function sortNewest(docs: VehicleDocument[]) {
  return [...docs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getDocuments(): Promise<VehicleDocument[]> {
  const db = await getDatabase();
  return sortNewest(await db.getAll(STORES.documents));
}

export async function getDocumentsByVehicle(
  vehicleId: string,
): Promise<VehicleDocument[]> {
  const db = await getDatabase();
  const docs = await db.getAllFromIndex(
    STORES.documents,
    "by-vehicle",
    vehicleId,
  );
  return sortNewest(docs);
}

export async function getDocument(
  id: string,
): Promise<VehicleDocument | undefined> {
  const db = await getDatabase();
  return db.get(STORES.documents, id);
}

export async function createDocument(
  input: CreateDocumentInput,
  files: File[] = [],
): Promise<VehicleDocument> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = createId();

  const attachments: DocumentAttachment[] = [];
  for (const file of files) {
    const fileId = createId();
    const meta: DocumentAttachment = {
      id: fileId,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
    };
    attachments.push(meta);
    const blobRecord: DocumentFileBlob = {
      id: fileId,
      documentId: id,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size,
      blob: file,
      createdAt: now,
    };
    await db.put(STORES.documentFiles, blobRecord);
  }

  const document: VehicleDocument = {
    ...input,
    id,
    attachments,
    createdAt: now,
    updatedAt: now,
  };

  await db.put(STORES.documents, document);
  return document;
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput,
  newFiles: File[] = [],
): Promise<VehicleDocument> {
  const db = await getDatabase();
  const existing = await db.get(STORES.documents, id);
  if (!existing) throw new Error("Document not found");

  const now = new Date().toISOString();
  const attachments = [...existing.attachments];

  for (const file of newFiles) {
    const fileId = createId();
    const meta: DocumentAttachment = {
      id: fileId,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
    };
    attachments.push(meta);
    await db.put(STORES.documentFiles, {
      id: fileId,
      documentId: id,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size,
      blob: file,
      createdAt: now,
    });
  }

  const next: VehicleDocument = {
    ...existing,
    ...input,
    id: existing.id,
    attachments,
    createdAt: existing.createdAt,
    updatedAt: now,
  };

  await db.put(STORES.documents, next);
  return next;
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get(STORES.documents, id);
  if (!existing) throw new Error("Document not found");

  const files = await db.getAllFromIndex(
    STORES.documentFiles,
    "by-document",
    id,
  );
  const tx = db.transaction(
    [STORES.documents, STORES.documentFiles],
    "readwrite",
  );
  await tx.objectStore(STORES.documents).delete(id);
  for (const file of files) {
    await tx.objectStore(STORES.documentFiles).delete(file.id);
  }
  await tx.done;
}

export async function deleteDocumentAttachment(
  documentId: string,
  attachmentId: string,
): Promise<VehicleDocument> {
  const db = await getDatabase();
  const existing = await db.get(STORES.documents, documentId);
  if (!existing) throw new Error("Document not found");

  await db.delete(STORES.documentFiles, attachmentId);
  const next: VehicleDocument = {
    ...existing,
    attachments: existing.attachments.filter((item) => item.id !== attachmentId),
    updatedAt: new Date().toISOString(),
  };
  await db.put(STORES.documents, next);
  return next;
}

export async function getDocumentFile(
  attachmentId: string,
): Promise<DocumentFileBlob | undefined> {
  const db = await getDatabase();
  return db.get(STORES.documentFiles, attachmentId);
}

export async function getDocumentFiles(
  documentId: string,
): Promise<DocumentFileBlob[]> {
  const db = await getDatabase();
  return db.getAllFromIndex(STORES.documentFiles, "by-document", documentId);
}

export function getDocumentTypeLabel(type: DocumentType) {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

function daysUntil(dateValue: string, now = new Date()) {
  const due = new Date(dateValue);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildDocumentReminder(
  document: VehicleDocument,
  now = new Date(),
): DocumentReminder | null {
  if (!document.expiryDate) return null;
  const daysRemaining = daysUntil(document.expiryDate, now);

  let status: DocumentReminder["status"] = "upcoming";
  let priority: DocumentReminder["priority"] = "low";

  if (daysRemaining < 0) {
    status = "overdue";
    priority = "high";
  } else if (daysRemaining <= DOCUMENT_DUE_SOON_DAYS) {
    status = "due_soon";
    priority = "high";
  } else if (daysRemaining <= DOCUMENT_UPCOMING_DAYS) {
    status = "upcoming";
    priority = "medium";
  } else {
    return null;
  }

  return {
    id: `doc-reminder-${document.id}`,
    documentId: document.id,
    vehicleId: document.vehicleId,
    title: document.title,
    type: document.type,
    expiryDate: document.expiryDate,
    daysRemaining,
    status,
    priority,
  };
}

export function getDocumentReminders(
  documents: VehicleDocument[],
  now = new Date(),
): DocumentReminder[] {
  return documents
    .map((doc) => buildDocumentReminder(doc, now))
    .filter((item): item is DocumentReminder => item !== null)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getMissingImportantTypes(
  documents: VehicleDocument[],
  vehicleId?: string,
): DocumentType[] {
  const scoped = vehicleId
    ? documents.filter((doc) => doc.vehicleId === vehicleId)
    : documents;
  const present = new Set(scoped.map((doc) => doc.type));
  return (
    [
      "insurance_rca",
      "itp",
      "vehicle_registration",
      "driving_license",
    ] as DocumentType[]
  ).filter((type) => !present.has(type));
}

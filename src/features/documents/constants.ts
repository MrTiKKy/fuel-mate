import type { DocumentType } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Car,
  CircleDot,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Fuel,
  IdCard,
  Receipt,
  Shield,
  ShieldCheck,
  Stamp,
  WalletCards,
} from "lucide-react";

export const DOCUMENT_TYPE_OPTIONS: {
  value: DocumentType;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "insurance_rca", label: "Insurance (RCA)", icon: Shield },
  { value: "casco", label: "CASCO", icon: ShieldCheck },
  { value: "itp", label: "ITP Certificate", icon: ClipboardCheck },
  { value: "vehicle_registration", label: "Vehicle Registration", icon: Stamp },
  {
    value: "vehicle_identity_card",
    label: "Vehicle Identity Card",
    icon: IdCard,
  },
  { value: "driving_license", label: "Driving License", icon: BadgeCheck },
  { value: "purchase_invoice", label: "Purchase Invoice", icon: Receipt },
  { value: "service_invoice", label: "Service Invoice", icon: FileSpreadsheet },
  { value: "fuel_receipt", label: "Fuel Receipts", icon: Fuel },
  { value: "tyre_invoice", label: "Tyre Invoice", icon: CircleDot },
  { value: "road_tax", label: "Road Tax", icon: WalletCards },
  { value: "warranty", label: "Warranty", icon: Car },
  { value: "other", label: "Other", icon: FileText },
];

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DocumentType, string>;

export const ACCEPTED_DOCUMENT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_DOCUMENT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const MAX_DOCUMENT_FILE_BYTES = 12 * 1024 * 1024;

export const DOCUMENT_UPCOMING_DAYS = 45;
export const DOCUMENT_DUE_SOON_DAYS = 14;

/** Important docs used for “missing document” dashboard hints */
export const IMPORTANT_DOCUMENT_TYPES: DocumentType[] = [
  "insurance_rca",
  "itp",
  "vehicle_registration",
  "driving_license",
];

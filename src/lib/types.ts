export const ROLES = [
  "direktur",
  "bendahara",
  "sekretaris",
  "ibadah",
  "pendidikan",
  "fasilitas",
  "pembimbing",
] as const;
export type Role = (typeof ROLES)[number];

export const CURRENCIES = ["JPY", "IDR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const LOCALES = ["id", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

interface Base {
  id: string;
  created_at: string;
}

export interface Profile extends Base {
  full_name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Account extends Base {
  name: string;
  currency: Currency;
  kind: "bank" | "cash" | "qris";
  opening_balance: number;
}

export interface Budget extends Base {
  program: string;
  year: number;
  currency: Currency;
  amount: number;
  notes: string | null;
}

export interface CashEntry extends Base {
  entry_date: string;
  account_id: string;
  currency: Currency;
  type: "in" | "out";
  category: string;
  amount: number;
  description: string;
  proof_path: string | null;
  budget_id: string | null;
  source: "manual" | "import" | "expense" | "donation";
  ref_id: string | null;
  dedupe_hash: string;
  created_by: string | null;
}

export type ExpenseStatus = "submitted" | "approved" | "rejected" | "paid";

export interface ExpenseRequest extends Base {
  title: string;
  category: string;
  amount: number;
  currency: Currency;
  budget_id: string | null;
  bill_id: string | null;
  needed_by: string | null;
  notes: string | null;
  status: ExpenseStatus;
  requested_by: string;
  requested_by_name: string;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  paid_by: string | null;
  paid_at: string | null;
  account_id: string | null;
  receipt_path: string | null;
  cash_entry_id: string | null;
}

export interface Bill extends Base {
  name: string;
  category: string;
  vendor: string | null;
  amount: number;
  currency: Currency;
  frequency: "monthly" | "quarterly" | "yearly";
  next_due: string;
  active: boolean;
  notes: string | null;
}

export type DonationStatus = "pending" | "matched" | "expired" | "rejected";

export interface Donation extends Base {
  reference_code: string;
  donor_name: string | null;
  kana_name: string | null;
  contact: string | null;
  program: string | null;
  amount: number;
  currency: Currency;
  channel: "qris" | "yucho" | "cash";
  status: DonationStatus;
  submitted_at: string;
  matched_line_id: string | null;
  matched_at: string | null;
  notes: string | null;
  /** Id baris asal di database web publik (donation_confirmations); null bila dicatat pengurus. */
  public_ref?: string | null;
}

export interface StatementImport extends Base {
  source: "qris_report" | "yucho_csv";
  account_id: string;
  file_name: string;
  file_hash: string;
  row_count: number;
  matched_count: number;
  imported_by: string;
}

export interface StatementLine extends Base {
  import_id: string;
  account_id: string;
  occurred_on: string;
  amount: number;
  currency: Currency;
  sender_name: string | null;
  description: string | null;
  status: "unmatched" | "matched" | "ignored";
  donation_id: string | null;
}

export interface RecurringDonor extends Base {
  full_name: string;
  contact: string | null;
  amount: number;
  currency: Currency;
  method: "qris" | "yucho" | "cash";
  pay_day: number | null;
  last_paid_on: string | null;
  active: boolean;
  notes: string | null;
  public_ref?: string | null;
}

export interface InventoryItem extends Base {
  code: string | null;
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: "good" | "needs_repair" | "broken" | "lost";
  acquired_on: string | null;
  photo_path: string | null;
  notes: string | null;
}

export interface Congregant extends Base {
  full_name: string;
  contact: string | null;
  city: string | null;
  nationality: string | null;
  consent_news: boolean;
  notes: string | null;
}

export interface Muallaf extends Base {
  full_name: string;
  contact: string | null;
  shahada_date: string | null;
  mentor_id: string | null;
  needs: string | null;
  progress_notes: string | null;
  status: "active" | "independent" | "inactive";
}

export interface Room extends Base {
  name: string;
  capacity: number;
  /** Kunci ruangan yang sama di web publik (content_items.item_key). */
  public_key?: string | null;
}

export type BookingStatus = "requested" | "approved" | "declined" | "confirmed";

export interface RoomBooking extends Base {
  room_id: string;
  purpose: string;
  organizer_name: string;
  contact: string | null;
  attendees: number | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  decision_note: string | null;
  decided_by: string | null;
  source: "internal" | "public";
  public_ref?: string | null;
}

export interface Issue extends Base {
  title: string;
  location: string | null;
  severity: "low" | "medium" | "high";
  status: "open" | "in_progress" | "done";
  reported_on: string;
  reported_by_name: string | null;
  notes: string | null;
  public_ref?: string | null;
}

export interface EventItem extends Base {
  title: string;
  kind: "jumuah" | "kajian" | "class" | "meeting" | "other";
  starts_at: string;
  location: string | null;
  officer: string | null;
  notes: string | null;
  /** Id agenda di web publik bila kegiatan ini sudah ditampilkan di sana. */
  public_ref?: string | null;
}

export interface TpaStudent extends Base {
  full_name: string;
  guardian_contact: string | null;
  class_name: string | null;
  active: boolean;
  public_ref?: string | null;
}

export interface TpaAttendance extends Base {
  student_id: string;
  date: string;
  status: "present" | "permit" | "sick" | "absent";
}

export interface LetterTemplate extends Base {
  code: string;
  name: string;
  body: string;
}

export interface Letter extends Base {
  template_id: string;
  number: string;
  subject: string;
  data: Record<string, string>;
  body: string;
  issued_on: string;
  created_by: string;
}

export interface ActivityLog extends Base {
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string | null;
}

export interface Tables {
  profiles: Profile;
  accounts: Account;
  budgets: Budget;
  cash_entries: CashEntry;
  expense_requests: ExpenseRequest;
  bills: Bill;
  donations: Donation;
  statement_imports: StatementImport;
  statement_lines: StatementLine;
  recurring_donors: RecurringDonor;
  inventory_items: InventoryItem;
  congregants: Congregant;
  muallaf: Muallaf;
  rooms: Room;
  room_bookings: RoomBooking;
  issues: Issue;
  events: EventItem;
  tpa_students: TpaStudent;
  tpa_attendance: TpaAttendance;
  letter_templates: LetterTemplate;
  letters: Letter;
  activity_logs: ActivityLog;
}
export type TableName = keyof Tables;
export type AnyRow = { id: string; created_at: string } & Record<string, unknown>;

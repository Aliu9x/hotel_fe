export interface RegistrationBundle {
  meta: {
    code: string;
    createdAt: string;
    updatedAt: string;
    completedOverview: boolean;
    completedContract: boolean;
    hotelId?: number; // NEW
    status?: "IN_PROGRESS" | "PENDING" | "APPROVED"; // NEW
  };
  data: {
    basicInfo?: Record<string, any>;
    addressInfo?: Record<string, any>;
    contactInfo?: Record<string, any>;
    legalEntity?: Record<string, any>;
    signatory?: Record<string, any>;
    terms?: Record<string, any>;
    files?: {
      contract_pdf_filename?: string;
      identity_doc_filename?: string;
    };
  };
  stepFlags: {
    BASIC_INFO: boolean;
    ADDRESS: boolean;
    CONTACT: boolean;
    LEGAL_ENTITY_INFO: boolean;
    SIGNATORY_INFO: boolean;
    TERMS: boolean;
  };
}

const INDEX_KEY = "partnerRegIndex";
function regKey(code: string) { return `partnerReg:${code}`; }

export function generateRegistrationCode(): string {
  const num = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
  return String(num);
}

export function getRegistrationIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function setRegistrationIndex(codes: string[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(codes));
}

export function createEmptyRegistration(code: string) {
  const now = new Date().toISOString();
  const bundle: RegistrationBundle = {
    meta: {
      code,
      createdAt: now,
      updatedAt: now,
      completedOverview: false,
      completedContract: false,
      status: "IN_PROGRESS",
    },
    data: {},
    stepFlags: {
      BASIC_INFO: false,
      ADDRESS: false,
      CONTACT: false,
      LEGAL_ENTITY_INFO: false,
      SIGNATORY_INFO: false,
      TERMS: false,
    },
  };
  saveRegistration(bundle);
  return bundle;
}

export function loadRegistration(code: string): RegistrationBundle | null {
  try {
    const raw = localStorage.getItem(regKey(code));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveRegistration(bundle: RegistrationBundle) {
  bundle.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(regKey(bundle.meta.code), JSON.stringify(bundle));
}

export function updateSection(code: string, section: keyof RegistrationBundle["data"], data: any, flag?: keyof RegistrationBundle["stepFlags"]) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.data[section] = { ...(existing.data[section] || {}), ...data };
  if (flag) existing.stepFlags[flag] = true;
  saveRegistration(existing);
  // đưa vào index nếu chưa có
  const idx = getRegistrationIndex();
  if (!idx.includes(code)) {
    idx.push(code);
    setRegistrationIndex(idx);
  }
}

export function setHotelId(code: string, hotelId: number) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.meta.hotelId = hotelId;
  saveRegistration(existing);
}

export function markOverviewCompleted(code: string) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.meta.completedOverview = true;
  saveRegistration(existing);
}

export function markContractCompleted(code: string) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.meta.completedContract = true;
  saveRegistration(existing);
}

export function setStatus(code: string, status: RegistrationBundle["meta"]["status"]) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.meta.status = status;
  saveRegistration(existing);
}

export function setFileNames(code: string, files: { contract_pdf_filename?: string; identity_doc_filename?: string }) {
  const existing = loadRegistration(code);
  if (!existing) return;
  existing.data.files = { ...(existing.data.files || {}), ...files };
  saveRegistration(existing);
}

export function deleteRegistration(code: string) {
  localStorage.removeItem(regKey(code));
  const idx = getRegistrationIndex().filter(c => c !== code);
  setRegistrationIndex(idx);
}
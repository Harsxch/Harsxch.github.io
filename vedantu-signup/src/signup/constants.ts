export const GRADES = [
  "8th and below",
  "9th",
  "10th",
  "11th",
  "12th",
  "Dropper",
  "1st year",
  "2nd year",
  "3rd year",
  "Final year",
  "Recent grad",
] as const;

/** Board is shown (and mandatory) only for these grades. */
export const BOARD_GRADES: readonly string[] = [
  "8th and below",
  "9th",
  "10th",
  "11th",
  "12th",
  "Dropper",
];

export const TARGET_EXAMS = [
  "JEE (Main/Advanced)",
  "NEET",
  "CUET",
  "CAT",
  "GATE",
  "Other",
  "Not decided yet",
] as const;

export interface Option {
  value: string;
  /** Optional group heading shown above the first option of a group. */
  group?: string;
}

const grp = (group: string, values: string[]): Option[] =>
  values.map((value) => ({ value, group }));

/** Order is exactly as specified; the first four are pinned to the top. */
export const BOARDS: Option[] = [
  ...grp("Popular boards", ["CBSE", "ICSE / ISC (CISCE)", "IB", "IGCSE / Cambridge (CAIE)"]),
  ...grp("Other national & international", ["NIOS", "IBSE (Indian Board of School Education)"]),
  ...grp("State boards", [
    "Andhra Pradesh (BSEAP)",
    "Assam (SEBA / AHSEC)",
    "Bihar (BSEB)",
    "Chhattisgarh (CGBSE)",
    "Goa (GBSHSE)",
    "Gujarat (GSEB)",
    "Haryana (BSEH)",
    "Himachal Pradesh (HPBOSE)",
    "Jammu & Kashmir (JKBOSE)",
    "Jharkhand (JAC)",
    "Karnataka (KSEAB / Karnataka PU Board)",
    "Kerala (Kerala Board)",
    "Madhya Pradesh (MPBSE)",
    "Maharashtra (MSBSHSE)",
    "Manipur (BSEM / COHSEM)",
    "Meghalaya (MBOSE)",
    "Mizoram (MBSE)",
    "Nagaland (NBSE)",
    "Odisha (BSE / CHSE)",
    "Punjab (PSEB)",
    "Rajasthan (RBSE)",
    "Sikkim (Sikkim Board)",
    "Tamil Nadu (TN State Board)",
    "Telangana (BSE / TSBIE)",
    "Tripura (TBSE)",
    "Uttar Pradesh (UPMSP)",
    "Uttarakhand (UBSE)",
    "West Bengal (WBBSE / WBCHSE)",
  ]),
  { value: "Other" },
];

export const COUNTRY_CODES = [
  { code: "+91", label: "India", flag: "IN" },
  { code: "+1", label: "US / Canada", flag: "US" },
  { code: "+971", label: "UAE", flag: "AE" },
  { code: "+966", label: "Saudi Arabia", flag: "SA" },
  { code: "+974", label: "Qatar", flag: "QA" },
  { code: "+965", label: "Kuwait", flag: "KW" },
  { code: "+968", label: "Oman", flag: "OM" },
  { code: "+65", label: "Singapore", flag: "SG" },
  { code: "+44", label: "UK", flag: "GB" },
  { code: "+61", label: "Australia", flag: "AU" },
  { code: "+977", label: "Nepal", flag: "NP" },
  { code: "+880", label: "Bangladesh", flag: "BD" },
] as const;

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

// TODO(Vedantu): replace with the real policy URLs.
export const PRIVACY_URL = "https://www.vedantu.com/privacy-policy";
export const TERMS_URL = "https://www.vedantu.com/terms-and-conditions";

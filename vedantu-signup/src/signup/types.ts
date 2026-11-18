export interface SignupValues {
  name: string;
  countryCode: string;
  mobile: string; // national number, digits only
  /** National number that was OTP-verified, or null. Changing mobile invalidates it. */
  verifiedMobile: string | null;
  email: string;
  grade: string;
  targetExam: string;
  board: string;
  consent: boolean;
}

export type FieldName =
  | "name"
  | "mobile"
  | "email"
  | "grade"
  | "targetExam"
  | "board"
  | "consent";

export type SignupErrors = Partial<Record<FieldName, string>>;

/** Shape handed to the (replaceable) submit handler. */
export interface SignupPayload {
  name: string;
  mobile: string; // "+91XXXXXXXXXX"
  mobile_verified: boolean;
  email: string;
  grade: string;
  target_exam: string;
  /** Omitted when Board does not apply to the selected grade. */
  board?: string;
  consent: boolean;
}

export const EMPTY_VALUES: SignupValues = {
  name: "",
  countryCode: "+91",
  mobile: "",
  verifiedMobile: null,
  email: "",
  grade: "",
  targetExam: "",
  board: "",
  consent: false,
};

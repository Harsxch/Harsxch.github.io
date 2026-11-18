import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPayload, suggestEmail, validateEmail, validateForm, validateMobile, validateName } from "../src/signup/validation.ts";
import { BOARDS, GRADES } from "../src/signup/constants.ts";
import { EMPTY_VALUES, type SignupValues } from "../src/signup/types.ts";

const valid = (o: Partial<SignupValues> = {}): SignupValues => ({
  ...EMPTY_VALUES, name: "Asha Rao", mobile: "9876543210", verifiedMobile: "9876543210",
  email: "asha@example.com", grade: "12th", targetExam: "NEET", board: "CBSE", consent: true, ...o,
});

test("option counts and order", () => {
  assert.equal(GRADES.length, 11);
  assert.equal(BOARDS.length, 35);
  assert.deepEqual(BOARDS.slice(0, 4).map((b) => b.value), ["CBSE", "ICSE / ISC (CISCE)", "IB", "IGCSE / Cambridge (CAIE)"]);
  assert.equal(BOARDS[34].value, "Other");
});

test("name", () => {
  assert.ok(validateName("   "));
  assert.equal(validateName("A"), undefined);
});

test("mobile", () => {
  assert.ok(validateMobile("+91", ""));
  assert.ok(validateMobile("+91", "12345"));
  assert.ok(validateMobile("+91", "5876543210"));
  assert.equal(validateMobile("+91", "9876543210"), undefined);
});

test("email structure + typos", () => {
  assert.ok(validateEmail("nope"));
  assert.ok(validateEmail("a@b"));
  assert.equal(validateEmail("a@b.co.in"), undefined);
  assert.equal(suggestEmail("a@gmial.com"), "a@gmail.com");
  assert.equal(suggestEmail("a@gmal.com"), "a@gmail.com");
  assert.equal(suggestEmail("a@yahho.com"), "a@yahoo.com");
  assert.equal(suggestEmail("a@outlok.com"), "a@outlook.com");
  assert.equal(suggestEmail("a@gmail.com"), null);
  assert.equal(suggestEmail("a@school.edu.in"), null);
});

test("board rules", () => {
  assert.deepEqual(validateForm(valid()), {});
  assert.ok(validateForm(valid({ board: "" })).board);
  assert.ok(validateForm(valid({ grade: "Dropper", board: "" })).board);
  for (const g of ["1st year", "2nd year", "3rd year", "Final year", "Recent grad"]) {
    assert.equal(validateForm(valid({ grade: g, board: "" })).board, undefined);
  }
});

test("blocks unverified mobile and missing consent", () => {
  assert.ok(validateForm(valid({ verifiedMobile: null })).mobile);
  assert.ok(validateForm(valid({ consent: false })).consent);
});

test("payload omits board when not applicable", () => {
  const p = buildPayload(valid({ grade: "1st year", board: "CBSE" }));
  assert.equal("board" in p, false);
  assert.equal(p.mobile, "+919876543210");
  assert.equal(p.mobile_verified, true);
  assert.equal(buildPayload(valid()).board, "CBSE");
});

/**
 * Builds a VietQR payload (NAPAS 247 bank-transfer QR, EMVCo format) that
 * Vietnamese banking apps scan to pre-fill the recipient, amount and
 * transfer note. Render the returned string as a QR code.
 *
 * Structure: ID (2 digits) + length (2 digits) + value, nested for the
 * merchant-account and additional-data fields, ending in a CRC-16 checksum.
 */

const field = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, "0")}${value}`;

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), as EMVCo requires. */
export const crc16 = (input: string) => {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

type Args = {
  /** 6-digit NAPAS bank identifier, e.g. 970436 for Vietcombank. */
  bankBin: string;
  accountNumber: string;
  /** Whole dong. */
  amount: number;
  /** Transfer note. Banks strip most punctuation, so keep it A–Z/0–9. */
  note: string;
};

export function buildVietQRPayload({
  bankBin,
  accountNumber,
  amount,
  note,
}: Args) {
  const cleanNote = note.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 25);

  const merchantAccount =
    field("00", "A000000727") + // NAPAS
    field("01", field("00", bankBin) + field("01", accountNumber)) +
    field("02", "QRIBFTTA"); // transfer to account number

  const body =
    field("00", "01") + // payload format version
    field("01", "12") + // dynamic QR (single use, fixed amount)
    field("38", merchantAccount) +
    field("53", "704") + // VND
    field("54", String(Math.round(amount))) +
    field("58", "VN") +
    field("62", field("08", cleanNote)) + // purpose of transaction
    "6304"; // CRC field header; checksum covers everything up to here

  return body + crc16(body);
}

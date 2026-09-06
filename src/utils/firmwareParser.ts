/**
 * Utility functions for parsing various firmware file extensions:
 * - .bin (Raw binary)
 * - .hex / .ihex (Intel HEX format)
 * - .uf2 (USB Flashing Format)
 * - .elf / .dfu / .img / .ota (Binary formats)
 */

export interface ParsedFirmwareResult {
  data: Uint8Array;
  address: number;
  format: string;
}

/**
 * Parses Intel HEX text format into a contiguous binary Uint8Array
 */
export function parseIntelHex(hexString: string, defaultAddress: number): { data: Uint8Array; address: number } {
  const lines = hexString.split(/\r?\n/);
  let upperAddress = 0;
  let minAddress = 0xFFFFFFFF;
  let maxAddress = 0;
  const memory = new Map<number, number>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith(':')) continue;

    const byteCount = parseInt(line.substring(1, 3), 16);
    const address = parseInt(line.substring(3, 7), 16);
    const recordType = parseInt(line.substring(7, 9), 16);

    if (isNaN(byteCount) || isNaN(address) || isNaN(recordType)) continue;

    if (recordType === 0x00) {
      // Data Record
      const fullAddress = upperAddress + address;
      for (let i = 0; i < byteCount; i++) {
        const byteVal = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
        const curAddr = fullAddress + i;
        memory.set(curAddr, byteVal);
        if (curAddr < minAddress) minAddress = curAddr;
        if (curAddr > maxAddress) maxAddress = curAddr;
      }
    } else if (recordType === 0x01) {
      // End of File
      break;
    } else if (recordType === 0x02) {
      // Extended Segment Address
      upperAddress = parseInt(line.substring(9, 13), 16) << 4;
    } else if (recordType === 0x04) {
      // Extended Linear Address
      upperAddress = parseInt(line.substring(9, 13), 16) << 16;
    }
  }

  if (memory.size === 0) {
    return { data: new Uint8Array(0), address: defaultAddress };
  }

  const length = maxAddress - minAddress + 1;
  const buffer = new Uint8Array(length);
  buffer.fill(0xFF);

  for (const [addr, val] of memory.entries()) {
    buffer[addr - minAddress] = val;
  }

  return {
    data: buffer,
    address: minAddress !== 0xFFFFFFFF && minAddress > 0 ? minAddress : defaultAddress
  };
}

/**
 * Parses UF2 (USB Flashing Format) 512-byte blocks into binary
 */
export function parseUF2(buffer: Uint8Array, defaultAddress: number): { data: Uint8Array; address: number } {
  const BLOCK_SIZE = 512;
  if (buffer.length % BLOCK_SIZE !== 0) {
    return { data: buffer, address: defaultAddress };
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let minAddress = 0xFFFFFFFF;
  let maxAddress = 0;
  const memory = new Map<number, number>();

  for (let offset = 0; offset < buffer.length; offset += BLOCK_SIZE) {
    const magicStart0 = view.getUint32(offset, true);
    const magicStart1 = view.getUint32(offset + 4, true);
    const magicEnd = view.getUint32(offset + 508, true);

    if (magicStart0 !== 0x0A324655 || magicStart1 !== 0x9E5D5157 || magicEnd !== 0x0AB16F30) {
      continue;
    }

    const targetAddr = view.getUint32(offset + 12, true);
    const payloadSize = view.getUint32(offset + 16, true);

    for (let i = 0; i < Math.min(payloadSize, 476); i++) {
      const curAddr = targetAddr + i;
      memory.set(curAddr, buffer[offset + 32 + i]);
      if (curAddr < minAddress) minAddress = curAddr;
      if (curAddr > maxAddress) maxAddress = curAddr;
    }
  }

  if (memory.size === 0) {
    return { data: buffer, address: defaultAddress };
  }

  const length = maxAddress - minAddress + 1;
  const result = new Uint8Array(length);
  result.fill(0xFF);

  for (const [addr, val] of memory.entries()) {
    result[addr - minAddress] = val;
  }

  return {
    data: result,
    address: minAddress !== 0xFFFFFFFF && minAddress > 0 ? minAddress : defaultAddress
  };
}

/**
 * Normalizes and prepares any firmware file format for flashing
 */
export function processFirmwareFile(fileName: string, rawBytes: Uint8Array, fallbackAddress: number): ParsedFirmwareResult {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.hex') || lowerName.endsWith('.ihex')) {
    const decoder = new TextDecoder('utf-8');
    const hexText = decoder.decode(rawBytes);
    const parsed = parseIntelHex(hexText, fallbackAddress);
    return {
      data: parsed.data,
      address: parsed.address,
      format: 'Intel HEX (.hex)'
    };
  }

  if (lowerName.endsWith('.uf2')) {
    const parsed = parseUF2(rawBytes, fallbackAddress);
    return {
      data: parsed.data,
      address: parsed.address,
      format: 'UF2 Binary (.uf2)'
    };
  }

  const ext = lowerName.includes('.') ? `.${lowerName.split('.').pop()}` : '.bin';
  return {
    data: rawBytes,
    address: fallbackAddress,
    format: `Binary (${ext})`
  };
}

#include "HalfHelper.hpp"

namespace as {
namespace HalfHelper {

namespace {

bool initialized = false;
uint16_t baseTable[512] = { 0 };
int8_t shiftTable[512] = { 0 };
uint32_t mantissaTable[2048] = { 0 };
uint32_t exponentTable[64] = { 0 };
uint16_t offsetTable[64] = { 0 };

uint32_t ConvertMantissa(int i) {
  uint32_t m = (uint32_t)(i << 13);  // Zero pad mantissa bits
  uint32_t e = 0;                    // Zero exponent

  // While not normalized
  while ((m & 0x00800000) == 0) {
    e -= 0x00800000;  // Decrement exponent (1<<23)
    m <<= 1;          // Shift mantissa
  }
  m &= ((uint32_t)~0x00800000);  // Clear leading 1 bit
  e += 0x38800000;               // Adjust bias ((127-14)<<23)
  return m | e;                  // Return combined number
}

void GenerateBaseTable() {
  for (int i = 0; i < 256; ++i) {
    int8_t e = (int8_t)(127 - i);
    if (e > 24) {  // Very small numbers map to zero
      baseTable[i | 0x000] = 0x0000;
      baseTable[i | 0x100] = 0x8000;
    } else if (e > 14) {  // Small numbers map to denorms
      baseTable[i | 0x000] = (uint16_t)(0x0400 >> (18 + e));
      baseTable[i | 0x100] = (uint16_t)((0x0400 >> (18 + e)) | 0x8000);
    } else if (e >= -15) {  // Normal numbers just lose precision
      baseTable[i | 0x000] = (uint16_t)((15 - e) << 10);
      baseTable[i | 0x100] = (uint16_t)(((15 - e) << 10) | 0x8000);
    } else if (e > -128) {  // Large numbers map to Infinity
      baseTable[i | 0x000] = 0x7c00;
      baseTable[i | 0x100] = 0xfc00;
    } else {  // Infinity and NaN's stay Infinity and NaN's
      baseTable[i | 0x000] = 0x7c00;
      baseTable[i | 0x100] = 0xfc00;
    }
  }
}

void GenerateShiftTable() {
  for (int i = 0; i < 256; ++i) {
    int8_t e = (int8_t)(127 - i);
    if (e > 24) {  // Very small numbers map to zero
      shiftTable[i | 0x000] = 24;
      shiftTable[i | 0x100] = 24;
    } else if (e > 14) {  // Small numbers map to denorms
      shiftTable[i | 0x000] = (int8_t)(e - 1);
      shiftTable[i | 0x100] = (int8_t)(e - 1);
    } else if (e >= -15) {  // Normal numbers just lose precision
      shiftTable[i | 0x000] = 13;
      shiftTable[i | 0x100] = 13;
    } else if (e > -128) {  // Large numbers map to Infinity
      shiftTable[i | 0x000] = 24;
      shiftTable[i | 0x100] = 24;
    } else {  // Infinity and NaN's stay Infinity and NaN's
      shiftTable[i | 0x000] = 13;
      shiftTable[i | 0x100] = 13;
    }
  }
}

void GenerateMantissaTable() {
  mantissaTable[0] = 0;
  for (int i = 1; i < 1024; i++) {
    mantissaTable[i] = ConvertMantissa(i);
  }
  for (int i = 1024; i < 2048; i++) {
    mantissaTable[i] = (uint32_t)(0x38000000 + ((i - 1024) << 13));
  }
}
void GenerateExponentTable() {
  exponentTable[0] = 0;
  for (int i = 1; i < 31; i++) {
    exponentTable[i] = (uint32_t)(i << 23);
  }
  exponentTable[31] = 0x47800000;
  exponentTable[32] = 0x80000000;
  for (int i = 33; i < 63; i++) {
    exponentTable[i] = (uint32_t)(0x80000000 + ((i - 32) << 23));
  }
  exponentTable[63] = 0xc7800000;
}

void GenerateOffsetTable() {
  offsetTable[0] = 0;
  for (int i = 1; i < 32; i++) {
    offsetTable[i] = 1024;
  }
  offsetTable[32] = 0;
  for (int i = 33; i < 64; i++) {
    offsetTable[i] = 1024;
  }
}

void Init() {
  if (initialized) return;
  GenerateBaseTable();
  GenerateShiftTable();
  GenerateMantissaTable();
  GenerateExponentTable();
  GenerateOffsetTable();
  initialized = true;
}

}

Half SingleToHalf(float single) {
  Init();
  uint32_t value = static_cast<uint32_t>(single);
  uint16_t result =
      (uint16_t)(baseTable[(value >> 23) & 0x1ff] +
                 ((value & 0x007fffff) >> shiftTable[value >> 23]));
  return Half::ToHalf(result);
}

float HalfToSingle(const Half& half) {
  Init();
  uint32_t result = mantissaTable[offsetTable[half.value >> 10] + (half.value & 0x3ff)] + exponentTable[half.value >> 10];
  return static_cast<float>(result);
}

Half Negate(const Half& half) {
  return Half::ToHalf((uint16_t)(half.value ^ 0x8000));
}

Half Abs(const Half& half) {
  return Half::ToHalf((uint16_t)(half.value & 0x7fff));
}

bool IsNaN(const Half& half) {
  return ((half.value & 0x7fff) > 0x7c00);
}

bool IsInfinity(const Half& half) {
  return ((half.value & 0x7fff) == 0x7c00);
}

bool IsPositiveInfinity(const Half& half) {
  return (half.value == 0x7c00);
}

bool IsNegativeInfinity(const Half& half) {
  return (half.value == 0xfc00);
}

}
}

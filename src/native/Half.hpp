#ifndef __HALF_HPP__
#define __HALF_HPP__

#include <cstdint>

namespace as {

class Half {
 public:
  uint16_t value;

  static Half epsilon;
  static Half maxValue;
  static Half minValue;
  static Half NaN;
  static Half negativeInfinity;
  static Half positiveInfinity;

  static Half ToHalf(uint16_t value);
  static Half ToHalf(uint8_t* value, int startIndex);

  Half();
  Half(float v);
  Half(uint8_t v);
  Half(int8_t v);
  Half(uint16_t v);
  Half(int16_t v);
  Half(int32_t v);
  Half(int64_t v);
  Half(double v);
  Half(uint32_t v);
  Half(uint64_t v);

  Half& operator=(float v);
  Half& operator=(uint8_t v);
  Half& operator=(int8_t v);
  Half& operator=(uint16_t v);
  Half& operator=(int16_t v);
  Half& operator=(int32_t v);
  Half& operator=(int64_t v);
  Half& operator=(double v);
  Half& operator=(uint32_t v);
  Half& operator=(uint64_t v);

  operator float() const;
  float toFloat() const;
};

}

#endif

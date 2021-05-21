#include "HalfHelper.hpp"

namespace as {

Half Half::epsilon = Half{0x0001};
Half Half::maxValue = Half{0x7bff};
Half Half::minValue = Half{0xfbff};
Half Half::NaN = Half{0xfe00};
Half Half::negativeInfinity = Half{0xfc00};
Half Half::positiveInfinity = Half{0x7c00};

Half Half::ToHalf(uint16_t value) {
  Half half;
  half.value = value;
  return half;
}

Half Half::ToHalf(uint8_t* value, int startIndex) {
   return Half::ToHalf((uint16_t)(int16_t)(*(value + startIndex)));
}

Half::Half(): value(0) {}
Half::Half(float v): value(HalfHelper::SingleToHalf(v).value) {}
Half::Half(uint8_t v): Half((float)(v)) {}
Half::Half(int8_t v): Half((float)(v)) {}
Half::Half(uint16_t v): Half((float)(v)) {}
Half::Half(int16_t v): Half((float)(v)) {}
Half::Half(int32_t v): Half((float)(v)) {}
Half::Half(int64_t v): Half((float)(v)) {}
Half::Half(double v): Half((float)(v)) {}
Half::Half(uint32_t v): Half((float)(v)) {}
Half::Half(uint64_t v): Half((float)(v)) {}

Half& Half::operator=(float v) {
  this->value = HalfHelper::SingleToHalf(v).value;
  return *this;
}
Half& Half::operator=(uint8_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(int8_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(uint16_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(int16_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(int32_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(int64_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(double v) {
  return this->operator=((float)v);
}
Half& Half::operator=(uint32_t v) {
  return this->operator=((float)v);
}
Half& Half::operator=(uint64_t v) {
  return this->operator=((float)v);
}

Half::operator float() const {
  return HalfHelper::HalfToSingle(*this);
}

float Half::toFloat() const {
  return HalfHelper::HalfToSingle(*this);
}

}

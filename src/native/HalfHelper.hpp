#ifndef __HALF_HELPER_HPP__
#define __HALF_HELPER_HPP__

#include "Half.hpp"

namespace as {
  namespace HalfHelper {
    Half SingleToHalf(float single);
    float HalfToSingle(const Half& half);
    Half Negate(const Half& half);
    Half Abs(const Half& half);
    bool IsNaN(const Half& half);
    bool IsInfinity(const Half& half);
    bool IsPositiveInfinity(const Half& half);
    bool IsNegativeInfinity(const Half& half);
  }
}

#endif

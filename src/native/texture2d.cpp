#include <cstring>
#include <cmath>

#include "napi.h"
#include "texture2d.h"
#include "HalfHelper.hpp"

#define TEXTRUE_API(name) \
  static Boolean _##name(const CallbackInfo& info) {\
    Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();\
    int32_t width = info[1].As<Number>().Int32Value();\
    int32_t height = info[2].As<Number>().Int32Value();\
    Buffer<uint8_t> outbuf = info[3].As<Buffer<uint8_t>>();\
    bool32_t r = name(buffer.Data(), width, height, outbuf.Data());\
    return Boolean::New(info.Env(), static_cast<bool>(r));\
  }

#define TEXTRUE_API_JS(name) \
  exports[#name] = Function::New(env, _##name, #name)

namespace as {

using Napi::Value;
using Napi::CallbackInfo;
using Napi::Env;
using Napi::Buffer;
using Napi::Object;
using Napi::ObjectReference;
using Napi::String;
using Napi::Boolean;
using Napi::Number;
using Napi::Function;

static Boolean _DecodePVRTC(const CallbackInfo& info) {
  Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();
  int32_t width = info[1].As<Number>().Int32Value();
  int32_t height = info[2].As<Number>().Int32Value();
  Buffer<uint8_t> outbuf = info[3].As<Buffer<uint8_t>>();
  bool is2bpp = info[4].As<Boolean>().Value();
  bool32_t r = DecodePVRTC(buffer.Data(), width, height, outbuf.Data(), static_cast<bool32_t>(is2bpp));
  return Boolean::New(info.Env(), static_cast<bool>(r));
}

static Boolean _DecodeASTC(const CallbackInfo& info) {
  Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();
  int32_t width = info[1].As<Number>().Int32Value();
  int32_t height = info[2].As<Number>().Int32Value();
  int32_t blockWidth = info[3].As<Number>().Int32Value();
  int32_t blockHeight = info[4].As<Number>().Int32Value();
  Buffer<uint8_t> outbuf = info[5].As<Buffer<uint8_t>>();
  bool32_t r = DecodeASTC(buffer.Data(), width, height, blockWidth, blockHeight, outbuf.Data());
  return Boolean::New(info.Env(), static_cast<bool>(r));
}

TEXTRUE_API(DecodeDXT1)
TEXTRUE_API(DecodeDXT5)
TEXTRUE_API(DecodeETC1)
TEXTRUE_API(DecodeETC2)
TEXTRUE_API(DecodeETC2A1)
TEXTRUE_API(DecodeETC2A8)
TEXTRUE_API(DecodeEACR)
TEXTRUE_API(DecodeEACRSigned)
TEXTRUE_API(DecodeEACRG)
TEXTRUE_API(DecodeEACRGSigned)
TEXTRUE_API(DecodeBC4)
TEXTRUE_API(DecodeBC5)
TEXTRUE_API(DecodeBC6)
TEXTRUE_API(DecodeBC7)
TEXTRUE_API(DecodeATCRGB4)
TEXTRUE_API(DecodeATCRGBA8)

static Value _UnpackCrunch(const CallbackInfo& info) {
  void* pBuffer = nullptr;
  uint32_t bufferSize = 0;

  Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();
  uint8_t* pData = buffer.Data();

  UnpackCrunch(pData, buffer.Get("length").As<Number>().Uint32Value(), &pBuffer, &bufferSize);

  if (pBuffer == nullptr) {
    return info.Env().Null();
  }

  uint8_t* result = new uint8_t[bufferSize];
  memcpy(result, pBuffer, bufferSize);

  DisposeBuffer(&pBuffer);

  return Buffer<uint8_t>::New(info.Env(), result, bufferSize, [](Env env, uint8_t* data) {
    delete[] data;
  });
}

static Value _UnpackUnityCrunch(const CallbackInfo& info) {
  void* pBuffer = nullptr;
  uint32_t bufferSize = 0;

  Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();
  uint8_t* pData = buffer.Data();

  UnpackUnityCrunch(pData, buffer.Get("length").As<Number>().Uint32Value(), &pBuffer, &bufferSize);

  if (pBuffer == nullptr) {
    return info.Env().Null();
  }

  uint8_t* result = new uint8_t[bufferSize];
  memcpy(result, pBuffer, bufferSize);

  DisposeBuffer(&pBuffer);

  return Buffer<uint8_t>::New(info.Env(), result, bufferSize, [](Env env, uint8_t* data) {
    delete[] data;
  });
}

static Value _DecodeRHalf(const CallbackInfo& info) {
  Buffer<uint8_t> image_data = info[0].As<Buffer<uint8_t>>();
  Buffer<uint8_t> buff = info[1].As<Buffer<uint8_t>>();
  size_t length = buff.Get("length").As<Number>().Uint32Value();
  for (size_t i = 0; i < length; i += 4) {
    buff[i] = 0;
    buff[i + 1] = 0;
    buff[i + 2] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i / 2).toFloat() * (float)255);
    buff[i + 3] = 255;
  }
  return info.Env().Undefined();
}
static Value _DecodeRGHalf(const CallbackInfo& info) {
  Buffer<uint8_t> image_data = info[0].As<Buffer<uint8_t>>();
  Buffer<uint8_t> buff = info[1].As<Buffer<uint8_t>>();
  size_t length = buff.Get("length").As<Number>().Uint32Value();
  for (size_t i = 0; i < length; i += 4) {
    buff[i] = 0;
    buff[i + 1] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i + 2).toFloat() * (float)255);
    buff[i + 2] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i).toFloat() * (float)255);
    buff[i + 3] = 255;
  }
  return info.Env().Undefined();
}
static Value _DecodeRGBAHalf(const CallbackInfo& info) {
  Buffer<uint8_t> image_data = info[0].As<Buffer<uint8_t>>();
  Buffer<uint8_t> buff = info[1].As<Buffer<uint8_t>>();
  size_t length = buff.Get("length").As<Number>().Uint32Value();
  for (size_t i = 0; i < length; i += 4) {
    buff[i] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i * 2 + 4).toFloat() * (float)255);
    buff[i + 1] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i * 2 + 2).toFloat() * (float)255);
    buff[i + 2] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i * 2).toFloat() * (float)255);
    buff[i + 3] = (uint8_t)::round(Half::ToHalf(image_data.Data(), i * 2 + 6).toFloat() * (float)255);
  }
  return info.Env().Undefined();
}

static Object _index(Env env, Object exports) {
  exports["DecodePVRTC"] = Function::New(env, _DecodePVRTC, "DecodePVRTC");
  exports["DecodeASTC"] = Function::New(env, _DecodeASTC, "DecodeASTC");

  TEXTRUE_API_JS(DecodeDXT1);
  TEXTRUE_API_JS(DecodeDXT5);
  TEXTRUE_API_JS(DecodeETC1);
  TEXTRUE_API_JS(DecodeETC2);
  TEXTRUE_API_JS(DecodeETC2A1);
  TEXTRUE_API_JS(DecodeETC2A8);
  TEXTRUE_API_JS(DecodeEACR);
  TEXTRUE_API_JS(DecodeEACRSigned);
  TEXTRUE_API_JS(DecodeEACRG);
  TEXTRUE_API_JS(DecodeEACRGSigned);
  TEXTRUE_API_JS(DecodeBC4);
  TEXTRUE_API_JS(DecodeBC5);
  TEXTRUE_API_JS(DecodeBC6);
  TEXTRUE_API_JS(DecodeBC7);
  TEXTRUE_API_JS(DecodeATCRGB4);
  TEXTRUE_API_JS(DecodeATCRGBA8);

  exports["UnpackCrunch"] = Function::New(env, _UnpackCrunch, "UnpackCrunch");
  exports["UnpackUnityCrunch"] = Function::New(env, _UnpackUnityCrunch, "UnpackUnityCrunch");

  exports["DecodeRHalf"] = Function::New(env, _DecodeRHalf, "DecodeRHalf");
  exports["DecodeRGHalf"] = Function::New(env, _DecodeRGHalf, "DecodeRGHalf");
  exports["DecodeRGBAHalf"] = Function::New(env, _DecodeRGBAHalf, "DecodeRGBAHalf");
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, _index)

}

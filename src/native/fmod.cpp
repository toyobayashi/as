#include <cstring>

#include "napi.h"
#include "fmodapi.h"

#ifdef _WIN32
#include "windlfcn.h"
#else
#include <dlfcn.h>
#endif

#define FMOD_CALL_NULL(env, exp) \
  do {\
    FMOD_RESULT result = (exp); \
    if (result != FMOD_OK) { return (env).Null(); } \
  } while (0)

#define FMOD_CALL_NULL_R1(env, exp) \
  do {\
    FMOD_RESULT result = (exp); \
    if (result != FMOD_OK) {\
      FMOD_System_Release(system);\
      return (env).Null();\
    } \
  } while (0)

#define FMOD_CALL_NULL_R2(env, exp) \
  do {\
    FMOD_RESULT result = (exp); \
    if (result != FMOD_OK) {\
      FMOD_Sound_Release(sound);\
      FMOD_System_Release(system);\
      return (env).Null();\
    } \
  } while (0)

#define FMOD_CALL_NULL_R3(env, exp) \
  do {\
    FMOD_RESULT result = (exp); \
    if (result != FMOD_OK) {\
      delete[] buffer;\
      return (env).Null();\
    } \
  } while (0)

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

static Value _soundToWav(const CallbackInfo& info, FMOD_SOUND* sound) {
  Env env = info.Env();
  void* dll = env.GetInstanceData<void>();

  auto FMOD_Sound_GetFormat = reinterpret_cast<FMOD_Sound_GetFormat_t>(dlsym(dll, "FMOD_Sound_GetFormat"));
  auto FMOD_Sound_GetLength = reinterpret_cast<FMOD_Sound_GetLength_t>(dlsym(dll, "FMOD_Sound_GetLength"));
  auto FMOD_Sound_GetDefaults = reinterpret_cast<FMOD_Sound_GetDefaults_t>(dlsym(dll, "FMOD_Sound_GetDefaults"));
  auto FMOD_Sound_Lock = reinterpret_cast<FMOD_Sound_Lock_t>(dlsym(dll, "FMOD_Sound_Lock"));
  auto FMOD_Sound_Unlock = reinterpret_cast<FMOD_Sound_Unlock_t>(dlsym(dll, "FMOD_Sound_Unlock"));

  FMOD_SOUND_TYPE type;
  FMOD_SOUND_FORMAT format;
  int channels = 0;
  int bits = 0;
  FMOD_CALL_NULL(env, FMOD_Sound_GetFormat(sound, &type, &format, &channels, &bits));
  float frequency = 0;
  int priority = 0;
  FMOD_CALL_NULL(env, FMOD_Sound_GetDefaults(sound, &frequency, &priority));
  float sampleRate = frequency;
  unsigned int length;
  FMOD_CALL_NULL(env, FMOD_Sound_GetLength(sound, &length, FMOD_TIMEUNIT_PCMBYTES));
  char* ptr1 = nullptr;
  char* ptr2 = nullptr;
  unsigned int len1 = 0;
  unsigned int len2 = 0;
  FMOD_CALL_NULL(env, FMOD_Sound_Lock(sound, 0, length, (void**)&ptr1, (void**)&ptr2, &len1, &len2));

  uint8_t* buffer = new uint8_t[len1 + 44];
  const char riff[] = { 'R', 'I', 'F', 'F' };
  memcpy(buffer, riff, 4);
  uint32_t u32 = static_cast<uint32_t>(len1 + 36);
  memcpy(buffer + 4, &u32, 4);
  const char wavfmt[] = { 'W', 'A', 'V', 'E', 'f', 'm', 't', ' ' };
  memcpy(buffer + 8, wavfmt, 8);
  u32 = 16;
  memcpy(buffer + 16, &u32, 4);
  int16_t i16 = 1;
  memcpy(buffer + 20, &i16, 2);
  i16 = static_cast<int16_t>(channels);
  memcpy(buffer + 22, &i16, 2);
  int32_t i32 = static_cast<int32_t>(sampleRate);
  memcpy(buffer + 24, &i32, 4);
  i32 = (static_cast<int32_t>(sampleRate) * channels * bits / 8);
  memcpy(buffer + 28, &i32, 4);
  i16 = static_cast<int16_t>(channels * bits / 8);
  memcpy(buffer + 32, &i16, 2);
  i16 = static_cast<int16_t>(bits);
  memcpy(buffer + 34, &i16, 2);
  const char data[] = { 'd', 'a', 't', 'a' };
  memcpy(buffer + 36, data, 4);
  u32 = static_cast<uint32_t>(len1);
  memcpy(buffer + 40, &u32, 4);
  memcpy(buffer + 44, ptr1, len1);

  FMOD_CALL_NULL_R3(env, FMOD_Sound_Unlock(sound, ptr1, ptr2, len1, len2));

  return Buffer<uint8_t>::New(env, buffer, len1 + 44, [](Env env, uint8_t* data) {
    delete[] data;
  });
}

static Value _convertToWav(const CallbackInfo& info) {
  Env env = info.Env();
  Buffer<uint8_t> m_AudioData = info[0].As<Buffer<uint8_t>>();

  void* dll = env.GetInstanceData<void>();
  auto FMOD_System_Create = reinterpret_cast<FMOD_System_Create_t>(dlsym(dll, "FMOD_System_Create"));
  auto FMOD_System_Release = reinterpret_cast<FMOD_System_Release_t>(dlsym(dll, "FMOD_System_Release"));
  auto FMOD_System_CreateSound = reinterpret_cast<FMOD_System_CreateSound_t>(dlsym(dll, "FMOD_System_CreateSound"));
  auto FMOD_Sound_GetNumSubSounds = reinterpret_cast<FMOD_Sound_GetNumSubSounds_t>(dlsym(dll, "FMOD_Sound_GetNumSubSounds"));
  auto FMOD_Sound_Release = reinterpret_cast<FMOD_Sound_Release_t>(dlsym(dll, "FMOD_Sound_Release"));
  auto FMOD_System_Init = reinterpret_cast<FMOD_System_Init_t>(dlsym(dll, "FMOD_System_Init"));

  FMOD_SYSTEM* system = nullptr;
  FMOD_CALL_NULL(env, FMOD_System_Create(&system));
  FMOD_CALL_NULL_R1(env, FMOD_System_Init(system, 1, FMOD_INIT_NORMAL, 0));

  FMOD_CREATESOUNDEXINFO exinfo;
  memset(&exinfo, 0, sizeof(FMOD_CREATESOUNDEXINFO));
  exinfo.cbsize = sizeof(FMOD_CREATESOUNDEXINFO);
  exinfo.length = info[1].As<Number>().Uint32Value();

  FMOD_SOUND *sound = nullptr;
  auto data = reinterpret_cast<const char*>(m_AudioData.Data());
  FMOD_CALL_NULL_R1(env, FMOD_System_CreateSound(system, data, FMOD_OPENMEMORY, &exinfo, &sound));

  int numsubsounds = 0;
  FMOD_CALL_NULL_R2(env, FMOD_Sound_GetNumSubSounds(sound, &numsubsounds));
  if (numsubsounds > 0) {
    FMOD_SOUND *subsound = nullptr;
    auto FMOD_Sound_GetSubSound = reinterpret_cast<FMOD_Sound_GetSubSound_t>(dlsym(dll, "FMOD_Sound_GetSubSound"));
    FMOD_CALL_NULL_R2(env, FMOD_Sound_GetSubSound(sound, 0, &subsound));
    Value buff = _soundToWav(info, subsound);
    FMOD_Sound_Release(subsound);
    FMOD_Sound_Release(sound);
    FMOD_System_Release(system);
    return buff;
  } else {
    Value buff = _soundToWav(info, sound);
    FMOD_Sound_Release(sound);
    FMOD_System_Release(system);
    return buff;
  }
}

static void cleanupData(Napi::Env env, void* data) {
  dlclose(data);
}

static void exportFunctions(const Env& env, const ObjectReference& exportsRef) {
  Object exports = exportsRef.Value();
  exports["convertToWav"] = Function::New(env, _convertToWav, "convertToWav");
}

static Value _init(const CallbackInfo& info) {
  Env env = info.Env();
  Value exportsValue = info.This();
  if (exportsValue.IsUndefined() || exportsValue.IsNull()) {
    return Boolean::New(env, false);
  }
  ObjectReference exports = Weak(exportsValue.As<Object>());

  String dllpath = info[0].As<String>();

  void* storedHandle = env.GetInstanceData<void>();
  if (storedHandle != nullptr) {
    exportFunctions(env, exports);
    return Boolean::New(env, true);
  }

  std::string cpppathstr = dllpath.Utf8Value();
  void* handle = dlopen(cpppathstr.c_str(), RTLD_LAZY);
  if (handle == nullptr) {
    return Boolean::New(env, false);
  }

  env.SetInstanceData<void, cleanupData>(handle);
  exportFunctions(env, exports);
  return Boolean::New(env, true);
}

static Object _index(Env env, Object exports) {
  exports["init"] = Function::New(env, _init, "init");
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, _index)

}

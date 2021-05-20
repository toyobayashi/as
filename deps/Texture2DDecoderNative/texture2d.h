#ifndef __TEXTURE2D_H__
#define __TEXTURE2D_H__

#include "dllexport.h"
#include "bool32_t.h"

T2D_API(bool32_t) DecodeDXT1(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeDXT5(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodePVRTC(const void* data, int32_t width, int32_t height, void* image, bool32_t is2bpp);

T2D_API(bool32_t) DecodeETC1(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeETC2(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeETC2A1(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeETC2A8(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeEACR(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeEACRSigned(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeEACRG(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeEACRGSigned(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeBC4(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeBC5(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeBC6(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeBC7(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeATCRGB4(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeATCRGBA8(const void* data, int32_t width, int32_t height, void* image);

T2D_API(bool32_t) DecodeASTC(const void* data, int32_t width, int32_t height, int32_t blockWidth, int32_t blockHeight, void* image);

T2D_API(void) DisposeBuffer(void** ppBuffer);

T2D_API(void) UnpackCrunch(const void* data, uint32_t dataSize, void** ppResult, uint32_t* pResultSize);

T2D_API(void) UnpackUnityCrunch(const void* data, uint32_t dataSize, void** ppResult, uint32_t* pResultSize);

#endif

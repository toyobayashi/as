#ifndef __FMODAPI_H__
#define __FMODAPI_H__

#ifdef __cplusplus
  #define EXTERN_C_START extern "C" {
  #define EXTERN_C_END }
#else
  #define EXTERN_C_START
  #define EXTERN_C_END
#endif

#if defined(_WIN32) || defined(__CYGWIN__)
    #define F_CALL __stdcall
#else
    #define F_CALL
#endif

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__ORBIS__) || defined(F_USE_DECLSPEC)
    #define F_EXPORT __declspec(dllexport)
#elif defined(__APPLE__) || defined(__ANDROID__) || defined(__linux__) || defined(F_USE_ATTRIBUTE)
    #define F_EXPORT __attribute__((visibility("default")))
#else
    #define F_EXPORT
#endif

#define F_API F_CALL

#define F_CALLBACK F_CALL

EXTERN_C_START

typedef unsigned int uint;
typedef unsigned int FMOD_TIMEUNIT;
#define FMOD_TIMEUNIT_MS                            0x00000001
#define FMOD_TIMEUNIT_PCM                           0x00000002
#define FMOD_TIMEUNIT_PCMBYTES                      0x00000004
#define FMOD_TIMEUNIT_RAWBYTES                      0x00000008
#define FMOD_TIMEUNIT_PCMFRACTION                   0x00000010
#define FMOD_TIMEUNIT_MODORDER                      0x00000100
#define FMOD_TIMEUNIT_MODROW                        0x00000200
#define FMOD_TIMEUNIT_MODPATTERN                    0x00000400
#define FMOD_TIMEUNIT_BUFFERED                      0x10000000

typedef enum FMOD_RESULT {
  FMOD_OK,
  FMOD_ERR_BADCOMMAND,
  FMOD_ERR_CHANNEL_ALLOC,
  FMOD_ERR_CHANNEL_STOLEN,
  FMOD_ERR_DMA,
  FMOD_ERR_DSP_CONNECTION,
  FMOD_ERR_DSP_DONTPROCESS,
  FMOD_ERR_DSP_FORMAT,
  FMOD_ERR_DSP_INUSE,
  FMOD_ERR_DSP_NOTFOUND,
  FMOD_ERR_DSP_RESERVED,
  FMOD_ERR_DSP_SILENCE,
  FMOD_ERR_DSP_TYPE,
  FMOD_ERR_FILE_BAD,
  FMOD_ERR_FILE_COULDNOTSEEK,
  FMOD_ERR_FILE_DISKEJECTED,
  FMOD_ERR_FILE_EOF,
  FMOD_ERR_FILE_ENDOFDATA,
  FMOD_ERR_FILE_NOTFOUND,
  FMOD_ERR_FORMAT,
  FMOD_ERR_HEADER_MISMATCH,
  FMOD_ERR_HTTP,
  FMOD_ERR_HTTP_ACCESS,
  FMOD_ERR_HTTP_PROXY_AUTH,
  FMOD_ERR_HTTP_SERVER_ERROR,
  FMOD_ERR_HTTP_TIMEOUT,
  FMOD_ERR_INITIALIZATION,
  FMOD_ERR_INITIALIZED,
  FMOD_ERR_INTERNAL,
  FMOD_ERR_INVALID_FLOAT,
  FMOD_ERR_INVALID_HANDLE,
  FMOD_ERR_INVALID_PARAM,
  FMOD_ERR_INVALID_POSITION,
  FMOD_ERR_INVALID_SPEAKER,
  FMOD_ERR_INVALID_SYNCPOINT,
  FMOD_ERR_INVALID_THREAD,
  FMOD_ERR_INVALID_VECTOR,
  FMOD_ERR_MAXAUDIBLE,
  FMOD_ERR_MEMORY,
  FMOD_ERR_MEMORY_CANTPOINT,
  FMOD_ERR_NEEDS3D,
  FMOD_ERR_NEEDSHARDWARE,
  FMOD_ERR_NET_CONNECT,
  FMOD_ERR_NET_SOCKET_ERROR,
  FMOD_ERR_NET_URL,
  FMOD_ERR_NET_WOULD_BLOCK,
  FMOD_ERR_NOTREADY,
  FMOD_ERR_OUTPUT_ALLOCATED,
  FMOD_ERR_OUTPUT_CREATEBUFFER,
  FMOD_ERR_OUTPUT_DRIVERCALL,
  FMOD_ERR_OUTPUT_FORMAT,
  FMOD_ERR_OUTPUT_INIT,
  FMOD_ERR_OUTPUT_NODRIVERS,
  FMOD_ERR_PLUGIN,
  FMOD_ERR_PLUGIN_MISSING,
  FMOD_ERR_PLUGIN_RESOURCE,
  FMOD_ERR_PLUGIN_VERSION,
  FMOD_ERR_RECORD,
  FMOD_ERR_REVERB_CHANNELGROUP,
  FMOD_ERR_REVERB_INSTANCE,
  FMOD_ERR_SUBSOUNDS,
  FMOD_ERR_SUBSOUND_ALLOCATED,
  FMOD_ERR_SUBSOUND_CANTMOVE,
  FMOD_ERR_TAGNOTFOUND,
  FMOD_ERR_TOOMANYCHANNELS,
  FMOD_ERR_TRUNCATED,
  FMOD_ERR_UNIMPLEMENTED,
  FMOD_ERR_UNINITIALIZED,
  FMOD_ERR_UNSUPPORTED,
  FMOD_ERR_VERSION,
  FMOD_ERR_EVENT_ALREADY_LOADED,
  FMOD_ERR_EVENT_LIVEUPDATE_BUSY,
  FMOD_ERR_EVENT_LIVEUPDATE_MISMATCH,
  FMOD_ERR_EVENT_LIVEUPDATE_TIMEOUT,
  FMOD_ERR_EVENT_NOTFOUND,
  FMOD_ERR_STUDIO_UNINITIALIZED,
  FMOD_ERR_STUDIO_NOT_LOADED,
  FMOD_ERR_INVALID_STRING,
  FMOD_ERR_ALREADY_LOCKED,
  FMOD_ERR_NOT_LOCKED,
  FMOD_ERR_RECORD_DISCONNECTED,
  FMOD_ERR_TOOMANYSAMPLES
} FMOD_RESULT;

typedef enum FMOD_SOUND_FORMAT {
  FMOD_SOUND_FORMAT_NONE,
  FMOD_SOUND_FORMAT_PCM8,
  FMOD_SOUND_FORMAT_PCM16,
  FMOD_SOUND_FORMAT_PCM24,
  FMOD_SOUND_FORMAT_PCM32,
  FMOD_SOUND_FORMAT_PCMFLOAT,
  FMOD_SOUND_FORMAT_BITSTREAM,

  FMOD_SOUND_FORMAT_MAX
} FMOD_SOUND_FORMAT;

typedef struct FMOD_ASYNCREADINFO FMOD_ASYNCREADINFO;
typedef struct FMOD_SOUNDGROUP     FMOD_SOUNDGROUP;
typedef struct FMOD_SOUND          FMOD_SOUND;
typedef struct FMOD_SYSTEM         FMOD_SYSTEM;


typedef FMOD_RESULT (F_CALL *FMOD_SOUND_PCMREAD_CALLBACK)   (FMOD_SOUND *sound, void *data, unsigned int datalen);
typedef FMOD_RESULT (F_CALL *FMOD_SOUND_PCMSETPOS_CALLBACK) (FMOD_SOUND *sound, int subsound, unsigned int position, FMOD_TIMEUNIT postype);
typedef FMOD_RESULT (F_CALL *FMOD_SOUND_NONBLOCK_CALLBACK)  (FMOD_SOUND *sound, FMOD_RESULT result);

typedef FMOD_RESULT (F_CALL *FMOD_FILE_OPEN_CALLBACK)       (const char *name, unsigned int *filesize, void **handle, void *userdata);
typedef FMOD_RESULT (F_CALL *FMOD_FILE_CLOSE_CALLBACK)      (void *handle, void *userdata);
typedef FMOD_RESULT (F_CALL *FMOD_FILE_READ_CALLBACK)       (void *handle, void *buffer, unsigned int sizebytes, unsigned int *bytesread, void *userdata);
typedef FMOD_RESULT (F_CALL *FMOD_FILE_SEEK_CALLBACK)       (void *handle, unsigned int pos, void *userdata);
typedef FMOD_RESULT (F_CALL *FMOD_FILE_ASYNCREAD_CALLBACK)  (FMOD_ASYNCREADINFO *info, void *userdata);
typedef FMOD_RESULT (F_CALL *FMOD_FILE_ASYNCCANCEL_CALLBACK)(FMOD_ASYNCREADINFO *info, void *userdata);

typedef void        (F_CALL *FMOD_FILE_ASYNCDONE_FUNC)      (FMOD_ASYNCREADINFO *info, FMOD_RESULT result);

struct FMOD_ASYNCREADINFO
{
    void                     *handle;
    unsigned int              offset;
    unsigned int              sizebytes;
    int                       priority;
    void                     *userdata;
    void                     *buffer;
    unsigned int              bytesread;
    FMOD_FILE_ASYNCDONE_FUNC  done;
};

typedef enum FMOD_SOUND_TYPE
{
    FMOD_SOUND_TYPE_UNKNOWN,
    FMOD_SOUND_TYPE_AIFF,
    FMOD_SOUND_TYPE_ASF,
    FMOD_SOUND_TYPE_DLS,
    FMOD_SOUND_TYPE_FLAC,
    FMOD_SOUND_TYPE_FSB,
    FMOD_SOUND_TYPE_IT,
    FMOD_SOUND_TYPE_MIDI,
    FMOD_SOUND_TYPE_MOD,
    FMOD_SOUND_TYPE_MPEG,
    FMOD_SOUND_TYPE_OGGVORBIS,
    FMOD_SOUND_TYPE_PLAYLIST,
    FMOD_SOUND_TYPE_RAW,
    FMOD_SOUND_TYPE_S3M,
    FMOD_SOUND_TYPE_USER,
    FMOD_SOUND_TYPE_WAV,
    FMOD_SOUND_TYPE_XM,
    FMOD_SOUND_TYPE_XMA,
    FMOD_SOUND_TYPE_AUDIOQUEUE,
    FMOD_SOUND_TYPE_AT9,
    FMOD_SOUND_TYPE_VORBIS,
    FMOD_SOUND_TYPE_MEDIA_FOUNDATION,
    FMOD_SOUND_TYPE_MEDIACODEC,
    FMOD_SOUND_TYPE_FADPCM,
    FMOD_SOUND_TYPE_OPUS,

    FMOD_SOUND_TYPE_MAX
} FMOD_SOUND_TYPE;

typedef enum FMOD_CHANNELORDER
{
    FMOD_CHANNELORDER_DEFAULT,
    FMOD_CHANNELORDER_WAVEFORMAT,
    FMOD_CHANNELORDER_PROTOOLS,
    FMOD_CHANNELORDER_ALLMONO,
    FMOD_CHANNELORDER_ALLSTEREO,
    FMOD_CHANNELORDER_ALSA,

    FMOD_CHANNELORDER_MAX
} FMOD_CHANNELORDER;

typedef enum FMOD_CHANNELMASK {
  FRONT_LEFT             = 0x00000001,
  FRONT_RIGHT            = 0x00000002,
  FRONT_CENTER           = 0x00000004,
  LOW_FREQUENCY          = 0x00000008,
  SURROUND_LEFT          = 0x00000010,
  SURROUND_RIGHT         = 0x00000020,
  BACK_LEFT              = 0x00000040,
  BACK_RIGHT             = 0x00000080,
  BACK_CENTER            = 0x00000100,

  MONO                   = (FRONT_LEFT),
  STEREO                 = (FRONT_LEFT | FRONT_RIGHT),
  LRC                    = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER),
  QUAD                   = (FRONT_LEFT | FRONT_RIGHT | SURROUND_LEFT | SURROUND_RIGHT),
  SURROUND               = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER | SURROUND_LEFT | SURROUND_RIGHT),
  _5POINT1               = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER | LOW_FREQUENCY | SURROUND_LEFT | SURROUND_RIGHT),
  _5POINT1_REARS         = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER | LOW_FREQUENCY | BACK_LEFT | BACK_RIGHT),
  _7POINT0               = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER | SURROUND_LEFT | SURROUND_RIGHT | BACK_LEFT | BACK_RIGHT),
  _7POINT1               = (FRONT_LEFT | FRONT_RIGHT | FRONT_CENTER | LOW_FREQUENCY | SURROUND_LEFT | SURROUND_RIGHT | BACK_LEFT | BACK_RIGHT)
} FMOD_CHANNELMASK;

typedef struct FMOD_CREATESOUNDEXINFO {
  int                         cbsize;                 /* [w] Size of this structure.  This is used so the structure can be expanded in the future and still work on older versions of FMOD Ex. */
  uint                        length;                 /* [w] Optional. Specify 0 to ignore. Size in bytes of file to load, or sound to create (in this case only if FMOD_OPENUSER is used).  Required if loading from memory.  If 0 is specified, then it will use the size of the file (unless loading from memory then an error will be returned). */
  uint                        fileoffset;             /* [w] Optional. Specify 0 to ignore. Offset from start of the file to start loading from.  This is useful for loading files from inside big data files. */
  int                         numchannels;            /* [w] Optional. Specify 0 to ignore. Number of channels in a sound specified only if OPENUSER is used. */
  int                         defaultfrequency;       /* [w] Optional. Specify 0 to ignore. Default frequency of sound in a sound specified only if OPENUSER is used.  Other formats use the frequency determined by the file format. */
  FMOD_SOUND_FORMAT           format;                 /* [w] Optional. Specify 0 or SOUND_FORMAT_NONE to ignore. Format of the sound specified only if OPENUSER is used.  Other formats use the format determined by the file format.   */
  uint                        decodebuffersize;       /* [w] Optional. Specify 0 to ignore. For streams.  This determines the size of the double buffer (in PCM samples) that a stream uses.  Use this for user created streams if you want to determine the size of the callback buffer passed to you.  Specify 0 to use FMOD's default size which is currently equivalent to 400ms of the sound format created/loaded. */
  int                         initialsubsound;        /* [w] Optional. Specify 0 to ignore. In a multi-sample file format such as .FSB/.DLS/.SF2, specify the initial subsound to seek to, only if CREATESTREAM is used. */
  int                         numsubsounds;           /* [w] Optional. Specify 0 to ignore or have no subsounds.  In a user created multi-sample sound, specify the number of subsounds within the sound that are accessable with Sound::getSubSound / SoundGetSubSound. */
  int*                        inclusionlist;          /* [w] Optional. Specify 0 to ignore. In a multi-sample format such as .FSB/.DLS/.SF2 it may be desirable to specify only a subset of sounds to be loaded out of the whole file.  This is an array of subsound indicies to load into memory when created. */
  int                         inclusionlistnum;       /* [w] Optional. Specify 0 to ignore. This is the number of integers contained within the */
  FMOD_SOUND_PCMREAD_CALLBACK pcmreadcallback;        /* [w] Optional. Specify 0 to ignore. Callback to 'piggyback' on FMOD's read functions and accept or even write PCM data while FMOD is opening the sound.  Used for user sounds created with OPENUSER or for capturing decoded data as FMOD reads it. */
  FMOD_SOUND_PCMSETPOS_CALLBACK pcmsetposcallback;      /* [w] Optional. Specify 0 to ignore. Callback for when the user calls a seeking function such as Channel::setPosition within a multi-sample sound, and for when it is opened.*/
  FMOD_SOUND_NONBLOCK_CALLBACK nonblockcallback;       /* [w] Optional. Specify 0 to ignore. Callback for successful completion, or error while loading a sound that used the FMOD_NONBLOCKING flag.*/
  const char*                 dlsname;                /* [w] Optional. Specify 0 to ignore. Filename for a DLS or SF2 sample set when loading a MIDI file.   If not specified, on windows it will attempt to open /windows/system32/drivers/gm.dls, otherwise the MIDI will fail to open.  */
  const char*                 encryptionkey;          /* [w] Optional. Specify 0 to ignore. Key for encrypted FSB file.  Without this key an encrypted FSB file will not load. */
  int                         maxpolyphony;           /* [w] Optional. Specify 0 to ingore. For sequenced formats with dynamic channel allocation such as .MID and .IT, this specifies the maximum voice count allowed while playing.  .IT defaults to 64.  .MID defaults to 32. */
  void*                       userdata;               /* [w] Optional. Specify 0 to ignore. This is user data to be attached to the sound during creation.  Access via Sound::getUserData. */
  FMOD_SOUND_TYPE             suggestedsoundtype;     /* [w] Optional. Specify 0 or FMOD_SOUND_TYPE_UNKNOWN to ignore.  Instead of scanning all codec types, use this to speed up loading by making it jump straight to this codec. */
  FMOD_FILE_OPEN_CALLBACK           fileuseropen;           /* [w] Optional. Specify 0 to ignore. Callback for opening this file. */
  FMOD_FILE_CLOSE_CALLBACK          fileuserclose;          /* [w] Optional. Specify 0 to ignore. Callback for closing this file. */
  FMOD_FILE_READ_CALLBACK           fileuserread;           /* [w] Optional. Specify 0 to ignore. Callback for reading from this file. */
  FMOD_FILE_SEEK_CALLBACK           fileuserseek;           /* [w] Optional. Specify 0 to ignore. Callback for seeking within this file. */
  FMOD_FILE_ASYNCREAD_CALLBACK      fileuserasyncread;      /* [w] Optional. Specify 0 to ignore. Callback for asyncronously reading from this file. */
  FMOD_FILE_ASYNCCANCEL_CALLBACK    fileuserasynccancel;    /* [w] Optional. Specify 0 to ignore. Callback for cancelling an asyncronous read. */
  void*                       fileuserdata;           /* [w] Optional. Specify 0 to ignore. User data to be passed into the file callbacks. */
  FMOD_CHANNELORDER                channelorder;           /* [w] Optional. Specify 0 to ignore. Use this to differ the way fmod maps multichannel sounds to speakers.  See FMOD_CHANNELORDER for more. */
  FMOD_CHANNELMASK                 channelmask;            /* [w] Optional. Specify 0 to ignore. Use this to differ the way fmod maps multichannel sounds to speakers.  See FMOD_CHANNELMASK for more. */
  FMOD_SOUNDGROUP*                      initialsoundgroup;      /* [w] Optional. Specify 0 to ignore. Specify a sound group if required, to put sound in as it is created. */
  uint                        initialseekposition;    /* [w] Optional. Specify 0 to ignore. For streams. Specify an initial position to seek the stream to. */
  FMOD_TIMEUNIT               initialseekpostype;     /* [w] Optional. Specify 0 to ignore. For streams. Specify the time unit for the position set in initialseekposition. */
  int                         ignoresetfilesystem;    /* [w] Optional. Specify 0 to ignore. Set to 1 to use fmod's built in file system. Ignores setFileSystem callbacks and also FMOD_CREATESOUNEXINFO file callbacks.  Useful for specific cases where you don't want to use your own file system but want to use fmod's file system (ie net streaming). */
  uint                        audioqueuepolicy;       /* [w] Optional. Specify 0 or FMOD_AUDIOQUEUE_CODECPOLICY_DEFAULT to ignore. Policy used to determine whether hardware or software is used for decoding, see FMOD_AUDIOQUEUE_CODECPOLICY for options (iOS >= 3.0 required, otherwise only hardware is available) */
  uint                        minmidigranularity;     /* [w] Optional. Specify 0 to ignore. Allows you to set a minimum desired MIDI mixer granularity. Values smaller than 512 give greater than default accuracy at the cost of more CPU and vise versa. Specify 0 for default (512 samples). */
  int                         nonblockthreadid;       /* [w] Optional. Specify 0 to ignore. Specifies a thread index to execute non blocking load on.  Allows for up to 5 threads to be used for loading at once.  This is to avoid one load blocking another.  Maximum value = 4. */
} FMOD_CREATESOUNDEXINFO;

typedef unsigned int FMOD_INITFLAGS;
#define FMOD_INIT_NORMAL                            0x00000000
#define FMOD_INIT_STREAM_FROM_UPDATE                0x00000001
#define FMOD_INIT_MIX_FROM_UPDATE                   0x00000002
#define FMOD_INIT_3D_RIGHTHANDED                    0x00000004
#define FMOD_INIT_CHANNEL_LOWPASS                   0x00000100
#define FMOD_INIT_CHANNEL_DISTANCEFILTER            0x00000200
#define FMOD_INIT_PROFILE_ENABLE                    0x00010000
#define FMOD_INIT_VOL0_BECOMES_VIRTUAL              0x00020000
#define FMOD_INIT_GEOMETRY_USECLOSEST               0x00040000
#define FMOD_INIT_PREFER_DOLBY_DOWNMIX              0x00080000
#define FMOD_INIT_THREAD_UNSAFE                     0x00100000
#define FMOD_INIT_PROFILE_METER_ALL                 0x00200000

typedef unsigned int FMOD_MODE;
#define FMOD_DEFAULT                                0x00000000
#define FMOD_LOOP_OFF                               0x00000001
#define FMOD_LOOP_NORMAL                            0x00000002
#define FMOD_LOOP_BIDI                              0x00000004
#define FMOD_2D                                     0x00000008
#define FMOD_3D                                     0x00000010
#define FMOD_CREATESTREAM                           0x00000080
#define FMOD_CREATESAMPLE                           0x00000100
#define FMOD_CREATECOMPRESSEDSAMPLE                 0x00000200
#define FMOD_OPENUSER                               0x00000400
#define FMOD_OPENMEMORY                             0x00000800
#define FMOD_OPENMEMORY_POINT                       0x10000000
#define FMOD_OPENRAW                                0x00001000
#define FMOD_OPENONLY                               0x00002000
#define FMOD_ACCURATETIME                           0x00004000
#define FMOD_MPEGSEARCH                             0x00008000
#define FMOD_NONBLOCKING                            0x00010000
#define FMOD_UNIQUE                                 0x00020000
#define FMOD_3D_HEADRELATIVE                        0x00040000
#define FMOD_3D_WORLDRELATIVE                       0x00080000
#define FMOD_3D_INVERSEROLLOFF                      0x00100000
#define FMOD_3D_LINEARROLLOFF                       0x00200000
#define FMOD_3D_LINEARSQUAREROLLOFF                 0x00400000
#define FMOD_3D_INVERSETAPEREDROLLOFF               0x00800000
#define FMOD_3D_CUSTOMROLLOFF                       0x04000000
#define FMOD_3D_IGNOREGEOMETRY                      0x40000000
#define FMOD_IGNORETAGS                             0x02000000
#define FMOD_LOWMEM                                 0x08000000
#define FMOD_VIRTUAL_PLAYFROMSTART                  0x80000000

typedef FMOD_RESULT (F_API *FMOD_System_Create_t)    (FMOD_SYSTEM **system); 
typedef FMOD_RESULT (F_API *FMOD_System_Release_t)   (FMOD_SYSTEM *system);

typedef FMOD_RESULT (F_API *FMOD_System_Init_t)      (FMOD_SYSTEM *system, int maxchannels, FMOD_INITFLAGS flags, void *extradriverdata);
typedef FMOD_RESULT (F_API *FMOD_System_Close_t)     (FMOD_SYSTEM *system);

typedef FMOD_RESULT (F_API *FMOD_System_CreateSound_t) (FMOD_SYSTEM *system, const char *name_or_data, FMOD_MODE mode, FMOD_CREATESOUNDEXINFO *exinfo, FMOD_SOUND **sound);

typedef FMOD_RESULT (F_API *FMOD_Sound_GetNumSubSounds_t)    (FMOD_SOUND *sound, int *numsubsounds);
typedef FMOD_RESULT (F_API *FMOD_Sound_GetSubSound_t)        (FMOD_SOUND *sound, int index, FMOD_SOUND **subsound);
typedef FMOD_RESULT (F_API *FMOD_Sound_GetDefaults_t)        (FMOD_SOUND *sound, float *frequency, int *priority);
typedef FMOD_RESULT (F_API *FMOD_Sound_GetLength_t)          (FMOD_SOUND *sound, unsigned int *length, FMOD_TIMEUNIT lengthtype);
typedef FMOD_RESULT (F_API *FMOD_Sound_GetFormat_t)          (FMOD_SOUND *sound, FMOD_SOUND_TYPE *type, FMOD_SOUND_FORMAT *format, int *channels, int *bits);
typedef FMOD_RESULT (F_API *FMOD_Sound_Lock_t)               (FMOD_SOUND *sound, unsigned int offset, unsigned int length, void **ptr1, void **ptr2, unsigned int *len1, unsigned int *len2);
typedef FMOD_RESULT (F_API *FMOD_Sound_Unlock_t)             (FMOD_SOUND *sound, void *ptr1, void *ptr2, unsigned int len1, unsigned int len2);
typedef FMOD_RESULT (F_API *FMOD_Sound_Release_t)            (FMOD_SOUND *sound);

EXTERN_C_END

#endif

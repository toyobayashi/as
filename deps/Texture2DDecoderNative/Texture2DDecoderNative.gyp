{
  'variables': { 'target_arch%': 'ia32' },

  'target_defaults': {
    'conditions': [
      ['OS=="mac"', {
        'cflags+': ['-fvisibility=hidden'],
        'xcode_settings': {
          'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
          'CLANG_CXX_LIBRARY': 'libc++',
          'MACOSX_DEPLOYMENT_TARGET': '10.7',
          'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES', # -fvisibility=hidden
        }
      }],
      ['OS=="win"', { 
        'msvs_settings': {
          'VCCLCompilerTool': { 'ExceptionHandling': 1, 'AdditionalOptions': ['/source-charset:utf-8'] },
        },
        'defines':[
          'NOMINMAX'
        ]
      }]
    ]
  },

  'targets': [
    {
      'target_name': 'texture2ddecoder',
      'type': 'static_library',
      'sources': [
        'astc.cpp',
        'atc.cpp',
        'bcn.cpp',
        'crunch.cpp',
        'dllmain.cpp',
        'etc.cpp',
        'pvrtc.cpp',
        'unitycrunch.cpp'
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          '.',
        ],
      },
    }
  ]
}

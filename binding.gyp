{
  "variables": {
    "module_path": "./dist"
  },
  'targets': [
    {
      'target_name': 'decoder',
      'sources': [
        'src/native/texture2d.cpp'
      ],
      'includes': [
        './common.gypi'
      ],
      'dependencies': [
        'deps/Texture2DDecoderNative/Texture2DDecoderNative.gyp:texture2ddecoder',
      ],
    },
    {
      'target_name': 'fmod',
      'sources': [
        'src/native/fmod.cpp',
        'src/native/windlfcn.c'
      ],
      'includes': [
        './common.gypi'
      ],
      'conditions': [
        ['OS!="win"', { 
          'libraries': ['-ldl']
        }]
      ]

      # 'include_dirs': ['./deps/fmod/inc'],
      # 'conditions': [
      #   ['OS=="win" and target_arch=="x64"', { 
      #     'libraries': ['../deps/fmod/lib/x64/fmod_vc.lib']
      #   }],
      #   ['OS=="win" and target_arch=="ia32"', { 
      #     'libraries': ['../deps/fmod/lib/x86/fmod_vc.lib']
      #   }]
      # ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "fmod", "decoder" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/fmod.node", "<(PRODUCT_DIR)/decoder.node" ],
          "destination": "<(module_path)"
        }
      ],
      # 'conditions': [
      #   ['OS=="win" and target_arch=="x64"', { 
      #     "copies": [
      #       {
      #         "files": [ "./deps/fmod/lib/x64/fmod_vc.dll" ],
      #         "destination": "<(module_path)"
      #       }
      #     ]
      #   }],
      #   ['OS=="win" and target_arch=="ia32"', { 
      #     "copies": [
      #       {
      #         "files": [ "./deps/fmod/lib/x86/fmod.dll" ],
      #         "destination": "<(module_path)"
      #       }
      #     ]
      #   }]
      # ]
    }
  ]
}

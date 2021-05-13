{
  "variables": {
    "module_name": "binding",
    "module_path": "./dist",
    "PRODUCT_DIR": "./build/Release"
  },
  'targets': [
    {
      'target_name': '<(module_name)',
      'sources': [
        'src/native/index.cpp',
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
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
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

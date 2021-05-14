const { AssetsManager, exportAudioClip, AudioClip } = require('..')
const { join } = require('path')
const { readdirSync } = require('fs')

// const assetBundleFile = join(__dirname, 'bgm_china_day')

const dir = join(__dirname, 'bgms')
const out = join(__dirname, 'out')
const items = readdirSync(dir).map(item => join(dir, item))

const assetsManager = new AssetsManager()

assetsManager.load(items).then(() => {
  for (const assetFile of assetsManager.assetsFileList) {
    const objects = assetFile.Objects
    for (const obj of objects) {
      if (obj instanceof AudioClip) {
        console.log(obj.m_Name, exportAudioClip(obj, out, obj.m_Name))
      }
    }
  }
})

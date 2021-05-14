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
      console.log(Object.prototype.toString.call(obj))
      if (obj instanceof AudioClip) {
        console.log(exportAudioClip(obj, out, obj.m_Name))
      }
    }
  }
})

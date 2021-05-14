const { AssetsManager, exportAudioClip, AudioClip } = require('..')
const { join } = require('path')

const assetBundleFile = join(__dirname, 'bgm_china_day')

const assetsManager = new AssetsManager()
assetsManager.loadFile(assetBundleFile).then(() => {
  assetsManager.readAssets()
  console.log(assetsManager.assetsFileList)
  const objects = assetsManager.assetsFileList[0].Objects
  for (const obj of objects) {
    console.log(Object.prototype.toString.call(obj))
    if (obj instanceof AudioClip) {
      console.log(exportAudioClip(obj, __dirname, obj.m_Name))
    }
  }
})

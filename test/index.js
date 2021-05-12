const { AssetsManager, exportAudioClip } = require('..')
const { join } = require('path')

const assetBundleFile = join(__dirname, 'bgm_china_day')

const assetsManager = new AssetsManager()
assetsManager.loadFile(assetBundleFile).then(() => {
  assetsManager.readAssets()
  console.log(assetsManager.assetsFileList)
  return exportAudioClip(assetsManager.assetsFileList[0].Objects.values().next().value, __dirname, 'test')
}).then(console.log)

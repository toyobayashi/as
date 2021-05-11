const { AssetsManager } = require('..')
const { join } = require('path')

const assetBundleFile = join(__dirname, 'bgm_china_day')

const assetsManager = new AssetsManager()
assetsManager.loadFile(assetBundleFile).then(() => {
  console.log(assetsManager)
})

const { AssetsManager, exportTexture2D, Texture2D, TextureFormat } = require('..')
const { join } = require('path')

const assetBundleFile = join(__dirname, 'card_100003_sm.unity3d')
const assetsManager = new AssetsManager()
const out = join(__dirname, 'out2')
assetsManager.loadFile(assetBundleFile).then(async () => {
  await assetsManager.readAssets()
  for (const assetFile of assetsManager.assetsFileList) {
    const objects = assetFile.Objects
    for (const obj of objects) {
      if (obj instanceof Texture2D) {
        console.log(obj.m_Name, TextureFormat[obj.m_TextureFormat], await exportTexture2D(obj, 'PNG', out, obj.m_Name))
      }
    }
  }
})

import type { BinaryReader } from '@tybys/binreader'
import { basename, dirname, sep } from 'path'
import { BundleFile } from './BundleFile'
import { EndianBinaryReader } from './EndianBinaryReader'
import { checkFileType, FileType } from './import-helper'
import { ObjectReader } from './ObjectReader'
import { Object } from './classes/Object'
import { SerializedFile } from './SerializedFile'
import { ClassIDType } from './ClassIDType'
import { AudioClip } from './classes/AudioClip'
import { AssetBundle } from './classes/AssetBundle'
import { Texture2D } from './classes/Texture2D'
import { NotImplementedException } from './util/Exception'

/** @public */
export class AssetsManager {
  public assetsFileList: SerializedFile[] = []
  // private readonly assetsFileIndexCache = new Map<string, number>()
  public readonly resourceFileReaders = new Map<string, BinaryReader>()

  private readonly importFiles: string[] = []
  private readonly importFilesHash = new Set<string>()
  private readonly assetsFileListHash = new Set<string>()

  public async load (files: string[]): Promise<void> {
    for (const file of files) {
      this.importFiles.push(file)
      this.importFilesHash.add(basename(file))
    }

    // Progress.Reset()
    // use a for loop because list size can change
    for (let i = 0; i < this.importFiles.length; i++) {
      await this.loadFile(this.importFiles[i])
      // Progress.Report(i + 1, importFiles.Count)
    }

    this.importFiles.length = 0
    this.importFilesHash.clear()
    this.assetsFileListHash.clear()

    this.readAssets()
    this.processAssets()
  }

  public async loadFile (fullName: string): Promise<void> {
    const reader = new EndianBinaryReader(fullName)
    const type = checkFileType(reader)
    switch (type) {
      case FileType.AssetsFile:
        // LoadAssetsFile(fullName, reader);
        // break;
        throw new NotImplementedException('AssetsManager::loadFile()', `FileType.${FileType[type]}`)
      case FileType.BundleFile:
        await this.loadBundleFile(fullName, reader)
        break
      case FileType.WebFile:
        // LoadWebFile(fullName, reader);
        // break;
        throw new NotImplementedException('AssetsManager::loadFile()', `FileType.${FileType[type]}`)
    }
  }

  private async loadBundleFile (fullName: string, reader: EndianBinaryReader, parentPath: string | null = null): Promise<void> {
    const fileName = basename(fullName)
    console.info('Loading ' + fileName)
    try {
      const bundleFile = await BundleFile.build(reader, fullName)
      for (const file of bundleFile.fileList) {
        const subReader = new EndianBinaryReader(file.stream)
        if (SerializedFile.isSerializedFile(subReader)) {
          const dummyPath = dirname(fullName) + sep + file.fileName
          this.loadAssetsFromMemory(dummyPath, subReader, parentPath ?? fullName, bundleFile.m_Header.unityRevision)
        } else {
          this.resourceFileReaders.set(file.fileName, subReader)
        }
      }
    } catch (err) {
      console.error(err)
      /* var str = $"Unable to load bundle file {fileName}";
                if (parentPath != null)
                {
                    str += $" from {Path.GetFileName(parentPath)}";
                }
                Logger.Error(str); */
    }
    reader.dispose()
  }

  private loadAssetsFromMemory (fullName: string, reader: EndianBinaryReader, originalPath: string, unityVersion: string = ''): void {
    const fileName = basename(fullName)
    if (!this.assetsFileListHash.has(fileName)) {
      try {
        const assetsFile = new SerializedFile(this, fullName, reader)
        assetsFile.originalPath = originalPath
        if (assetsFile.header.m_Version < 7) {
          assetsFile.setVersion(unityVersion)
        }
        this.assetsFileList.push(assetsFile)
        this.assetsFileListHash.add(assetsFile.fileName)
      } catch (_) {
        // console.error(_)
        // console.error(`Unable to load assets file ${fileName} from ${basename(originalPath)}`)
        this.resourceFileReaders.set(fileName, reader)
      }
    }
  }

  public readAssets (): void {
    console.info('Read assets...')

    // const progressCount = this.assetsFileList.reduce((pv, c) => pv + c.m_Objects.size, 0)
    // let i = 0
    for (const assetsFile of this.assetsFileList) {
      for (const objectInfo of assetsFile.m_Objects) {
        const objectReader = new ObjectReader(assetsFile.reader, assetsFile, objectInfo)
        try {
          let obj: Object
          switch (objectReader.classIDType) {
            case ClassIDType.Animation:
              // obj = new Animation(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.AnimationClip:
              // obj = new AnimationClip(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Animator:
              // obj = new Animator(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.AnimatorController:
              // obj = new AnimatorController(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.AnimatorOverrideController:
              // obj = new AnimatorOverrideController(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.AssetBundle:
              obj = new AssetBundle(objectReader)
              break
            case ClassIDType.AudioClip:
              obj = new AudioClip(objectReader)
              break
            case ClassIDType.Avatar:
              // obj = new Avatar(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Font:
              // obj = new Font(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.GameObject:
              // obj = new GameObject(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Material:
              // obj = new Material(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Mesh:
              // obj = new Mesh(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.MeshFilter:
              // obj = new MeshFilter(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.MeshRenderer:
              // obj = new MeshRenderer(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.MonoBehaviour:
              // obj = new MonoBehaviour(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.MonoScript:
              // obj = new MonoScript(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.MovieTexture:
              // obj = new MovieTexture(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.PlayerSettings:
              // obj = new PlayerSettings(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.RectTransform:
              // obj = new RectTransform(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Shader:
              // obj = new Shader(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.SkinnedMeshRenderer:
              // obj = new SkinnedMeshRenderer(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Sprite:
              // obj = new Sprite(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.SpriteAtlas:
              // obj = new SpriteAtlas(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.TextAsset:
              // obj = new TextAsset(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.Texture2D:
              obj = new Texture2D(objectReader)
              break
            case ClassIDType.Transform:
              // obj = new Transform(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.VideoClip:
              // obj = new VideoClip(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            case ClassIDType.ResourceManager:
              // obj = new ResourceManager(objectReader)
              obj = new Object(objectReader)
              console.warn(`ClassIDType.${ClassIDType[objectReader.classIDType]} has not been implemented yet`)
              break
            default:
              obj = new Object(objectReader)
              break
          }
          assetsFile.addObject(obj)
        } catch (_) {
          console.error(_)
        /* var sb = new StringBuilder();
          sb.AppendLine("Unable to load object")
              .AppendLine($"Assets {assetsFile.fileName}")
              .AppendLine($"Type {objectReader.type}")
              .AppendLine($"PathID {objectInfo.m_PathID}")
              .Append(e);
          Logger.Error(sb.ToString()); */
        }
      }
    }
  }

  public processAssets (): void {
    // TODO
  }
}

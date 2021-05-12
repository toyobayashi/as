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

/** @public */
export class AssetsManager {
  public assetsFileList: SerializedFile[] = []
  // private readonly assetsFileIndexCache = new Map<string, number>()
  public readonly resourceFileReaders = new Map<string, BinaryReader>()

  // private readonly importFiles = new Set<string>()
  // private readonly importFilesHash = new Set<string>()
  private readonly assetsFileListHash = new Set<string>()

  public async loadFile (fullName: string): Promise<void> {
    const reader = new EndianBinaryReader(fullName)
    switch (checkFileType(reader)) {
      case FileType.AssetsFile:
        // LoadAssetsFile(fullName, reader);
        // break;
        throw new Error('not implemented yet')
      case FileType.BundleFile:
        await this.loadBundleFile(fullName, reader)
        break
      case FileType.WebFile:
        // LoadWebFile(fullName, reader);
        // break;
        throw new Error('not implemented yet')
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
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.AnimationClip:
              // obj = new AnimationClip(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Animator:
              // obj = new Animator(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.AnimatorController:
              // obj = new AnimatorController(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.AnimatorOverrideController:
              // obj = new AnimatorOverrideController(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.AssetBundle:
              obj = new AssetBundle(objectReader)
              break
            case ClassIDType.AudioClip:
              obj = new AudioClip(objectReader)
              break
            case ClassIDType.Avatar:
              // obj = new Avatar(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Font:
              // obj = new Font(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.GameObject:
              // obj = new GameObject(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Material:
              // obj = new Material(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Mesh:
              // obj = new Mesh(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.MeshFilter:
              // obj = new MeshFilter(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.MeshRenderer:
              // obj = new MeshRenderer(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.MonoBehaviour:
              // obj = new MonoBehaviour(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.MonoScript:
              // obj = new MonoScript(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.MovieTexture:
              // obj = new MovieTexture(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.PlayerSettings:
              // obj = new PlayerSettings(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.RectTransform:
              // obj = new RectTransform(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Shader:
              // obj = new Shader(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.SkinnedMeshRenderer:
              // obj = new SkinnedMeshRenderer(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Sprite:
              // obj = new Sprite(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.SpriteAtlas:
              // obj = new SpriteAtlas(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.TextAsset:
              // obj = new TextAsset(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Texture2D:
              // obj = new Texture2D(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.Transform:
              // obj = new Transform(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.VideoClip:
              // obj = new VideoClip(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
            case ClassIDType.ResourceManager:
              // obj = new ResourceManager(objectReader)
              // break
              throw new Error(`not implemented yet {ClassIDType.${ClassIDType[objectReader.classIDType]}}`)
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
}

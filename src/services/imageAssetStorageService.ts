import { createId } from './idService'

const IMAGE_ASSET_DB_NAME = 'interactive-book-editor-assets'
const IMAGE_ASSET_STORE_NAME = 'image-assets'
const IMAGE_ASSET_DB_VERSION = 1

interface ImageAssetRecord {
  id: string
  blob: Blob
  mimeType: string
  fileName: string
  createdAt: string
}

function openImageAssetDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_ASSET_DB_NAME, IMAGE_ASSET_DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IMAGE_ASSET_STORE_NAME)) {
        db.createObjectStore(IMAGE_ASSET_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB'))
  })
}

export async function saveLocalImageAsset(file: File): Promise<{ assetId: string; fileName: string }> {
  const db = await openImageAssetDb()
  const assetId = createId('img')

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_ASSET_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(IMAGE_ASSET_STORE_NAME)

    const payload: ImageAssetRecord = {
      id: assetId,
      blob: file,
      mimeType: file.type,
      fileName: file.name,
      createdAt: new Date().toISOString(),
    }

    store.put(payload)
    transaction.oncomplete = () => {
      db.close()
      resolve({ assetId, fileName: file.name })
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error ?? new Error('Falha ao salvar imagem no IndexedDB'))
    }
  })
}

export async function getLocalImageAssetBlob(assetId: string): Promise<Blob | null> {
  if (!assetId) {
    return null
  }

  const db = await openImageAssetDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_ASSET_STORE_NAME, 'readonly')
    const store = transaction.objectStore(IMAGE_ASSET_STORE_NAME)
    const request = store.get(assetId)

    request.onsuccess = () => {
      db.close()
      const record = request.result as ImageAssetRecord | undefined
      resolve(record?.blob ?? null)
    }
    request.onerror = () => {
      db.close()
      reject(request.error ?? new Error('Falha ao carregar imagem local'))
    }
  })
}
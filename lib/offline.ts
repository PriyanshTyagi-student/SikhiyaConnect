/*
  Offline utilities for web + Capacitor.
  This file is scaffolding and not imported anywhere yet.
*/

export type LessonProgress = {
  courseId: string
  lessonId: string
  secondsWatched: number
  updatedAt: number
}

const COURSE_CACHE = 'course-zips'
const PROGRESS_STORE = 'progress-store'

export const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform

// Store lesson progress in localStorage (simple); switch to IndexedDB if needed.
export function saveProgressLocal(progress: LessonProgress) {
  try {
    const key = `${PROGRESS_STORE}:${progress.courseId}:${progress.lessonId}`
    localStorage.setItem(key, JSON.stringify(progress))
  } catch {}
}

export function getProgressLocal(courseId: string, lessonId: string): LessonProgress | null {
  try {
    const key = `${PROGRESS_STORE}:${courseId}:${lessonId}`
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as LessonProgress) : null
  } catch {
    return null
  }
}

// Web: Download and cache a course ZIP by URL using Cache Storage.
export async function cacheCourseZip(courseId: string, zipUrl: string) {
  const cache = await caches.open(COURSE_CACHE)
  const res = await fetch(zipUrl, { cache: 'reload' })
  if (!res.ok) throw new Error(`Failed to fetch zip: ${res.status}`)
  await cache.put(new Request(`/offline/${courseId}.zip`), res)
}

// Web: Extract a single file from cached ZIP to a Blob URL (ephemeral).
export async function extractLessonVideoBlobUrl(courseId: string, pathInZip: string): Promise<string> {
  const cache = await caches.open(COURSE_CACHE)
  const res = await cache.match(`/offline/${courseId}.zip`)
  if (!res) throw new Error('ZIP not cached')
  const arrBuf = await res.arrayBuffer()
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(arrBuf)
  const file = zip.file(pathInZip)
  if (!file) throw new Error('Video not found in ZIP')
  const blob = await file.async('blob')
  return URL.createObjectURL(blob)
}

export function revokeBlobUrl(url: string) {
  try { URL.revokeObjectURL(url) } catch {}
}

// Native (Capacitor): Use filesystem + zip plugin to extract and cleanup.
export async function nativeExtractLessonVideoTemp(courseId: string, zipPath: string, pathInZip: string) {
  // Pseudocode: requires installing a zip plugin
  // const { Zip } = await import('capacitor-zip')
  // const { Filesystem } = await import('@capacitor/filesystem')
  // const tempDir = `temp/${courseId}`
  // await Filesystem.mkdir({ path: tempDir, directory: Directory.Cache, recursive: true })
  // await Zip.unzip({ source: zipPath, destination: `${tempDir}` , entries: [pathInZip] })
  // return `${tempDir}/${pathInZip}`
  throw new Error('Implement with capacitor-zip and @capacitor/filesystem on native')
}

export async function nativeDeleteTemp(path: string) {
  // const { Filesystem } = await import('@capacitor/filesystem')
  // await Filesystem.deleteFile({ path, directory: Directory.Cache })
}

// Background sync stub: send local progress to backend when online.
export async function syncProgressToBackend(endpoint: string, authToken: string) {
  // iterate localStorage keys and POST to backend
}

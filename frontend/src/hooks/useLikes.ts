import { useState, useCallback } from 'react'

const STORAGE_KEY = 'peterflix_likes'

function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLikedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

// Globális state — minden komponens ugyanazt látja re-render nélkül is
let _likedIds = getLikedIds()

export function useLikes(momentId: string) {
  const [liked, setLiked] = useState(() => _likedIds.has(momentId))

  const toggle = useCallback(() => {
    _likedIds = getLikedIds()
    if (_likedIds.has(momentId)) {
      _likedIds.delete(momentId)
    } else {
      _likedIds.add(momentId)
    }
    saveLikedIds(_likedIds)
    setLiked(_likedIds.has(momentId))
  }, [momentId])

  return { liked, toggle }
}

export function getLikeCount(): number {
  return getLikedIds().size
}

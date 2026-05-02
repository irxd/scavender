export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach(url => {
    // Cache in memory
    const img = new Image()
    img.src = url

    // Add preload link to head if not present
    const selector = `link[rel="preload"][href="${url}"]`
    if (!document.querySelector(selector)) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    }
  })
}

export function preloadGLBs(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach(url => {
    fetch(url).catch(() => {})
  })
}

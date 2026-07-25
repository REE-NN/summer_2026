import { useEffect, useRef, useState } from 'react'

interface PhotoItem {
  src: string
  alt: string
}

interface PhotoModalProps {
  photos: PhotoItem[]
  initialIndex: number
  onClose: () => void
}

function PhotoModal({ photos, initialIndex, onClose }: PhotoModalProps) {
  const [index, setIndex] = useState(initialIndex)
  const closeRef = useRef<HTMLButtonElement>(null)
  const current = photos[index]

  const goPrev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  const goNext = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  if (!current) return null

  return (
    <div
      className="photo-modal"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        ref={closeRef}
        className="photo-modal__close"
        onClick={onClose}
        aria-label="Закрыть"
      >
        ✕
      </button>

      <button
        className="photo-modal__nav photo-modal__nav--prev"
        onClick={goPrev}
        aria-label="Предыдущая"
      >
        ‹
      </button>
      <button
        className="photo-modal__nav photo-modal__nav--next"
        onClick={goNext}
        aria-label="Следующая"
      >
        ›
      </button>

      <div className="photo-modal__wrapper">
        <img src={current.src} alt={current.alt} className="photo-modal__img" />
        <span className="photo-modal__counter">
          {index + 1} из {photos.length}
        </span>
      </div>
    </div>
  )
}

export default PhotoModal

import { useState } from 'react'

interface MediaPlaceholderProps {
  variant:
    | 'hero'
    | 'garden'
    | 'river'
    | 'dog'
    | 'village'
    | 'drawing'
    | 'clay'
    | 'paper'
    | 'video'
  label?: string
  src?: string
  alt?: string
  loading?: 'lazy' | 'eager'
}

function MediaPlaceholder({
  variant,
  label,
  src,
  alt,
  loading = 'lazy',
}: MediaPlaceholderProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const hasImage = src && !imageError

  return (
    <div
      className={`media-placeholder media-placeholder--${variant}`}
      role="img"
      aria-label={label ?? ''}
    >
      {!hasImage && <div className="media-placeholder__deco" aria-hidden="true" />}
      {!hasImage && label && <span className="media-placeholder__label">{label}</span>}
      {src && !imageError && (
        <img
          src={src}
          alt={alt ?? label ?? ''}
          loading={loading}
          className={`media-placeholder__img${imageLoaded ? ' media-placeholder__img--loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  )
}

export default MediaPlaceholder

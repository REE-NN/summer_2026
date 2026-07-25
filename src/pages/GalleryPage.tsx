import { useState } from 'react'
import { GALLERY_PHOTOS } from '../data/gallery'
import { photoPath } from '../utils/paths'
import MediaPlaceholder from '../components/MediaPlaceholder'
import PhotoModal from '../components/PhotoModal'

const SECTION_TITLES: Record<string, string> = {
  garden: 'Сад и огород',
  river: 'Река и рыбалка',
  village: 'Деревенские дни',
}

function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = String(item[key])
      ;(acc[k] ??= []).push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}

function GalleryPage() {
  const sections = groupBy(GALLERY_PHOTOS, 'section')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const allPhotos = GALLERY_PHOTOS.map((p) => ({
    src: photoPath(p.src),
    alt: p.alt,
  }))

  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">Галерея</h1>
        <p className="page-section__desc">Фотографии нашего лета в Задворке</p>

        {Object.entries(sections).map(([section, photos]) => (
          <div key={section} className="gallery-section">
            <h2 className="gallery-section__title">
              {SECTION_TITLES[section] ?? section}
            </h2>
            <div className="gallery-grid">
              {photos.map((photo) => {
                const globalIndex = allPhotos.findIndex(
                  (p) => p.src === photoPath(photo.src),
                )
                return (
                  <button
                    key={photo.id}
                    className="gallery-grid__item gallery-grid__btn"
                    onClick={() => setSelectedIndex(globalIndex)}
                    aria-label={`Открыть: ${photo.alt}`}
                  >
                    <MediaPlaceholder
                      variant="hero"
                      label={photo.alt}
                      src={photoPath(photo.src)}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {selectedIndex !== null && (
        <PhotoModal
          photos={allPhotos}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  )
}

export default GalleryPage

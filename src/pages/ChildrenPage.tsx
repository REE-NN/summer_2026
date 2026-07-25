import { useState } from 'react'
import { CHILDREN_PHOTOS } from '../data/children'
import { photoPath } from '../utils/paths'
import MediaPlaceholder from '../components/MediaPlaceholder'
import PhotoModal from '../components/PhotoModal'

function ChildrenPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const childrenItems = CHILDREN_PHOTOS.map((p) => ({
    src: photoPath(p.src),
    alt: p.alt,
  }))

  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">Детское творчество</h1>
        <p className="page-section__desc">
          Рисунки, фигурки из глины, бумажные поделки и короткие ролики
        </p>
        <div className="children-grid">
          {CHILDREN_PHOTOS.map((photo, i) => (
            <button
              key={photo.id}
              className="children-grid__item children-grid__btn"
              onClick={() => setSelectedIndex(i)}
              aria-label={`Открыть: ${photo.alt}`}
            >
              <MediaPlaceholder
                variant={photo.category}
                label={photo.alt}
                src={photoPath(photo.src)}
              />
            </button>
          ))}
        </div>
      </section>

      {selectedIndex !== null && (
        <PhotoModal
          photos={childrenItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  )
}

export default ChildrenPage

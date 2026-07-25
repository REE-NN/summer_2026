import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { STORIES_DATA } from '../data/stories'
import { photoPath } from '../utils/paths'
import MediaPlaceholder from '../components/MediaPlaceholder'
import PhotoModal from '../components/PhotoModal'

const VARIANT_MAP: Record<string, 'garden' | 'river' | 'dog' | 'village'> = {
  garden: 'garden',
  river: 'river',
  dog: 'dog',
  'village-days': 'village',
}

function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const story = STORIES_DATA.find((s) => s.id === storyId)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

  if (!story) {
    return (
      <div className="page-wrapper">
        <section className="page-section">
          <h1 className="page-section__title">История не найдена</h1>
          <p className="page-section__note">Запрашиваемая история не существует.</p>
          <Link to="/stories" className="btn btn--primary page-section__action">
            ← К списку историй
          </Link>
        </section>
      </div>
    )
  }

  const variant = VARIANT_MAP[story.id] ?? 'hero'
  const galleryItems = story.gallery.map((p) => ({
    src: photoPath(p.src),
    alt: p.alt,
  }))

  return (
    <div className="page-wrapper">
      <article className="page-section story-page">
        <Link to="/stories" className="page-section__link">
          ← Все истории
        </Link>

        <h1 className="page-section__title">{story.title}</h1>
        <p className="page-section__meta">{story.date}</p>

        <div className="story-page__hero">
          <MediaPlaceholder
            variant={variant}
            label={story.title}
            src={photoPath(story.imageSrc)}
            loading="eager"
          />
        </div>

        {story.content.map((paragraph, i) => (
          <p key={i} className="story-page__text">
            {paragraph}
          </p>
        ))}

        {story.gallery.length > 0 && (
          <>
            <h2 className="story-page__gallery-title">Фотографии</h2>
            <div className="gallery-grid">
              {story.gallery.map((photo, i) => (
                <button
                  key={i}
                  className="gallery-grid__item gallery-grid__btn"
                  onClick={() => setGalleryIndex(i)}
                  aria-label={`Открыть: ${photo.alt}`}
                >
                  <MediaPlaceholder
                    variant="hero"
                    src={photoPath(photo.src)}
                    label={photo.alt}
                  />
                </button>
              ))}
            </div>

            {galleryIndex !== null && (
              <PhotoModal
                photos={galleryItems}
                initialIndex={galleryIndex}
                onClose={() => setGalleryIndex(null)}
              />
            )}
          </>
        )}
      </article>
    </div>
  )
}

export default StoryPage

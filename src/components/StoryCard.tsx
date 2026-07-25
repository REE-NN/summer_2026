import { Link } from 'react-router-dom'
import type { StoryCardData } from '../data/homeContent'
import { photoPath } from '../utils/paths'
import MediaPlaceholder from './MediaPlaceholder'

interface StoryCardProps {
  data: StoryCardData
}

function StoryCard({ data }: StoryCardProps) {
  return (
    <article className="story-card">
      <Link to={`/stories/${data.storyId}`} className="story-card__link">
        <div className="story-card__media">
          <MediaPlaceholder
            variant={data.placeholderVariant}
            label={data.title}
            src={data.imageSrc ? photoPath(data.imageSrc) : undefined}
          />
        </div>
        <div className="story-card__body">
          <h3 className="story-card__title">{data.title}</h3>
          <p className="story-card__desc">{data.description}</p>
          <span className="story-card__more">Читать историю</span>
        </div>
      </Link>
    </article>
  )
}

export default StoryCard

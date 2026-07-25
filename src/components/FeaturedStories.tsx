import { STORIES } from '../data/homeContent'
import SectionHeading from './SectionHeading'
import StoryCard from './StoryCard'

function FeaturedStories() {
  return (
    <section className="featured-stories">
      <SectionHeading>Основные истории</SectionHeading>
      <div className="featured-stories__grid">
        {STORIES.map((story) => (
          <StoryCard key={story.id} data={story} />
        ))}
      </div>
    </section>
  )
}

export default FeaturedStories

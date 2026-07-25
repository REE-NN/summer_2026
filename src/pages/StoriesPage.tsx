import { STORIES } from '../data/homeContent'
import StoryCard from '../components/StoryCard'

function StoriesPage() {
  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">Истории</h1>
        <p className="page-section__desc">
          Все истории нашего лета в Задворке
        </p>
        <div className="featured-stories__grid">
          {STORIES.map((story) => (
            <StoryCard key={story.id} data={story} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default StoriesPage

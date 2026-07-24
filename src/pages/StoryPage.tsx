import { useParams } from 'react-router-dom'

function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>()

  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">История</h1>
        <p className="page-section__note">Раздел находится в разработке.</p>
        {storyId && (
          <p className="page-section__meta">
            Идентификатор истории: {storyId}
          </p>
        )}
      </section>
    </div>
  )
}

export default StoryPage

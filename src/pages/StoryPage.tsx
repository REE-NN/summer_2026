import { useParams } from 'react-router-dom'

function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>()

  return (
    <section className="page-section">
      <h1>История</h1>
      <p className="page-section__note">Раздел находится в разработке.</p>
      {storyId && <p className="page-section__meta">Идентификатор истории: {storyId}</p>}
    </section>
  )
}

export default StoryPage

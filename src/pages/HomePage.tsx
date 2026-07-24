const REPO_URL = 'https://github.com/ree-nn/summer_2026'

function HomePage() {
  return (
    <section className="page-section">
      <h1>Задворка 2026</h1>
      <p className="page-section__subtitle">Сайт-воспоминание о лете 2026 года</p>
      <p className="page-section__repo">
        Исходный код проекта на{' '}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </section>
  )
}

export default HomePage

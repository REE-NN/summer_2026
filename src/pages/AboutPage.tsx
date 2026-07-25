import { Link } from 'react-router-dom'
import { ABOUT_DATA } from '../data/about'

function AboutPage() {
  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">{ABOUT_DATA.title}</h1>
        {ABOUT_DATA.fullText.map((p, i) => (
          <p key={i} className="about-text">
            {p}
          </p>
        ))}
        <p className="about-text" style={{ marginTop: '1rem' }}>
          Репозиторий проекта:{' '}
          <a
            href={ABOUT_DATA.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="page-section__link"
          >
            GitHub
          </a>
        </p>
        <Link to="/" className="btn btn--primary page-section__action">
          На главную
        </Link>
      </section>
    </div>
  )
}

export default AboutPage

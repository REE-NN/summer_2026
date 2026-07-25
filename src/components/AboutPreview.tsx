import { Link } from 'react-router-dom'
import { ABOUT_DATA } from '../data/about'
import SectionHeading from './SectionHeading'

function AboutPreview() {
  return (
    <section className="about-preview">
      <SectionHeading>{ABOUT_DATA.title}</SectionHeading>
      {ABOUT_DATA.previewText.map((paragraph, i) => (
        <p key={i} className="about-preview__text">
          {paragraph}
        </p>
      ))}
      <div className="about-preview__action">
        <Link to="/about" className="btn btn--outline">
          Подробнее
        </Link>
      </div>
    </section>
  )
}

export default AboutPreview

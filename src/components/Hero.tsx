import { Link } from 'react-router-dom'
import { HERO } from '../data/homeContent'
import { photoPath } from '../utils/paths'
import MediaPlaceholder from './MediaPlaceholder'

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__content">
          <span className="hero__badge">{HERO.badge}</span>
          <h1 className="hero__title">{HERO.title}</h1>
          <p className="hero__subtitle">{HERO.subtitle}</p>
          <div className="hero__actions">
            <Link to={HERO.cta.to} className="btn btn--primary">
              {HERO.cta.label}
            </Link>
            <Link to={HERO.secondary.to} className="btn btn--outline">
              {HERO.secondary.label}
            </Link>
          </div>
        </div>
        <div className="hero__media">
          <MediaPlaceholder
            variant="hero"
            label="Фотография нашего лета в Задворке"
            src={photoPath(HERO.imageSrc)}
            alt={HERO.imageAlt}
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero

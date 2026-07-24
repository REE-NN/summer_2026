import Hero from '../components/Hero'
import FeaturedStories from '../components/FeaturedStories'
import ChildrenPreview from '../components/ChildrenPreview'
import Statistics from '../components/Statistics'
import AboutPreview from '../components/AboutPreview'
import { INTRO_TEXT } from '../data/homeContent'

function HomePage() {
  return (
    <>
      <Hero />
      <div className="home-content">
        <section className="intro">
          <p className="intro__text">{INTRO_TEXT}</p>
        </section>
        <FeaturedStories />
        <ChildrenPreview />
        <Statistics />
        <AboutPreview />
      </div>
    </>
  )
}

export default HomePage

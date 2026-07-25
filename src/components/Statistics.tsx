import { STATS } from '../data/homeContent'
import SectionHeading from './SectionHeading'

function Statistics() {
  return (
    <section className="statistics">
      <SectionHeading>Лето в цифрах</SectionHeading>
      <div className="statistics__grid">
        {STATS.map((stat, index) => (
          <div key={index} className="statistics__item">
            <span className="statistics__value">{stat.value}</span>
            <span className="statistics__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Statistics

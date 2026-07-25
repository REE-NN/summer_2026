import { Link } from 'react-router-dom'
import { CHILDREN_PREVIEW } from '../data/children'
import { photoPath } from '../utils/paths'
import SectionHeading from './SectionHeading'
import MediaPlaceholder from './MediaPlaceholder'

function ChildrenPreview() {
  return (
    <section className="children-preview">
      <SectionHeading>{CHILDREN_PREVIEW.title}</SectionHeading>
      <p className="children-preview__desc">{CHILDREN_PREVIEW.description}</p>
      <div className="children-preview__grid">
        {CHILDREN_PREVIEW.placeholders.map((item) => (
          <div key={item.id} className="children-preview__item">
            <MediaPlaceholder
              variant={item.variant}
              src={item.imageSrc ? photoPath(item.imageSrc) : undefined}
            />
          </div>
        ))}
      </div>
      <div className="children-preview__action">
        <Link to={CHILDREN_PREVIEW.cta.to} className="btn btn--outline">
          {CHILDREN_PREVIEW.cta.label}
        </Link>
      </div>
    </section>
  )
}

export default ChildrenPreview

interface SectionHeadingProps {
  as?: 'h1' | 'h2' | 'h3'
  children: string
}

function SectionHeading({ as: Tag = 'h2', children }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <Tag className="section-heading__title">{children}</Tag>
      <span className="section-heading__line" aria-hidden="true" />
    </header>
  )
}

export default SectionHeading

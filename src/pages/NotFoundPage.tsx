import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="page-wrapper">
      <section className="page-section">
        <h1 className="page-section__title">Страница не найдена</h1>
        <p className="page-section__note">
          Запрашиваемая страница не существует.
        </p>
        <Link to="/" className="btn btn--primary page-section__action">
          Вернуться на главную
        </Link>
      </section>
    </div>
  )
}

export default NotFoundPage

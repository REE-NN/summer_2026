import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-section">
      <h1>Страница не найдена</h1>
      <p className="page-section__note">Запрашиваемая страница не существует.</p>
      <Link to="/" className="page-section__link">Вернуться на главную</Link>
    </section>
  )
}

export default NotFoundPage

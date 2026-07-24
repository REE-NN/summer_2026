const REPO_URL = 'https://github.com/ree-nn/summer_2026'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__title">Задворка 2026</div>
        <p className="footer__desc">Семейный архив лета 2026 года</p>
        <p className="footer__meta">
          &copy; {new Date().getFullYear()} &middot;{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

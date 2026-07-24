const REPO_URL = 'https://github.com/ree-nn/summer_2026'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__text">
          &copy; {new Date().getFullYear()} Задворка 2026 &middot;{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

import { useState, useMemo, useEffect } from 'react'
import { photoPath } from '../utils/paths'
import {
  getAllMedia,
  getCategoryLabel,
  getUniqueCategories,
  type MediaItem,
} from '../data/mediaAdapter'

function MediaList({
  items,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  categories,
}: {
  items: MediaItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: string | null
  onFilterChange: (cat: string | null) => void
  categories: { label: string; count: number }[]
}) {
  return (
    <div className="cm-list">
      <div className="cm-list__header">
        <h2 className="cm-list__title">Медиа</h2>
        <span className="cm-list__count">{items.length}</span>
      </div>

      <div className="cm-list__filter">
        <select
          value={filter ?? ''}
          onChange={(e) => onFilterChange(e.target.value || null)}
          aria-label="Фильтр по категории"
        >
          <option value="">Все категории</option>
          {categories.map(({ label, count }) => (
            <option key={label} value={label}>
              {getCategoryLabel(label)} ({count})
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="cm-list__empty">
          <p>Нет медиа для выбранной категории</p>
          <button className="cm-btn cm-btn--small" onClick={() => onFilterChange(null)}>
            Сбросить фильтр
          </button>
        </div>
      ) : (
        <div className="cm-list__grid">
          {items.map((item) => (
            <button
              key={item.id}
              className={`cm-thumb${item.id === selectedId ? ' cm-thumb--selected' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-label={item.title || item.alt || item.id}
            >
              <div className="cm-thumb__img-wrap">
                <img
                  src={photoPath(item.src)}
                  alt={item.alt || ''}
                  className="cm-thumb__img"
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.style.display = 'none'
                    el.parentElement!.classList.add('cm-thumb__img-wrap--broken')
                  }}
                />
              </div>
              <span className="cm-thumb__label">{item.title || item.id}</span>
              <span className="cm-thumb__category">{getCategoryLabel(item.category)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaPreview({ item }: { item: MediaItem | null }) {
  if (!item) {
    return (
      <div className="cm-preview cm-preview--empty">
        <p>Выберите элемент из списка</p>
      </div>
    )
  }

  const isFieldSynthetic = (field: string): boolean => {
    const key = field === 'Заголовок' ? 'title' : field === 'Подпись' ? 'caption' : ''
    return key !== '' && item.syntheticFields.includes(key)
  }

  const fields: { label: string; value: string | boolean | string[] }[] = [
    { label: 'ID', value: item.id },
    { label: 'src', value: item.src },
    { label: 'Тип', value: item.type === 'video' ? 'Видео' : 'Изображение' },
    { label: 'Категория', value: getCategoryLabel(item.category) },
    { label: 'Заголовок', value: item.title || '— не указано —' },
    { label: 'Alt', value: item.alt || '— не указано —' },
    { label: 'Подпись', value: item.caption || '— не указано —' },
    { label: 'Featured', value: item.featured ? 'Да' : 'Нет' },
    {
      label: 'Показывать в галерее',
      value: item.showInGallery ? 'Да' : 'Нет',
    },
    { label: 'Роли', value: item.roles.join(', ') },
  ]

  return (
    <div className="cm-preview">
      <div className="cm-preview__image-wrap">
        {item.type === 'video' ? (
          <div className="cm-preview__video-placeholder">
            <span className="cm-preview__video-icon">▶</span>
            <span className="cm-preview__video-path">{item.src}</span>
          </div>
        ) : (
          <img
            src={photoPath(item.src)}
            alt={item.alt || ''}
            className="cm-preview__img"
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              el.parentElement!.classList.add('cm-preview__image-wrap--broken')
            }}
          />
        )}
      </div>

      <dl className="cm-preview__fields">
        {fields.map((f) => (
          <div key={f.label} className="cm-preview__field">
            <dt className="cm-preview__field-label">{f.label}</dt>
            <dd
              className={`cm-preview__field-value${isFieldSynthetic(f.label) ? ' cm-preview__field-value--synthetic' : ''}`}
            >
              {String(f.value)}
              {isFieldSynthetic(f.label) && (
                <span className="cm-preview__synthetic-badge">временное</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function HelpContent() {
  return (
    <div className="cm-help" role="tabpanel" id="cm-help-panel" aria-labelledby="cm-tab-help">
      <h2 className="cm-help__title">Справка</h2>

      <section className="cm-help__section">
        <h3 className="cm-help__section-title">Запуск проекта</h3>
        <pre className="cm-help__code">npm install</pre>
        <pre className="cm-help__code">npm run dev</pre>
        <p className="cm-help__text">
          После запуска dev-сервера сайт доступен по адресу{' '}
          <code className="cm-help__inline-code">http://localhost:5173/summer_2026/</code>.
        </p>
        <p className="cm-help__text">
          Content manager (эта страница) —{' '}
          <code className="cm-help__inline-code">http://localhost:5173/summer_2026/#/content-manager</code>.
        </p>
        <p className="cm-help__text">
          Content manager доступен <strong>только в development-режиме</strong>.
          В production-сборке маршрут отсутствует, переход открывает 404.
        </p>
      </section>

      <section className="cm-help__section">
        <h3 className="cm-help__section-title">Проверка production-сборки</h3>
        <pre className="cm-help__code">npm run build</pre>
        <pre className="cm-help__code">npm run preview</pre>
        <p className="cm-help__text">
          В production-сборке content manager не включается —
          переход на <code className="cm-help__inline-code">/content-manager</code> открывает 404.
        </p>
      </section>

      <section className="cm-help__section">
        <h3 className="cm-help__section-title">Ссылки</h3>
        <ul className="cm-help__list">
          <li>
            <strong>Репозиторий</strong> —{' '}
            <a href="https://github.com/REE-NN/summer_2026" target="_blank" rel="noopener noreferrer">
              github.com/REE-NN/summer_2026
            </a>{' '}
            (исходный код, разработка)
          </li>
          <li>
            <strong>GitHub Pages</strong> —{' '}
            <a href="https://REE-NN.github.io/summer_2026" target="_blank" rel="noopener noreferrer">
              REE-NN.github.io/summer_2026
            </a>{' '}
            (опубликованный сайт, будет добавлен позже)
          </li>
        </ul>
        <p className="cm-help__text">
          Репозиторий содержит все исходные файлы. GitHub Pages — финальная публичная версия сайта.
          Локальный dev-сервер используется для разработки и отладки. Порты localhost могут
          отличаться от указанных, если стандартный порт 5173 занят.
        </p>
      </section>
    </div>
  )
}

function ContentManagerPage() {
  const allMedia = useMemo(() => getAllMedia(), [])
  const categories = useMemo(() => getUniqueCategories(allMedia), [allMedia])
  const allCategoryCounts = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat,
        count: allMedia.filter((m) => m.category === cat).length,
      })),
    [categories, allMedia],
  )
  const [filter, setFilter] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(
    allMedia.length > 0 ? allMedia[0].id : null,
  )
  const [mode, setMode] = useState<'browse' | 'help'>('browse')

  const filtered = useMemo(
    () => (filter ? allMedia.filter((m) => m.category === filter) : allMedia),
    [allMedia, filter],
  )

  // Синхронизация selectedId при смене фильтра
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
    } else if (!filtered.some((m) => m.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
    // Срабатывает только при смене filter, не при каждом рендере
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const currentIndex = filtered.findIndex((m) => m.id === selectedId)
  const selectedItem = filtered[currentIndex] ?? null

  const goPrev = () => {
    if (currentIndex > 0) setSelectedId(filtered[currentIndex - 1].id)
  }
  const goNext = () => {
    if (currentIndex < filtered.length - 1) setSelectedId(filtered[currentIndex + 1].id)
  }

  return (
    <div className="page-wrapper">
      <div className="cm-layout">
        <MediaList
          items={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          categories={allCategoryCounts}
        />

        <div className="cm-main">
          <div className="cm-tabs" role="tablist">
            <button
              className={`cm-tabs__tab${mode === 'browse' ? ' cm-tabs__tab--active' : ''}`}
              onClick={() => setMode('browse')}
              role="tab"
              aria-selected={mode === 'browse'}
              aria-controls="cm-browse-panel"
              id="cm-tab-browse"
            >
              Просмотр
            </button>
            <button
              className={`cm-tabs__tab${mode === 'help' ? ' cm-tabs__tab--active' : ''}`}
              onClick={() => setMode('help')}
              role="tab"
              aria-selected={mode === 'help'}
              aria-controls="cm-help-panel"
              id="cm-tab-help"
            >
              Справка
            </button>
          </div>

          {mode === 'browse' ? (
            <>
              <div className="cm-nav">
                <button
                  className="cm-btn"
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  aria-label="Предыдущее"
                >
                  ← Предыдущее
                </button>
                <span className="cm-nav__counter">
                  {filtered.length > 0
                    ? `${currentIndex + 1} из ${filtered.length}`
                    : '—'}
                </span>
                <button
                  className="cm-btn"
                  onClick={goNext}
                  disabled={currentIndex < 0 || currentIndex >= filtered.length - 1}
                  aria-label="Следующее"
                >
                  Следующее →
                </button>
              </div>

              <MediaPreview item={selectedItem} />
            </>
          ) : (
            <HelpContent />
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentManagerPage

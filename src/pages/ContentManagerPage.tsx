import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { photoPath } from '../utils/paths'
import {
  getAllMedia,
  getCategoryLabel,
  getUniqueCategories,
  CATEGORIES,
  isCategoryValid,
  type MediaItem,
} from '../data/mediaAdapter'

// ---- Types ----

interface MediaDraft {
  type: 'image' | 'video'
  category: string
  title: string
  alt: string
  caption: string
  featured: boolean
  showInGallery: boolean
  /** Поля, которые пользователь явно редактировал и они отличаются от saved-значения */
  nonSyntheticFields: string[]
}

interface ValidationErrors {
  title?: string
  alt?: string
  caption?: string
  type?: string
  category?: string
}

type SaveStatus = 'clean' | 'dirty' | 'saved'

// ---- Helpers ----

function createDraftFrom(item: MediaItem): MediaDraft {
  return {
    type: item.type,
    category: item.category,
    title: item.title,
    alt: item.alt,
    caption: item.caption,
    featured: item.featured,
    showInGallery: item.showInGallery,
    nonSyntheticFields: [],
  }
}

/** Сравнение draft с saved item. Учитывает значения полей + synthetic status. */
function isDirty(draft: MediaDraft, saved: MediaItem): boolean {
  if (draft.type !== saved.type) return true
  if (draft.category !== saved.category) return true
  if (draft.title !== saved.title) return true
  if (draft.alt !== saved.alt) return true
  if (draft.caption !== saved.caption) return true
  if (draft.featured !== saved.featured) return true
  if (draft.showInGallery !== saved.showInGallery) return true
  if (draft.nonSyntheticFields.length > 0) return true
  return false
}

/** Является ли поле синтетическим в текущем draft по saved item. */
function isFieldSynth(field: string, saved: MediaItem, draft: MediaDraft): boolean {
  if (!saved.syntheticFields.includes(field)) return false
  if (draft.nonSyntheticFields.includes(field)) return false
  return true
}

/**
 * Обновление поля draft с синхронизацией nonSyntheticFields.
 * Если значение вернулось к saved-значению — поле убирается из nonSyntheticFields,
 * бейдж «временное» восстанавливается.
 */
function updateDraftField(
  draft: MediaDraft,
  field: keyof MediaDraft,
  value: string | boolean,
  saved: MediaItem,
): MediaDraft {
  let newNonSynth = [...draft.nonSyntheticFields]
  const synthableFields = ['title', 'alt', 'caption']

  if (synthableFields.includes(field as string)) {
    const fieldStr = field as string
    const savedVal = String(saved[fieldStr as keyof MediaItem] ?? '')

    if (String(value) === savedVal) {
      // значение совпало с saved → восстанавливаем synthetic-статус
      newNonSynth = newNonSynth.filter((f) => f !== fieldStr)
    } else if (!newNonSynth.includes(fieldStr)) {
      // значение изменилось → снимаем synthetic-статус
      newNonSynth.push(fieldStr)
    }
  }

  return { ...draft, [field]: value, nonSyntheticFields: newNonSynth }
}

function validateDraft(d: MediaDraft): ValidationErrors {
  const err: ValidationErrors = {}
  if (d.title.length > 120) err.title = 'Не более 120 символов'
  if (d.alt.length > 200) err.alt = 'Не более 200 символов'
  if (d.caption.length > 500) err.caption = 'Не более 500 символов'
  if (d.type !== 'image' && d.type !== 'video') err.type = 'Недопустимый тип'
  if (!isCategoryValid(d.category)) err.category = 'Недопустимая категория'
  return err
}

function applyDraft(item: MediaItem, draft: MediaDraft): MediaItem {
  return {
    ...item,
    type: draft.type,
    category: draft.category,
    title: draft.title,
    alt: draft.alt,
    caption: draft.caption,
    featured: draft.featured,
    showInGallery: draft.showInGallery,
    syntheticFields: item.syntheticFields.filter(
      (f) => !draft.nonSyntheticFields.includes(f),
    ),
  }
}

/** Проверка, останется ли запись в отфильтрованном списке. */
function wouldSurviveFilter(item: MediaItem, category: string | null): boolean {
  return category === null || item.category === category
}

// ---- ConfirmDialog ----

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  return (
    <div
      className="cm-dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Подтверждение"
    >
      <div className="cm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="cm-dialog__message">{message}</p>
        <div className="cm-dialog__actions">
          <button className="cm-btn cm-btn--danger" onClick={onConfirm} ref={confirmRef}>
            Отменить изменения
          </button>
          <button className="cm-btn" onClick={onCancel}>
            Остаться
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- MediaEditor ----

function MediaEditor({
  item,
  draft,
  onDraftChange,
  onSave,
  onReset,
  saveStatus,
  errors,
  savedItem,
}: {
  item: MediaItem
  draft: MediaDraft
  onDraftChange: (d: MediaDraft) => void
  onSave: () => void
  onReset: () => void
  saveStatus: SaveStatus
  errors: ValidationErrors
  savedItem: MediaItem
}) {
  const fid = (name: string) => `cm-e-${item.id}-${name}`
  const eid = (name: string) => `${fid(name)}-err`

  const upd = (field: keyof MediaDraft, value: string | boolean) => {
    onDraftChange(updateDraftField(draft, field, value, savedItem))
  }

  const synth = (field: string) => isFieldSynth(field, savedItem, draft)

  const statusLabel =
    saveStatus === 'clean'
      ? 'Изменений нет'
      : saveStatus === 'dirty'
        ? 'Есть несохранённые изменения'
        : 'Изменения сохранены локально'

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="cm-editor">
      {/* изображение — использует draft.type и draft.alt для live preview */}
      <div className="cm-editor__image-wrap">
        {draft.type === 'video' ? (
          <div className="cm-editor__video-placeholder">
            <span className="cm-editor__video-icon">▶</span>
            <span className="cm-editor__video-path">{item.src}</span>
          </div>
        ) : (
          <img
            src={photoPath(item.src)}
            alt={draft.alt || ''}
            className="cm-editor__img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.classList.add(
                'cm-editor__image-wrap--broken',
              )
            }}
          />
        )}
      </div>

      {/* статус */}
      <div className="cm-editor__status" role="status" aria-live="polite">
        {statusLabel}
      </div>

      {/* только для чтения */}
      <div className="cm-editor__readonly">
        <span className="cm-editor__ro-label">ID</span>
        <span className="cm-editor__ro-value">{item.id}</span>
      </div>
      <div className="cm-editor__readonly">
        <span className="cm-editor__ro-label">src</span>
        <span className="cm-editor__ro-value">{item.src}</span>
      </div>
      <div className="cm-editor__readonly">
        <span className="cm-editor__ro-label">Роли</span>
        <span className="cm-editor__ro-value">{item.roles.join(', ')}</span>
      </div>

      {/* поля формы */}
      <div className="cm-editor__fields">
        {/* type */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('type')}>Тип</label>
          <div className="cm-editor__input-wrap">
            <select
              id={fid('type')}
              className="cm-editor__select"
              value={draft.type}
              onChange={(e) => upd('type', e.target.value)}
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? eid('type') : undefined}
            >
              <option value="image">Изображение</option>
              <option value="video">Видео</option>
            </select>
            {errors.type && <p className="cm-editor__error" id={eid('type')} role="alert">{errors.type}</p>}
          </div>
        </div>

        {/* category */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('category')}>Категория</label>
          <div className="cm-editor__input-wrap">
            <select
              id={fid('category')}
              className="cm-editor__select"
              value={draft.category}
              onChange={(e) => upd('category', e.target.value)}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? eid('category') : undefined}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="cm-editor__error" id={eid('category')} role="alert">{errors.category}</p>}
          </div>
        </div>

        {/* title */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('title')}>
            Заголовок
            {synth('title') && <span className="cm-editor__synth">временное</span>}
          </label>
          <div className="cm-editor__input-wrap">
            <input
              id={fid('title')}
              className="cm-editor__input"
              type="text"
              value={draft.title}
              onChange={(e) => upd('title', e.target.value)}
              maxLength={120}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? eid('title') : undefined}
            />
            <span className="cm-editor__counter">{draft.title.length}/120</span>
            {errors.title && <p className="cm-editor__error" id={eid('title')} role="alert">{errors.title}</p>}
          </div>
        </div>

        {/* alt */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('alt')}>
            Alt
            {synth('alt') && <span className="cm-editor__synth">временное</span>}
          </label>
          <div className="cm-editor__input-wrap">
            <input
              id={fid('alt')}
              className="cm-editor__input"
              type="text"
              value={draft.alt}
              onChange={(e) => upd('alt', e.target.value)}
              maxLength={200}
              aria-invalid={!!errors.alt}
              aria-describedby={errors.alt ? eid('alt') : undefined}
            />
            <span className="cm-editor__counter">{draft.alt.length}/200</span>
            {errors.alt && <p className="cm-editor__error" id={eid('alt')} role="alert">{errors.alt}</p>}
          </div>
        </div>

        {/* caption */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('caption')}>
            Подпись
            {synth('caption') && <span className="cm-editor__synth">временное</span>}
          </label>
          <div className="cm-editor__input-wrap">
            <textarea
              id={fid('caption')}
              className="cm-editor__textarea"
              value={draft.caption}
              onChange={(e) => upd('caption', e.target.value)}
              maxLength={500}
              rows={3}
              aria-invalid={!!errors.caption}
              aria-describedby={errors.caption ? eid('caption') : undefined}
            />
            <span className="cm-editor__counter">{draft.caption.length}/500</span>
            {errors.caption && <p className="cm-editor__error" id={eid('caption')} role="alert">{errors.caption}</p>}
          </div>
        </div>

        {/* featured */}
        <div className="cm-editor__unit">
          <div className="cm-editor__unit cm-editor__unit--row">
            <input
              id={fid('featured')}
              className="cm-editor__checkbox"
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => upd('featured', e.target.checked)}
            />
            <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('featured')}>
              Главное изображение
            </label>
          </div>
          <p className="cm-editor__hint">
            Использовать как главное или приоритетное изображение.
          </p>
        </div>

        {/* showInGallery */}
        <div className="cm-editor__unit">
          <div className="cm-editor__unit cm-editor__unit--row">
            <input
              id={fid('showInGallery')}
              className="cm-editor__checkbox"
              type="checkbox"
              checked={draft.showInGallery}
              onChange={(e) => upd('showInGallery', e.target.checked)}
            />
            <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('showInGallery')}>
              Показывать в общей галерее
            </label>
          </div>
          <p className="cm-editor__hint">
            Показывать эту фотографию на странице общей галереи.
          </p>
        </div>
      </div>

      {/* кнопки */}
      <div className="cm-editor__actions">
        <button
          className="cm-btn cm-btn--primary"
          onClick={onSave}
          disabled={saveStatus !== 'dirty' || hasErrors}
        >
          Сохранить
        </button>
        <button
          className="cm-btn"
          onClick={onReset}
          disabled={saveStatus !== 'dirty'}
        >
          Отменить
        </button>
      </div>
    </div>
  )
}

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

  // локально сохранённое состояние (живёт до перезагрузки)
  const [savedItems, setSavedItems] = useState<Map<string, MediaItem>>(() => {
    const m = new Map<string, MediaItem>()
    for (const item of allMedia) m.set(item.id, item)
    return m
  })

  const allItems = useMemo(() => Array.from(savedItems.values()), [savedItems])
  const categories = useMemo(() => getUniqueCategories(allItems), [allItems])
  const allCategoryCounts = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat,
        count: allItems.filter((m) => m.category === cat).length,
      })),
    [categories, allItems],
  )
  const [filter, setFilter] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(
    allItems.length > 0 ? allItems[0].id : null,
  )
  const [mode, setMode] = useState<'browse' | 'help'>('browse')
  const [draft, setDraft] = useState<MediaDraft | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('clean')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [pendingNav, setPendingNav] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter ? allItems.filter((m) => m.category === filter) : allItems),
    [allItems, filter],
  )

  // Синхронизация selectedId при смене фильтра
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
    } else if (!filtered.some((m) => m.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, allItems])

  const currentIndex = filtered.findIndex((m) => m.id === selectedId)
  const selectedItem = filtered[currentIndex] ?? null

  // Создание draft при выборе элемента
  useEffect(() => {
    if (selectedItem) {
      const saved = savedItems.get(selectedItem.id)
      if (saved) {
        setDraft(createDraftFrom(saved))
        setSaveStatus('clean')
        setErrors({})
      }
    } else {
      setDraft(null)
      setSaveStatus('clean')
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // Валидация при изменении draft
  useEffect(() => {
    if (draft) setErrors(validateDraft(draft))
  }, [draft])

  // Навигация с проверкой dirty
  const tryNavigate = useCallback(
    (targetId: string) => {
      if (saveStatus === 'dirty') {
        setPendingNav(targetId)
      } else {
        setSelectedId(targetId)
      }
    },
    [saveStatus],
  )

  const clearDraftState = useCallback(() => {
    setDraft(null)
    setSaveStatus('clean')
    setErrors({})
  }, [])

  const confirmNav = useCallback(() => {
    if (!pendingNav) return
    clearDraftState()
    setSelectedId(pendingNav)
    setPendingNav(null)
  }, [pendingNav, clearDraftState])

  const cancelNav = useCallback(() => {
    setPendingNav(null)
  }, [])

  const goPrev = () => {
    if (currentIndex > 0) tryNavigate(filtered[currentIndex - 1].id)
  }
  const goNext = () => {
    if (currentIndex < filtered.length - 1) tryNavigate(filtered[currentIndex + 1].id)
  }

  const handleFilterChange = useCallback(
    (cat: string | null) => {
      // Подтверждение только если выбранная запись исчезнет из нового фильтра
      if (saveStatus === 'dirty' && selectedItem && !wouldSurviveFilter(selectedItem, cat)) {
        setPendingNav(selectedItem.id)
      } else {
        setFilter(cat)
      }
    },
    [saveStatus, selectedItem],
  )

  const handleSave = useCallback(() => {
    if (!selectedItem || !draft) return
    const v = validateDraft(draft)
    if (Object.keys(v).length > 0) { setErrors(v); return }
    const updated = applyDraft(selectedItem, draft)
    setSavedItems((prev) => {
      const next = new Map(prev)
      next.set(selectedItem.id, updated)
      return next
    })
    setSaveStatus('saved')
  }, [selectedItem, draft])

  const handleReset = useCallback(() => {
    if (!selectedItem) return
    const saved = savedItems.get(selectedItem.id)
    if (saved) {
      setDraft(createDraftFrom(saved))
      setSaveStatus('clean')
      setErrors({})
    }
  }, [selectedItem, savedItems])

  const handleDraftChange = useCallback((d: MediaDraft) => {
    if (!selectedItem) return
    setDraft(d)
    const saved = savedItems.get(selectedItem.id)
    if (saved) {
      setSaveStatus(isDirty(d, saved) ? 'dirty' : 'clean')
    }
  }, [selectedItem, savedItems])

  return (
    <div className="page-wrapper">
      {pendingNav && (
        <ConfirmDialog
          message="Есть несохранённые изменения. Перейти к другой записи и отменить их?"
          onConfirm={confirmNav}
          onCancel={cancelNav}
        />
      )}

      <div className="cm-layout">
        <MediaList
          items={filtered}
          selectedId={selectedId}
          onSelect={tryNavigate}
          filter={filter}
          onFilterChange={handleFilterChange}
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

              {selectedItem && draft ? (
                <MediaEditor
                  item={selectedItem}
                  draft={draft}
                  onDraftChange={handleDraftChange}
                  onSave={handleSave}
                  onReset={handleReset}
                  saveStatus={saveStatus}
                  errors={errors}
                  savedItem={savedItems.get(selectedItem.id) ?? selectedItem}
                />
              ) : (
                <div className="cm-editor cm-editor--empty">
                  <p>Выберите элемент из списка</p>
                </div>
              )}
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

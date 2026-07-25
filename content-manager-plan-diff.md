# Content Manager — diff (скорректированный)

## Поправки

1. **Фильтр**: категории и их количества вычисляются по `allMedia`, в список передаётся `filtered`.
2. **Синхронизация `selectedId`**: при смене фильтра через `useEffect`.
3. **Тип**: `'image' | 'video'` вместо `'photo' | 'video'`.
4. **Синтетические поля**: помечены флагом `syntheticFields`, в интерфейсе отображаются курсивом с меткой `(временное)`.
5. **Дедупликация по `src`**: `Map<src, MediaItem>`, дубли сливаются, `roles` перечисляет все использования.
6. **Focus-visible**: явные стили для `.cm-thumb`, `.cm-btn`, `select`.
7. **Стиль импорта** (п. 7–8): через barrel `src/pages/index.ts`, как и все остальные страницы.
8. **Production**: маршрута нет → 404, ссылки в Header/Footer нет — подтверждено в коде.

---

### 1. `src/data/mediaAdapter.ts` — создаётся

```ts
import { HERO, STORIES } from './homeContent'
import { GALLERY_PHOTOS } from './gallery'
import { CHILDREN_PHOTOS } from './children'
import { STORIES_DATA } from './stories'

export interface MediaItem {
  id: string
  src: string
  type: 'image' | 'video'
  category: string
  title: string
  alt: string
  caption: string
  featured: boolean
  showInGallery: boolean
  /** Поля, заполненные адаптером (нет в исходных данных) */
  syntheticFields: string[]
  /** Все источники, использующие этот файл */
  roles: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  drawing: 'Рисунок',
  clay: 'Пластилин',
  paper: 'Бумага',
  video: 'Видео',
  hero: 'Главное',
  garden: 'Сад',
  river: 'Река',
  dog: 'Собака',
  village: 'Деревня',
  'village-days': 'Деревня',
}

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat
}

export function getAllMedia(): MediaItem[] {
  const map = new Map<string, MediaItem>()

  function add(
    src: string,
    data: {
      id: string
      category: string
      title: string
      alt: string
      caption: string
      featured: boolean
      showInGallery: boolean
      syntheticFields: string[]
      role: string
    },
  ) {
    const existing = map.get(src)
    if (existing) {
      if (!existing.roles.includes(data.role)) {
        existing.roles.push(data.role)
      }
    } else {
      map.set(src, {
        id: data.id,
        src,
        type: 'image',
        category: data.category,
        title: data.title,
        alt: data.alt,
        caption: data.caption,
        featured: data.featured,
        showInGallery: data.showInGallery,
        syntheticFields: data.syntheticFields,
        roles: [data.role],
      })
    }
  }

  // 1. Hero
  add(HERO.imageSrc, {
    id: 'hero',
    category: 'hero',
    title: 'Главное фото',
    alt: HERO.imageAlt,
    caption: HERO.imageAlt,
    featured: true,
    showInGallery: false,
    syntheticFields: ['title', 'caption'],
    role: 'Главная — hero',
  })

  // 2. Story cards
  for (const story of STORIES) {
    if (!story.imageSrc) continue
    add(story.imageSrc, {
      id: `story-card-${story.id}`,
      category: story.placeholderVariant,
      title: story.title,
      alt: story.title,
      caption: story.description,
      featured: false,
      showInGallery: false,
      syntheticFields: ['caption'],
      role: story.title,
    })
  }

  // 3. Gallery photos
  for (const photo of GALLERY_PHOTOS) {
    add(photo.src, {
      id: photo.id,
      category: photo.section,
      title: photo.alt,
      alt: photo.alt,
      caption: photo.alt,
      featured: false,
      showInGallery: true,
      syntheticFields: ['title', 'caption'],
      role: `Галерея — ${photo.alt}`,
    })
  }

  // 4. Children photos
  for (const photo of CHILDREN_PHOTOS) {
    add(photo.src, {
      id: photo.id,
      category: photo.category,
      title: CATEGORY_LABELS[photo.category] ?? photo.category,
      alt: photo.alt,
      caption: photo.alt,
      featured: false,
      showInGallery: true,
      syntheticFields: ['title', 'caption'],
      role: `Детское творчество — ${photo.alt}`,
    })
  }

  // 5. Story gallery photos
  for (const story of STORIES_DATA) {
    for (let i = 0; i < story.gallery.length; i++) {
      const photo = story.gallery[i]
      add(photo.src, {
        id: `story-${story.id}-gallery-${i}`,
        category: story.id,
        title: photo.alt,
        alt: photo.alt,
        caption: `${story.title} — фотография`,
        featured: false,
        showInGallery: true,
        syntheticFields: ['title', 'caption'],
        role: `${story.title} — фотография в истории`,
      })
    }
  }

  return Array.from(map.values())
}

export function getUniqueCategories(items: MediaItem[]): string[] {
  const cats = new Set(items.map((i) => i.category))
  return Array.from(cats).sort()
}
```

---

### 2. `src/pages/ContentManagerPage.tsx` — создаётся

```tsx
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

  const isSynthetic = (field: string) => item.syntheticFields.includes(field)

  const fields: { label: string; value: string | boolean | string[] }[] = [
    { label: 'ID', value: item.id },
    { label: 'src', value: item.src },
    { label: 'Тип', value: item.type === 'video' ? 'Видео' : 'Изображение' },
    { label: 'Категория', value: getCategoryLabel(item.category) },
    {
      label: 'Заголовок',
      value: item.title || '— не указано —',
    },
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
              className={
                `cm-preview__field-value` +
                (isSynthetic(f.label === 'Заголовок' ? 'title' : f.label === 'Подпись' ? 'caption' : '')
                  ? ' cm-preview__field-value--synthetic'
                  : '')
              }
            >
              {String(f.value)}
              {isSynthetic(f.label === 'Заголовок' ? 'title' : f.label === 'Подпись' ? 'caption' : '') && (
                <span className="cm-preview__synthetic-badge">временное</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
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
    // Срабатывает только при смене filter
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
        </div>
      </div>
    </div>
  )
}

export default ContentManagerPage
```

---

### 3. `src/App.tsx` — diff

```diff
 import { Routes, Route } from 'react-router-dom'
 import Layout from './layouts/Layout'
 import {
   HomePage,
   StoriesPage,
   StoryPage,
   ChildrenPage,
   GalleryPage,
   AboutPage,
   NotFoundPage,
+  ContentManagerPage,
 } from './pages'
 
 function App() {
   return (
     <Routes>
       <Route element={<Layout />}>
         <Route index element={<HomePage />} />
         <Route path="stories" element={<StoriesPage />} />
         <Route path="stories/:storyId" element={<StoryPage />} />
         <Route path="children" element={<ChildrenPage />} />
         <Route path="gallery" element={<GalleryPage />} />
         <Route path="about" element={<AboutPage />} />
+        {import.meta.env.DEV && (
+          <Route path="content-manager" element={<ContentManagerPage />} />
+        )}
         <Route path="*" element={<NotFoundPage />} />
       </Route>
     </Routes>
   )
 }
 
 export default App
```

---

### 4. `src/pages/index.ts` — diff

```diff
 export { default as HomePage } from './HomePage'
 export { default as StoriesPage } from './StoriesPage'
 export { default as StoryPage } from './StoryPage'
 export { default as ChildrenPage } from './ChildrenPage'
 export { default as GalleryPage } from './GalleryPage'
 export { default as AboutPage } from './AboutPage'
 export { default as NotFoundPage } from './NotFoundPage'
+export { default as ContentManagerPage } from './ContentManagerPage'
```

---

### 5. `src/styles/index.css` — добавляется в конец

```css
/* ===== Content Manager ===== */

.cm-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
  min-height: 60vh;
}

.cm-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.cm-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.cm-list__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-green);
}

.cm-list__count {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  background: var(--color-border);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.cm-list__filter {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cm-list__filter select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.cm-list__filter select:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.cm-list__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.cm-list__empty p {
  margin-bottom: 0.75rem;
}

.cm-list__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
}

.cm-thumb {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: border-color 0.15s, background-color 0.15s;
}

.cm-thumb:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.cm-thumb:hover {
  background: var(--color-bg);
  border-color: var(--color-sand);
}

.cm-thumb--selected {
  background: var(--color-sand);
  border-color: var(--color-green);
}

.cm-thumb__img-wrap {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cm-thumb__img-wrap--broken::after {
  content: '✕';
  font-size: 1.25rem;
  color: var(--color-text-muted);
}

.cm-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cm-thumb__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cm-thumb__category {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
}

.cm-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cm-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.cm-nav__counter {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  min-width: 6rem;
  text-align: center;
}

.cm-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.cm-btn:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.cm-btn:hover:not(:disabled) {
  background: var(--color-bg);
  border-color: var(--color-green);
}

.cm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cm-btn--small {
  font-size: 0.8125rem;
  padding: 0.25rem 0.75rem;
}

.cm-preview {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cm-preview--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.cm-preview__image-wrap {
  max-height: 50vh;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cm-preview__image-wrap--broken {
  min-height: 200px;
}

.cm-preview__image-wrap--broken::after {
  content: 'Изображение не найдено';
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.cm-preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 50vh;
}

.cm-preview__video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.cm-preview__video-icon {
  font-size: 3rem;
}

.cm-preview__video-path {
  font-size: 0.8125rem;
  font-family: monospace;
  word-break: break-all;
}

.cm-preview__fields {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  font-size: 0.875rem;
}

.cm-preview__field {
  display: contents;
}

.cm-preview__field-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.cm-preview__field-value {
  color: var(--color-text);
  word-break: break-all;
}

.cm-preview__field-value--synthetic {
  font-style: italic;
  color: var(--color-text-muted);
}

.cm-preview__synthetic-badge {
  display: inline-block;
  margin-left: 0.375rem;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-style: normal;
  line-height: 1.4;
  color: var(--color-terracotta);
  background: var(--color-bg);
  border-radius: 3px;
  vertical-align: middle;
}

@media (max-width: 1024px) {
  .cm-layout {
    grid-template-columns: 260px 1fr;
  }
}

@media (max-width: 768px) {
  .cm-layout {
    grid-template-columns: 1fr;
  }

  .cm-list {
    max-height: none;
  }

  .cm-list__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 390px) {
  .cm-list__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cm-preview__fields {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .cm-nav {
    flex-wrap: wrap;
  }
}
```

---

### 6. Production

- `import.meta.env.DEV` — условие ложно → `<Route path="content-manager">` не рендерится
- Переход на `/#/content-manager` → не найден ни в одном Route → `Route path="*"` → `NotFoundPage` (404)
- Ссылки на `/content-manager` нет в `Header` и `Footer` — не добавлялась

---

## Итоговый список изменений

| Файл | Действие |
|---|---|
| `src/data/mediaAdapter.ts` | **Создать** |
| `src/pages/ContentManagerPage.tsx` | **Создать** |
| `src/App.tsx` | **Изменить** (+ импорт в barrel, + условный Route) |
| `src/pages/index.ts` | **Изменить** (+ экспорт) |
| `src/styles/index.css` | **Изменить** (+ ~290 строк стилей `.cm-*`) |

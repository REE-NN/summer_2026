# Content Manager — этап 3. Полный diff

## Изменяемые файлы

1. `src/pages/ContentManagerPage.tsx` — добавить загрузку новых медиа
2. `src/styles/index.css` — добавить стили формы добавления

---

## Модель состояния

Новый `mode: 'browse' | 'help' | 'add'` + состояние выбранного файла:

```ts
const [addingFile, setAddingFile] = useState<File | null>(null)
// id вычисляется: computeNextId(allItems)
// type определяется по расширению
// category = 'unsorted' по умолчанию
```

Форма нового медиа — отдельный компонент `AddMediaForm`, не пересекающийся с `MediaEditor`.

При подтверждённом `pendingNav` из режима `add` — `clearAddState()` + переключение `mode`.

---

### 1. `src/pages/ContentManagerPage.tsx` — diff

#### 1a. Добавить константы и helper

```diff
+const ACCEPTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp']
+const ACCEPTED_VIDEO_FORMATS = ['mp4', 'webm']
+const ACCEPTED_MEDIA_TYPES = [
+  'image/jpeg', 'image/png', 'image/webp',
+  'video/mp4', 'video/webm',
+]
+
+function getFileExtension(name: string): string {
+  return name.split('.').pop()?.toLowerCase() ?? ''
+}
+
+function detectType(name: string): 'image' | 'video' {
+  const ext = getFileExtension(name)
+  return ACCEPTED_VIDEO_FORMATS.includes(ext) ? 'video' : 'image'
+}
+
+function computeNextId(items: Map<string, MediaItem>): string {
+  let max = 0
+  for (const id of items.keys()) {
+    const num = parseInt(id.replace(/^.*?(\d+)$/, '$1'), 10)
+    if (!isNaN(num) && num > max) max = num
+  }
+  return `media-${max + 1}`
+}
+
+function isMediaTypeAllowed(file: File): boolean {
+  return ACCEPTED_MEDIA_TYPES.includes(file.type)
+}
```

#### 1b. Компонент `AddMediaForm`

```tsx
function AddMediaForm({
  file,
  draft,
  onDraftChange,
  onSave,
  onCancel,
  nextId,
  errors,
  existingSrcs,
}: {
  file: File
  draft: MediaDraft
  onDraftChange: (d: MediaDraft) => void
  onSave: () => void
  onCancel: () => void
  nextId: string
  errors: ValidationErrors & { file?: string; src?: string }
  existingSrcs: Set<string>
}) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file])
  const fid = (name: string) => `cm-add-${name}`
  const eid = (name: string) => `${fid(name)}-err`

  // очистка blob URL при размонтировании
  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const upd = (field: keyof MediaDraft, value: string | boolean) => {
    onDraftChange({ ...draft, [field]: value })
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="cm-editor cm-add-form">
      {/* предпросмотр */}
      <div className="cm-editor__image-wrap">
        {draft.type === 'video' ? (
          <video
            src={previewUrl}
            className="cm-editor__img"
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={previewUrl}
            alt={draft.alt || 'Новое изображение'}
            className="cm-editor__img"
          />
        )}
      </div>

      {errors.file && <p className="cm-editor__error" role="alert">{errors.file}</p>}

      {/* только для чтения */}
      <div className="cm-editor__readonly">
        <span className="cm-editor__ro-label">ID</span>
        <span className="cm-editor__ro-value">{nextId}</span>
      </div>
      <div className="cm-editor__readonly">
        <span className="cm-editor__ro-label">Файл</span>
        <span className="cm-editor__ro-value">{file.name}</span>
      </div>
      {errors.src && <p className="cm-editor__error" id={eid('src')} role="alert">{errors.src}</p>}

      {/* поля формы — такие же как в MediaEditor, но без synthetic-badge и nonSyntheticFields */}
      <div className="cm-editor__fields">
        {/* type */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('type')}>Тип</label>
          <div className="cm-editor__input-wrap">
            <select
              id={fid('type')}
              className="cm-editor__select"
              value={draft.type}
              onChange={(e) => upd('type', e.target.value as 'image' | 'video')}
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

        {/* title, alt, caption — без synthetic */}
        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('title')}>Заголовок</label>
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

        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('alt')}>Alt</label>
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

        <div className="cm-editor__unit">
          <label className="cm-editor__label" htmlFor={fid('caption')}>Подпись</label>
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

        {/* checkbox блоки — как в MediaEditor */}
        <div className="cm-editor__unit">
          <div className="cm-editor__unit cm-editor__unit--row">
            <input id={fid('featured')} className="cm-editor__checkbox" type="checkbox"
              checked={draft.featured}
              onChange={(e) => upd('featured', e.target.checked)} />
            <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('featured')}>Главное изображение</label>
          </div>
          <p className="cm-editor__hint">Использовать как главное или приоритетное изображение.</p>
        </div>

        <div className="cm-editor__unit">
          <div className="cm-editor__unit cm-editor__unit--row">
            <input id={fid('showInGallery')} className="cm-editor__checkbox" type="checkbox"
              checked={draft.showInGallery}
              onChange={(e) => upd('showInGallery', e.target.checked)} />
            <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('showInGallery')}>Показывать в общей галерее</label>
          </div>
          <p className="cm-editor__hint">Показывать эту фотографию на странице общей галереи.</p>
        </div>
      </div>

      {/* кнопки */}
      <div className="cm-editor__actions">
        <button className="cm-btn cm-btn--primary" onClick={onSave} disabled={hasErrors}>
          Сохранить
        </button>
        <button className="cm-btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}
```

#### 1c. Кнопка «Добавить медиа» в MediaList

```diff
 function MediaList({ … }) {
   return (
     <div className="cm-list">
       <div className="cm-list__header">
         <h2 className="cm-list__title">Медиа</h2>
         <span className="cm-list__count">{items.length}</span>
+        <button
+          className="cm-btn cm-btn--small cm-btn--primary"
+          onClick={onAddClick}
+          aria-label="Добавить медиа"
+        >
+          + Добавить
+        </button>
       </div>
       …
     </div>
   )
 }
```

(добавить проп `onAddClick: () => void`)

В MediaList:
```diff
   categories: { label: string; count: number }[]
+  onAddClick: () => void
```

#### 1d. Скрытый file input в `ContentManagerPage`

```tsx
const fileInputRef = useRef<HTMLInputElement>(null)

const handleAddClick = () => {
  fileInputRef.current?.click()
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Валидация типа
  if (!isMediaTypeAllowed(file)) {
    setAddErrors({ file: `Недопустимый тип файла: ${file.type}` })
    return
  }

  // Проверка конфликта имени файла
  const existingSrcs = new Set(
    Array.from(savedItems.values()).map((i) => i.src),
  )
  const fileName = file.name.toLowerCase()
  for (const src of existingSrcs) {
    if (src.toLowerCase().endsWith(fileName)) {
      setAddErrors({
        src: `Файл с именем «${file.name}» уже существует в медиатеке (${src})`,
      })
      return
    }
  }

  setAddingFile(file)
  setAddDraft({
    type: detectType(file.name),
    category: 'unsorted',
    title: '',
    alt: '',
    caption: '',
    featured: false,
    showInGallery: false,
    nonSyntheticFields: [],
  })
  setAddErrors({})
  setMode('add')
  // Сброс input, чтобы можно было выбрать тот же файл повторно
  e.target.value = ''
}
```

```tsx
<input
  ref={fileInputRef}
  type="file"
  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
  style={{ display: 'none' }}
  onChange={handleFileChange}
  aria-hidden="true"
/>
```

#### 1e. Добавить состояния и валидацию в `ContentManagerPage`

```diff
-const [mode, setMode] = useState<'browse' | 'help'>('browse')
+const [mode, setMode] = useState<'browse' | 'help' | 'add'>('browse')
+const [addingFile, setAddingFile] = useState<File | null>(null)
+const [addDraft, setAddDraft] = useState<MediaDraft | null>(null)
+const [addErrors, setAddErrors] = useState<ValidationErrors & { file?: string; src?: string }>({})
+const fileInputRef = useRef<HTMLInputElement>(null)
```

Валидация перед сохранением нового медиа:

```ts
const validateAddForm = (
  draft: MediaDraft,
  file: File,
  nextId: string,
  savedItems: Map<string, MediaItem>,
): (ValidationErrors & { file?: string; src?: string }) => {
  const err: ValidationErrors & { file?: string; src?: string } = {}

  if (!isMediaTypeAllowed(file)) err.file = 'Недопустимый тип файла'
  if (draft.title.length > 120) err.title = 'Не более 120 символов'
  if (draft.alt.length > 200) err.alt = 'Не более 200 символов'
  if (draft.caption.length > 500) err.caption = 'Не более 500 символов'
  if (draft.type !== 'image' && draft.type !== 'video') err.type = 'Недопустимый тип'
  if (!isCategoryValid(draft.category)) err.category = 'Недопустимая категория'
  if (savedItems.has(nextId)) err.file = 'Конфликт ID'

  // Проверка имени файла
  const fileName = file.name.toLowerCase()
  for (const item of savedItems.values()) {
    if (item.src.toLowerCase().endsWith(fileName)) {
      err.src = `Файл «${file.name}» уже существует`
      break
    }
  }

  return err
}
```

Сохранение нового медиа:

```ts
const handleAddSave = () => {
  if (!addingFile || !addDraft) return
  const nextId = computeNextId(savedItems)
  const v = validateAddForm(addDraft, addingFile, nextId, savedItems)
  if (Object.keys(v).length > 0) { setAddErrors(v); return }

  const newItem: MediaItem = {
    id: nextId,
    src: `photos/${addDraft.category}/${addingFile.name}`,
    type: addDraft.type,
    category: addDraft.category,
    title: addDraft.title || addingFile.name,
    alt: addDraft.alt || addingFile.name,
    caption: addDraft.caption || '',
    featured: addDraft.featured,
    showInGallery: addDraft.showInGallery,
    syntheticFields: [],
    roles: ['Добавлено через content manager'],
  }

  setSavedItems((prev) => {
    const next = new Map(prev)
    next.set(nextId, newItem)
    return next
  })

  // Очистка
  setAddingFile(null)
  setAddDraft(null)
  setAddErrors({})
  setMode('browse')
  setSelectedId(nextId)
  // Автоматически сбросить фильтр, если newItem не попадает в него
  if (filter && filter !== newItem.category) {
    setFilter(null)
  }
}

const handleAddCancel = () => {
  setAddingFile(null)
  setAddDraft(null)
  setAddErrors({})
  setMode('browse')
}
```

#### 1f. Рендер в `ContentManagerPage`

В панели навигации (в browse mode):

```diff
+        <button className="cm-btn cm-btn--primary" onClick={handleAddClick}>+ Добавить медиа</button>
```

В основном блоке, в секции `mode === 'browse'`:

```diff
           {mode === 'browse' ? (
             <>
               …навигация…

+              {addingFile && addDraft ? (
+                <AddMediaForm
+                  file={addingFile}
+                  draft={addDraft}
+                  onDraftChange={setAddDraft}
+                  onSave={handleAddSave}
+                  onCancel={handleAddCancel}
+                  nextId={computeNextId(savedItems)}
+                  errors={addErrors}
+                  existingSrcs={…}
+                />
+              ) : selectedItem && draft ? (
                 <MediaEditor … />
               ) : (
                 <div className="cm-editor cm-editor--empty">
                   <p>Выберите элемент из списка</p>
                 </div>
               )}
             </>
```

---

### 2. `src/styles/index.css` — CSS изменений

Добавить минимум:

```css
.cm-editor__image-wrap video {
  width: 100%;
  max-height: 40vh;
  object-fit: contain;
}
```

Стили `.cm-btn--primary` уже есть. Кнопка «+ Добавить» помещается в `cm-list__header`.

---

## Итоговый список изменений

| Файл | Действие |
|---|---|
| `src/pages/ContentManagerPage.tsx` | Изменить |
| `src/styles/index.css` | Изменить (+ стиль для video в редакторе) |

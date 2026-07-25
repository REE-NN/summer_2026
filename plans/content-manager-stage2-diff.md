# Content Manager — этап 2. Полный diff

## Изменяемые файлы

1. `src/data/mediaAdapter.ts` — добавить экспорт `CATEGORIES`, `isCategoryValid`
2. `src/pages/ContentManagerPage.tsx` — переписать browse-режим (draft, форма, валидация, диалог)
3. `src/styles/index.css` — добавить стили формы, диалога, кнопок

---

### 1. `src/data/mediaAdapter.ts` — в конец

```diff
 export function getUniqueCategories(items: MediaItem[]): string[] {
   const cats = new Set(items.map((i) => i.category))
   return Array.from(cats).sort()
 }
+
+/** Единый список категорий для редактора. Все существующие + unsorted + unused. */
+export const CATEGORIES: { value: string; label: string }[] = [
+  { value: 'hero', label: 'Главное' },
+  { value: 'garden', label: 'Сад' },
+  { value: 'river', label: 'Река' },
+  { value: 'dog', label: 'Собака' },
+  { value: 'village', label: 'Деревня' },
+  { value: 'village-days', label: 'Деревня (будни)' },
+  { value: 'drawing', label: 'Рисунок' },
+  { value: 'clay', label: 'Пластилин' },
+  { value: 'paper', label: 'Бумага' },
+  { value: 'unsorted', label: 'Без сортировки' },
+  { value: 'unused', label: 'Не используется' },
+]
+
+export function isCategoryValid(value: string): boolean {
+  return CATEGORIES.some((c) => c.value === value)
+}
```

---

### 2. `src/pages/ContentManagerPage.tsx` — полный diff

```diff
-import { useState, useMemo, useEffect } from 'react'
+import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
 import { photoPath } from '../utils/paths'
 import {
   getAllMedia,
   getCategoryLabel,
   getUniqueCategories,
+  CATEGORIES,
+  isCategoryValid,
   type MediaItem,
 } from '../data/mediaAdapter'

+// ---- Типы ----
+
+interface MediaDraft {
+  type: 'image' | 'video'
+  category: string
+  title: string
+  alt: string
+  caption: string
+  featured: boolean
+  showInGallery: boolean
+  /** Поля, которые пользователь явно редактировал и они отличаются от saved-значения */
+  nonSyntheticFields: string[]
+}
+
+interface ValidationErrors {
+  title?: string
+  alt?: string
+  caption?: string
+  type?: string
+  category?: string
+}
+
+type SaveStatus = 'clean' | 'dirty' | 'saved'
+
+// ---- Вспомогательные функции ----
+
+function createDraftFrom(item: MediaItem): MediaDraft {
+  return {
+    type: item.type,
+    category: item.category,
+    title: item.title,
+    alt: item.alt,
+    caption: item.caption,
+    featured: item.featured,
+    showInGallery: item.showInGallery,
+    nonSyntheticFields: [],
+  }
+}
+
+/** Сравнение draft с saved item. Учитывает значения полей + synthetic status. */
+function isDirty(draft: MediaDraft, saved: MediaItem): boolean {
+  if (draft.type !== saved.type) return true
+  if (draft.category !== saved.category) return true
+  if (draft.title !== saved.title) return true
+  if (draft.alt !== saved.alt) return true
+  if (draft.caption !== saved.caption) return true
+  if (draft.featured !== saved.featured) return true
+  if (draft.showInGallery !== saved.showInGallery) return true
+  // nonSyntheticFields непуст → есть изменения даже при совпадении значений
+  if (draft.nonSyntheticFields.length > 0) return true
+  return false
+}
+
+/** Является ли поле синтетическим в текущем draft по saved item. */
+function isFieldSynth(field: string, saved: MediaItem, draft: MediaDraft): boolean {
+  if (!saved.syntheticFields.includes(field)) return false
+  if (draft.nonSyntheticFields.includes(field)) return false
+  return true
+}
+
+/**
+ * Обновление поля draft с синхронизацией nonSyntheticFields.
+ * Если значение вернулось к saved-значению — поле убирается из nonSyntheticFields,
+ * бейдж «временное» восстанавливается, draft перестаёт быть dirty по этому полю.
+ */
+function updateDraftField(
+  draft: MediaDraft,
+  field: keyof MediaDraft,
+  value: string | boolean,
+  saved: MediaItem,
+): MediaDraft {
+  let newNonSynth = [...draft.nonSyntheticFields]
+  const synthableFields = ['title', 'alt', 'caption']
+
+  if (synthableFields.includes(field as string)) {
+    const fieldStr = field as string
+    const savedVal = String(saved[fieldStr as keyof MediaItem] ?? '')
+
+    if (String(value) === savedVal) {
+      // значение совпало с saved → восстанавливаем synthetic-статус
+      newNonSynth = newNonSynth.filter((f) => f !== fieldStr)
+    } else if (!newNonSynth.includes(fieldStr)) {
+      // значение изменилось → снимаем synthetic-статус
+      newNonSynth.push(fieldStr)
+    }
+  }
+
+  return { ...draft, [field]: value, nonSyntheticFields: newNonSynth }
+}
+
+function validateDraft(d: MediaDraft): ValidationErrors {
+  const err: ValidationErrors = {}
+  if (d.title.length > 120) err.title = 'Не более 120 символов'
+  if (d.alt.length > 200) err.alt = 'Не более 200 символов'
+  if (d.caption.length > 500) err.caption = 'Не более 500 символов'
+  if (d.type !== 'image' && d.type !== 'video') err.type = 'Недопустимый тип'
+  if (!isCategoryValid(d.category)) err.category = 'Недопустимая категория'
+  return err
+}
+
+function applyDraft(item: MediaItem, draft: MediaDraft): MediaItem {
+  return {
+    ...item,
+    type: draft.type,
+    category: draft.category,
+    title: draft.title,
+    alt: draft.alt,
+    caption: draft.caption,
+    featured: draft.featured,
+    showInGallery: draft.showInGallery,
+    syntheticFields: item.syntheticFields.filter(
+      (f) => !draft.nonSyntheticFields.includes(f),
+    ),
+  }
+}
+
+/** Проверка, останется ли запись в отфильтрованном списке. */
+function wouldSurviveFilter(item: MediaItem, category: string | null): boolean {
+  return category === null || item.category === category
+}
+
+// ---- ConfirmDialog ----
+
+function ConfirmDialog({
+  message,
+  onConfirm,
+  onCancel,
+}: {
+  message: string
+  onConfirm: () => void
+  onCancel: () => void
+}) {
+  const confirmRef = useRef<HTMLButtonElement>(null)
+
+  useEffect(() => {
+    confirmRef.current?.focus()
+    const handleKey = (e: KeyboardEvent) => {
+      if (e.key === 'Escape') onCancel()
+    }
+    document.addEventListener('keydown', handleKey)
+    document.body.style.overflow = 'hidden'
+    return () => {
+      document.removeEventListener('keydown', handleKey)
+      document.body.style.overflow = ''
+    }
+  }, [onCancel])
+
+  return (
+    <div
+      className="cm-dialog-overlay"
+      onClick={onCancel}
+      role="dialog"
+      aria-modal="true"
+      aria-label="Подтверждение"
+    >
+      <div className="cm-dialog" onClick={(e) => e.stopPropagation()}>
+        <p className="cm-dialog__message">{message}</p>
+        <div className="cm-dialog__actions">
+          <button className="cm-btn cm-btn--danger" onClick={onConfirm} ref={confirmRef}>
+            Отменить изменения
+          </button>
+          <button className="cm-btn" onClick={onCancel}>
+            Остаться
+          </button>
+        </div>
+      </div>
+    </div>
+  )
+}
+
+// ---- MediaEditor ----
+
+function MediaEditor({
+  item,
+  draft,
+  onDraftChange,
+  onSave,
+  onReset,
+  saveStatus,
+  errors,
+  savedItem,
+}: {
+  item: MediaItem
+  draft: MediaDraft
+  onDraftChange: (d: MediaDraft) => void
+  onSave: () => void
+  onReset: () => void
+  saveStatus: SaveStatus
+  errors: ValidationErrors
+  savedItem: MediaItem
+}) {
+  const fid = (name: string) => `cm-e-${item.id}-${name}`
+  const eid = (name: string) => `${fid(name)}-err`
+
+  const upd = (field: keyof MediaDraft, value: string | boolean) => {
+    onDraftChange(updateDraftField(draft, field, value, savedItem))
+  }
+
+  const synth = (field: string) => isFieldSynth(field, savedItem, draft)
+
+  const statusLabel =
+    saveStatus === 'clean'
+      ? 'Изменений нет'
+      : saveStatus === 'dirty'
+        ? 'Есть несохранённые изменения'
+        : 'Изменения сохранены локально'
+
+  const hasErrors = Object.keys(errors).length > 0
+
+  return (
+    <div className="cm-editor">
+      {/* изображение — использует draft.type и draft.alt для live preview */}
+      <div className="cm-editor__image-wrap">
+        {draft.type === 'video' ? (
+          <div className="cm-editor__video-placeholder">
+            <span className="cm-editor__video-icon">▶</span>
+            <span className="cm-editor__video-path">{item.src}</span>
+          </div>
+        ) : (
+          <img
+            src={photoPath(item.src)}
+            alt={draft.alt || ''}
+            className="cm-editor__img"
+            onError={(e) => {
+              e.currentTarget.style.display = 'none'
+              e.currentTarget.parentElement!.classList.add(
+                'cm-editor__image-wrap--broken',
+              )
+            }}
+          />
+        )}
+      </div>
+
+      {/* статус */}
+      <div className="cm-editor__status" role="status" aria-live="polite">
+        {statusLabel}
+      </div>
+
+      {/* только для чтения */}
+      <div className="cm-editor__readonly">
+        <span className="cm-editor__ro-label">ID</span>
+        <span className="cm-editor__ro-value">{item.id}</span>
+      </div>
+      <div className="cm-editor__readonly">
+        <span className="cm-editor__ro-label">src</span>
+        <span className="cm-editor__ro-value">{item.src}</span>
+      </div>
+      <div className="cm-editor__readonly">
+        <span className="cm-editor__ro-label">Роли</span>
+        <span className="cm-editor__ro-value">{item.roles.join(', ')}</span>
+      </div>
+
+      {/* поля формы */}
+      <div className="cm-editor__fields">
+        {/* type */}
+        <div className="cm-editor__unit">
+          <label className="cm-editor__label" htmlFor={fid('type')}>Тип</label>
+          <div className="cm-editor__input-wrap">
+            <select
+              id={fid('type')}
+              className="cm-editor__select"
+              value={draft.type}
+              onChange={(e) => upd('type', e.target.value)}
+              aria-invalid={!!errors.type}
+              aria-describedby={errors.type ? eid('type') : undefined}
+            >
+              <option value="image">Изображение</option>
+              <option value="video">Видео</option>
+            </select>
+            {errors.type && <p className="cm-editor__error" id={eid('type')} role="alert">{errors.type}</p>}
+          </div>
+        </div>
+
+        {/* category */}
+        <div className="cm-editor__unit">
+          <label className="cm-editor__label" htmlFor={fid('category')}>Категория</label>
+          <div className="cm-editor__input-wrap">
+            <select
+              id={fid('category')}
+              className="cm-editor__select"
+              value={draft.category}
+              onChange={(e) => upd('category', e.target.value)}
+              aria-invalid={!!errors.category}
+              aria-describedby={errors.category ? eid('category') : undefined}
+            >
+              {CATEGORIES.map((c) => (
+                <option key={c.value} value={c.value}>{c.label}</option>
+              ))}
+            </select>
+            {errors.category && <p className="cm-editor__error" id={eid('category')} role="alert">{errors.category}</p>}
+          </div>
+        </div>
+
+        {/* title */}
+        <div className="cm-editor__unit">
+          <label className="cm-editor__label" htmlFor={fid('title')}>
+            Заголовок
+            {synth('title') && <span className="cm-editor__synth">временное</span>}
+          </label>
+          <div className="cm-editor__input-wrap">
+            <input
+              id={fid('title')}
+              className="cm-editor__input"
+              type="text"
+              value={draft.title}
+              onChange={(e) => upd('title', e.target.value)}
+              maxLength={120}
+              aria-invalid={!!errors.title}
+              aria-describedby={errors.title ? eid('title') : undefined}
+            />
+            <span className="cm-editor__counter">{draft.title.length}/120</span>
+            {errors.title && <p className="cm-editor__error" id={eid('title')} role="alert">{errors.title}</p>}
+          </div>
+        </div>
+
+        {/* alt */}
+        <div className="cm-editor__unit">
+          <label className="cm-editor__label" htmlFor={fid('alt')}>
+            Alt
+            {synth('alt') && <span className="cm-editor__synth">временное</span>}
+          </label>
+          <div className="cm-editor__input-wrap">
+            <input
+              id={fid('alt')}
+              className="cm-editor__input"
+              type="text"
+              value={draft.alt}
+              onChange={(e) => upd('alt', e.target.value)}
+              maxLength={200}
+              aria-invalid={!!errors.alt}
+              aria-describedby={errors.alt ? eid('alt') : undefined}
+            />
+            <span className="cm-editor__counter">{draft.alt.length}/200</span>
+            {errors.alt && <p className="cm-editor__error" id={eid('alt')} role="alert">{errors.alt}</p>}
+          </div>
+        </div>
+
+        {/* caption */}
+        <div className="cm-editor__unit">
+          <label className="cm-editor__label" htmlFor={fid('caption')}>
+            Подпись
+            {synth('caption') && <span className="cm-editor__synth">временное</span>}
+          </label>
+          <div className="cm-editor__input-wrap">
+            <textarea
+              id={fid('caption')}
+              className="cm-editor__textarea"
+              value={draft.caption}
+              onChange={(e) => upd('caption', e.target.value)}
+              maxLength={500}
+              rows={3}
+              aria-invalid={!!errors.caption}
+              aria-describedby={errors.caption ? eid('caption') : undefined}
+            />
+            <span className="cm-editor__counter">{draft.caption.length}/500</span>
+            {errors.caption && <p className="cm-editor__error" id={eid('caption')} role="alert">{errors.caption}</p>}
+          </div>
+        </div>
+
+        {/* featured */}
+        <div className="cm-editor__unit cm-editor__unit--row">
+          <input
+            id={fid('featured')}
+            className="cm-editor__checkbox"
+            type="checkbox"
+            checked={draft.featured}
+            onChange={(e) => upd('featured', e.target.checked)}
+          />
+          <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('featured')}>Featured</label>
+        </div>
+
+        {/* showInGallery */}
+        <div className="cm-editor__unit cm-editor__unit--row">
+          <input
+            id={fid('showInGallery')}
+            className="cm-editor__checkbox"
+            type="checkbox"
+            checked={draft.showInGallery}
+            onChange={(e) => upd('showInGallery', e.target.checked)}
+          />
+          <label className="cm-editor__label cm-editor__label--row" htmlFor={fid('showInGallery')}>
+            Показывать в галерее
+          </label>
+        </div>
+      </div>
+
+      {/* кнопки — Отменить доступна только при dirty */}
+      <div className="cm-editor__actions">
+        <button
+          className="cm-btn cm-btn--primary"
+          onClick={onSave}
+          disabled={saveStatus !== 'dirty' || hasErrors}
+        >
+          Сохранить
+        </button>
+        <button
+          className="cm-btn"
+          onClick={onReset}
+          disabled={saveStatus !== 'dirty'}
+        >
+          Отменить
+        </button>
+      </div>
+    </div>
+  )
+}

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
-  onSelect: (id: string) => void
+  onSelect: (id: string) => void  // выбор с confirm при dirty
   filter: string | null
   onFilterChange: (cat: string | null) => void
   categories: { label: string; count: number }[]
 }) {
   return (
     <div className="cm-list">
       …шапка, фильтр, пусто…
       {items.length > 0 && (
         <div className="cm-list__grid">
           {items.map((item) => (
             <button
               key={item.id}
               className={…}
               onClick={() => onSelect(item.id)}
               …
             >
               …
             </button>
           ))}
         </div>
       )}
     </div>
   )
 }

-// MediaPreview полностью удаляется

 function HelpContent() { … }  // без изменений

 function ContentManagerPage() {
   const allMedia = useMemo(() => getAllMedia(), [])

+  // локально сохранённое состояние (живёт до перезагрузки)
+  const [savedItems, setSavedItems] = useState<Map<string, MediaItem>>(() => {
+    const m = new Map<string, MediaItem>()
+    for (const item of allMedia) m.set(item.id, item)
+    return m
+  })
+
+  const allItems = useMemo(() => Array.from(savedItems.values()), [savedItems])
   const categories = useMemo(() => getUniqueCategories(allItems), [allItems])
   const allCategoryCounts = useMemo(
     () =>
@@ -160,11 +475,12 @@
   )
   const [filter, setFilter] = useState<string | null>(null)
   const [selectedId, setSelectedId] = useState<string | null>(
-    allMedia.length > 0 ? allMedia[0].id : null,
+    allItems.length > 0 ? allItems[0].id : null,
   )
   const [mode, setMode] = useState<'browse' | 'help'>('browse')
+  const [draft, setDraft] = useState<MediaDraft | null>(null)
+  const [saveStatus, setSaveStatus] = useState<SaveStatus>('clean')
+  const [errors, setErrors] = useState<ValidationErrors>({})
+  const [pendingNav, setPendingNav] = useState<string | null>(null) // targetId

-  const filtered = useMemo(
-    () => (filter ? allMedia.filter((m) => m.category === filter) : allMedia),
-    [allMedia, filter],
-  )
+  const filtered = useMemo(
+    () => (filter ? allItems.filter((m) => m.category === filter) : allItems),
+    [allItems, filter],
+  )

   // Синхронизация selectedId при смене фильтра
   useEffect(() => {
     if (filtered.length === 0) {
       setSelectedId(null)
     } else if (!filtered.some((m) => m.id === selectedId)) {
       setSelectedId(filtered[0].id)
     }
-    // Срабатывает только при смене filter
     // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, [filter])
+  }, [filter, allItems])

   const currentIndex = filtered.findIndex((m) => m.id === selectedId)
   const selectedItem = filtered[currentIndex] ?? null

+  // Создание draft при выборе элемента
+  useEffect(() => {
+    if (selectedItem) {
+      const saved = savedItems.get(selectedItem.id)
+      if (saved) {
+        setDraft(createDraftFrom(saved))
+        setSaveStatus('clean')
+        setErrors({})
+      }
+    } else {
+      setDraft(null)
+      setSaveStatus('clean')
+      setErrors({})
+    }
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [selectedId])
+
+  // Валидация при изменении draft
+  useEffect(() => {
+    if (draft) setErrors(validateDraft(draft))
+  }, [draft])
+
+  // Навигация с проверкой dirty
+  const tryNavigate = useCallback(
+    (targetId: string) => {
+      if (saveStatus === 'dirty') {
+        setPendingNav(targetId)
+      } else {
+        setSelectedId(targetId)
+      }
+    },
+    [saveStatus],
+  )
+
+  // Сброс draft + state (используется при подтверждении навигации)
+  const clearDraftState = useCallback(() => {
+    setDraft(null)
+    setSaveStatus('clean')
+    setErrors({})
+  }, [])
+
+  const confirmNav = useCallback(() => {
+    if (!pendingNav) return
+    clearDraftState()
+    setSelectedId(pendingNav)
+    setPendingNav(null)
+  }, [pendingNav, clearDraftState])
+
+  const cancelNav = useCallback(() => {
+    setPendingNav(null)
+  }, [])
+
   const goPrev = () => {
-    if (currentIndex > 0) setSelectedId(filtered[currentIndex - 1].id)
+    if (currentIndex > 0) tryNavigate(filtered[currentIndex - 1].id)
   }
   const goNext = () => {
-    if (currentIndex < filtered.length - 1) setSelectedId(filtered[currentIndex + 1].id)
+    if (currentIndex < filtered.length - 1) tryNavigate(filtered[currentIndex + 1].id)
   }
+
+  const handleFilterChange = useCallback(
+    (cat: string | null) => {
+      // Подтверждение только если выбранная запись исчезнет из нового фильтра
+      if (saveStatus === 'dirty' && selectedItem && !wouldSurviveFilter(selectedItem, cat)) {
+        setPendingNav(selectedItem.id)
+      } else {
+        setFilter(cat)
+      }
+    },
+    [saveStatus, selectedItem],
+  )
+
+  const handleSave = useCallback(() => {
+    if (!selectedItem || !draft) return
+    const v = validateDraft(draft)
+    if (Object.keys(v).length > 0) { setErrors(v); return }
+    const updated = applyDraft(selectedItem, draft)
+    setSavedItems((prev) => {
+      const next = new Map(prev)
+      next.set(selectedItem.id, updated)
+      return next
+    })
+    setSaveStatus('saved')
+  }, [selectedItem, draft])
+
+  const handleReset = useCallback(() => {
+    if (!selectedItem) return
+    const saved = savedItems.get(selectedItem.id)
+    if (saved) {
+      setDraft(createDraftFrom(saved))
+      setSaveStatus('clean')
+      setErrors({})
+    }
+  }, [selectedItem, savedItems])
+
+  const handleDraftChange = useCallback((d: MediaDraft) => {
+    if (!selectedItem) return
+    setDraft(d)
+    const saved = savedItems.get(selectedItem.id)
+    if (saved) {
+      setSaveStatus(isDirty(d, saved) ? 'dirty' : 'clean')
+    }
+  }, [selectedItem, savedItems])

   return (
     <div className="page-wrapper">
+      {pendingNav && (
+        <ConfirmDialog
+          message="Есть несохранённые изменения. Перейти к другой записи и отменить их?"
+          onConfirm={confirmNav}
+          onCancel={cancelNav}
+        />
+      )}
+
       <div className="cm-layout">
         <MediaList
           items={filtered}
           selectedId={selectedId}
-          onSelect={setSelectedId}
+          onSelect={tryNavigate}
           filter={filter}
-          onFilterChange={setFilter}
+          onFilterChange={handleFilterChange}
           categories={allCategoryCounts}
         />

         <div className="cm-main">
           <div className="cm-tabs" role="tablist">
             …табы Просмотр / Справка…
           </div>

           {mode === 'browse' ? (
             <>
               <div className="cm-nav">
                 <button … onClick={goPrev} …>← Предыдущее</button>
                 <span className="cm-nav__counter">…</span>
                 <button … onClick={goNext} …>Следующее →</button>
               </div>

-              <MediaPreview item={selectedItem} />
+              {selectedItem && draft ? (
+                <MediaEditor
+                  item={selectedItem}
+                  draft={draft}
+                  onDraftChange={handleDraftChange}
+                  onSave={handleSave}
+                  onReset={handleReset}
+                  saveStatus={saveStatus}
+                  errors={errors}
+                  savedItem={savedItems.get(selectedItem.id) ?? selectedItem}
+                />
+              ) : (
+                <div className="cm-editor cm-editor--empty">
+                  <p>Выберите элемент из списка</p>
+                </div>
+              )}
             </>
           ) : (
             <HelpContent />
```

**Карта исправлений по каждому пункту:**

| № | Проблема | Исправление |
|---|---|---|
| 1 | `CATEGORIES` не включает drawing, clay, paper; содержит children/gallery которых нет в данных | Перечислены все 9 существующих: hero, garden, river, dog, village, village-days, drawing, clay, paper + unsorted + unused |
| 2 | `originalSynth` — отдельный map, не отражает saved состояние | Удалён. `isFieldSynth()` проверяет `savedItem.syntheticFields` напрямую (проп `savedItem` из `savedItems.get()`) |
| 3 | Dirty-сравнение не учитывает «вернул исходное» | `updateDraftField()`: если значение совпало с saved — поле убирается из nonSyntheticFields → бейдж восстанавливается. `isDirty()` проверяет `nonSyntheticFields.length > 0` |
| 4 | «Отменить» активна при clean | `disabled={saveStatus !== 'dirty'}` — строго только при dirty |
| 5 | Фильтр всегда показывает confirm при dirty | `wouldSurviveFilter()` — confirm только если выбранная запись не проходит новый фильтр |
| 6 | confirmNav не сбрасывает draft | `clearDraftState()` вызывается первой строкой `confirmNav()` |
| 7 | Два onSelect-пропа в MediaList | Удалён неиспользуемый `onSelect`, оставлен один `onSelect` = `tryNavigate` |
| 8 | Предпросмотр использует `item.type` / `item.alt` | Использует `draft.type` для video/image и `draft.alt` для `alt` у `<img>` |

---

### 3. `src/styles/index.css` — добавляется после `/* ===== Content Manager Help ===== */`

```css
/* ===== Confirm Dialog ===== */

.cm-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cm-dialog {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 1.5rem;
  max-width: 26rem;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cm-dialog__message {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}

.cm-dialog__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cm-btn--danger {
  border-color: #c0392b;
  color: #c0392b;
}

.cm-btn--danger:hover:not(:disabled) {
  background: #c0392b;
  color: #fff;
  border-color: #c0392b;
}

/* ===== Content Manager Editor ===== */

.cm-editor {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cm-editor--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.cm-editor__image-wrap {
  max-height: 40vh;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cm-editor__image-wrap--broken {
  min-height: 150px;
}

.cm-editor__image-wrap--broken::after {
  content: 'Изображение не найдено';
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.cm-editor__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 40vh;
}

.cm-editor__video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.cm-editor__video-icon {
  font-size: 2.5rem;
}

.cm-editor__video-path {
  font-size: 0.8125rem;
  font-family: monospace;
  word-break: break-all;
}

.cm-editor__status {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 0.375rem 0.75rem;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  text-align: center;
}

.cm-editor__readonly {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.cm-editor__ro-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 4rem;
  flex-shrink: 0;
}

.cm-editor__ro-value {
  color: var(--color-text);
  word-break: break-all;
}

.cm-editor__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cm-editor__unit {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cm-editor__unit--row {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.cm-editor__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cm-editor__label--row {
  font-size: 0.875rem;
  color: var(--color-text);
  cursor: pointer;
}

.cm-editor__synth {
  display: inline-block;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-terracotta);
  background: var(--color-bg);
  border-radius: 3px;
}

.cm-editor__input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
}

.cm-editor__input,
.cm-editor__select,
.cm-editor__textarea {
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.15s;
}

.cm-editor__input:focus,
.cm-editor__select:focus,
.cm-editor__textarea:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 2px rgba(91, 138, 140, 0.2);
}

.cm-editor__input[aria-invalid="true"],
.cm-editor__select[aria-invalid="true"],
.cm-editor__textarea[aria-invalid="true"] {
  border-color: #c0392b;
}

.cm-editor__input[aria-invalid="true"]:focus,
.cm-editor__select[aria-invalid="true"]:focus,
.cm-editor__textarea[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.2);
}

.cm-editor__textarea {
  resize: vertical;
  min-height: 4rem;
}

.cm-editor__counter {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
  padding: 0 0.125rem;
}

.cm-editor__error {
  font-size: 0.75rem;
  color: #c0392b;
  margin: 0;
}

.cm-editor__checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-green);
}

.cm-editor__actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.cm-btn--primary {
  background: var(--color-green);
  color: #fff;
  border-color: var(--color-green);
}

.cm-btn--primary:hover:not(:disabled) {
  background: var(--color-green-light);
  border-color: var(--color-green-light);
}

.cm-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cm-editor__actions {
    flex-direction: column;
  }
}
```

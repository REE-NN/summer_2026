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

/** Единый список категорий для редактора. Все существующие + unsorted + unused. */
export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'hero', label: 'Главное' },
  { value: 'garden', label: 'Сад' },
  { value: 'river', label: 'Река' },
  { value: 'dog', label: 'Собака' },
  { value: 'village', label: 'Деревня' },
  { value: 'village-days', label: 'Деревня (будни)' },
  { value: 'drawing', label: 'Рисунок' },
  { value: 'clay', label: 'Пластилин' },
  { value: 'paper', label: 'Бумага' },
  { value: 'unsorted', label: 'Без сортировки' },
  { value: 'unused', label: 'Не используется' },
]

export function isCategoryValid(value: string): boolean {
  return CATEGORIES.some((c) => c.value === value)
}

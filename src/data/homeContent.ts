export interface StoryCardData {
  id: string
  storyId: string
  title: string
  description: string
  placeholderVariant: 'garden' | 'river' | 'dog' | 'village'
  imageSrc?: string
}

export interface StatItem {
  value: string
  label: string
}

export const HERO = {
  badge: 'Лето 2026',
  title: 'Задворка 2026',
  subtitle:
    'Дом возле Ветлуги, сад, река, рыбалка, дети, собака и истории, которых никто не планировал',
  cta: { label: 'Смотреть истории', to: '/stories' },
  secondary: { label: 'Детское творчество', to: '/children' },
  imageSrc: 'photos/hero/2026-06-05_09-58-06.webp',
  imageAlt: 'Утро на реке Ветлуга — наш первый день в Задворке',
} as const

export const INTRO_TEXT =
  'Мы приехали в деревенский дом на несколько недель. Постепенно у нас появились любимая дорога к реке, огород, рыбалка, собака во дворе и множество маленьких историй.'

export const STORIES: StoryCardData[] = [
  {
    id: 'story-garden',
    storyId: 'garden',
    title: 'Сад и огород',
    description:
      'Одиннадцать кустов помидоров, кабачки, укроп и бесконечные споры о том, что сажать в следующем году.',
    placeholderVariant: 'garden',
    imageSrc: 'photos/garden/2026-06-04_16-22-29.webp',
  },
  {
    id: 'story-river',
    storyId: 'river',
    title: 'Река и рыбалка',
    description:
      'Ветлуга — широкая, спокойная и обманчиво медленная. Удочки, поплавки и несколько видов рыбы.',
    placeholderVariant: 'river',
    imageSrc: 'photos/river/2026-06-05_12-17-38.webp',
  },
  {
    id: 'story-dog',
    storyId: 'dog',
    title: 'Собака и щенок',
    description:
      'Лохматый охранник двора и маленький щенок, который гоняет кур и засыпает на пороге.',
    placeholderVariant: 'dog',
    imageSrc: 'photos/dog/2026-06-04_17-09-28.webp',
  },
  {
    id: 'story-village',
    storyId: 'village-days',
    title: 'Деревенские дни',
    description:
      'Утро начинается с петухов, а заканчивается костром и звёздами. Между ними — целая жизнь.',
    placeholderVariant: 'village',
    imageSrc: 'photos/village/2026-06-09_14-28-58.webp',
  },
]

export const STATS: StatItem[] = [
  { value: '11', label: 'кустов помидоров' },
  { value: 'несколько', label: 'видов рыбы' },
  { value: '1', label: 'собака-охранник' },
  { value: '1', label: 'щенок' },
  { value: 'множество', label: 'походов к реке' },
  { value: '1', label: 'кормушка, улетевшая на середину реки' },
]

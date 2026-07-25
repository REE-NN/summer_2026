export interface GalleryPhotoData {
  id: string
  src: string
  alt: string
  section: string
}

export const GALLERY_PHOTOS: GalleryPhotoData[] = [
  { id: 'gal-01', src: 'photos/gallery/2026-06-04_16-23-44.webp', alt: 'Сад, цветы и зелень', section: 'garden' },
  { id: 'gal-02', src: 'photos/gallery/2026-06-04_16-29-04.webp', alt: 'Огородные грядки', section: 'garden' },
  { id: 'gal-03', src: 'photos/gallery/2026-06-06_12-51-38.webp', alt: 'Летний сад', section: 'garden' },
  { id: 'gal-04', src: 'photos/gallery/2026-06-05_13-15-44.webp', alt: 'Река Ветлуга', section: 'river' },
  { id: 'gal-05', src: 'photos/gallery/2026-06-05_13-46-44.webp', alt: 'Рыбалка на реке', section: 'river' },
  { id: 'gal-06', src: 'photos/gallery/2026-06-05_13-53-16.webp', alt: 'Улов', section: 'river' },
  { id: 'gal-07', src: 'photos/gallery/2026-06-05_14-11-08.webp', alt: 'Речной пейзаж', section: 'river' },
  { id: 'gal-08', src: 'photos/gallery/2026-06-05_14-12-18.webp', alt: 'Ветлуга, дальний план', section: 'river' },
  { id: 'gal-09', src: 'photos/gallery/2026-06-09_15-13-43.webp', alt: 'Деревенские будни', section: 'village' },
  { id: 'gal-10', src: 'photos/gallery/2026-06-19_20-06-04.webp', alt: 'Вечер у костра', section: 'village' },
  { id: 'gal-11', src: 'photos/gallery/2026-06-19_20-06-08.webp', alt: 'Костер и звёзды', section: 'village' },
  { id: 'gal-12', src: 'photos/gallery/2026-06-21_16-20-14.webp', alt: 'Двор и дом', section: 'village' },
  { id: 'gal-13', src: 'photos/gallery/2026-06-21_16-20-16.webp', alt: 'Вечер в деревне', section: 'village' },
  { id: 'gal-14', src: 'photos/gallery/2026-06-25_21-23-58.webp', alt: 'Ночное небо', section: 'village' },
]

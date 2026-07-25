export interface ChildrenPhotoData {
  id: string
  src: string
  alt: string
  category: 'drawing' | 'clay' | 'paper' | 'video'
}

export const CHILDREN_PREVIEW = {
  title: 'Детское творчество',
  description:
    'Рисунки, фигурки из глины, бумажные поделки и короткие ролики — всё, что успели сделать маленькие руки за это лето.',
  cta: { label: 'Посмотреть работы', to: '/children' },
  placeholders: [
    { id: 'child-art-1', variant: 'drawing' as const, imageSrc: 'photos/children/IMG-20260620-WA0000.webp' },
    { id: 'child-art-2', variant: 'clay' as const, imageSrc: 'photos/children/IMG-20260620-WA0003.webp' },
    { id: 'child-art-3', variant: 'paper' as const, imageSrc: 'photos/children/IMG-20260620-WA0016.webp' },
    { id: 'child-art-4', variant: 'video' as const, imageSrc: 'photos/children/IMG-20260620-WA0017.webp' },
  ],
}

export const CHILDREN_PHOTOS: ChildrenPhotoData[] = [
  { id: 'ch-000', src: 'photos/children/IMG-20260620-WA0000.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-001', src: 'photos/children/IMG-20260620-WA0001.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-002', src: 'photos/children/IMG-20260620-WA0002.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-003', src: 'photos/children/IMG-20260620-WA0003.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-004', src: 'photos/children/IMG-20260620-WA0004.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-005', src: 'photos/children/IMG-20260620-WA0005.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-006', src: 'photos/children/IMG-20260620-WA0006.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-007', src: 'photos/children/IMG-20260620-WA0007.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-009', src: 'photos/children/IMG-20260620-WA0009.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-010', src: 'photos/children/IMG-20260620-WA0010.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-011', src: 'photos/children/IMG-20260620-WA0011.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-012', src: 'photos/children/IMG-20260620-WA0012.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-014', src: 'photos/children/IMG-20260620-WA0014.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-015', src: 'photos/children/IMG-20260620-WA0015.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-016', src: 'photos/children/IMG-20260620-WA0016.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-017', src: 'photos/children/IMG-20260620-WA0017.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-018', src: 'photos/children/IMG-20260620-WA0018.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-019', src: 'photos/children/IMG-20260620-WA0019.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-020', src: 'photos/children/IMG-20260620-WA0020.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-021', src: 'photos/children/IMG-20260620-WA0021.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-022', src: 'photos/children/IMG-20260620-WA0022.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-023', src: 'photos/children/IMG-20260620-WA0023.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-024', src: 'photos/children/IMG-20260620-WA0024.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-025', src: 'photos/children/IMG-20260620-WA0025.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-026', src: 'photos/children/IMG-20260620-WA0026.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-027', src: 'photos/children/IMG-20260620-WA0027.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-028', src: 'photos/children/IMG-20260620-WA0028.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-029', src: 'photos/children/IMG-20260620-WA0029.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-030', src: 'photos/children/IMG-20260620-WA0030.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-031', src: 'photos/children/IMG-20260620-WA0031.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-032', src: 'photos/children/IMG-20260620-WA0032.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-033', src: 'photos/children/IMG-20260620-WA0033.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-034', src: 'photos/children/IMG-20260620-WA0034.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-035', src: 'photos/children/IMG-20260620-WA0035.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-036', src: 'photos/children/IMG-20260620-WA0036.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-037', src: 'photos/children/IMG-20260620-WA0037.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-038', src: 'photos/children/IMG-20260620-WA0038.webp', alt: 'Детский рисунок', category: 'drawing' },
  { id: 'ch-039', src: 'photos/children/IMG-20260620-WA0039.webp', alt: 'Поделка из бумаги', category: 'paper' },
  { id: 'ch-040', src: 'photos/children/IMG-20260620-WA0040.webp', alt: 'Поделка из пластилина', category: 'clay' },
  { id: 'ch-041', src: 'photos/children/IMG-20260620-WA0041.webp', alt: 'Поделка из пластилина', category: 'clay' },
]

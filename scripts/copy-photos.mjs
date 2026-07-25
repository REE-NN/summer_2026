import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { extname, join } from 'path'

const SELECTED = join(import.meta.dirname, '..', 'selected-photos')
const PUBLIC = join(import.meta.dirname, '..', 'public', 'photos')

const MAPPING = {
  '01-Главное-фото': 'hero',
  '02-Сад-и-огород': 'garden',
  '03-Река-и-рыбалка': 'river',
  '04-Собака-и-щенок': 'dog',
  '05-Деревенские-будни': 'village',
  '06-Детское-творчество': 'children',
  '07-Галерея': 'gallery',
}

let total = 0

for (const [srcDir, destDir] of Object.entries(MAPPING)) {
  const srcPath = join(SELECTED, srcDir)
  const destPath = join(PUBLIC, destDir)

  if (!existsSync(srcPath)) {
    console.log(`⚠ Source not found: ${srcDir}`)
    continue
  }

  mkdirSync(destPath, { recursive: true })

  const files = readdirSync(srcPath).filter(f => extname(f).toLowerCase() === '.webp')
  for (const file of files) {
    const srcFile = join(srcPath, file)
    const destFile = join(destPath, file.replace(/ /g, '_'))
    copyFileSync(srcFile, destFile)
    total++
  }

  console.log(`✓ ${files.length} files → public/photos/${destDir}/`)
}

console.log(`\n✅ Total: ${total} files copied to public/photos/`)

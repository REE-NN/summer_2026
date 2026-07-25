import { readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import sharp from 'sharp'

const ROOT = join(import.meta.dirname, '..', 'selected-photos')
const groups = readdirSync(ROOT).filter(f => statSync(join(ROOT, f)).isDirectory())

const QUALITY = 85
let total = 0

for (const group of groups) {
  const dir = join(ROOT, group)
  const files = readdirSync(dir).filter(f => /\.jpe?g$/i.test(f))

  for (const file of files) {
    const input = join(dir, file)
    const output = join(dir, basename(file, extname(file)) + '.webp')

    await sharp(input)
      .webp({ quality: QUALITY })
      .toFile(output)

    const inSize = statSync(input).size
    const outSize = statSync(output).size
    const ratio = ((1 - outSize / inSize) * 100).toFixed(1)

    console.log(`✓ ${group}/${file} → .webp (сжатие ${ratio}%)`)
    total++
  }
}

console.log(`\n✅ Готово. Сконвертировано ${total} файлов.`)

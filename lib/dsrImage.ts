import type { DsrReport } from './dsr'

const WIDTH = 720
const PADDING = 0
const ROW_HEIGHT = 44
const HEADER_HEIGHT = 52
const LABEL_X = 18
const VALUE_COL_WIDTH = 110
const BORDER = '#7f9fbf'
const HEADER_BG = '#cfe2f3'
const HEADER_TEXT = '#0b3954'
const BODY_BG = '#ffffff'
const ALT_BG = '#f7fafd'
const TEXT = '#0f172a'

function escapePngFilename(s: string): string {
  return s.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
}

export async function renderDsrPng(report: DsrReport): Promise<Blob> {
  const dpr = Math.max(2, Math.min(3, window.devicePixelRatio || 1))
  const height = HEADER_HEIGHT + report.rows.length * ROW_HEIGHT + PADDING * 2

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')
  ctx.scale(dpr, dpr)

  ctx.fillStyle = BODY_BG
  ctx.fillRect(0, 0, WIDTH, height)

  // Header row
  ctx.fillStyle = HEADER_BG
  ctx.fillRect(0, 0, WIDTH, HEADER_HEIGHT)
  ctx.fillStyle = HEADER_TEXT
  ctx.font = 'bold 18px -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`Date: ${report.dateLabel}`, LABEL_X, HEADER_HEIGHT / 2)

  // Rows
  let y = HEADER_HEIGHT
  for (let i = 0; i < report.rows.length; i++) {
    const row = report.rows[i]
    ctx.fillStyle = i % 2 === 0 ? BODY_BG : ALT_BG
    ctx.fillRect(0, y, WIDTH, ROW_HEIGHT)

    const weight = row.emphasize ? 'bold' : 'normal'
    ctx.fillStyle = TEXT
    ctx.font = `${weight} 16px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(row.label, LABEL_X, y + ROW_HEIGHT / 2)

    ctx.textAlign = 'right'
    ctx.font = `${weight} 17px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
    ctx.fillText(String(row.value), WIDTH - 18, y + ROW_HEIGHT / 2)

    y += ROW_HEIGHT
  }

  // Borders — outer
  ctx.strokeStyle = BORDER
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, WIDTH - 1, height - 1)

  // Horizontal lines
  ctx.beginPath()
  ctx.moveTo(0, HEADER_HEIGHT + 0.5)
  ctx.lineTo(WIDTH, HEADER_HEIGHT + 0.5)
  for (let i = 1; i <= report.rows.length; i++) {
    const yLine = HEADER_HEIGHT + i * ROW_HEIGHT + 0.5
    ctx.moveTo(0, yLine)
    ctx.lineTo(WIDTH, yLine)
  }
  ctx.stroke()

  // Vertical separator between label and value
  const valueX = WIDTH - VALUE_COL_WIDTH + 0.5
  ctx.beginPath()
  ctx.moveTo(valueX, HEADER_HEIGHT)
  ctx.lineTo(valueX, height)
  ctx.stroke()

  ctx.textAlign = 'left'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas.toBlob returned null'))
    }, 'image/png')
  })
}

export function downloadDsrPng(blob: Blob, dateLabel: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lilypad-dsr-${escapePngFilename(dateLabel)}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

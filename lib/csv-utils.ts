export type ColumnType = 'numeric' | 'categorical' | 'date' | 'unknown'

export type ColumnInfo = {
  name: string
  type: ColumnType
  nullCount: number
  uniqueCount: number
  sampleValues: string[]
}

export type ParsedCSV = {
  fileName: string
  headers: string[]
  rows: Record<string, string>[]
  columns: ColumnInfo[]
}

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{4}\/\d{2}\/\d{2}$/,
  /^\d{2}-\d{2}-\d{4}$/,
]

function detectType(values: string[]): ColumnType {
  const nonNull = values.filter(v => v.trim() !== '')
  if (nonNull.length === 0) return 'unknown'

  const sample = nonNull.slice(0, 30)

  const isDate = sample.every(v =>
    DATE_PATTERNS.some(p => p.test(v.trim())) ||
    (!isNaN(Date.parse(v)) && isNaN(Number(v)))
  )
  if (isDate) return 'date'

  const numericRatio = nonNull.filter(v =>
    !isNaN(Number(v.replace(/,/g, '').trim())) && v.trim() !== ''
  ).length / nonNull.length
  if (numericRatio > 0.7) return 'numeric'

  return 'categorical'
}

export function analyzeColumns(
  headers: string[],
  rows: Record<string, string>[]
): ColumnInfo[] {
  return headers.map(name => {
    const values = rows.map(r => r[name] ?? '')
    const nonNull = values.filter(v => v.trim() !== '')
    return {
      name,
      type: detectType(values),
      nullCount: values.length - nonNull.length,
      uniqueCount: new Set(nonNull).size,
      sampleValues: Array.from(new Set(nonNull)).slice(0, 5),
    }
  })
}

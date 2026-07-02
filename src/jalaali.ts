/**
 * Solar Hijri (Jalaali) ⇄ Gregorian conversion.
 *
 * This is a faithful TypeScript port of the well-known astronomical algorithm
 * by Behrang Noruzi Niya (the `jalaali-js` library), which itself derives from
 * Kazimierz M. Borkowski's work. It is accurate across the full supported year
 * range and is the same math relied on for official documents.
 *
 * The Afghan Solar Hijri calendar and the Iranian Solar Hijri calendar share an
 * identical astronomical structure (same leap-year rule, same year length); only
 * the month *names* differ. So this algorithm applies directly to Afghan dates.
 */

export interface JalaaliDate {
  jy: number
  jm: number
  jd: number
}

export interface GregorianDate {
  gy: number
  gm: number
  gd: number
}

/** Integer division, truncating toward zero. */
function div(a: number, b: number): number {
  return Math.trunc(a / b)
}

/** Modulo consistent with the truncating division above. */
function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b
}

interface JalCal {
  leap: number
  gy: number
  march: number
}

/**
 * Determine, for a given Jalaali year, the number of leap years since the epoch,
 * the corresponding Gregorian year, and the day-in-March on which that Jalaali
 * year begins.
 */
function jalCal(jy: number, withoutLeap: boolean): JalCal {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ]
  const bl = breaks.length
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]

  if (jy < jp || jy >= breaks[bl - 1]) {
    throw new Error('Invalid Jalaali year ' + jy)
  }

  let jump = 0
  let jm: number
  let n: number
  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  n = jy - jp

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG

  let leap = -1
  if (!withoutLeap) {
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33
    leap = mod(mod(n + 1, 33) - 1, 4)
    if (leap === -1) leap = 4
  }

  return { leap, gy, march }
}

/** Gregorian date → Julian Day Number. */
function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

/** Julian Day Number → Gregorian date. */
function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

/** Jalaali date → Julian Day Number. */
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy, true)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/** Julian Day Number → Jalaali date. */
function d2j(jdn: number): JalaaliDate {
  const gy = d2g(jdn).gy
  let jy = gy - 621
  const r = jalCal(jy, false)
  const jdn1f = g2d(gy, 3, r.march)
  let jd: number
  let jm: number
  let k = jdn - jdn1f

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return { jy, jm, jd }
    } else {
      k -= 186
    }
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return { jy, jm, jd }
}

/** Convert a Gregorian date to the Solar Hijri (Jalaali) calendar. */
export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate {
  return d2j(g2d(gy, gm, gd))
}

/** Convert a Solar Hijri (Jalaali) date to the Gregorian calendar. */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd))
}

/** True if the given Jalaali year is a leap year (has a 30-day Hut / month 12). */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy, true).leap === 0
}

/** Number of days in a given Jalaali month (1–12). */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isLeapJalaaliYear(jy) ? 30 : 29
}

/** True if (jy, jm, jd) is a valid Solar Hijri date. */
export function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean {
  return (
    jy >= -61 &&
    jy <= 3177 &&
    jm >= 1 &&
    jm <= 12 &&
    jd >= 1 &&
    jd <= jalaaliMonthLength(jy, jm)
  )
}

/** Afghan (Dari) month names of the Solar Hijri calendar, in order (index 0 = Hamal). */
export const AFGHAN_MONTHS = [
  'Hamal',
  'Sawr',
  'Jawza',
  'Saratan',
  'Asad',
  'Sunbula',
  'Mizan',
  'Aqrab',
  'Qaws',
  'Jadi',
  'Dalw',
  'Hut',
] as const

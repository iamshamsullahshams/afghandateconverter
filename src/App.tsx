import { useMemo, useState } from 'react'
import {
  AFGHAN_MONTHS,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
  type GregorianDate,
} from './jalaali'

const GREGORIAN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Weekday name for a Gregorian date, computed at UTC noon to avoid TZ drift. */
function weekdayOf({ gy, gm, gd }: GregorianDate): string {
  return WEEKDAYS[new Date(Date.UTC(gy, gm - 1, gd, 12)).getUTCDay()]
}

/** Today's Gregorian date in the user's local time zone. */
function todayGregorian(): GregorianDate {
  const now = new Date()
  return { gy: now.getFullYear(), gm: now.getMonth() + 1, gd: now.getDate() }
}

const MIN_YEAR = 1
const MAX_YEAR = 9999

export default function App() {
  // The Gregorian value is the single source of truth; the Afghan date is derived.
  const [greg, setGreg] = useState<GregorianDate>(todayGregorian)
  // Which calendar is shown first. false = Afghan first (default), true = Gregorian first.
  const [gregorianFirst, setGregorianFirst] = useState(false)

  const jalaali = useMemo(
    () => toJalaali(greg.gy, greg.gm, greg.gd),
    [greg.gy, greg.gm, greg.gd],
  )

  const weekday = useMemo(() => weekdayOf(greg), [greg])

  // --- Afghan (Solar Hijri) edits -------------------------------------------
  function setJalaali(jy: number, jm: number, jd: number) {
    // Clamp the day to the (possibly shorter) length of the chosen month/year.
    const maxDay = jalaaliMonthLength(jy, jm)
    const day = Math.min(Math.max(jd, 1), maxDay)
    setGreg(toGregorian(jy, jm, day))
  }

  function onJalaaliDay(e: React.ChangeEvent<HTMLSelectElement>) {
    setJalaali(jalaali.jy, jalaali.jm, Number(e.target.value))
  }
  function onJalaaliMonth(e: React.ChangeEvent<HTMLSelectElement>) {
    setJalaali(jalaali.jy, Number(e.target.value), jalaali.jd)
  }
  function onJalaaliYear(e: React.ChangeEvent<HTMLInputElement>) {
    const jy = Number(e.target.value)
    if (!Number.isFinite(jy) || jy < 1 || jy > 3177) return
    setJalaali(jy, jalaali.jm, jalaali.jd)
  }

  // --- Gregorian edits ------------------------------------------------------
  function onGregorianInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value // "yyyy-mm-dd"
    if (!value) return
    const [gy, gm, gd] = value.split('-').map(Number)
    if (!gy || !gm || !gd || gy < MIN_YEAR || gy > MAX_YEAR) return
    setGreg({ gy, gm, gd })
  }

  const jalaaliDayCount = jalaaliMonthLength(jalaali.jy, jalaali.jm)
  const gregorianInputValue = `${String(greg.gy).padStart(4, '0')}-${pad(
    greg.gm,
  )}-${pad(greg.gd)}`

  const afghanPanel = (
    <section className="panel" aria-labelledby="afghan-heading">
      <h2 id="afghan-heading" className="panel__title">
        Afghan <span className="panel__subtitle">Solar Hijri</span>
      </h2>

      <div className="fields">
        <label className="field">
          <span className="field__label">Day</span>
          <select
            className="field__control mono"
            value={jalaali.jd}
            onChange={onJalaaliDay}
            aria-label="Afghan day"
          >
            {Array.from({ length: jalaaliDayCount }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--month">
          <span className="field__label">Month</span>
          <select
            className="field__control"
            value={jalaali.jm}
            onChange={onJalaaliMonth}
            aria-label="Afghan month"
          >
            {AFGHAN_MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Year</span>
          <input
            className="field__control mono"
            type="number"
            inputMode="numeric"
            min={1}
            max={3177}
            value={jalaali.jy}
            onChange={onJalaaliYear}
            aria-label="Afghan year"
          />
        </label>
      </div>

      <p className="panel__result serif">
        {jalaali.jd} {AFGHAN_MONTHS[jalaali.jm - 1]} {jalaali.jy}
      </p>
    </section>
  )

  const gregorianPanel = (
    <section className="panel" aria-labelledby="gregorian-heading">
      <h2 id="gregorian-heading" className="panel__title">
        Gregorian <span className="panel__subtitle">Common Era</span>
      </h2>

      <div className="fields">
        <label className="field field--full">
          <span className="field__label">Date</span>
          <input
            className="field__control mono"
            type="date"
            min={`${String(MIN_YEAR).padStart(4, '0')}-01-01`}
            max={`${MAX_YEAR}-12-31`}
            value={gregorianInputValue}
            onChange={onGregorianInput}
            aria-label="Gregorian date"
          />
        </label>
      </div>

      <p className="panel__result serif">
        {greg.gd} {GREGORIAN_MONTHS[greg.gm - 1]} {greg.gy}
      </p>
    </section>
  )

  return (
    <>
      <header className="site-header">
        <div className="sun-motif" aria-hidden="true">
          <svg viewBox="0 0 120 60" width="120" height="60" role="presentation">
            <path
              d="M8 52 A52 52 0 0 1 112 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="60" cy="52" r="9" fill="currentColor" />
          </svg>
        </div>
        <h1 className="site-title serif">Afghan Date Converter</h1>
        <p className="site-tagline">
          Convert between the Afghan Solar Hijri calendar and the Gregorian
          calendar, instantly.
        </p>
      </header>

      <main>
        <div className="converter" role="group" aria-label="Date converter">
          {gregorianFirst ? gregorianPanel : afghanPanel}

          <button
            type="button"
            className="swap"
            onClick={() => setGregorianFirst((v) => !v)}
            aria-label="Swap which calendar is shown first"
            title="Swap"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M7 4 L3 8 L7 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 8 H18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M17 12 L21 16 L17 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 16 H6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {gregorianFirst ? afghanPanel : gregorianPanel}
        </div>

        <p className="weekday">
          <span className="weekday__label">This date falls on a</span>{' '}
          <strong className="serif">{weekday}</strong>
        </p>

        <section className="explainer" aria-labelledby="about-heading">
          <h2 id="about-heading" className="explainer__title serif">
            About the Solar Hijri calendar
          </h2>
          <p>
            The Solar Hijri calendar is the official calendar of Afghanistan, a
            solar calendar whose years are counted from the Prophet Muhammad's
            migration (Hijra) from Mecca to Medina in 622&nbsp;CE. Each year begins
            at the spring equinox (Nowruz) and is divided into twelve months —
            named in Afghanistan as Hamal, Sawr, Jawza, Saratan, Asad, Sunbula,
            Mizan, Aqrab, Qaws, Jadi, Dalw, and Hut — with the first six months
            having 31 days, the next five 30 days, and the last month 29 or 30 days
            in a leap year. Because it is astronomically anchored to the equinox
            rather than to lunar cycles, it stays precisely aligned with the
            seasons, making it one of the most accurate calendars in use today.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          AfghanDate is a free, independent tool. No accounts, no tracking — every
          conversion runs privately in your browser.
        </p>
      </footer>
    </>
  )
}

import { reactive } from 'vue'
import { setSeasonCrops } from '../data/crops'

export const gameState = reactive({
  day: 1,
  season: 'spring',
  minutes: 8 * 60,
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  experience: 0,
  totalFish: 0,
  totalHarvest: 0,
  inventory: {
    seed_potato: 3,
    potato: 0,
    fish_roach: 0,
    fish_carp: 0,
    fish_trout: 0,
    golden_fish: 0,
    stone: 0,
    shell: 0,
    tea: 0
  },
  discovered: ['seed_potato'],
  achievements: [],
  relationships: {
    mira: 0,
    kai: 0,
    luna: 0,
    old_bob: 0
  },
  farm: [
    { id: 1, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 2, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 3, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 4, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 5, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 6, crop: null, plantedDay: 0, readyDay: 0 }
  ],
  log: []
})

const seasons = ['spring', 'summer', 'fall', 'winter']

export function getSeasonForDay(day) {
  return seasons[Math.floor((day - 1) / 28) % 4]
}

export function getSeasonDay(day) {
  return ((day - 1) % 28) + 1
}

export function addLog(text) {
  gameState.log.unshift({ day: gameState.day, text })
  gameState.log = gameState.log.slice(0, 20)
}

export function discover(id) {
  if (!gameState.discovered.includes(id)) gameState.discovered.push(id)
}

export function addItem(id, count = 1) {
  gameState.inventory[id] = (gameState.inventory[id] || 0) + count
  discover(id)
}

export function gainExperience(value) {
  gameState.experience += value
  while (gameState.experience >= gameState.level * 100) {
    gameState.experience -= gameState.level * 100
    gameState.level++
    gameState.maxEnergy += 5
    gameState.energy = gameState.maxEnergy
    addLog(`你提升到了 Lv.${gameState.level}。`)
  }
}

export function syncSeason() {
  const season = getSeasonForDay(gameState.day)
  gameState.season = season
  setSeasonCrops(season)
}

export function advanceDay() {
  const previousSeason = gameState.season
  gameState.day++
  gameState.season = getSeasonForDay(gameState.day)
  setSeasonCrops(gameState.season)

  if (gameState.season !== previousSeason) {
    for (const plot of gameState.farm) {
      if (plot.crop) {
        plot.crop = null
        plot.plantedDay = 0
        plot.readyDay = 0
      }
    }
    const name = { spring: '春季', summer: '夏季', fall: '秋季', winter: '冬季' }[gameState.season]
    addLog(`进入了${name}。上一季未收获的作物已经枯萎。`)
  }
}

syncSeason()

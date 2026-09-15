import { reactive } from 'vue'
import { setSeasonCrops } from '../data/crops'

const seasons = ['spring', 'summer', 'fall', 'winter']
const seasonNames = { spring: '春季', summer: '夏季', fall: '秋季', winter: '冬季' }
const makePlots = () => Array.from({ length: 12 }, (_, i) => ({ id: i + 1, crop: null, plantedDay: 0, readyDay: 0, watered: false, greenhouse: false }))

export const gameState = reactive({
  year: 1, day: 1, season: 'spring', minutes: 8 * 60,
  gold: 500, totalEarnings: 0, energy: 100, maxEnergy: 100, health: 100, maxHealth: 100,
  level: 1, experience: 0, totalFish: 0, totalHarvest: 0,
  weather: 'sunny', luck: 0.02,
  skills: {
    farming: { level: 0, xp: 0, mastery: 0, profession: null },
    fishing: { level: 0, xp: 0, mastery: 0, profession: null },
    foraging: { level: 0, xp: 0, mastery: 0, profession: null },
    mining: { level: 0, xp: 0, mastery: 0, profession: null },
    combat: { level: 0, xp: 0, mastery: 0, profession: null }
  },
  mastery: { points: 0, unlocked: [] },
  inventory: { seed_potato: 3, potato: 0, fish_roach: 0, fish_carp: 0, fish_trout: 0, golden_fish: 0, stone: 10, wood: 20, fiber: 10, coal: 2, copper_ore: 0, iron_ore: 0, gold_ore: 0, crystal: 0, shell: 0, tea: 0, egg: 0, milk: 0, mayonnaise: 0, cheese: 0 },
  discovered: ['seed_potato'], achievements: [],
  relationships: { mira: 0, kai: 0, luna: 0, old_bob: 0 },
  animals: [], buildings: { coop: 0, barn: 0, silo: 0, stable: 0, greenhouse: false, house: 1 },
  machines: [], recipes: [], cooked: [], museum: [], bundles: {}, quests: [], completedQuests: [],
  festivals: {}, specialOrders: [], books: [], buffs: [], qiGems: 0, goldenWalnuts: 0, islandUnlocked: false, islandProgress: 0,
  mineFloor: 0, skullFloor: 0, volcanoFloor: 0, busRepaired: false, sewerUnlocked: false, communityCenter: 0, joja: false,
  pet: { type: null, friendship: 0 }, log: [], farm: makePlots()
})

export function getSeasonForDay(day) { return seasons[Math.floor((day - 1) / 28) % 4] }
export function getSeasonDay(day) { return ((day - 1) % 28) + 1 }
export function addLog(text) { gameState.log.unshift({ day: gameState.day, text }); gameState.log = gameState.log.slice(0, 40) }
export function discover(id) { if (id && !gameState.discovered.includes(id)) gameState.discovered.push(id) }
export function addItem(id, count = 1) { gameState.inventory[id] = (gameState.inventory[id] || 0) + count; if (count > 0) discover(id) }
export function removeItem(id, count = 1) { if ((gameState.inventory[id] || 0) < count) return false; gameState.inventory[id] -= count; return true }
export function gainGold(value) { gameState.gold += value; if (value > 0) gameState.totalEarnings += value }
export function gainExperience(value) { gameState.experience += value; while (gameState.experience >= gameState.level * 100) { gameState.experience -= gameState.level * 100; gameState.level++; gameState.maxEnergy += 5; gameState.energy = gameState.maxEnergy; addLog(`你提升到了总等级 Lv.${gameState.level}。`) } }

export function gainSkill(skill, value) {
  const s = gameState.skills[skill]; if (!s) return
  s.xp += value
  const thresholds = [100, 280, 390, 530, 850, 1150, 1500, 2100, 3100, 5000]
  while (s.level < 10 && s.xp >= thresholds[s.level]) { s.xp -= thresholds[s.level]; s.level++; addLog(`${skillName(skill)} 达到 Lv.${s.level}。`) }
  if (Object.values(gameState.skills).every(x => x.level >= 10)) gameState.mastery.points += Math.floor(value * (skill === 'farming' ? 0.5 : 1))
}
export function skillName(skill) { return { farming: '耕种', fishing: '钓鱼', foraging: '采集', mining: '采矿', combat: '战斗' }[skill] || skill }

function clearSeasonalFarm() {
  for (const plot of gameState.farm) if (!plot.greenhouse && plot.crop) { plot.crop = null; plot.plantedDay = 0; plot.readyDay = 0; plot.watered = false }
}
export function syncSeason() {
  const season = getSeasonForDay(gameState.day); gameState.season = season; gameState.year = Math.floor((gameState.day - 1) / 112) + 1; setSeasonCrops(season)
}
export function advanceDay() {
  const previous = gameState.season
  gameState.day++; gameState.minutes = 8 * 60; gameState.energy = gameState.maxEnergy; gameState.health = gameState.maxHealth
  gameState.year = Math.floor((gameState.day - 1) / 112) + 1; gameState.season = getSeasonForDay(gameState.day); setSeasonCrops(gameState.season)
  if (gameState.season !== previous) { clearSeasonalFarm(); addLog(`进入了${seasonNames[gameState.season]}。季节作物已更新。`) }
  for (const plot of gameState.farm) plot.watered = false
  for (const animal of gameState.animals) animal.fed = false
  gameState.weather = Math.random() < 0.18 ? 'rain' : Math.random() < 0.08 ? 'storm' : 'sunny'
  if (gameState.pet.type) gameState.pet.friendship = Math.min(1000, gameState.pet.friendship + 5)
}

syncSeason()

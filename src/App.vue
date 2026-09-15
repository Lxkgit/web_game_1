<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { gameState as state, addItem, addLog, discover, gainExperience, advanceDay, syncSeason, getSeasonDay } from './stores/game'
import { items, getItem } from './data/items'
import { crops, allCrops, seasonNames, seasonIcons, getCrop } from './data/crops'
import { fish } from './data/fish'
import { achievements as achievementData } from './data/achievements'
import { npcs } from './data/npcs'
import { events } from './data/events'
import { saveGame, loadGame } from './utils/storage'

const currentPage = ref('home')
const message = ref('新的生活开始了。')
const event = ref(null)

const navItems = [
  ['home', '🏠', '家园'], ['farm', '🌱', '农场'], ['fishing', '🎣', '钓鱼'],
  ['shop', '🛒', '商店'], ['collection', '📖', '图鉴'], ['achievement', '🏆', '成就'],
  ['people', '👥', '人物'], ['bag', '🎒', '背包'], ['status', '📊', '状态']
]

const pageMeta = {
  home: ['家园', '安排今天的生活。每一天都会产生新的故事。'],
  farm: ['农场', '每个季节都有自己的作物，28 天后自动进入下一季。'],
  fishing: ['钓鱼', '不同鱼类拥有不同稀有度，稀有鱼值得收藏。'],
  shop: ['商店', '只出售当前季节可以正常购买的作物种子。'],
  collection: ['图鉴', '发现过的物品永久记录，换季也不会丢失。'],
  achievement: ['成就', '长期目标会给你的生活提供持续动力。'],
  people: ['人物', '认识邻居，提高好感度，解锁更多故事。'],
  bag: ['背包', '查看、出售当前拥有的物品。'],
  status: ['状态', '查看等级、经验、季节与生活记录。']
}

const season = computed(() => state.season)
const seasonName = computed(() => seasonNames[state.season])
const seasonIcon = computed(() => seasonIcons[state.season])
const seasonDay = computed(() => getSeasonDay(state.day))
const timeText = computed(() => `${String(Math.floor(state.minutes / 60) % 24).padStart(2, '0')}:${String(state.minutes % 60).padStart(2, '0')}`)
const pageTitle = computed(() => pageMeta[currentPage.value][0])
const pageSub = computed(() => pageMeta[currentPage.value][1])
const discoveredCount = computed(() => state.discovered.length)
const readyCrops = computed(() => state.farm.filter(x => x.crop && x.readyDay <= state.day).length)
const shopCrops = computed(() => crops.filter(c => c.seedPrice > 0 && !c.special))

const achievementList = computed(() => achievementData.map(a => {
  const value = { days: state.day, fish: state.totalFish, collection: discoveredCount.value, gold: state.gold, harvest: state.totalHarvest, legendary: state.inventory.golden_fish > 0 ? 1 : 0 }[a.type] || 0
  return { ...a, value, done: value >= a.target }
}))

const bagItems = computed(() => items.filter(item => (state.inventory[item.id] || 0) > 0))

function showPage(page) { currentPage.value = page }
function spend(cost) {
  if (state.energy < cost) { message.value = '体力不足，今天先休息吧。'; return false }
  state.energy -= cost
  return true
}
function gainGold(value) { state.gold += value }

function plant(plot, crop) {
  if (plot.crop) return
  if (!state.inventory[crop.seed]) { message.value = `你没有${crop.name}种子。`; return }
  if (!spend(crop.energy)) return
  state.inventory[crop.seed]--
  plot.crop = crop.id
  plot.plantedDay = state.day
  plot.readyDay = state.day + crop.days
  discover(crop.id)
  gainExperience(12)
  state.minutes += 30
  addLog(`第 ${state.day} 天种下了 ${crop.name}。`)
  message.value = `${crop.name} 已种下，预计第 ${plot.readyDay} 天成熟。`
}

function harvest(plot) {
  if (!plot.crop || plot.readyDay > state.day) return
  const crop = getCrop(plot.crop)
  if (!crop) return
  addItem(crop.id)
  state.totalHarvest++
  gainExperience(20)
  if (crop.regrow) {
    plot.readyDay = state.day + crop.regrow
    message.value = `${crop.name} 收获完成，它还会继续生长，第 ${plot.readyDay} 天再次成熟。`
  } else {
    plot.crop = null
    plot.plantedDay = 0
    plot.readyDay = 0
    message.value = `收获了 ${crop.name}。可以出售，也可以留作收藏。`
  }
}

function chooseFish() {
  const roll = Math.random() * 100
  let total = 0
  for (const item of fish) { total += item.chance; if (roll <= total) return item }
  return fish[0]
}

function goFishing() {
  if (!spend(12)) return
  state.minutes += 45
  const caught = chooseFish()
  addItem(caught.id)
  state.totalFish++
  gainExperience(caught.rarity === 'legendary' ? 50 : 15)
  message.value = caught.rarity === 'legendary' ? `✨ 传说！你钓到了 ${caught.name}！` : `🎣 钓到了 ${caught.name}（${rarityName(caught.rarity)}）。`
  if (Math.random() < 0.25) addItem('shell')
}

function rarityName(value) { return { common: '普通', uncommon: '稀有', rare: '珍稀', legendary: '传说' }[value] || value }

function buy(item) {
  if (state.gold < item.seedPrice) return
  state.gold -= item.seedPrice
  addItem(item.seed)
  message.value = `购买了 ${item.name}种子。`
}

function sell(id) {
  const count = state.inventory[id] || 0
  const item = getItem(id)
  if (!count || !item?.sellPrice) return
  state.inventory[id]--
  gainGold(item.sellPrice)
  message.value = `出售 ${item.name}，获得 ${item.sellPrice} G。`
}

function talk(npc) {
  state.relationships[npc.id] = Math.min(100, state.relationships[npc.id] + 5)
  state.minutes += 20
  addLog(`和 ${npc.name} 聊了一会儿。`)
  message.value = `${npc.name} 对你的好感度 +5。`
}

function triggerEvent() {
  const total = events.reduce((sum, x) => sum + x.weight, 0)
  let roll = Math.random() * total
  for (const item of events) { roll -= item.weight; if (roll <= 0) { event.value = item; return } }
}

function applyEvent() {
  if (!event.value) return
  const effect = event.value.effect
  if (effect.gold) gainGold(effect.gold)
  if (effect.energy) state.energy = Math.max(0, Math.min(state.maxEnergy, state.energy + effect.energy))
  if (effect.collection) discover(effect.collection)
  if (effect.item) addItem(effect.item)
  message.value = `${event.value.icon} ${event.value.name}：${event.value.text}`
  addLog(`${event.value.name}：${event.value.text}`)
  event.value = null
}

function endDay() {
  const farmReady = readyCrops.value
  const oldSeason = state.season
  advanceDay()
  state.minutes = 8 * 60
  state.energy = state.maxEnergy
  state.gold += 50
  const changed = oldSeason !== state.season
  message.value = changed ? `季节更替：现在是${seasonNames[state.season]}。生活补贴 +50 G。` : farmReady ? `新的一天开始了。生活补贴 +50 G，有 ${farmReady} 块作物成熟了。` : '新的一天开始了。生活补贴 +50 G。'
  triggerEvent()
  currentPage.value = 'home'
}

function progressWidth(a) { return `${Math.min(100, a.value / a.target * 100)}%` }

onMounted(() => {
  loadGame(state)
  syncSeason()
  message.value = state.day > 1 ? `欢迎回来，现在是${seasonNames[state.season]}第 ${seasonDay.value} 天。` : '新的生活开始了。'
})
watch(state, () => saveGame(state), { deep: true })
</script>

<template>
  <div class="game-shell">
    <header class="topbar">
      <div><div class="logo">四季物语</div><div class="subtitle">一个只需要点击的单机养成世界</div></div>
      <div class="top-stats"><span>{{ seasonIcon }} <b>{{ seasonName }}</b> 第 <b>{{ seasonDay }}</b> 天</span><span>🕘 <b>{{ timeText }}</b></span><span>💰 <b>{{ state.gold }}</b> G</span></div>
    </header>
    <main class="layout">
      <aside class="sidebar">
        <button v-for="item in navItems" :key="item[0]" class="nav" :class="{active: currentPage === item[0]}" @click="showPage(item[0])"><span>{{ item[1] }}</span><span>{{ item[2] }}</span></button>
        <div class="side-bottom"><div class="energy-label"><span>体力</span><b>{{ state.energy }} / {{ state.maxEnergy }}</b></div><div class="energy"><i :style="{width: `${state.energy / state.maxEnergy * 100}%`}"></i></div><button class="end-day" @click="endDay">🌙 结束今天</button></div>
      </aside>
      <section class="content">
        <div class="page-title"><div><h1>{{ pageTitle }}</h1><p>{{ pageSub }}</p></div><span class="badge">{{ seasonIcon }} {{ seasonName }}</span></div>
        <div class="notice">🌿 {{ message }}</div>

        <template v-if="currentPage === 'home'">
          <div class="grid"><div class="card"><h3>今日状态</h3><div class="big-number">{{ state.energy }}</div><p>剩余体力</p></div><div class="card"><h3>冒险者</h3><div class="big-number">Lv. {{ state.level }}</div><p>经验 {{ state.experience }} / {{ state.level * 100 }}</p></div><div class="card"><h3>季节进度</h3><div class="big-number">{{ seasonDay }} / 28</div><p>{{ seasonIcon }} {{ seasonName }} · 第 {{ state.day }} 天</p></div></div>
          <div class="card action-card"><h3>今天做什么？</h3><div class="actions"><button class="action" @click="showPage('farm')"><span class="emoji">🌱</span><strong>照料农场</strong><small>{{ crops.length }} 种本季作物</small></button><button class="action" @click="showPage('fishing')"><span class="emoji">🎣</span><strong>去河边钓鱼</strong><small>寻找稀有鱼</small></button><button class="action" @click="showPage('people')"><span class="emoji">👥</span><strong>拜访邻居</strong><small>提升人物好感</small></button><button class="action" @click="showPage('collection')"><span class="emoji">📖</span><strong>研究图鉴</strong><small>收藏永久保存</small></button><button class="action" @click="showPage('achievement')"><span class="emoji">🏆</span><strong>完成成就</strong><small>获取长期奖励</small></button><button class="action" @click="showPage('shop')"><span class="emoji">🛒</span><strong>逛商店</strong><small>购买 {{ shopCrops.length }} 种种子</small></button></div></div>
          <div class="card log-card"><h3>📜 最近发生的事</h3><div v-if="state.log.length" class="list"><div v-for="(log,index) in state.log.slice(0,5)" :key="index" class="row"><div>📌</div><div class="row-main"><b>第 {{ log.day }} 天</b><div class="row-desc">{{ log.text }}</div></div></div></div><p v-else>还没有记录。</p></div>
        </template>

        <template v-else-if="currentPage === 'farm'">
          <div class="card" style="margin-bottom:16px"><h3>{{ seasonIcon }} {{ seasonName }}作物</h3><p>本季共有 {{ crops.length }} 种作物。换季时未成熟作物会枯萎，连作作物收获后会继续生长。</p></div>
          <div class="grid crop-grid"><div v-for="plot in state.farm" :key="plot.id" class="card plot"><div class="plot-number">田地 {{ plot.id }}</div><div v-if="plot.crop" class="crop-icon">{{ getCrop(plot.crop)?.icon }}</div><div v-else class="crop-icon empty">＋</div><h3>{{ plot.crop ? getCrop(plot.crop)?.name : '空闲土地' }}</h3><p v-if="plot.crop && plot.readyDay > state.day">第 {{ plot.readyDay }} 天成熟</p><p v-else-if="plot.crop">已经成熟，可以收获。</p><p v-else>选择作物种植。</p><button v-if="plot.crop && plot.readyDay <= state.day" class="primary-btn" @click="harvest(plot)">收获</button><div v-else-if="!plot.crop" class="crop-buttons"><button v-for="crop in crops" :key="crop.id" class="buy-btn" :disabled="!state.inventory[crop.seed]" @click="plant(plot,crop)">{{ crop.icon }} {{ crop.name }}<small> ×{{ state.inventory[crop.seed] || 0 }}</small></button></div></div></div>
        </template>

        <template v-else-if="currentPage === 'fishing'"><div class="card fishing-card"><div class="fishing-hero">🌊</div><h2>宁静河畔</h2><p>每次钓鱼消耗 12 体力。鱼类越稀有，经验和售价越高。</p><button class="primary-btn" @click="goFishing">🎣 抛竿</button></div><div class="card fish-table"><h3>鱼类图鉴</h3><div class="list"><div v-for="f in fish" :key="f.id" class="row"><div class="item-icon">{{ state.discovered.includes(f.id) ? f.icon : '?' }}</div><div class="row-main"><b>{{ state.discovered.includes(f.id) ? f.name : '未知鱼类' }}</b><div class="row-desc">{{ rarityName(f.rarity) }} · 售价 {{ f.sellPrice }} G</div></div><b>x{{ state.inventory[f.id] || 0 }}</b></div></div></div></template>

        <template v-else-if="currentPage === 'shop'"><div class="card"><h3>{{ seasonIcon }} {{ seasonName }}种子商店</h3><p>商店根据季节自动切换。特殊作物不会在这里直接出售种子。</p></div><div class="list" style="margin-top:16px"><div v-for="shop in shopCrops" :key="shop.id" class="row"><div class="item-icon">{{ shop.icon }}</div><div class="row-main"><b>{{ shop.name }}种子</b><div class="row-desc">成熟 {{ shop.days }} 天 · 收获售价 {{ shop.sellPrice }} G{{ shop.regrow ? ` · 每 ${shop.regrow} 天再生` : '' }}</div></div><b>{{ shop.seedPrice }} G</b><button class="buy-btn" :disabled="state.gold < shop.seedPrice" @click="buy(shop)">购买</button></div></div></template>

        <template v-else-if="currentPage === 'collection'"><div class="card"><h3>📖 收藏进度</h3><p>{{ discoveredCount }} / {{ items.length }} 种物品已发现。出售后仍会保留图鉴记录。</p></div><div class="collection-grid" style="margin-top:16px"><div v-for="item in items" :key="item.id" class="collection-item" :class="{locked: !state.discovered.includes(item.id)}"><span>{{ state.discovered.includes(item.id) ? item.icon : '❔' }}</span><b>{{ state.discovered.includes(item.id) ? item.name : '未知' }}</b></div></div></template>

        <template v-else-if="currentPage === 'achievement'"><div class="list"><div v-for="a in achievementList" :key="a.id" class="row"><div class="item-icon">{{ a.icon }}</div><div class="row-main"><b>{{ a.name }} <span v-if="a.done">✓</span></b><div class="row-desc">{{ a.desc }} · 奖励 {{ a.reward }} G</div><div class="progress"><i :style="{width: progressWidth(a)}"></i></div></div><b>{{ Math.min(a.value, a.target) }} / {{ a.target }}</b></div></div></template>

        <template v-else-if="currentPage === 'people'"><div class="grid"><div v-for="npc in npcs" :key="npc.id" class="card"><div class="crop-icon">{{ npc.icon }}</div><h3>{{ npc.name }}</h3><p>{{ npc.role }}</p><p>{{ npc.intro }}</p><div class="progress"><i :style="{width: `${state.relationships[npc.id]}%`}"></i></div><p>好感度 {{ state.relationships[npc.id] }} / 100</p><button class="primary-btn" @click="talk(npc)">💬 聊天</button></div></div></template>

        <template v-else-if="currentPage === 'bag'"><div class="list"><div v-for="item in bagItems" :key="item.id" class="row"><div class="item-icon">{{ item.icon }}</div><div class="row-main"><b>{{ item.name }}</b><div class="row-desc">{{ item.category }} · 售价 {{ item.sellPrice || 0 }} G</div></div><b>x{{ state.inventory[item.id] }}</b><button v-if="item.sellPrice" class="buy-btn" @click="sell(item.id)">出售</button></div></div><p v-if="!bagItems.length">背包还是空的。</p></template>

        <template v-else-if="currentPage === 'status'"><div class="grid"><div class="card"><h3>季节</h3><div class="big-number">{{ seasonIcon }}</div><p>{{ seasonName }}第 {{ seasonDay }} 天 / 总第 {{ state.day }} 天</p></div><div class="card"><h3>等级</h3><div class="big-number">Lv. {{ state.level }}</div><p>经验 {{ state.experience }} / {{ state.level * 100 }}</p></div><div class="card"><h3>统计</h3><p>钓鱼：{{ state.totalFish }}</p><p>收获：{{ state.totalHarvest }}</p><p>收藏：{{ discoveredCount }}</p></div></div><div class="card"><h3>四季农作物总览</h3><div class="list"><div v-for="s in ['spring','summer','fall','winter']" :key="s" class="row"><div class="item-icon">{{ seasonIcons[s] }}</div><div class="row-main"><b>{{ seasonNames[s] }}</b><div class="row-desc">{{ allCrops.filter(c => c.season.includes(s)).length }} 种作物</div></div><button class="buy-btn" @click="state.season = s">查看</button></div></div></div></template>
      </section>
    </main>
    <div v-if="event" class="modal-mask"><div class="event-modal"><div class="event-icon">{{ event.icon }}</div><h2>{{ event.name }}</h2><p>{{ event.text }}</p><button class="primary-btn" @click="applyEvent">收下这份惊喜</button></div></div>
  </div>
</template>

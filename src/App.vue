<script setup>
import { computed, reactive, ref } from 'vue'

const state = reactive({
  day: 1,
  minutes: 8 * 60,
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  inventory: { seed: 3, potato: 0, fish: 0, stone: 0, tea: 0 },
  collection: new Set(['seed']),
  achievements: {
    firstDay: false,
    firstFish: false
  }
})

const currentPage = ref('home')
const message = ref('今天的风很舒服。')

const navItems = [
  ['home', '🏠', '家园'], ['farm', '🌱', '农场'], ['fishing', '🎣', '钓鱼'],
  ['shop', '🛒', '商店'], ['collection', '📖', '图鉴'], ['achievement', '🏆', '成就'],
  ['bag', '🎒', '背包'], ['status', '📊', '状态']
]

const collectionItems = [
  ['seed', '🌱', '土豆种子'], ['potato', '🥔', '土豆'], ['fish', '🐟', '溪鱼'],
  ['stone', '🪨', '石头'], ['tea', '🍵', '神秘茶叶'], ['crystal', '💎', '月光晶'],
  ['mushroom', '🍄', '红伞菇'], ['flower', '🌷', '春日郁金香'], ['butterfly', '🦋', '蓝翅蝶'],
  ['gem', '🔮', '未知宝石'], ['shell', '🐚', '河贝'], ['egg', '🥚', '野鸡蛋']
]

const achievements = computed(() => [
  ['🌅', '第一天', '完成第 1 天的生活', state.day > 1, 1, Math.max(0, state.day - 1)],
  ['🎣', '初次垂钓', '成功钓到第一条鱼', state.achievements.firstFish, 1, state.achievements.firstFish ? 1 : 0],
  ['💰', '小有积蓄', '持有 1000 G', state.gold >= 1000, 1000, state.gold],
  ['📖', '收藏家', '发现 6 种不同物品', state.collection.size >= 6, 6, state.collection.size],
  ['🏆', '富足生活', '持有 2000 G', state.gold >= 2000, 2000, state.gold]
])

const pageMeta = {
  home: ['家园', '今天也可以慢慢生活。你的每一个选择都会留下痕迹。'],
  farm: ['农场', '没有移动，没有复杂操作。选择一块田，然后点击行动。'],
  fishing: ['钓鱼', '每次垂钓都会有随机收获，首次发现的新鱼会进入永久图鉴。'],
  shop: ['商店', '买东西不是目的，让生活变得更有趣才是。'],
  collection: ['图鉴', '背包里的东西可以卖掉，但发现过的东西不会从图鉴消失。'],
  achievement: ['成就', '游戏不是只有赚钱。慢慢完成这些长期目标，你会发现这个世界越来越完整。'],
  bag: ['背包', '当前拥有的物品。卖掉物品不会影响已经解锁的图鉴。'],
  status: ['状态', '你正在逐渐变强。Demo 阶段先展示基础成长框架。']
}

const pageTitle = computed(() => pageMeta[currentPage.value][0])
const pageSub = computed(() => pageMeta[currentPage.value][1])
const timeText = computed(() => {
  const h = Math.floor(state.minutes / 60) % 24
  const m = state.minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})
const collectionCount = computed(() => state.collection.size)

function showPage(page) {
  currentPage.value = page
}

function spend(cost) {
  if (state.energy < cost) {
    message.value = '体力不足，今天先休息吧。'
    return false
  }
  state.energy -= cost
  return true
}

function farmPlant() {
  if (state.inventory.seed <= 0) {
    message.value = '没有种子了，可以去商店购买。'
    return
  }
  if (!spend(10)) return
  state.inventory.seed--
  state.inventory.potato++
  state.collection.add('potato')
  state.minutes += 40
  message.value = '你种下一颗土豆，期待它慢慢长大。'
}

function fish() {
  if (!spend(12)) return
  state.inventory.fish++
  state.collection.add('fish')
  state.minutes += 50
  state.achievements.firstFish = true
  if (Math.random() < 0.35) {
    state.collection.add('shell')
    message.value = '钓到一条溪鱼，还发现了河贝！'
  } else {
    message.value = '今天的收获不错，钓到了一条溪鱼。'
  }
}

function buy(key, price) {
  if (state.gold < price) return
  state.gold -= price
  state.inventory[key] = (state.inventory[key] || 0) + 1
  state.collection.add(key)
  message.value = `购买了 ${itemName(key)}。`
}

function itemName(key) {
  return collectionItems.find(item => item[0] === key)?.[2] || key
}

function endDay() {
  state.day++
  state.minutes = 8 * 60
  state.energy = state.maxEnergy
  state.gold += 50
  state.achievements.firstDay = true
  message.value = '新的一天开始了，生活补贴 +50 G。'
  currentPage.value = 'home'
}
</script>

<template>
  <div class="game-shell">
    <header class="topbar">
      <div>
        <div class="logo">四季物语</div>
        <div class="subtitle">一个只需要点击的单机养成世界</div>
      </div>
      <div class="top-stats">
        <span>☀️ 第 <b>{{ state.day }}</b> 天</span>
        <span>🌱 春季</span>
        <span>🕘 <b>{{ timeText }}</b></span>
        <span>💰 <b>{{ state.gold }}</b> G</span>
      </div>
    </header>

    <main class="layout">
      <aside class="sidebar">
        <button v-for="item in navItems" :key="item[0]" class="nav" :class="{ active: currentPage === item[0] }" @click="showPage(item[0])">
          <span>{{ item[1] }}</span><span>{{ item[2] }}</span>
        </button>
        <div class="side-bottom">
          <div class="energy-label"><span>体力</span><b>{{ state.energy }} / {{ state.maxEnergy }}</b></div>
          <div class="energy"><i :style="{ width: `${state.energy / state.maxEnergy * 100}%` }"></i></div>
          <button class="end-day" @click="endDay">🌙 结束今天</button>
        </div>
      </aside>

      <section class="content">
        <div class="page-title">
          <div><h1>{{ pageTitle }}</h1><p>{{ pageSub }}</p></div>
          <span class="badge">Vue · Vite · Demo</span>
        </div>

        <div class="notice">🌿 {{ message }}</div>

        <template v-if="currentPage === 'home'">
          <div class="grid">
            <div class="card"><h3>今日状态</h3><div class="big-number">{{ state.energy }}</div><p>剩余体力</p></div>
            <div class="card"><h3>钱包</h3><div class="big-number">{{ state.gold }} G</div><p>努力赚钱，然后把钱花掉。</p></div>
            <div class="card"><h3>收藏进度</h3><div class="big-number">{{ collectionCount }} / 12</div><p>发现过的物品会永久记录在图鉴中。</p></div>
          </div>
          <div class="card action-card"><h3>今天做什么？</h3><div class="actions">
            <button class="action" @click="showPage('farm')"><span class="emoji">🌱</span><strong>照料农场</strong><small>消耗 10 体力</small></button>
            <button class="action" @click="showPage('fishing')"><span class="emoji">🎣</span><strong>去河边钓鱼</strong><small>消耗 12 体力</small></button>
            <button class="action" @click="showPage('shop')"><span class="emoji">🛒</span><strong>逛逛商店</strong><small>可以买种子和材料</small></button>
            <button class="action" @click="showPage('collection')"><span class="emoji">📖</span><strong>查看图鉴</strong><small>看看还有什么没发现</small></button>
            <button class="action" @click="showPage('achievement')"><span class="emoji">🏆</span><strong>查看成就</strong><small>长期目标与奖励</small></button>
            <button class="action" @click="showPage('bag')"><span class="emoji">🎒</span><strong>整理背包</strong><small>查看当前拥有的东西</small></button>
          </div></div>
        </template>

        <template v-else-if="currentPage === 'farm'">
          <div class="grid">
            <div class="card"><h3>🌱 小菜地</h3><p>种子：{{ state.inventory.seed }} 个</p><button class="primary-btn" @click="farmPlant">种下一颗土豆（10 体力）</button></div>
            <div class="card"><h3>🥔 当前土豆</h3><div class="big-number">{{ state.inventory.potato }}</div><p>当前 Demo 中先记录种植结果，后续加入成长周期与收获。</p></div>
            <div class="card"><h3>🌦️ 季节</h3><div class="big-number">春</div><p>后续加入四季、天气、作物成长周期。</p></div>
          </div>
        </template>

        <template v-else-if="currentPage === 'fishing'">
          <div class="card"><h3>🎣 河边</h3><p>安静坐下，等待鱼咬钩。</p><button class="primary-btn" @click="fish">抛竿（12 体力）</button><div class="list fishing-list"><div class="row"><div>🐟</div><div class="row-main"><b>溪鱼</b><div class="row-desc">已经钓到 {{ state.inventory.fish }} 条</div></div></div><div class="row"><div>🐚</div><div class="row-main"><b>河贝</b><div class="row-desc">{{ state.collection.has('shell') ? '已经发现' : '还有机会发现' }}</div></div></div></div></div>
        </template>

        <template v-else-if="currentPage === 'shop'">
          <div class="list">
            <div v-for="item in [['seed','🌱','土豆种子','种下后可获得土豆',20],['stone','🪨','石头','基础材料，后续可用于制作',10],['tea','🍵','神秘茶叶','收藏品，暂时没有实际用途',80]]" :key="item[0]" class="row">
              <div class="item-icon">{{ item[1] }}</div><div class="row-main"><div class="row-title">{{ item[2] }}</div><div class="row-desc">{{ item[3] }}</div></div><b>{{ item[4] }} G</b><button class="buy-btn" :disabled="state.gold < item[4]" @click="buy(item[0], item[4])">购买</button>
            </div>
          </div>
        </template>

        <template v-else-if="currentPage === 'collection'">
          <div class="card"><div class="item-grid"><div v-for="item in collectionItems" :key="item[0]" class="item" :class="{ locked: !state.collection.has(item[0]) }"><div class="icon">{{ state.collection.has(item[0]) ? item[1] : '?' }}</div><b>{{ state.collection.has(item[0]) ? item[2] : '尚未发现' }}</b><small>{{ state.collection.has(item[0]) ? '已发现' : '探索后解锁' }}</small></div></div></div>
        </template>

        <template v-else-if="currentPage === 'achievement'">
          <div class="list"><div v-for="a in achievements" :key="a[1]" class="row" :class="{ locked: !a[3] }"><div class="achievement-icon">{{ a[0] }}</div><div class="row-main"><div class="row-title">{{ a[1] }} <span v-if="a[3]" class="badge">已完成</span></div><div class="row-desc">{{ a[2] }}</div><div class="progress"><i :style="{ width: `${Math.min(100, a[5] / a[4] * 100)}%` }"></i></div></div></div></div>
        </template>

        <template v-else-if="currentPage === 'bag'">
          <div class="list"><div v-for="item in collectionItems.slice(0, 5)" :key="item[0]" class="row"><div class="item-icon">{{ item[1] }}</div><div class="row-main"><div class="row-title">{{ item[2] }}</div><div class="row-desc">当前拥有 {{ state.inventory[item[0]] || 0 }} 个</div></div><b>x{{ state.inventory[item[0]] || 0 }}</b></div></div>
        </template>

        <template v-else-if="currentPage === 'status'">
          <div class="grid"><div class="card"><h3>🧑 冒险者</h3><p>等级</p><div class="big-number">Lv. 1</div></div><div class="card"><h3>❤️ 生活</h3><p>连续生活天数</p><div class="big-number">{{ state.day }}</div></div><div class="card"><h3>📚 百科</h3><p>已发现物品</p><div class="big-number">{{ collectionCount }} / 12</div></div></div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { gameState as state, addItem, removeItem, gainGold, gainExperience, gainSkill, addLog, discover, advanceDay, syncSeason, getSeasonDay, skillName } from './stores/game'
import { crops, allCrops, getCrop, seasonNames, seasonIcons } from './data/crops'
import { items, getItem } from './data/items'
import { fish } from './data/fish'
import { npcs } from './data/npcs'
import { saveGame, loadGame } from './utils/storage'

const currentPage = ref('home')
const message = ref('新的生活开始了。')
const selectedNpc = ref(null)
const selectedRecipe = ref(null)

const navItems = [
  ['home','🏠','家园'], ['farm','🌱','农场'], ['fishing','🎣','钓鱼'], ['mine','⛏️','矿井'],
  ['forage','🌲','采集'], ['animals','🐄','动物'], ['machines','⚙️','工匠'], ['cooking','🍳','料理'],
  ['shop','🛒','商店'], ['town','👥','小镇'], ['center','🏛️','社区中心'], ['museum','🏺','博物馆'],
  ['quests','📜','任务'], ['festival','🎪','节日'], ['island','🏝️','姜岛'], ['collection','📖','图鉴'],
  ['achievement','🏆','成就'], ['skills','⭐','技能'], ['bag','🎒','背包'], ['status','📊','状态']
]
const pageMeta = {
  home:['家园','没有移动角色，所有地点和玩法都通过菜单进入。'], farm:['农场','种植、浇水、施肥、收获、温室和巨型作物。'], fishing:['钓鱼','鱼类、宝箱、蟹笼和季节性鱼种。'], mine:['矿井','矿石、晶球、怪物、战斗、骷髅洞穴和火山地牢。'], forage:['采集','四季采集、树木、木材、纤维和特殊采集事件。'], animals:['动物','鸡舍、畜棚、宠物、产品与畜牧技能。'], machines:['工匠','酿酒、腌制、奶酪、蛋黄酱、蜂蜜和各种机器。'], cooking:['料理','收集食谱、烹饪、食物恢复与 Buff。'], shop:['商店','季节种子、工具、动物和特殊商品。'], town:['小镇','居民、送礼、好感、恋爱、婚姻与故事。'], center:['社区中心','收集包、房间奖励和 Joja 路线。'], museum:['博物馆','矿物、古物和捐赠收藏。'], quests:['任务','每日任务、特别订单和长期目标。'], festival:['节日','按日期举办节日与菜单小游戏。'], island:['姜岛','金色核桃、齐先生、火山地牢和岛屿农场。'], collection:['图鉴','发现过的物品、鱼、作物、矿物和料理。'], achievement:['成就','长期目标与一次性奖励。'], skills:['技能','五项技能、职业、精通与被动能力。'], bag:['背包','管理和出售当前拥有的物品。'], status:['状态','查看年份、收入、建筑、社区、岛屿和进度。']
}

const seasonName = computed(() => seasonNames[state.season])
const seasonIcon = computed(() => seasonIcons[state.season])
const seasonDay = computed(() => getSeasonDay(state.day))
const timeText = computed(() => `${String(Math.floor(state.minutes / 60) % 24).padStart(2,'0')}:${String(state.minutes % 60).padStart(2,'0')}`)
const pageTitle = computed(() => pageMeta[currentPage.value][0])
const pageSub = computed(() => pageMeta[currentPage.value][1])
const bagItems = computed(() => items.filter(x => (state.inventory[x.id] || 0) > 0))
const discoveredCount = computed(() => state.discovered.length)
const skillTotal = computed(() => Object.values(state.skills).reduce((n,x) => n + x.level, 0))
const readyCrops = computed(() => state.farm.filter(x => x.crop && x.readyDay <= state.day).length)
const currentFestival = computed(() => {
  const d = seasonDay.value
  if (state.season === 'spring' && d === 13) return '春季复活节'
  if (state.season === 'spring' && d === 24) return '花舞节'
  if (state.season === 'summer' && d === 11) return '夏威夷宴会'
  if (state.season === 'summer' && d === 28) return '月光水母舞会'
  if (state.season === 'fall' && d === 16) return '星露谷展览会'
  if (state.season === 'fall' && d === 27) return '万灵节'
  if (state.season === 'winter' && d === 8) return '冰雪节'
  if (state.season === 'winter' && d === 15) return '夜市'
  if (state.season === 'winter' && d === 25) return '冰雪盛宴'
  return null
})

const skillDefs = [
  ['farming','🌱','耕种',['牧场主','农耕者'],['动物产品价值 +20%','作物价值 +10%']],
  ['fishing','🎣','钓鱼',['渔夫','捕鱼者'],['鱼价 +25%','宝箱更丰富']],
  ['foraging','🌲','采集',['护林人','采集者'],['木材 +25%','采集有概率双倍']],
  ['mining','⛏️','采矿',['矿工','地质学家'],['矿脉额外矿石','晶球概率提高']],
  ['combat','⚔️','战斗',['战士','侦察兵'],['伤害 +10%','暴击率提高']]
]
const animals = [
  ['chicken','鸡','🐔',800,'蛋','egg'], ['duck','鸭','🦆',1200,'鸭蛋','duck_egg'], ['cow','奶牛','🐄',1500,'牛奶','milk'],
  ['goat','山羊','🐐',4000,'羊奶','goat_milk'], ['sheep','绵羊','🐑',8000,'羊毛','wool'], ['pig','猪','🐖',16000,'松露','truffle'], ['rabbit','兔子','🐇',8000,'兔脚','rabbit_foot']
]
const recipes = [
  ['mayonnaise','蛋黄酱机','🥚',['egg:1','wood:15','stone:15'],['egg','mayonnaise'],120],
  ['cheese','奶酪机','🧀',['milk:1','wood:45','stone:45'],['milk','cheese'],180],
  ['keg','酒桶','🛢️',['wood:30','copper_ore:1','iron_ore:1','oak_resin:1'],['fruit','wine'],240],
  ['preserves','腌制罐','🫙',['wood:50','stone:40','coal:8'],['fruit','preserves'],150],
  ['bee','蜂房','🐝',['wood:40','coal:8','iron_ore:1','maple_syrup:1'],['flower','honey'],200],
  ['crystalarium','复制机','💎',['stone:99','gold_ore:5','iridium_ore:2','battery:1'],['gem','gem'],360],
  ['sprinkler','洒水器','💧',['copper_ore:1','iron_ore:1'],['water','sprinkler'],90]
]
const foods = [
  ['field_snack','野炊小食','🥜',['acorn:1','maple_seed:1','pine_cone:1'],80,'体力 +50'],
  ['farmer_lunch','农夫午餐','🍱',['omelet:1','parsnip:1'],120,'耕种 +3'],
  ['dish_o_sea','海之菜肴','🍲',['sardine:2','hashbrow:1'],150,'钓鱼 +3'],
  ['spicy_eel','香辣鳗鱼','🌶️',['eel:1','hot_pepper:1'],160,'速度 +1、幸运 +1'],
  ['pumpkin_soup','南瓜汤','🥣',['pumpkin:1','milk:1'],200,'防御 +2、幸运 +2']
]
const bundleRooms = [
  ['春季采集包',['wild_horseradish','daffodil','leek','dandelion'],100],
  ['夏季采集包',['grape','spice_berry','sweet_pea'],150],
  ['秋季采集包',['common_mushroom','wild_plum','hazelnut','blackberry'],200],
  ['工艺品室',['wood','stone','fiber','honey'],250],
  ['鱼缸',['fish_roach','fish_carp','fish_trout','golden_fish'],300],
  ['锅炉房',['copper_ore','iron_ore','gold_ore','coal'],400]
]
const achievements = [
  ['first_day','🌅','新生活','度过第 1 天',1,() => state.day >= 1], ['year_one','📅','一年四季','度过 112 天',112,() => state.day >= 112],
  ['harvest','🌾','丰收','收获 50 次',50,() => state.totalHarvest >= 50], ['fish','🎣','垂钓大师','钓鱼 100 次',100,() => state.totalFish >= 100],
  ['mine','⛏️','矿工','到达矿井 80 层',80,() => state.mineFloor >= 80], ['friends','❤️','好人缘','任意居民达到 8 心',8,() => Math.max(...Object.values(state.relationships)) >= 800],
  ['museum','🏺','博物馆长','捐赠 30 件',30,() => state.museum.length >= 30], ['bundles','🏛️','本地传奇','完成全部收集包',6,() => state.communityCenter >= 6],
  ['island','🏝️','遥远海岸','解锁姜岛',1,() => state.islandUnlocked], ['mastery','⭐','五项精通','解锁全部精通',5,() => state.mastery.unlocked.length >= 5],
  ['rich','💰','百万富翁','累计收入 1000000 G',1000000,() => state.totalEarnings >= 1000000], ['perfection','🌟','完美生活','综合完成度达到终局',100,() => completion.value >= 100]
]
const completion = computed(() => Math.min(100, Math.floor((skillTotal.value / 50) * 25 + Math.min(20,state.museum.length / 100 * 20) + Math.min(20,state.communityCenter / 6 * 20) + Math.min(15,state.goldenWalnuts / 130 * 15) + Math.min(20,discoveredCount.value / 250 * 20))))

function showPage(p) { currentPage.value = p }
function spend(cost) { if (state.energy < cost) { message.value = '体力不足，今天先休息吧。'; return false } state.energy -= cost; return true }
function advanceTime(minutes) { state.minutes += minutes; if (state.minutes >= 24 * 60) state.minutes = 23 * 60 + 50 }
function itemName(id) { return getItem(id)?.name || ({wood:'木材',stone:'石头',fiber:'纤维',coal:'煤炭',copper_ore:'铜矿石',iron_ore:'铁矿石',gold_ore:'金矿石',iridium_ore:'铱矿石',milk:'牛奶',egg:'鸡蛋',oak_resin:'橡树树液',maple_syrup:'枫糖浆',battery:'电池组'}[id] || id) }
function itemIcon(id) { return getItem(id)?.icon || ({wood:'🪵',stone:'🪨',fiber:'🌿',coal:'⚫',copper_ore:'🟠',iron_ore:'⚙️',gold_ore:'🟡',iridium_ore:'💜',milk:'🥛',egg:'🥚'}[id] || '📦') }
function need(list) { return list.every(x => { const [id,n] = x.split(':'); return (state.inventory[id] || 0) >= Number(n) }) }
function consume(list) { list.forEach(x => { const [id,n] = x.split(':'); removeItem(id,Number(n)) }) }

function plant(plot,crop) {
  if (plot.crop) return
  if (!state.inventory[crop.seed]) { message.value = `没有 ${crop.name} 种子`; return }
  if (!spend(5)) return
  removeItem(crop.seed); plot.crop = crop.id; plot.plantedDay = state.day; plot.readyDay = state.day + crop.days; plot.watered = state.weather === 'rain' || state.weather === 'storm'; gainSkill('farming',4); discover(crop.id); advanceTime(20); message.value = `${crop.name} 已种下。`
}
function water(plot) { if (!plot.crop || plot.watered) return; if (!spend(2)) return; plot.watered = true; advanceTime(5); message.value = '土地已浇水。' }
function harvest(plot) { if (!plot.crop || plot.readyDay > state.day) return; const c=getCrop(plot.crop); if(!c)return; addItem(c.id); state.totalHarvest++; gainSkill('farming',10); gainExperience(10); if(c.regrow){plot.readyDay=state.day+c.regrow;plot.watered=false}else{plot.crop=null;plot.readyDay=0;plot.plantedDay=0;plot.watered=false}; message.value=`收获了 ${c.name}。` }
function buySeed(crop) { if(state.gold<crop.seedPrice)return; gainGold(-crop.seedPrice); addItem(crop.seed); message.value=`购买 ${crop.name} 种子。` }

function fishOnce() { if(!spend(10))return; advanceTime(35); const f=fish[Math.floor(Math.random()*fish.length)]; addItem(f.id); state.totalFish++; gainSkill('fishing',12); gainExperience(15); if(Math.random()<.18)addItem('bait'); message.value=`🎣 钓到 ${f.name}。` }
function crabPot() { if(!spend(4))return; addItem('fish_roach'); gainSkill('fishing',5); message.value='蟹笼收获了一份水产。' }
function mine() { if(!spend(8))return; advanceTime(30); const roll=Math.random(); state.mineFloor=Math.min(120,state.mineFloor+(Math.random()<.25?2:1)); if(roll<.45){addItem('stone',2+Math.floor(Math.random()*4));gainSkill('mining',5)}else if(roll<.72){addItem('copper_ore',1+Math.floor(Math.random()*3));gainSkill('mining',8)}else if(roll<.9){addItem('iron_ore',1+Math.floor(Math.random()*2));gainSkill('mining',12)}else{addItem('gold_ore');gainSkill('mining',18)} if(Math.random()<.28){state.health-=10;gainSkill('combat',5);message.value='⚔️ 遭遇怪物并取得胜利，但受了伤。'}else message.value=`⛏️ 深入矿井至 ${state.mineFloor} 层。` }
function skullRun(){ if(state.mineFloor<120){message.value='先完成普通矿井。';return} if(!spend(20))return;state.skullFloor=Math.min(100,state.skullFloor+Math.floor(Math.random()*12)+1);addItem(Math.random()<.5?'gold_ore':'stone',3);gainSkill('mining',25);gainSkill('combat',20);message.value=`进入骷髅洞穴 ${state.skullFloor} 层。` }
function forage() { if(!spend(4))return; advanceTime(20); const pool={spring:['flower','mushroom','fiber'],summer:['grape','shell','fiber'],fall:['mushroom','tea','fiber'],winter:['shell','crystal','fiber']}[state.season]; const id=pool[Math.floor(Math.random()*pool.length)];addItem(id);gainSkill('foraging',8);message.value=`🌲 采集到了 ${itemName(id)}。` }

function buyAnimal(a) { const cap=state.buildings.coop+state.buildings.barn*4; if(state.animals.length>=Math.max(2,cap)||state.gold<a[3])return;gainGold(-a[3]);state.animals.push({id:Date.now(),type:a[0],name:a[1],icon:a[2],product:a[5],fed:false,friendship:0});message.value=`获得了 ${a[1]}。` }
function careAnimal(a) { if(!a.fed){a.fed=true;a.friendship=Math.min(1000,a.friendship+15);gainSkill('farming',5);addItem(a.product);message.value=`照料了 ${a.name}，获得 ${itemName(a.product)}。`}else message.value=`${a.name} 今天已经照料过了。` }
function build(type) { const costs={silo:500,coop:4000,barn:6000,stable:10000};const cost=costs[type];if(!cost||state.gold<cost)return;gainGold(-cost);state.buildings[type]++;message.value=`建造了 ${type}。`;if(type==='silo')addItem('hay',30) }
function upgradeHouse(){if(state.buildings.house>=3||state.gold<10000)return;gainGold(-10000);state.buildings.house++;message.value='农舍升级完成。'}

function craft(r){if(!need(r[3])){message.value='材料不足。';return}consume(r[3]);state.machines.push(r[0]);discover(r[0]);gainSkill('farming',8);message.value=`制作了 ${r[1]}。`}
function processMachine(id){if(id==='mayonnaise'&&removeItem('egg')){addItem('mayonnaise');gainGold(190);message.value='制作了蛋黄酱。'}else if(id==='cheese'&&removeItem('milk')){addItem('cheese');gainGold(230);message.value='制作了奶酪。'}else if(id==='keg'){const crop=bagItems.value.find(x=>['melon','starfruit','apple','grape'].includes(x.id));if(crop&&removeItem(crop.id)){addItem('wine');message.value=`酿造了 ${crop.name} 酒。`}}else message.value='没有可加工的原料。'}
function cook(f){if(!need(f[3])){message.value='食材不足。';return}consume(f[3]);state.cooked.push(f[0]);state.buffs.push({name:f[1],until:state.day+1});message.value=`🍳 做好了 ${f[1]}，获得临时增益：${f[5]}。`}

function talk(npc){selectedNpc.value=npc;advanceTime(15);state.relationships[npc.id]=Math.min(1000,(state.relationships[npc.id]||0)+20);message.value=`和 ${npc.name} 聊了聊天，好感 +20。`}
function gift(npc){const candidate=bagItems.value.find(x=>npc.favorite.includes(x.id));if(!candidate){message.value='背包里没有合适的礼物。';return}removeItem(candidate.id);state.relationships[npc.id]=Math.min(1000,(state.relationships[npc.id]||0)+80);message.value=`送给 ${npc.name} ${candidate.name}，好感大幅提升。`}
function romance(npc){if((state.relationships[npc.id]||0)<800){message.value='需要先达到 8 心。';return}state.relationships[npc.id]=Math.min(1000,(state.relationships[npc.id]||0)+50);message.value=`你与 ${npc.name} 确立了恋爱关系。`}

function completeBundle(room){if(state.bundles[room[0]])return;state.bundles[room[0]]=true;state.communityCenter++;gainGold(room[2]);message.value=`完成 ${room[0]}，获得 ${room[2]} G 的社区奖励。`}
function donate(){const candidate=bagItems.value.find(x=>!state.museum.includes(x.id)&&['stone','crystal','gem','copper_ore','iron_ore','gold_ore'].includes(x.id));if(!candidate){message.value='没有符合博物馆收藏的物品。';return}removeItem(candidate.id);state.museum.push(candidate.id);message.value=`捐赠 ${candidate.name}，博物馆收藏 +1。`}
function doQuest(){const rewards=[50,100,250,500];const reward=rewards[Math.floor(Math.random()*rewards.length)];gainGold(reward);state.completedQuests.push(state.day);message.value=`完成了今天的委托，获得 ${reward} G。`}
function festival(){if(!currentFestival.value){message.value='今天没有节日。';return}const reward=100+Math.floor(Math.random()*400);gainGold(reward);state.festivals[`${state.year}-${state.day}`]=true;message.value=`🎪 参加 ${currentFestival.value}，赢得 ${reward} G。`}
function unlockIsland(){if(state.communityCenter<6&&!state.joja){message.value='需要先完成社区中心。';return}state.islandUnlocked=true;state.busRepaired=true;message.value='⛵ 姜岛已开放。'}
function islandAction(){if(!state.islandUnlocked){unlockIsland();return}const r=Math.random();if(r<.5){state.goldenWalnuts=Math.min(130,state.goldenWalnuts+5);message.value='找到 5 个金色核桃。'}else{state.volcanoFloor=Math.min(10,state.volcanoFloor+1);state.qiGems+=2;gainSkill('combat',20);message.value=`探索火山地牢 ${state.volcanoFloor} 层。`}}
function unlockMastery(skill){if(state.skills[skill].level<10){message.value='该技能需要 Lv.10。';return}if(state.mastery.unlocked.includes(skill)){message.value='已经精通。';return}if(state.mastery.points<10000){message.value='需要 10000 精通点。';return}state.mastery.points-=10000;state.mastery.unlocked.push(skill);message.value=`⭐ 解锁 ${skillName(skill)} 精通。`}
function claimAchievement(a){if(!a[5]()||state.achievements.includes(a[0]))return;state.achievements.push(a[0]);gainGold(500);message.value=`🏆 完成成就：${a[2]}，奖励 500 G。`}
function sell(id){const n=state.inventory[id]||0;if(!n)return;const price=getItem(id)?.sellPrice||10;removeItem(id);gainGold(price);message.value=`出售 ${itemName(id)}，获得 ${price} G。`}
function endDay(){const old=state.season;advanceDay();if(old!==state.season)message.value=`${seasonIcon.value} 新季节：${seasonName.value}`;else message.value=currentFestival.value?`明天是 ${currentFestival.value}`:'新的一天开始了。';currentPage.value='home'}
function normalizeSave(){state.inventory=Object.assign({wood:20,stone:10,fiber:10,coal:2},state.inventory||{});state.farm=Array.isArray(state.farm)?state.farm:[];while(state.farm.length<12)state.farm.push({id:state.farm.length+1,crop:null,plantedDay:0,readyDay:0,watered:false,greenhouse:false});state.relationships=Object.assign({mira:0,kai:0,luna:0,old_bob:0},state.relationships||{});state.skills=Object.assign({farming:{level:0,xp:0,mastery:0,profession:null},fishing:{level:0,xp:0,mastery:0,profession:null},foraging:{level:0,xp:0,mastery:0,profession:null},mining:{level:0,xp:0,mastery:0,profession:null},combat:{level:0,xp:0,mastery:0,profession:null}},state.skills||{})}
onMounted(()=>{loadGame(state);normalizeSave();syncSeason();message.value=state.day>1?`欢迎回来，${seasonName.value}第 ${seasonDay.value} 天。`:'新的生活开始了。'});watch(state,()=>saveGame(state),{deep:true})
</script>

<template>
<div class="game-shell">
<header class="topbar"><div><div class="logo">四季物语</div><div class="subtitle">Stardew 风格 · 菜单驱动单机版</div></div><div class="top-stats"><span>{{seasonIcon}} <b>第 {{state.year}} 年 {{seasonName}} {{seasonDay}} 日</b></span><span>🌦️ {{state.weather==='rain'?'下雨':state.weather==='storm'?'雷雨':'晴天'}}</span><span>🕘 <b>{{timeText}}</b></span><span>💰 <b>{{state.gold}}</b> G</span></div></header>
<main class="layout"><aside class="sidebar"><button v-for="n in navItems" :key="n[0]" class="nav" :class="{active:currentPage===n[0]}" @click="showPage(n[0])"><span>{{n[1]}}</span><span>{{n[2]}}</span></button><div class="side-bottom"><div class="energy-label"><span>体力</span><b>{{state.energy}} / {{state.maxEnergy}}</b></div><div class="energy"><i :style="{width:`${state.energy/state.maxEnergy*100}%`}"></i></div><button class="end-day" @click="endDay">🌙 睡觉 · 结束今天</button></div></aside>
<section class="content"><div class="page-title"><div><h1>{{pageTitle}}</h1><p>{{pageSub}}</p></div><span class="badge">{{seasonIcon}} {{seasonName}}</span></div><div class="notice">🌿 {{message}}</div>

<template v-if="currentPage==='home'"><div class="grid"><div class="card"><h3>今日</h3><div class="big-number">{{state.energy}}</div><p>体力 · {{state.health}} HP</p></div><div class="card"><h3>技能</h3><div class="big-number">{{skillTotal}} / 50</div><p>五项技能总等级</p></div><div class="card"><h3>完成度</h3><div class="big-number">{{completion}}%</div><div class="progress"><i :style="{width:`${completion}%`}"></i></div></div></div><div class="card action-card"><h3>🎮 今天做什么？</h3><div class="actions"><button v-for="n in navItems.slice(1,13)" :key="n[0]" class="action" @click="showPage(n[0])"><span class="emoji">{{n[1]}}</span><strong>{{n[2]}}</strong><small>{{pageMeta[n[0]][1]}}</small></button></div></div><div class="card log-card"><h3>📜 最近事件</h3><div class="list"><div v-for="(l,i) in state.log.slice(0,8)" :key="i" class="row"><span>📌</span><div class="row-main"><b>第 {{l.day}} 天</b><div class="row-desc">{{l.text}}</div></div></div></div></div></template>

<template v-else-if="currentPage==='farm'"><div class="card"><h3>{{seasonIcon}} {{seasonName}} · 12 块土地</h3><p>雨天会自动浇水。连作作物收获后继续生长。解锁温室后，温室土地不受季节限制。</p></div><div class="grid crop-grid"><div v-for="plot in state.farm" :key="plot.id" class="card plot"><div class="plot-number">田地 {{plot.id}}</div><div class="crop-icon">{{plot.crop?getCrop(plot.crop)?.icon:'＋'}}</div><h3>{{plot.crop?getCrop(plot.crop)?.name:'空闲土地'}}</h3><p v-if="plot.crop">{{plot.readyDay<=state.day?'可以收获':'第 '+plot.readyDay+' 天成熟'}} · {{plot.watered?'已浇水':'未浇水'}}</p><p v-else>选择本季作物</p><div v-if="plot.crop" class="button-row"><button class="buy-btn" :disabled="plot.watered" @click="water(plot)">💧 浇水</button><button class="primary-btn" :disabled="plot.readyDay>state.day" @click="harvest(plot)">🌾 收获</button></div><div v-else class="crop-buttons"><button v-for="c in crops.slice(0,8)" :key="c.id" class="buy-btn" :disabled="!state.inventory[c.seed]" @click="plant(plot,c)">{{c.icon}} {{c.name}}</button></div></div></div></template>

<template v-else-if="currentPage==='fishing'"><div class="grid"><div class="card fishing-card"><div class="fishing-hero">🎣</div><h2>钓鱼</h2><p>钓鱼、宝箱、垃圾、水草和蟹笼都会提升钓鱼技能。</p><button class="primary-btn" @click="fishOnce">抛竿 · 10 体力</button></div><div class="card"><h3>蟹笼</h3><p>拥有蟹笼后每天可以收获一次。</p><button class="buy-btn" @click="crabPot">收获蟹笼</button></div><div class="card"><h3>钓鱼进度</h3><div class="big-number">{{state.totalFish}}</div><p>累计鱼获</p></div></div><div class="card fish-table"><h3>鱼类图鉴</h3><div class="list"><div v-for="f in fish" :key="f.id" class="row"><span class="item-icon">{{state.discovered.includes(f.id)?f.icon:'?'}}</span><div class="row-main"><b>{{state.discovered.includes(f.id)?f.name:'未知鱼类'}}</b><div class="row-desc">{{f.rarity}} · {{f.sellPrice}} G</div></div><b>x{{state.inventory[f.id]||0}}</b></div></div></div></template>

<template v-else-if="currentPage==='mine'"><div class="grid"><div class="card"><h3>⛏️ 普通矿井</h3><div class="big-number">{{state.mineFloor}} / 120</div><p>矿石、晶球、怪物与宝箱。</p><button class="primary-btn" @click="mine">下矿 · 8 体力</button></div><div class="card"><h3>💀 骷髅洞穴</h3><div class="big-number">{{state.skullFloor}} / 100</div><p>完成普通矿井后解锁。</p><button class="buy-btn" @click="skullRun">挑战</button></div><div class="card"><h3>⚔️ 战斗</h3><div class="big-number">{{state.health}} HP</div><p>击杀怪物提升战斗技能。</p></div></div><div class="card"><h3>矿物</h3><div class="item-grid"><div v-for="id in ['stone','copper_ore','iron_ore','gold_ore','crystal']" :key="id" class="item"><span class="icon">{{itemIcon(id)}}</span><b>{{itemName(id)}}</b><small>x{{state.inventory[id]||0}}</small></div></div></div></template>

<template v-else-if="currentPage==='forage'"><div class="card"><h3>🌲 四季采集</h3><p>每天都能在不移动角色的情况下点击进行采集。不同季节会改变可获得的物品。</p><button class="primary-btn" @click="forage">采集一次 · 4 体力</button></div><div class="grid" style="margin-top:16px"><div class="card"><h3>🌳 树木</h3><p>木材、树液、种子和硬木是制作机器的重要材料。</p><button class="buy-btn" @click="addItem('wood',5);gainSkill('foraging',5);message='砍伐获得 5 木材。'">砍树</button></div><div class="card"><h3>🍃 纤维</h3><p>制作肥料、种子和各种设施。</p><button class="buy-btn" @click="addItem('fiber',3);gainSkill('foraging',4);message='获得 3 纤维。'">收集</button></div><div class="card"><h3>🍄 特殊采集</h3><p>稀有蘑菇、浆果和季节物品会进入图鉴。</p></div></div></template>

<template v-else-if="currentPage==='animals'"><div class="grid"><div class="card"><h3>🏠 建筑</h3><p>鸡舍 Lv.{{state.buildings.coop}} · 畜棚 Lv.{{state.buildings.barn}} · 筒仓 {{state.buildings.silo}}</p><div class="button-row"><button class="buy-btn" @click="build('silo')">建筒仓 500G</button><button class="buy-btn" @click="build('coop')">建鸡舍 4000G</button><button class="buy-btn" @click="build('barn')">建畜棚 6000G</button><button class="buy-btn" @click="build('stable')">建马厩 10000G</button></div></div><div class="card"><h3>🏡 农舍</h3><p>当前等级 {{state.buildings.house}}。升级后解锁更多生活内容。</p><button class="buy-btn" @click="upgradeHouse">升级农舍 10000G</button></div></div><div class="grid crop-grid" style="margin-top:16px"><div v-for="a in animals" :key="a[0]" class="card plot"><div class="crop-icon">{{a[2]}}</div><h3>{{a[1]}}</h3><p>购买 {{a[3]}} G · 产出 {{a[4]}}</p><button class="buy-btn" @click="buyAnimal(a)">购买</button></div></div><div class="card" style="margin-top:16px"><h3>你的动物</h3><div class="list"><div v-for="a in state.animals" :key="a.id" class="row"><span class="item-icon">{{a.icon}}</span><div class="row-main"><b>{{a.name}}</b><div class="row-desc">好感 {{a.friendship}} · {{a.fed?'今日已照料':'等待照料'}}</div></div><button class="buy-btn" @click="careAnimal(a)">照料</button></div></div></div></template>

<template v-else-if="currentPage==='machines'"><div class="card"><h3>⚙️ 工匠机器</h3><p>工匠路线是农场经济的核心之一：原料经过机器加工后价值显著提升。</p><div class="grid"><div v-for="r in recipes" :key="r[0]" class="card"><h3>{{r[2]}} {{r[1]}}</h3><p>{{r[3].map(x=>itemName(x.split(':')[0])+' ×'+x.split(':')[1]).join('、')}}</p><button class="buy-btn" @click="craft(r)">制作</button></div></div></div><div class="card"><h3>当前机器</h3><div class="item-grid"><div v-for="id in state.machines" :key="id" class="item"><span class="icon">⚙️</span><b>{{id}}</b><button class="buy-btn" @click="processMachine(id)">加工</button></div></div></div></template>

<template v-else-if="currentPage==='cooking'"><div class="card"><h3>🍳 料理</h3><p>料理可以恢复体力和生命，并提供临时技能、速度、幸运等 Buff。</p><div class="grid"><div v-for="f in foods" :key="f[0]" class="card"><h3>{{f[2]}} {{f[1]}}</h3><p>{{f[3].map(x=>itemName(x.split(':')[0])+' ×'+x.split(':')[1]).join('、')}}</p><small>{{f[5]}}</small><button class="buy-btn" style="margin-top:10px" @click="cook(f)">烹饪</button></div></div></div></template>

<template v-else-if="currentPage==='shop'"><div class="card"><h3>{{seasonIcon}} 本季种子</h3><div class="list"><div v-for="c in crops.filter(x=>x.seedPrice>0)" :key="c.id" class="row"><span class="item-icon">{{c.icon}}</span><div class="row-main"><b>{{c.name}}种子</b><div class="row-desc">{{c.days}} 天成熟 · 售价 {{c.sellPrice}} G</div></div><b>{{c.seedPrice}} G</b><button class="buy-btn" @click="buySeed(c)">购买</button></div></div></div></template>

<template v-else-if="currentPage==='town'"><div class="grid"><div v-for="n in npcs" :key="n.id" class="card"><div class="npc-icon">{{n.icon}}</div><h3>{{n.name}}</h3><div class="npc-role">{{n.role}}</div><div class="heart">❤️ {{Math.floor((state.relationships[n.id]||0)/100)}} / 10 心</div><div class="progress"><i :style="{width:`${(state.relationships[n.id]||0)/10}%`}"></i></div><p>{{n.intro}}</p><div class="button-row"><button class="buy-btn" @click="talk(n)">聊天</button><button class="buy-btn" @click="gift(n)">送礼</button><button class="primary-btn" @click="romance(n)">恋爱</button></div></div></div><div class="card"><h3>💍 婚姻与家庭</h3><p>达到 10 心后可以求婚；婚后可升级农舍并拥有孩子。当前版本采用菜单事件，不需要角色移动。</p></div></template>

<template v-else-if="currentPage==='center'"><div class="grid"><div class="card"><h3>🏛️ 社区中心</h3><div class="big-number">{{state.communityCenter}} / 6</div><p>完成收集包恢复小镇。</p><button class="buy-btn" @click="unlockIsland">修复交通</button></div><div class="card"><h3>🏢 Joja 路线</h3><p>另一条发展路线：直接用金钱购买社区升级。</p><button class="buy-btn" @click="state.joja=true;message='选择了 Joja 路线。'">加入 Joja</button></div></div><div class="list"><div v-for="b in bundleRooms" :key="b[0]" class="row"><span class="item-icon">{{state.bundles[b[0]]?'✅':'📦'}}</span><div class="row-main"><b>{{b[0]}}</b><div class="row-desc">需要：{{b[1].map(itemName).join('、')}} · 奖励 {{b[2]}} G</div></div><button class="buy-btn" :disabled="state.bundles[b[0]]" @click="completeBundle(b)">完成收集包</button></div></div></template>

<template v-else-if="currentPage==='museum'"><div class="card"><h3>🏺 博物馆</h3><div class="big-number">{{state.museum.length}}</div><p>捐赠矿物、古物和稀有发现。捐赠后的物品永久计入收藏。</p><button class="primary-btn" @click="donate">捐赠一件</button></div><div class="item-grid"><div v-for="id in state.museum" :key="id" class="item"><span class="icon">{{itemIcon(id)}}</span><b>{{itemName(id)}}</b></div></div></template>

<template v-else-if="currentPage==='quests'"><div class="grid"><div class="card"><h3>📜 每日任务</h3><p>每天刷新。完成任务获得金钱、经验和友谊。</p><button class="primary-btn" @click="doQuest">完成今日委托</button></div><div class="card"><h3>⭐ 特别订单</h3><p>特殊订单是中后期重要的资源和关系来源。</p><button class="buy-btn" @click="doQuest">完成特别订单</button></div><div class="card"><h3>📚 长期目标</h3><p>博物馆、社区中心、技能、姜岛和完美度都会形成长期目标。</p></div></div></template>

<template v-else-if="currentPage==='festival'"><div class="card"><h3>🎪 节日</h3><div class="big-number">{{currentFestival||'今天没有节日'}}</div><p>星露谷每个季节都有多个节日。网页版把原本需要走地图参加的活动改为按钮和菜单。</p><button class="primary-btn" @click="festival">参加 / 游玩</button></div><div class="grid"><div v-for="x in ['复活节','花舞节','夏威夷宴会','月光水母','展览会','万灵节','冰雪节','夜市','冰雪盛宴']" :key="x" class="card"><h3>🎟️ {{x}}</h3><p>可购买特殊商品、参与小游戏、赢得奖品或获得节日限定收藏。</p></div></div></template>

<template v-else-if="currentPage==='island'"><div class="grid"><div class="card"><h3>🏝️ 姜岛</h3><div class="big-number">{{state.goldenWalnuts}} / 130</div><p>金色核桃用于解锁岛屿区域、农场和齐先生的房间。</p><button class="primary-btn" @click="islandAction">探索姜岛</button></div><div class="card"><h3>🌋 火山地牢</h3><div class="big-number">{{state.volcanoFloor}} / 10</div><p>探索、战斗、锻造和附魔。</p><button class="buy-btn" @click="islandAction">进入火山</button></div><div class="card"><h3>💎 齐先生</h3><div class="big-number">{{state.qiGems}}</div><p>完成特殊挑战获得齐钻石，并兑换高级奖励。</p></div></div></template>

<template v-else-if="currentPage==='collection'"><div class="card"><h3>📖 图鉴</h3><div class="big-number">{{discoveredCount}}</div><p>背包、博物馆、作物、鱼类和特殊物品一旦发现就永久记录。</p></div><div class="item-grid"><div v-for="id in state.discovered" :key="id" class="item"><span class="icon">{{itemIcon(id)}}</span><b>{{itemName(id)}}</b></div></div></template>

<template v-else-if="currentPage==='achievement'"><div class="list"><div v-for="a in achievements" :key="a[0]" class="row" :class="{locked:!a[5]()}"><span class="achievement-icon">{{a[1]}}</span><div class="row-main"><b>{{a[2]}}</b><div class="row-desc">{{a[3]}}</div></div><span>{{a[5]()?'已完成':'未完成'}}</span><button v-if="a[5]()&&!state.achievements.includes(a[0])" class="buy-btn" @click="claimAchievement(a)">领取</button></div></div></template>

<template v-else-if="currentPage==='skills'"><div class="grid"><div v-for="s in skillDefs" :key="s[0]" class="card"><h3>{{s[1]}} {{s[2]}}</h3><div class="big-number">Lv. {{state.skills[s[0]].level}}</div><div class="progress"><i :style="{width:`${state.skills[s[0]].level*10}%`}"></i></div><p>XP {{state.skills[s[0]].xp}} · 10 级后进入精通系统</p><p>职业：{{state.skills[s[0]].profession||'未选择'}}</p><button class="buy-btn" @click="state.skills[s[0]].profession=s[0]+'-a';message=`选择了 ${s[2]} 职业。`">选择职业</button><button class="primary-btn" style="margin-left:6px" @click="unlockMastery(s[0])">精通</button></div></div><div class="card"><h3>⭐ 精通</h3><div class="big-number">{{state.mastery.points}} 点</div><p>五项技能全部达到 Lv.10 后持续获得精通经验。解锁五项精通后进入终局。</p></div></template>

<template v-else-if="currentPage==='bag'"><div class="list"><div v-for="x in bagItems" :key="x.id" class="row"><span class="item-icon">{{x.icon}}</span><div class="row-main"><b>{{x.name}}</b><div class="row-desc">{{x.category}} · 当前 {{state.inventory[x.id]}}</div></div><b>{{x.sellPrice||0}} G</b><button class="buy-btn" @click="sell(x.id)">出售 1</button></div></div></template>

<template v-else-if="currentPage==='status'"><div class="grid"><div class="card"><h3>📅 时间</h3><div class="big-number">第 {{state.year}} 年</div><p>{{seasonName}} 第 {{seasonDay}} 天 · {{timeText}}</p></div><div class="card"><h3>💰 财富</h3><div class="big-number">{{state.gold}} G</div><p>累计收入 {{state.totalEarnings}} G</p></div><div class="card"><h3>🌟 完美度</h3><div class="big-number">{{completion}}%</div><p>终局目标：技能、博物馆、社区中心、姜岛和收藏。</p></div><div class="card"><h3>🏡 建筑</h3><p>农舍 {{state.buildings.house}} · 鸡舍 {{state.buildings.coop}} · 畜棚 {{state.buildings.barn}} · 筒仓 {{state.buildings.silo}}</p></div><div class="card"><h3>🏝️ 岛屿</h3><p>{{state.islandUnlocked?'已解锁姜岛':'尚未解锁'}} · 金色核桃 {{state.goldenWalnuts}} · 齐钻石 {{state.qiGems}}</p></div><div class="card"><h3>📚 收藏</h3><p>发现 {{discoveredCount}} · 博物馆 {{state.museum.length}} · 成就 {{state.achievements.length}}</p></div></div></template>
</section></main>
</div>
</template>

import { allCrops } from './crops'

const cropItems = allCrops.flatMap(crop => [
  { id: crop.seed, name: `${crop.name}种子`, icon: crop.icon, category: '作物种子', price: crop.seedPrice, sellPrice: Math.max(1, Math.floor(crop.seedPrice * 0.4)) },
  { id: crop.id, name: crop.name, icon: crop.icon, category: '作物', sellPrice: crop.sellPrice }
])

export const items = [
  ...cropItems,
  { id: 'fish_roach', name: '溪鱼', icon: '🐟', category: '鱼类', sellPrice: 40 },
  { id: 'fish_carp', name: '鲤鱼', icon: '🐠', category: '鱼类', sellPrice: 75 },
  { id: 'fish_trout', name: '虹鳟', icon: '🐡', category: '鱼类', sellPrice: 120 },
  { id: 'golden_fish', name: '金色锦鲤', icon: '✨', category: '传说', sellPrice: 500 },
  { id: 'shell', name: '河贝', icon: '🐚', category: '采集', sellPrice: 25 },
  { id: 'stone', name: '石头', icon: '🪨', category: '矿物', sellPrice: 10 },
  { id: 'crystal', name: '月光晶', icon: '💎', category: '矿物', sellPrice: 180 },
  { id: 'mushroom', name: '红伞菇', icon: '🍄', category: '采集', sellPrice: 60 },
  { id: 'flower', name: '春日郁金香', icon: '🌷', category: '植物', sellPrice: 30 },
  { id: 'butterfly', name: '蓝翅蝶', icon: '🦋', category: '昆虫', sellPrice: 70 },
  { id: 'gem', name: '未知宝石', icon: '🔮', category: '稀有', sellPrice: 300 },
  { id: 'egg', name: '野鸡蛋', icon: '🥚', category: '动物', sellPrice: 50 },
  { id: 'tea', name: '神秘茶叶', icon: '🍵', category: '特殊', sellPrice: 100 }
]

export function getItem(id) {
  return items.find(item => item.id === id)
}

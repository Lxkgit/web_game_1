export const items = [
  { id: 'seed_potato', name: '土豆种子', icon: '🌱', category: '作物', price: 20, sellPrice: 8 },
  { id: 'potato', name: '土豆', icon: '🥔', category: '作物', sellPrice: 35 },
  { id: 'carrot', name: '胡萝卜', icon: '🥕', category: '作物', sellPrice: 45 },
  { id: 'tomato', name: '番茄', icon: '🍅', category: '作物', sellPrice: 55 },
  { id: 'strawberry', name: '草莓', icon: '🍓', category: '作物', sellPrice: 90 },
  { id: 'fish_roach', name: '溪鱼', icon: '🐟', category: '鱼类', sellPrice: 40 },
  { id: 'fish_carp', name: '鲤鱼', icon: '🐠', category: '鱼类', sellPrice: 75 },
  { id: 'fish_trout', name: '虹鳟', icon: '🐡', category: '鱼类', sellPrice: 120 },
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

import { reactive } from 'vue'

const crop = (id, name, icon, seedPrice, days, sellPrice, seasons, regrow = 0, special = false) => ({ id, name, icon, seed: `seed_${id}`, seedPrice, days, sellPrice, energy: 10, season: seasons, regrow, special })

export const allCrops = [
  crop('blue_jazz','蓝爵士','💠',30,7,50,['spring']), crop('carrot','胡萝卜','🥕',0,3,35,['spring'],0,true), crop('cauliflower','花椰菜','🥦',80,12,175,['spring']),
  crop('coffee_bean','咖啡豆','☕',2500,10,15,['spring','summer'],2,true), crop('garlic','大蒜','🧄',40,4,60,['spring']), crop('green_bean','四季豆','🫛',60,10,40,['spring'],3),
  crop('kale','甘蓝菜','🥬',70,6,110,['spring']), crop('parsnip','防风草','🌱',20,4,35,['spring']), crop('potato','土豆','🥔',50,6,80,['spring']),
  crop('rhubarb','大黄','🌿',100,13,220,['spring']), crop('strawberry','草莓','🍓',100,8,120,['spring'],4,true), crop('tulip','郁金香','🌷',20,6,30,['spring']), crop('unmilled_rice','未碾米','🌾',40,6,30,['spring']),
  crop('ancient_fruit','远古水果','🫐',1000,28,5500,['spring','summer','fall'],7,true), crop('tea_leaf','茶叶','🍃',1500,20,50,['spring','summer','fall'],1,true),
  crop('blueberry','蓝莓','🫐',80,13,50,['summer'],4), crop('corn','玉米','🌽',150,14,50,['summer','fall'],4), crop('hops','啤酒花','🌿',60,11,25,['summer'],1),
  crop('hot_pepper','辣椒','🌶️',40,5,40,['summer'],3), crop('melon','甜瓜','🍈',80,12,250,['summer']), crop('poppy','虞美人','🌺',100,7,140,['summer']),
  crop('radish','萝卜','🌱',40,6,90,['summer']), crop('red_cabbage','红叶卷心菜','🥬',100,9,260,['summer']), crop('starfruit','杨桃','⭐',400,13,750,['summer']),
  crop('summer_spangle','夏季亮片','🌸',50,8,90,['summer']), crop('summer_squash','夏季南瓜','🎃',0,6,45,['summer'],3,true), crop('sunflower','向日葵','🌻',200,8,80,['summer','fall']),
  crop('tomato','番茄','🍅',50,11,60,['summer'],4), crop('wheat','小麦','🌾',10,4,25,['summer','fall']), crop('pineapple','菠萝','🍍',240,14,300,['summer'],7,true), crop('taro_root','芋头','🫚',100,10,100,['summer']),
  crop('amaranth','苋菜','🌿',70,7,150,['fall']), crop('artichoke','洋蓟','🥬',30,8,160,['fall']), crop('beet','甜菜','🫜',20,6,100,['fall']), crop('bok_choy','上海青','🥬',50,4,80,['fall']),
  crop('broccoli','西兰花','🥦',0,8,70,['fall'],4,true), crop('cranberries','蔓越莓','🔴',240,7,75,['fall'],5), crop('eggplant','茄子','🍆',20,5,60,['fall'],5),
  crop('fairy_rose','仙女玫瑰','🌹',200,12,290,['fall']), crop('grape','葡萄','🍇',60,10,80,['fall'],3), crop('pumpkin','南瓜','🎃',100,13,320,['fall']),
  crop('yam','山药','🍠',60,10,160,['fall']), crop('sweet_gem_berry','宝石甜莓','💎',1000,24,3000,['fall'],0,true), crop('powdermelon','粉瓜','🍉',0,7,60,['winter'],0,true),
  crop('qi_fruit','齐氏果','🔵',0,4,100,['spring','summer','fall','winter'],0,true), crop('cactus_fruit','仙人掌果','🌵',150,12,75,['summer','fall'],3,true)
]

export const crops = reactive([])
export function setSeasonCrops(season){crops.splice(0,crops.length,...allCrops.filter(x=>x.season.includes(season)))}
setSeasonCrops('spring')
export function getCrop(id){return allCrops.find(x=>x.id===id)}
export const seasonNames={spring:'春季',summer:'夏季',fall:'秋季',winter:'冬季'}
export const seasonIcons={spring:'🌸',summer:'☀️',fall:'🍂',winter:'❄️'}

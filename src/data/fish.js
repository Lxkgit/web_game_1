const f = (id,name,icon,sellPrice,seasons,weather='any',start=6,end=26,rarity='common') => ({id,name,icon,sellPrice,seasons,weather,start,end,rarity,chance: rarity==='legendary'?2:rarity==='rare'?8:rarity==='uncommon'?20:70})

export const fish = [
  f('anchovy','鳀鱼','🐟',30,['spring','fall','winter']), f('sardine','沙丁鱼','🐟',40,['spring','fall','winter']), f('herring','鲱鱼','🐟',30,['spring','summer','fall','winter']),
  f('smallmouth_bass','小嘴鲈鱼','🐟',50,['spring','summer','fall']), f('largemouth_bass','大嘴鲈鱼','🐟',100,['spring','summer','fall','winter']), f('carp','鲤鱼','🐠',30,['spring','summer','fall','winter']),
  f('catfish','鲶鱼','🐟',200,['spring','summer'],'rain',6,24,'rare'), f('sunfish','太阳鱼','🐟',30,['spring','summer'],'sunny',6,19), f('eel','鳗鱼','🐍',85,['spring','fall'],'rain',16,26,'uncommon'),
  f('pike','狗鱼','🐟',100,['summer','winter']), f('perch','河鲈','🐟',55,['winter']), f('walleye','大眼鱼','🐟',105,['fall'],'rain',12,26,'uncommon'),
  f('red_mullet','红鲻鱼','🐟',75,['summer','winter']), f('red_snapper','红鲷鱼','🐟',75,['summer','fall','winter'],'rain'), f('tuna','金枪鱼','🐟',100,['summer','winter']),
  f('halibut','比目鱼','🐟',80,['spring','summer','winter']), f('flounder','比目鱼','🐟',100,['spring','summer']), f('octopus','章鱼','🐙',150,['summer'], 'any',6,13,'rare'),
  f('squid','鱿鱼','🦑',80,['winter'], 'any',18,26,'uncommon'), f('sturgeon','鲟鱼','🐟',200,['summer','winter'],'any',6,19,'rare'),
  f('tiger_trout','虎纹鳟鱼','🐟',150,['fall','winter']), f('salmon','鲑鱼','🐟',75,['fall']), f('shad','西鲱','🐟',60,['spring','summer','fall'],'rain'),
  f('lingcod','蛇齿单线鱼','🐟',120,['winter'],'any',6,26,'rare'), f('ice_pip','冰柱鱼','🐟',500,['winter'],'any',6,26,'rare'), f('lava_eel','熔岩鳗鱼','🌋',700,['spring','summer','fall','winter'],'any',6,26,'legendary'),
  f('ghostfish','幽灵鱼','👻',45,['spring','summer','fall','winter']), f('sandfish','沙鱼','🐟',75,['spring','summer','fall','winter']), f('scorpion_carp','蝎鲤','🦂',150,['spring','summer','fall','winter'],'any',6,20,'rare'),
  f('midnight_carp','午夜鲤鱼','🐟',150,['fall','winter'],'any',22,26,'rare'), f('woodskip','木跃鱼','🐟',75,['spring','summer','fall','winter']), f('pufferfish','河豚','🐡',200,['summer'],'sunny',12,16,'rare'),
  f('rainbow_trout','虹鳟鱼','🐟',65,['summer'],'sunny'), f('dorado','金色多拉多','🐟',100,['summer'],'sunny',6,19,'rare'), f('tilapia','罗非鱼','🐟',75,['summer','fall']),
  f('octopus_rare','深海章鱼','🐙',200,['summer'],'any',6,13,'rare'), f('blobfish','水滴鱼','🫧',500,['winter'],'any',18,26,'legendary'),
  { id:'fish_roach', name:'溪鱼', icon:'🐟', rarity:'common', chance:55, sellPrice:40, seasons:['spring','summer','fall','winter'], weather:'any', start:6, end:26 },
  { id:'fish_carp', name:'鲤鱼', icon:'🐠', rarity:'uncommon', chance:28, sellPrice:75, seasons:['spring','summer','fall','winter'], weather:'any', start:6, end:26 },
  { id:'fish_trout', name:'虹鳟', icon:'🐡', rarity:'rare', chance:12, sellPrice:120, seasons:['spring','summer'], weather:'any', start:6, end:20 },
  { id:'golden_fish', name:'金色锦鲤', icon:'✨', rarity:'legendary', chance:5, sellPrice:500, seasons:['spring','summer','fall','winter'], weather:'any', start:6, end:26 }
]

const state = {
  day: 1,
  minutes: 8 * 60,
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  inventory: { seed: 3, potato: 0, fish: 0, stone: 0 },
  collection: new Set(['seed']),
  achievements: {
    firstDay: false,
    firstFish: false,
    rich: false,
    collector: false
  },
  currentPage: 'home'
};

const pages = {
  home: {
    title: '家园',
    sub: '今天也可以慢慢生活。你的每一个选择都会留下痕迹。',
    render() {
      return `
        <div class="notice">🌿 今天的风很舒服。你可以去农场、钓鱼、商店，也可以直接结束今天。</div>
        <div class="grid">
          <div class="card"><h3>今日状态</h3><div class="big-number">${state.energy}</div><p>剩余体力</p></div>
          <div class="card"><h3>钱包</h3><div class="big-number">${state.gold} G</div><p>努力赚钱，然后把钱花掉。</p></div>
          <div class="card"><h3>收藏进度</h3><div class="big-number">${state.collection.size} / 12</div><p>发现过的物品会永久记录在图鉴中。</p></div>
        </div>
        <div class="card" style="margin-top:16px">
          <h3>今天做什么？</h3>
          <div class="actions">
            ${action('🌱','照料农场','消耗 10 体力','farm')}
            ${action('🎣','去河边钓鱼','消耗 12 体力','fishing')}
            ${action('🛒','逛逛商店','可以买种子和材料','shop')}
            ${action('📖','查看图鉴','看看还有什么没发现','collection')}
            ${action('🏆','查看成就','长期目标与奖励','achievement')}
            ${action('🎒','整理背包','查看当前拥有的东西','bag')}
          </div>
        </div>`;
    }
  },
  farm: {
    title: '农场', sub: '没有移动，没有复杂操作。选择一块田，然后点击行动。', render() {
      return `<div class="grid">
        <div class="card"><h3>🌱 小菜地</h3><p>种子：${state.inventory.seed} 个</p><button class="primary-btn" onclick="farmPlant()">种下一颗土豆</button></div>
        <div class="card"><h3>🥔 今日收获</h3><div class="big-number">${state.inventory.potato}</div><p>收获后可以卖钱，也会记录到收藏。</p></div>
        <div class="card"><h3>🌦️ 季节</h3><div class="big-number">春</div><p>当前 Demo 只有春季，后续加入四季与作物成长周期。</p></div>
      </div>`;
    }
  },
  fishing: {
    title:'钓鱼', sub:'每次垂钓都会有随机收获，首次发现的新鱼会进入永久图鉴。', render() {
      return `<div class="card"><h3>🎣 河边</h3><p>安静坐下，等待鱼咬钩。</p><button class="primary-btn" onclick="fish()">抛竿（12 体力）</button><div style="margin-top:20px" class="list">${fishList()}</div></div>`;
    }
  },
  shop: {
    title:'商店', sub:'买东西不是目的，让生活变得更有趣才是。', render() {
      return `<div class="list">${shopRow('🌱','土豆种子','种下后可获得土豆',20,'seed')}${shopRow('🪨','石头','基础材料，后续可用于制作',10,'stone')}${shopRow('🍵','神秘茶叶','收藏品，暂时没有实际用途',80,'tea')}</div>`;
    }
  },
  collection: {
    title:'图鉴', sub:'背包里的东西可以卖掉，但发现过的东西不会从图鉴消失。', render() {
      const items=[['seed','🌱','土豆种子'],['potato','🥔','土豆'],['fish','🐟','溪鱼'],['stone','🪨','石头'],['tea','🍵','神秘茶叶'],['crystal','💎','月光晶'],['mushroom','🍄','红伞菇'],['flower','🌷','春日郁金香'],['butterfly','🦋','蓝翅蝶'],['gem','🔮','未知宝石'],['shell','🐚','河贝'],['egg','🥚','野鸡蛋']];
      return `<div class="card"><div class="item-grid">${items.map(x=>`<div class="item ${state.collection.has(x[0])?'':'locked'}"><div class="icon">${state.collection.has(x[0])?x[1]:'?'}</div><b>${state.collection.has(x[0])?x[2]:'尚未发现'}</b><small>${state.collection.has(x[0])?'已发现':'探索后解锁'}</small></div>`).join('')}</div></div>`;
    }
  },
  achievement: {
    title:'成就', sub:'游戏不是只有赚钱。慢慢完成这些长期目标，你会发现这个世界越来越完整。', render() {
      const list=[
        ['🌅','第一天','完成第 1 天的生活',state.day>1,1,state.day-1],
        ['🎣','初次垂钓','成功钓到第一条鱼',state.achievements.firstFish,1,state.achievements.firstFish?1:0],
        ['💰','小有积蓄','持有 1000 G',state.gold>=1000,1000,state.gold],
        ['📖','收藏家','发现 6 种不同物品',state.collection.size>=6,6,state.collection.size],
        ['🏆','富足生活','持有 2000 G',state.gold>=2000,2000,state.gold]
      ];
      return `<div class="list">${list.map(a=>`<div class="row ${a[3]?'':'locked'}"><div style="font-size:30px">${a[0]}</div><div class="row-main"><div class="row-title">${a[1]} ${a[3]?'<span class="badge">已完成</span>':''}</div><div class="row-desc">${a[2]}</div><div class="progress" style="margin-top:9px"><i style="width:${Math.min(100,a[5]/a[4]*100)}%"></i></div></div></div>`).join('')}</div>`;
    }
  },
  bag: {
    title:'背包', sub:'当前拥有的物品。卖掉物品不会影响已经解锁的图鉴。', render() {
      const names={seed:'🌱 土豆种子',potato:'🥔 土豆',fish:'🐟 溪鱼',stone:'🪨 石头',tea:'🍵 神秘茶叶'};
      return `<div class="list">${Object.entries(state.inventory).map(([k,v])=>`<div class="row"><div style="font-size:28px">${names[k]?.split(' ')[0]||'📦'}</div><div class="row-main"><div class="row-title">${names[k]||k}</div><div class="row-desc">当前拥有 ${v} 个</div></div><b>x${v}</b></div>`).join('')}</div>`;
    }
  },
  status: {
    title:'状态', sub:'你正在逐渐变强。Demo 阶段先展示基础成长框架。', render() {
      return `<div class="grid"><div class="card"><h3>🧑 冒险者</h3><p>等级</p><div class="big-number">Lv. 1</div></div><div class="card"><h3>❤️ 生活</h3><p>连续生活天数</p><div class="big-number">${state.day}</div></div><div class="card"><h3>📚 百科</h3><p>已发现物品</p><div class="big-number">${state.collection.size} / 12</div></div></div>`;
    }
  }
};

function action(icon,title,desc,page){return `<button class="action" onclick="showPage('${page}')"><span class="emoji">${icon}</span><strong>${title}</strong><small>${desc}</small></button>`;}
function shopRow(icon,title,desc,price,key){return `<div class="row"><div style="font-size:30px">${icon}</div><div class="row-main"><div class="row-title">${title}</div><div class="row-desc">${desc}</div></div><b>${price} G</b><button class="buy-btn" onclick="buy('${key}',${price})" ${state.gold<price?'disabled':''}>购买</button></div>`;}
function fishList(){return state.inventory.fish?`<div class="row"><div>🐟</div><div class="row-main"><b>溪鱼</b><div class="row-desc">你已经钓到 ${state.inventory.fish} 条</div></div></div>`:'<div class="row"><div>🌊</div><div class="row-main"><b>水面很平静</b><div class="row-desc">也许下一竿会有惊喜。</div></div></div>';}

function spend(n){if(state.energy<n){alert('体力不足，今天先休息吧。');return false;}state.energy-=n;return true;}
function farmPlant(){if(!spend(10))return;state.inventory.potato++;state.collection.add('potato');state.minutes+=40;render();}
function fish(){if(!spend(12))return;state.inventory.fish++;state.collection.add('fish');state.minutes+=50;state.achievements.firstFish=true;if(Math.random()<.35)state.collection.add('shell');render();}
function buy(key,price){if(state.gold<price)return;state.gold-=price;state.inventory[key]=(state.inventory[key]||0)+1;state.collection.add(key);render();}
function endDay(){state.day++;state.minutes=8*60;state.energy=state.maxEnergy;state.achievements.firstDay=true;state.gold+=50;render();alert('新的一天开始了。今天的生活补贴 +50 G。');}
function fmtTime(){const h=Math.floor(state.minutes/60)%24;const m=state.minutes%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
function showPage(page){state.currentPage=page;document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===page));render();}
function render(){
  const p=pages[state.currentPage];
  document.querySelector('#page').innerHTML=`<div class="page-title"><div><h1>${p.title}</h1><p>${p.sub}</p></div><span class="badge">Demo · 单机模式</span></div>${p.render()}`;
  document.querySelector('#day').textContent=state.day;
  document.querySelector('#time').textContent=fmtTime();
  document.querySelector('#gold').textContent=state.gold;
  document.querySelector('#energyText').textContent=`${state.energy} / ${state.maxEnergy}`;
  document.querySelector('#energyBar').style.width=`${state.energy/state.maxEnergy*100}%`;
}

document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
document.querySelector('#endDay').addEventListener('click',endDay);
render();

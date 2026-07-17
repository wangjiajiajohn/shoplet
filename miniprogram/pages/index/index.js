const app = getApp();

Page({
  data: {
    info: {},
    activeCat: 'banchuan',
    statusBarHeight: 0,
    navBarHeight: 0,
    rightSafe: 0,
    tapCount: 0,

    // 拌川菜单 —— 实际使用时把 emoji 换成 image 组件 + 真实图片即可
    menuBanchuan: [
      { name: '杭州老式拌川', hot: true, desc: '猪肉丝 · 雪菜 · 豆芽 · 手打粗面', price: '¥15', emoji: '🍜', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(224,138,60,0.25))' },
      { name: '牛肉拌川', hot: false, desc: '现炒牛肉片 · 双椒 · 粗面', price: '¥18', emoji: '🥩', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(180,67,46,0.25))' },
      { name: '大排拌川', hot: false, desc: '现炸大排 · 榨菜丝 · 粗面', price: '¥17', emoji: '🍖', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(224,168,96,0.3))' }
    ],

    // 浇头
    menuTopping: [
      { name: '猪肝浇头', hot: true, desc: '现切猪肝 · 火候刚好', price: '+¥8', priceSuffix: '/份', emoji: '🥓', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(180,67,46,0.25))' },
      { name: '腰花浇头', hot: false, desc: '新鲜腰花 · 爆炒入味', price: '+¥10', priceSuffix: '/份', emoji: '🥩', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(160,50,40,0.2))' },
      { name: '虾仁浇头', hot: false, desc: '鲜剥虾仁 · 清甜爽口', price: '+¥12', priceSuffix: '/份', emoji: '🦐', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(127,163,209,0.25))' },
      { name: '加蛋 / 加素', hot: false, desc: '煎蛋一只 或 时蔬一份', price: '+¥3', priceSuffix: '/份', emoji: '🍳', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(91,122,82,0.2))' }
    ],

    // 饮品
    menuDrink: [
      { name: '冰镇啤酒', desc: '配拌川最对味', price: '¥6', emoji: '🍺', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(91,122,82,0.25))' },
      { name: '雪碧', desc: '冰镇整瓶', price: '¥4', emoji: '🥤', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(74,120,86,0.25))' },
      { name: '矿泉水', desc: '冰柜现拿', price: '¥2', emoji: '💧', bg: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(127,163,209,0.25))' }
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const navBarHeight = sysInfo.statusBarHeight + 48;
    const menuBtn = sysInfo.menuButtonBoundingClientRect;
    const rightSafe = menuBtn ? (sysInfo.windowWidth - menuBtn.right + 32) : 28;
    this.setData({ 
      statusBarHeight: sysInfo.statusBarHeight, 
      navBarHeight,
      rightSafe
    });
  },

  onShow() {
    app.checkDailyReset();
    this.setData({ info: app.getStallInfo() });
  },

  switchCat(e) {
    this.setData({ activeCat: e.currentTarget.dataset.cat });
  },

  openMap() {
    const { location, locationSub, latitude, longitude } = this.data.info;
    if (!latitude || !longitude) {
      wx.showToast({ title: '暂无定位信息', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude,
      longitude,
      name: '有点晚拌川',
      address: location + (locationSub ? ' · ' + locationSub : ''),
      scale: 16
    });
  },

  

  onTitleTap() {
    const count = this.data.tapCount + 1;
    this.setData({ tapCount: count });
    
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }
    
    if (count >= 5) {
      this.setData({ tapCount: 0 });
      wx.navigateTo({ url: '/pages/admin/admin' });
      return;
    }
    
    this.tapTimer = setTimeout(() => {
      this.setData({ tapCount: 0 });
    }, 3000);
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  }
});

App({
  globalData: {
    stallInfo: {
      status: 'not_started',
      location: '杭州采荷中学南门',
      locationSub: '',
      latitude: 30.253,
      longitude: 120.199,
      time: '22:30',
      timeSub: '',
      note: '',
      announcement: '周六休息一天，周日正常出摊',
      lastResetDate: ''
    },
    menu: {
      categories: [
        { id: 'banchuan', name: '拌川', icon: '🍜' },
        { id: 'topping', name: '浇头', icon: '🥓' },
        { id: 'drink', name: '饮品', icon: '🥤' }
      ],
      products: {
        banchuan: [
          { id: 'b1', name: '杭州老式拌川', hot: true, desc: '猪肉丝 · 雪菜 · 豆芽 · 手打粗面', price: '¥15', priceSuffix: '', emoji: '🍜' },
          { id: 'b2', name: '牛肉拌川', hot: false, desc: '现炒牛肉片 · 双椒 · 粗面', price: '¥18', priceSuffix: '', emoji: '🥩' },
          { id: 'b3', name: '大排拌川', hot: false, desc: '现炸大排 · 榨菜丝 · 粗面', price: '¥17', priceSuffix: '', emoji: '🍖' },
          { id: 'b4', name: '腰花拌川', hot: true, desc: '新鲜腰花 · 韭黄 · 爆炒入味', price: '¥22', priceSuffix: '', emoji: '🐷' },
          { id: 'b5', name: '猪肝拌川', hot: false, desc: '现切猪肝 · 洋葱 · 滑嫩可口', price: '¥20', priceSuffix: '', emoji: '🥓' },
          { id: 'b6', name: '虾仁拌川', hot: false, desc: '鲜剥虾仁 · 青豆 · 清甜爽口', price: '¥28', priceSuffix: '', emoji: '🦐' }
        ],
        topping: [
          { id: 't1', name: '猪肝浇头', hot: true, desc: '现切猪肝 · 火候刚好', price: '+¥8', priceSuffix: '/份', emoji: '🥓' },
          { id: 't2', name: '腰花浇头', hot: false, desc: '新鲜腰花 · 爆炒入味', price: '+¥10', priceSuffix: '/份', emoji: '🥩' },
          { id: 't3', name: '虾仁浇头', hot: false, desc: '鲜剥虾仁 · 清甜爽口', price: '+¥12', priceSuffix: '/份', emoji: '🦐' },
          { id: 't4', name: '加蛋 / 加素', hot: false, desc: '煎蛋一只 或 时蔬一份', price: '+¥3', priceSuffix: '/份', emoji: '🍳' },
          { id: 't5', name: '牛肉浇头', hot: false, desc: '现炒牛肉片 · 嫩滑多汁', price: '+¥10', priceSuffix: '/份', emoji: '🥩' },
          { id: 't6', name: '大排浇头', hot: false, desc: '现炸大排 · 外酥里嫩', price: '+¥9', priceSuffix: '/份', emoji: '🍖' },
          { id: 't7', name: '榨菜肉丝', hot: false, desc: '榨菜 · 猪肉丝 · 下饭神器', price: '+¥6', priceSuffix: '/份', emoji: '🥬' }
        ],
        drink: [
          { id: 'd1', name: '冰镇啤酒', hot: false, desc: '配拌川最对味', price: '¥6', priceSuffix: '', emoji: '🍺' },
          { id: 'd2', name: '雪碧', hot: false, desc: '冰镇整瓶', price: '¥4', priceSuffix: '', emoji: '🥤' },
          { id: 'd3', name: '矿泉水', hot: false, desc: '冰柜现拿', price: '¥2', priceSuffix: '', emoji: '💧' },
          { id: 'd4', name: '可乐', hot: false, desc: '冰爽解渴', price: '¥4', priceSuffix: '', emoji: '🥤' },
          { id: 'd5', name: '冰红茶', hot: false, desc: '冰爽茶味', price: '¥4', priceSuffix: '', emoji: '🍵' },
          { id: 'd6', name: '花生豆奶', hot: false, desc: '暖胃解腻', price: '¥3', priceSuffix: '', emoji: '🥛' }
        ]
      }
    }
  },

  onLaunch() {
    const saved = wx.getStorageSync('stallInfo');
    if (saved) {
      this.globalData.stallInfo = saved;
    }
    const savedMenu = wx.getStorageSync('menu');
    if (savedMenu && savedMenu.categories && savedMenu.categories.length > 0) {
      this.globalData.menu = savedMenu;
    } else {
      wx.setStorageSync('menu', this.globalData.menu);
    }
    this.checkDailyReset();
  },

  checkDailyReset() {
    const info = this.globalData.stallInfo;
    const today = new Date().toDateString();
    
    if (info.lastResetDate !== today) {
      const hour = new Date().getHours();
      if (hour >= 6) {
        info.status = 'not_started';
        info.lastResetDate = today;
        this.saveStallInfo(info);
      }
    }
  },

  // 供各页面统一读取
  getStallInfo() {
    let saved = wx.getStorageSync('stallInfo');
    if (saved) {
      if (saved.time && saved.time.includes('–')) {
        const match = saved.time.match(/(\d{2}:\d{2})/);
        if (match) {
          saved.time = match[1];
          saved.timeSub = '';
          this.saveStallInfo(saved);
        }
      }
      return saved;
    }
    return this.globalData.stallInfo;
  },

  // 供老板端保存
  saveStallInfo(info) {
    this.globalData.stallInfo = info;
    wx.setStorageSync('stallInfo', info);
  },

  getMenu() {
    const saved = wx.getStorageSync('menu');
    if (saved && saved.categories && saved.categories.length > 0 && saved.products) {
      return saved;
    }
    return this.globalData.menu;
  },

  saveMenu(menu) {
    this.globalData.menu = menu;
    wx.setStorageSync('menu', menu);
  }
});

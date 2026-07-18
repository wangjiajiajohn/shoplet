const app = getApp();

Page({
  data: {
    info: {},
    menu: {},
    activeCat: 'banchuan',
    statusBarHeight: 0,
    navBarHeight: 0,
    rightSafe: 0,
    tapCount: 0,
    loading: true
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
    this.loadData();
  },

  async onShow() {
    await app.checkDailyReset();
    await this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [info, menu] = await Promise.all([
        app.getStallInfo(),
        app.getMenu()
      ]);
      let activeCat = this.data.activeCat;
      const hasCategory = menu.categories && menu.categories.some(c => c.id === activeCat);
      if (!hasCategory) {
        activeCat = menu.categories && menu.categories[0]?.id || 'banchuan';
      }
      this.setData({ 
        info,
        menu,
        activeCat,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
    }
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
  },

  onRefresh() {
    if (this.data.loading) return;
    this.loadData();
  },

  onShareAppMessage() {
    return {
      title: '有点晚拌川',
      desc: '老板已经支好摊子，铁锅正热着 —— 现在过去，拌川管够。',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: '有点晚拌川',
      query: '',
      imageUrl: ''
    };
  }
});

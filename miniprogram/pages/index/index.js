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
    loading: true,
    animatedCards: {},
    animatedProducts: {}
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
      this.initAnimation();
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
    }
  },

  switchCat(e) {
    const newCat = e.currentTarget.dataset.cat;
    this.setData({ 
      activeCat: newCat,
      animatedProducts: {}
    });
    setTimeout(() => {
      this.triggerProductAnimations();
    }, 100);
  },

  triggerProductAnimations() {
    const { menu, activeCat } = this.data;
    if (!menu.products || !menu.products[activeCat]) return;
    
    const products = menu.products[activeCat];
    products.forEach((product, index) => {
      setTimeout(() => {
        this.setData({
          [`animatedProducts.${product.id}`]: true
        });
      }, index * 80);
    });
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

  goShopDetail() {
    wx.navigateTo({ url: '/pages/shop-detail/shop-detail' });
  },

  initAnimation() {
    setTimeout(() => {
      this.animateOnLoad();
      this.triggerProductAnimations();
    }, 100);
  },

  animateOnLoad() {
    const cards = ['status', 'loc', 'time'];
    cards.forEach((card, index) => {
      setTimeout(() => {
        this.setData({
          [`animatedCards.${card}`]: true
        });
      }, index * 100);
    });
  },

  triggerProductAnimations() {
    const { menu, activeCat, animatedProducts } = this.data;
    if (!menu.products || !menu.products[activeCat]) return;
    
    const products = menu.products[activeCat];
    const windowHeight = wx.getSystemInfoSync().windowHeight;
    
    products.forEach((product, index) => {
      const query = wx.createSelectorQuery();
      query.select(`#product-${product.id}`).boundingClientRect((rect) => {
        if (rect && rect.top < windowHeight + 100) {
          setTimeout(() => {
            if (!this.data.animatedProducts[product.id]) {
              this.setData({
                [`animatedProducts.${product.id}`]: true
              });
            }
          }, index * 80);
        }
      }).exec();
    });
  },

  onPageScroll(e) {
    const { menu, activeCat, animatedProducts } = this.data;
    if (!menu.products || !menu.products[activeCat]) return;
    
    const products = menu.products[activeCat];
    const windowHeight = wx.getSystemInfoSync().windowHeight;
    const scrollTop = e.scrollTop;
    
    products.forEach((product) => {
      if (animatedProducts[product.id]) return;
      
      const query = wx.createSelectorQuery();
      query.select(`#product-${product.id}`).boundingClientRect((rect) => {
        if (rect && rect.top - scrollTop < windowHeight) {
          this.setData({
            [`animatedProducts.${product.id}`]: true
          });
        }
      }).exec();
    });
  },

  onUnload() {
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }
  },

  makePhoneCall() {
    const phone = this.data.info.phone;
    if (!phone) return;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({ title: '拨打电话失败', icon: 'none' });
      }
    });
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

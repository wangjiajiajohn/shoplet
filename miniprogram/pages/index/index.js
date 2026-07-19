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
    sidebarOpen: false,
    userInfo: {
      avatarUrl: '',
      nickName: ''
    }
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const navBarHeight = sysInfo.statusBarHeight + 48;
    const menuBtn = sysInfo.menuButtonBoundingClientRect;
    const rightSafe = menuBtn ? (sysInfo.windowWidth - menuBtn.right + 32) : 28;
    
    const savedUserInfo = wx.getStorageSync('userInfo') || {};
    
    this.setData({ 
      statusBarHeight: sysInfo.statusBarHeight, 
      navBarHeight,
      rightSafe,
      userInfo: {
        avatarUrl: savedUserInfo.avatarUrl || '',
        nickName: savedUserInfo.nickName || ''
      }
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
    const newCat = e.currentTarget.dataset.cat;
    this.setData({ activeCat: newCat });
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
    this.closeSidebar();
    wx.navigateTo({ url: '/pages/shop-detail/shop-detail' });
  },

  goOrders() {
    this.closeSidebar();
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  toggleSidebar() {
    this.setData({ sidebarOpen: !this.data.sidebarOpen });
  },

  closeSidebar() {
    this.setData({ sidebarOpen: false });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        if (app.globalData.dbReady) {
          const cloudPath = 'avatar/' + Date.now() + '.png';
          
          try {
            const uploadRes = await wx.cloud.uploadFile({
              cloudPath: cloudPath,
              filePath: tempFilePath
            });
            
            const userInfo = { ...this.data.userInfo, avatarUrl: uploadRes.fileID };
            this.setData({ userInfo });
            wx.setStorageSync('userInfo', userInfo);
            wx.showToast({ title: '头像更新成功', icon: 'success' });
          } catch (error) {
            console.error('上传头像失败:', error);
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        } else {
          const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
          this.setData({ userInfo });
          wx.setStorageSync('userInfo', userInfo);
          wx.showToast({ title: '头像已保存（仅本地）', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '取消选择', icon: 'none' });
      }
    });
  },

  onNicknameBlur(e) {
    const nickName = e.detail.value;
    const userInfo = { ...this.data.userInfo, nickName };
    this.setData({ userInfo });
    wx.setStorageSync('userInfo', userInfo);
  },

  onUnload() {
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

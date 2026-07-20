const app = getApp();

Page({
  data: {
    info: {},
    menu: {},
    activeCat: 'banchuan',
    activeCatIndex: 0,
    jellyAnimation: {},
    statusBarHeight: 0,
    navBarHeight: 0,
    rightSafe: 0,
    
    loading: true,
    sidebarOpen: false,
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    passwordModalVisible: false,
    passwordInput: ''
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
      const activeCatIndex = menu.categories && menu.categories.findIndex(c => c.id === activeCat) || 0;
      this.setData({ 
        info,
        menu,
        activeCat,
        activeCatIndex,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
    }
  },

  switchCat(e) {
    const newCat = e.currentTarget.dataset.cat;
    const newIndex = e.currentTarget.dataset.index;
    this.setData({ activeCat: newCat, activeCatIndex: newIndex });
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
      name: 'shoplet',
      address: location + (locationSub ? ' · ' + locationSub : ''),
      scale: 16
    });
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
      title: 'shoplet',
      desc: '老板已经支好摊子，商品齐全 —— 现在过去，选购愉快。',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: 'shoplet',
      query: '',
      imageUrl: ''
    };
  },

  showPasswordModal() {
    this.setData({ passwordModalVisible: true, passwordInput: '' });
  },

  hidePasswordModal() {
    this.setData({ passwordModalVisible: false });
  },

  onPasswordInput(e) {
    this.setData({ passwordInput: e.detail.value });
  },

  submitPassword() {
    const password = this.data.passwordInput.trim();
    if (!password) {
      wx.showToast({ title: '请输入口令', icon: 'none' });
      return;
    }
    
    if (password === 'shoplet' || password === '888888') {
      this.hidePasswordModal();
      this.closeSidebar();
      wx.navigateTo({ url: '/pages/admin/admin' });
    } else {
      wx.showToast({ title: '口令错误', icon: 'none' });
      this.setData({ passwordInput: '' });
    }
  }
});

App({
  globalData: {
    stallInfo: {
      isOn: true,
      location: '杭州采荷中学南门',
      locationSub: '',
      latitude: 30.253,
      longitude: 120.199,
      time: '22:30 – 02:00',
      timeSub: '深夜档 · 卖完即收',
      note: '',
      announcement: '周六休息一天，周日正常出摊'
    }
  },

  onLaunch() {
    // 启动时尝试从本地缓存读取老板保存过的出摊信息
    const saved = wx.getStorageSync('stallInfo');
    if (saved) {
      this.globalData.stallInfo = saved;
    }
  },

  // 供各页面统一读取
  getStallInfo() {
    const saved = wx.getStorageSync('stallInfo');
    return saved || this.globalData.stallInfo;
  },

  // 供老板端保存
  saveStallInfo(info) {
    this.globalData.stallInfo = info;
    wx.setStorageSync('stallInfo', info);
  }
});

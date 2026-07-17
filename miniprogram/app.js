App({
  globalData: {
    // 出摊信息默认值，实际数据存在本地缓存里（后续可换成云开发/服务器接口）
    stallInfo: {
      isOn: true,
      location: '文一西路口',
      locationSub: '近电子科技大楼',
      time: '17:30 – 21:00',
      timeSub: '卖完即收摊',
      note: ''
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

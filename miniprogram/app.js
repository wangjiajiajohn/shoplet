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
    }
  },

  onLaunch() {
    const saved = wx.getStorageSync('stallInfo');
    if (saved) {
      this.globalData.stallInfo = saved;
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
  }
});

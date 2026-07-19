Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 0
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ 
      statusBarHeight: sysInfo.statusBarHeight, 
      navBarHeight: sysInfo.statusBarHeight + 48
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
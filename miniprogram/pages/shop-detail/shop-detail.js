const app = getApp();

Page({
  data: {
    info: {},
    statusBarHeight: 0,
    navBarHeight: 0
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const navBarHeight = sysInfo.statusBarHeight + 48;
    this.setData({ 
      statusBarHeight: sysInfo.statusBarHeight, 
      navBarHeight
    });
    this.loadData();
  },

  async loadData() {
    try {
      const info = await app.getStallInfo();
      this.setData({ info });
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  },

  goBack() {
    wx.navigateBack();
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
  }
});
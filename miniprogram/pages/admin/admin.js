const app = getApp();

Page({
  data: {
    form: {
      isOn: true,
      location: '文一西路口',
      locationSub: '近电子科技大楼',
      time: '17:30 – 21:00',
      timeSub: '卖完即收摊',
      note: ''
    }
  },

  onShow() {
    // 打开设置页时，读取当前已保存的出摊信息作为初始值
    this.setData({ form: app.getStallInfo() });
  },

  setStatus(e) {
    const isOn = e.currentTarget.dataset.on;
    this.setData({ 'form.isOn': isOn });
  },

  setLoc(e) {
    const { loc, sub, lat, lng } = e.currentTarget.dataset;
    this.setData({
      'form.location': loc,
      'form.locationSub': sub,
      'form.latitude': parseFloat(lat),
      'form.longitude': parseFloat(lng)
    });
  },

  setTime(e) {
    this.setData({ 'form.time': e.currentTarget.dataset.time });
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value });
  },

  saveInfo() {
    app.saveStallInfo(this.data.form);
    wx.showToast({
      title: '已发布给顾客',
      icon: 'success',
      duration: 1500
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 900);
  }
});

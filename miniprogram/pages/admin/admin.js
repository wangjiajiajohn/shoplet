const app = getApp();

Page({
  data: {
    form: {
      status: 'not_started',
      location: '文一西路口',
      locationSub: '近电子科技大楼',
      time: '17:30',
      timeSub: '',
      note: '',
      announcement: '',
      lastResetDate: ''
    }
  },

  onShow() {
    const info = app.getStallInfo();
    if (info.time && info.time.includes('–')) {
      const match = info.time.match(/(\d{2}:\d{2})/);
      if (match) {
        info.time = match[1];
        info.timeSub = '';
        app.saveStallInfo(info);
      }
    }
    this.setData({ form: info });
  },

  setStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 'form.status': status });
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

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.location': res.name || res.address,
          'form.locationSub': res.name ? res.address : '',
          'form.latitude': res.latitude,
          'form.longitude': res.longitude
        });
      },
      fail: () => {
        wx.showToast({ title: '定位失败', icon: 'none' });
      }
    });
  },

  onTimeChange(e) {
    this.setData({ 'form.time': e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value });
  },

  onAnnouncementInput(e) {
    this.setData({ 'form.announcement': e.detail.value });
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

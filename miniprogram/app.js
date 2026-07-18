App({
  cleanData(data) {
    const cleaned = { ...data }
    delete cleaned._openid
    delete cleaned._id
    delete cleaned._createTime
    delete cleaned._updateTime
    return cleaned
  },

  globalData: {
    stallInfo: {
      status: 'not_started',
      location: '',
      locationSub: '',
      latitude: null,
      longitude: null,
      time: '',
      timeSub: '',
      note: '',
      announcement: '',
      lastResetDate: '',
      phone: '',
      qrcode: ''
    },
    menu: {
      categories: [],
      products: {}
    },
    dbReady: false
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      })
      this.globalData.dbReady = true
      this.initCloudData()
    } else {
      console.warn('云开发未初始化，使用本地存储')
      const saved = wx.getStorageSync('stallInfo')
      if (saved) {
        this.globalData.stallInfo = saved
      }
      const savedMenu = wx.getStorageSync('menu')
      if (savedMenu && savedMenu.categories && savedMenu.categories.length > 0) {
        this.globalData.menu = savedMenu
      } else {
        wx.setStorageSync('menu', this.globalData.menu)
      }
    }
    this.checkDailyReset()
  },

  async initCloudData() {
    try {
      const db = wx.cloud.database()
      const stallInfoRes = await db.collection('stallInfo').get()
      if (stallInfoRes.data.length > 0) {
        this.globalData.stallInfo = stallInfoRes.data[0]
      }

      const menuRes = await db.collection('menu').get()
      if (menuRes.data.length > 0) {
        this.globalData.menu = menuRes.data[0]
      }
    } catch (error) {
      console.error('云数据库初始化失败:', error)
    }
  },

  async checkDailyReset() {
    const today = new Date().toDateString()
    
    if (this.globalData.dbReady) {
      try {
        const db = wx.cloud.database()
        const res = await db.collection('stallInfo').get()
        if (res.data.length > 0) {
          const info = res.data[0]
          if (info.lastResetDate !== today) {
            const hour = new Date().getHours()
            if (hour >= 6) {
              info.status = 'not_started'
              info.lastResetDate = today
              const cleaned = this.cleanData(info)
              await db.collection('stallInfo').doc(info._id).update({
                data: cleaned
              })
            }
          }
        }
      } catch (error) {
        console.error('每日重置失败:', error)
      }
    }
  },

  async getStallInfo() {
    if (this.globalData.dbReady) {
      try {
        const db = wx.cloud.database()
        const res = await db.collection('stallInfo').get()
        if (res.data.length > 0) {
          const saved = res.data[0]
          if (saved.time && saved.time.includes('–')) {
            const match = saved.time.match(/(\d{2}:\d{2})/)
            if (match) {
              saved.time = match[1]
              saved.timeSub = ''
              await this.saveStallInfo(saved)
            }
          }
          return saved
        }
      } catch (error) {
        console.error('读取 stallInfo 失败:', error)
      }
    } else {
      let saved = wx.getStorageSync('stallInfo')
      if (saved) {
        if (saved.time && saved.time.includes('–')) {
          const match = saved.time.match(/(\d{2}:\d{2})/)
          if (match) {
            saved.time = match[1]
            saved.timeSub = ''
            this.saveStallInfo(saved)
          }
        }
        return saved
      }
    }
    return this.globalData.stallInfo
  },

  async saveStallInfo(info) {
    this.globalData.stallInfo = info
    if (this.globalData.dbReady) {
      try {
        const db = wx.cloud.database()
        const cleaned = this.cleanData(info)
        const res = await db.collection('stallInfo').get()
        if (res.data.length > 0) {
          await db.collection('stallInfo').doc(res.data[0]._id).update({
            data: cleaned
          })
        } else {
          await db.collection('stallInfo').add({
            data: cleaned
          })
        }
      } catch (error) {
        console.error('保存 stallInfo 失败:', error)
        wx.showToast({ title: '保存失败，请检查数据库权限', icon: 'none', duration: 3000 })
        throw error
      }
    } else {
      wx.setStorageSync('stallInfo', info)
    }
  },

  async getMenu() {
    if (this.globalData.dbReady) {
      try {
        const db = wx.cloud.database()
        const res = await db.collection('menu').get()
        if (res.data.length > 0 && res.data[0].categories && res.data[0].categories.length > 0 && res.data[0].products) {
          return res.data[0]
        }
      } catch (error) {
        console.error('读取 menu 失败:', error)
      }
    } else {
      const saved = wx.getStorageSync('menu')
      if (saved && saved.categories && saved.categories.length > 0 && saved.products) {
        return saved
      }
    }
    return this.globalData.menu
  },

  async saveMenu(menu) {
    this.globalData.menu = menu
    if (this.globalData.dbReady) {
      try {
        const db = wx.cloud.database()
        const cleaned = this.cleanData(menu)
        const res = await db.collection('menu').get()
        if (res.data.length > 0) {
          await db.collection('menu').doc(res.data[0]._id).update({
            data: cleaned
          })
        } else {
          await db.collection('menu').add({
            data: cleaned
          })
        }
      } catch (error) {
        console.error('保存 menu 失败:', error)
        wx.showToast({ title: '保存失败，请检查数据库权限', icon: 'none', duration: 3000 })
        throw error
      }
    } else {
      wx.setStorageSync('menu', menu)
    }
  }
});

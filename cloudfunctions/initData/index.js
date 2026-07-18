const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const stallInfoRes = await db.collection('stallInfo').get()
    if (stallInfoRes.data.length === 0) {
      await db.collection('stallInfo').add({
        data: {
          status: 'not_started',
          location: '',
          locationSub: '',
          latitude: null,
          longitude: null,
          time: '',
          timeSub: '',
          note: '',
          announcement: '',
          lastResetDate: ''
        }
      })
    }

    const menuRes = await db.collection('menu').get()
    if (menuRes.data.length === 0) {
      await db.collection('menu').add({
        data: {
          categories: [],
          products: {}
        }
      })
    }

    return {
      success: true,
      message: '初始化完成'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const APP_ID = 'your_wechat_appid'
  
  try {
    const response = await axios.post('http://localhost:3001/api/merchants/check', {
      openid: OPENID,
      app_id: APP_ID
    })
    
    if (response.data && response.data.success) {
      return {
        success: true,
        isMerchant: response.data.isMerchant,
        message: response.data.isMerchant ? '验证成功，是商家' : '不是商家'
      }
    }
    
    return {
      success: false,
      isMerchant: false,
      message: '验证失败'
    }
  } catch (error) {
    console.error('调用后端验证接口失败:', error)
    
    try {
      const db = cloud.database()
      const res = await db.collection('stallInfo').get()
      if (res.data.length > 0) {
        const stallInfo = res.data[0]
        if (stallInfo.merchantOpenid && stallInfo.merchantOpenid === OPENID) {
          return {
            success: true,
            isMerchant: true,
            message: '本地验证成功，是商家'
          }
        }
      }
    } catch (dbError) {
      console.error('本地数据库验证失败:', dbError)
    }
    
    return {
      success: true,
      isMerchant: false,
      message: '后端服务不可用，降级验证通过'
    }
  }
}
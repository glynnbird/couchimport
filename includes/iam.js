const ccurllib = require('ccurllib')

const getToken = async (IAM_API_KEY) => {
  if (IAM_API_KEY) {
    let obj
    obj = ccurllib.get(IAM_API_KEY)
    if (!obj) {
      obj = await ccurllib.getBearerToken(IAM_API_KEY)
      if (obj) {
        ccurllib.set(IAM_API_KEY, obj)
      }
    }
    if (!obj) {
      throw new Error('Could not perform IAM authentication')
    }
    return obj.access_token
  } else {
    return null
  }
}

module.exports = {
  getToken
}

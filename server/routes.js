const { predictHandler, historyHandler} = require('../server/handler');
  
const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: predictHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true
      }
    }
  },
  {
    path: '/predict/histories',
    method: 'GET',
    handler: historyHandler
  }
] 
  
module.exports = routes;
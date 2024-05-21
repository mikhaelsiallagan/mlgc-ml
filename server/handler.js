const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');
 
async function predictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { result, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  const data = {
    "id": id,
    "result": result,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data: data
  })
  response.code(201);
  return response;
}

async function historyHandler(request, h) {
  const db = new Firestore();
  const predictCollection = db.collection('predictions');

  try {
      const snapshot = await predictCollection.get();
      if (snapshot.empty) {
          return h.response({
              status: 'success',
              data: []
          }).code(200);
      }

      const histories = snapshot.docs.map(doc => ({
          id: doc.id,
          history: doc.data()
      }));

      return h.response({
          status: 'success',
          data: histories
      }).code(200);

  } catch (error) {
      return h.response({
          status: 'fail',
          message: 'Failed to retrieve prediction histories'
      }).code(500);
  }
}

module.exports = { predictHandler, historyHandler };
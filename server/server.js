require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
 
(async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
            payload: {
                maxBytes: 1000000,
            },
        },
    });
    
    const model = await loadModel();
    server.app.model = model;
    
    server.route(routes);
    
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError || response.isBoom) {
            const statusCode = response instanceof InputError ? response.statusCode : response.output.statusCode;
            const errorMessage = response instanceof InputError ? response.message : response.output.payload.message;
            const newResponse = h.response({
                status: 'fail',
                message: errorMessage,
            });
            newResponse.code(parseInt(statusCode));
            return newResponse;
        }


        if (request.payload && request.payload.length > 1000000) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
            newResponse.code(413);
            return newResponse;
        }    

        return h.continue;
    });
    
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();
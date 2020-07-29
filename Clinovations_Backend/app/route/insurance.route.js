module.exports = function(app)
{
    const insurance = require('../controller/insurance.controller.js')

    app.get('/api/premiums',insurance.getPremiums)
}
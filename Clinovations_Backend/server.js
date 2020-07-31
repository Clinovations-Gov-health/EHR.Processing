var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json())

const cors = require('cors')
const corsOptions = {
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
const db = require('./app/db/mongodb.connect')

require('./app/route/insurance.route.js')(app);
// Create a Server


db.connect((err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  else {
    app.listen(8081, function () {
      console.log('Connected to app');
    })
  }
})


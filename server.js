const debug = require('debug')('app:server');
const session = require('cookie-session');
const express = require('express');
const app = express();
const morgan = require('morgan');
const logger = require('morgan');
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const CONFIG_FILE_PATH = __dirname + '/configs.json';
const config = require(CONFIG_FILE_PATH);
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    debug('Server Started. *:%o', PORT);
});

// Views setting
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Body Parser
app.use(morgan('tiny'));
app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));

//Simple Usage (Enable All CORS Requests)
app.use(cors())
    // app.get('/products/:id', function (req, res, next) {
    //   res.json({msg: 'This is CORS-enabled for all origins!'})
    // })
    // app.listen(80, function () {
    //   console.log('CORS-enabled web server listening on port 80')
    // })

//Static image
app.use(express.static(path.join(__dirname, 'uploads')));

// cookie-session
app.set('trust proxy', 1); // trust first proxy

app.use(session(config.cookies));

// MaxAge
app.use(function SessionMaxAgeMiddleware(req, res, next) {
    req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge;
    next();
});

// locals.
app.use(function LocalsMiddleware(req, res, next) {

    res.locals.edit = false;
    res.locals.user = req.session.user || false;

    next();
});

// All controllers should live here
app.get("/", function rootHandler(req, res) {
    res.end("Hello world!");
});

// ---------------------- ROUTES FILE ---------------------------------
// OKKP
const users = require('./users/routes.js');

// ---------------------- URL NAMESPACE ---------------------------------
// OKKP
app.use('/api/users', users)


// Error Middleware
app.use(require('./libs/error.js'));

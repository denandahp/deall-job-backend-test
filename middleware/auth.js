const config = require('../configs.json');
const jwt = require('jsonwebtoken');
const pool = require('../libs/db');

const schema = 'public';
const db_roles = schema + '.roles';


async function auth_admin (req, res, next) {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let access_token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        access_token = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        access_token = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }
    try {
        let query = await pool.query(`SELECT * from ${db_roles} WHERE name = 'Admin'`);
        let roles = query.rows[0];
        jwt.verify(access_token, config.secret, async function (err, decoded) {
            if (err) return res.status(401).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
            req.user = decoded;
            let users = decoded.data.data
            if(roles.id == users.role_id){
                next();
                return;
            }else{
                res.status(400).send({
                    status: res.statusCode,
                    message: 'Only admin can access'
                });
            }

        });

    } catch (error) {
        res.status(500).send({
            status: res.statusCode,
            message: 'Unauthorized',
            error: error.message
        });
    }
};

async function auth(req, res, next){
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let access_token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        access_token = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        access_token = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        jwt.verify(access_token, config.secret, async function (err, decoded) {
            if (err) return res.status(401).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
            req.user = decoded;
            next();
            return;
        });

    } catch (error) {
        res.status(500).send({
            status: res.statusCode,
            message: 'Unauthorized'
        });
    }
};

module.exports = {auth_admin, auth}
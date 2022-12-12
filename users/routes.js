const Router = require('express').Router();
const {auth_admin, auth} = require('../middleware/auth.js')
const user = require('./controllers.js');

Router
      .get('', auth_admin, user.index)
      .get('/detail', user.detail_users)
      .post('/login', user.login)
      .post('/logout', user.logout)
      .post('/add', auth_admin, user.register_users)
      .put('/edit', auth_admin ,user.update_users)
      .delete('/delete', auth_admin, user.delete_users)

module.exports = Router;
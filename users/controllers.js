const core = require('../utils/core.js');
const config = require('../configs.json');
const user = require('./models.js');
const jwt = require('jsonwebtoken');

let refreshTokens = []

class UserController {
  async showAllUser (req, res) {
    let users = (await user.get()).rows;

    res.render('index', {
      users
    });
  }

  async login (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    try {
      let data = await user.login(username, password);
      let accessToken = jwt.sign({
        data
      }, config.secret, {
        expiresIn: "2h"
      });
      let refreshToken = jwt.sign({
        data
      }, config.secret2, {
        expiresIn: "5h"
      });
      refreshTokens.push(refreshToken);
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        maxAge: -1
      });
      if (data.status == '400') {res.status(400).json({ response: data });}
      else {
        res.status(200).json({
            response: data,
            accessToken,
            refreshToken
          });
      }
      
    } catch (e) {
      let errorResponse = core.processLoginError(e);
      res.status(400).json(errorResponse);
    }
  } 

  async logout (req, res, next) {
    res.clearCookie('jwt');
    res.status(200).json({
      message: 'Cookie cleared'
    });
  }
  
  async register_users(req, res, next) {
    let callback = async() => {
        try {
            let data = req.body;
            let response = await user.register_users(data);
            core.response(res, response)
        } catch (e) {
            next(e.detail || e);
        }
    };
    let fallback = (err) => {
        next(err);
    }
    core.processRequestWithJWT(req, callback, fallback);
  }
  async update_users(req, res, next) {
    let callback = async() => {
        try {
            let data = req.body;
            let response = await user.update_users(data);
            core.response(res, response)
        } catch (e) {
            next(e.detail || e);
        }
    };
    let fallback = (err) => {
        next(err);
    }
    core.processRequestWithJWT(req, callback, fallback);
  }

  async index_sekretariat(req, res, next) {
    let callback = async() => {
        try {
            let id = req.query.user;
            let role = req.query.role;
            let detail = await user.index_sekretariat(id, role);
            if (detail.status == '400') {res.status(400).json({ detail });}
            else { res.status(200).json({ detail });}
        } catch (e) {
            next(e.detail || e);
        }
    };
    let fallback = (err) => {
        next(err);
    }
    core.processRequestWithJWT(req, callback, fallback);
  }

  async detail_pelaku_usaha(req, res, next) {
    let callback = async() => {
        try {
            let id = req.query.user;
            debug('detail %o', id);
            let detail = await user.detail_pelaku_usaha(id);
            if (detail.status == '400') {res.status(400).json({ detail });}
            else { res.status(200).json({ detail });}
        } catch (e) {
            next(e.detail || e);
        }
    };
    let fallback = (err) => {
        next(err);
    }
    core.processRequestWithJWT(req, callback, fallback);
  }

  async delete_sekretariat(req, res, next) {
    let callback = async() => {
        try {
            let id = req.query.user;
            let role = req.query.role;
            debug('detail %o', id);
            let detail = await user.delete_sekretariat(id, role);
            if (detail.status == '400') {res.status(400).json({ detail });}
            else { res.status(200).json({ detail });}
        } catch (e) {
            next(e.detail || e);
        }
    };
    let fallback = (err) => {
        next(err);
    }
    core.processRequestWithJWT(req, callback, fallback);
  }

}

module.exports = new UserController();
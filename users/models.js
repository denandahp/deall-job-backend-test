const encryptPassword = require('../libs/secret.js').encryptPassword;
var format = require('pg-format');
const pool = require('../libs/db');
const utils = require('./utils.js')

const schema = 'public';
const db_users = schema + '.users';

class UserModel {
  async login (username, password) {
    try{
      password = encryptPassword(password, username);
      let query = await pool.query(`SELECT * from ${db_users} where username = $1`, [username]);
      let users = query.rows[0];
      if (query.rowCount <= 0) {
        throw new Error('User tidak ditemukan.');
      } else {
        if (password == users.password) {
          users.password = undefined;
          return {status: 200, data: users};
        } else {
          throw new Error('Password salah.');
        }
      }
    }catch (ex) {
      return { status: '400', Error: ex.message };
    };
  }

  async register_users(data) {
    try {
      let {key, value} = utils.serialize_users(data, 'created');
      let query = await pool.query(format(`INSERT INTO ${db_users} (${key}) VALUES (%L) RETURNING *`, value));
      let users = query.rows[0]
      return {status: 'success', data: users};
    } catch (ex) {
        return { status: '400', Error: ex.message };
    };
  }

  async update_users(data) {
    try {
      let {key, value} = utils.serialize_users(data, 'updated');
      let query = await pool.query(format(`UPDATE ${db_users} SET (${key}) = (%L) WHERE id = ${data.id} RETURNING *`, value));
      let users = query.rows[0]
      return {status:200, data: users};
    } catch (ex) {
        return { status: '400', Error: ex.message };
    };
  }

  async index() {
    try {
        let query = await pool.query(format(`SELECT * FROM ${db_users}`));
        let users = query.rows
        return { status: '200', data: users};
    } catch (ex) {
      return { status: '400', Error: ex.message };
    };
}

  async detail_users(id) {
    try {
        let query = await pool.query(`SELECT * FROM ${db_users} WHERE id=${id}`);
        let users = query.rows[0]
        return { status: '200', data: users};
    } catch (ex) {
        return { status: '400', Error: ex.message };
    };
  }

  async delete_users(id) {
    try {
      let query = await pool.query(`UPDATE ${db_users} SET is_deleted = 'true' WHERE id=${id} RETURNING *`);
      let users = query.rows[0]
      return {status:200, data: users};
    } catch (ex) {
        
        return { status: '400', Error: ex.message };
    };
  }

}

module.exports = new UserModel();
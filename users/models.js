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
        console.log('Enek seng salah iki ' + ex);
        return { status: '400', Error: "" + ex };
    };
  }

  async update_users(data) {
    try {
      let {key, value} = utils.serialize_users(data, 'updated');
      console.log(key, value)
      let query = await pool.query(format(`UPDATE ${db_users} SET (${key}) = (%L) WHERE id = ${data.id} RETURNING *`, value));
      let users = query.rows[0]
      return {status:200, data: users};
    } catch (ex) {
        console.log('Enek seng salah iki ' + ex);
        return { status: '400', Error: "" + ex };
    };
  }

  async index_sekretariat(id, role) {
      try {
        let user;
        if(id == 'all'){
          if(role == 'list'){
            user = await pool.query('SELECT * FROM ' + db_list_sekretariat + ` WHERE role IN ('AUDITOR','TIM_KOMTEK', 'SUPERADMIN') AND is_deleted='false'`)
          }else if(role == 'list-okkp'){
            user = await pool.query('SELECT * FROM ' + db_list_sekretariat + ` WHERE role IN ('OKKP_ADMIN_UJILAB','OKKP_ADMIN_DAERAH','OKKP_ADMIN_PUSAT','SUPERADMIN') AND is_deleted='false'`)
          }else{
            user = await pool.query('SELECT * FROM ' + db_list_sekretariat + ` WHERE role=$1 AND is_deleted='false'` , [role])
          };
        }else{
          user = await pool.query('SELECT * FROM ' + db_list_sekretariat + ` WHERE id=ANY(ARRAY${id}) AND role='${role}' AND is_deleted='false'`)
        }
        check_query.check_queryset(user);
        debug('get %o', user);
        return {status: '200',
                keterangan: `Detail User id ${id} and role ${role}`,
                data: user.rows };
    } catch (ex) {
        console.log('Enek seng salah iki ' + ex);
        return { status: '400', Error: "" + ex };
    };
  }

  async detail_pelaku_usaha(id) {
    try {
      let user;
      if(id == 'all'){
          user = await pool.query('SELECT * FROM ' + db_list_pelaku_usaha + ` ORDER BY created DESC`)
      } else{
          user = await pool.query('SELECT * FROM ' + db_list_pelaku_usaha + ` WHERE id = ${id} AND role = 'PELAKU_USAHA'`)
      };
      check_query.check_queryset(user);
      debug('get %o', user);
      return { status: '200', keterangan: `Detail User id ${user.rows[0].id} ${user.rows[0].nama}`, data: user.rows };
  } catch (ex) {
      console.log('Enek seng salah iki ' + ex);
      return { status: '400', Error: "" + ex };
  };
  }

  async delete_sekretariat(id, role) {
    try {
      let response = {};
      let user = await pool.query(
        'UPDATE ' + db_pengguna + ' SET (is_deleted, update) = ($3, $4) WHERE id=$1 and role=$2 RETURNING *', [id, role, true, date]);
      check_query.check_queryset(user);
      let info_sekretariat = await pool.query(
        'UPDATE ' + db_sekretariat + ' SET (status, update) = ($2, $3) WHERE id=$1 RETURNING *', [user.rows[0].info_sekretariat, false, date]);
      check_query.check_queryset(info_sekretariat);
      response.pengguna = user.rows[0];
      response.info_sekretariat = info_sekretariat.rows[0];
      debug('get %o', response);
      return {status:200, keterangan: `Delete pengguna id ${user.rows[0].id} ${info_sekretariat.rows[0].nama}`, data: response};
    } catch (ex) {
        console.log('Enek seng salah iki ' + ex);
        return { status: '400', Error: "" + ex };
    };
  }

}

module.exports = new UserModel();
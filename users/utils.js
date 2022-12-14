const core = require('../utils/core.js')
const encryptPassword = require('../libs/secret.js').encryptPassword;


var date = core.date_now();

exports.serialize_users = (data, process) => {
    let serialize = {
        'username': data.username,
        'password': encryptPassword(data.password, data.username),
        'name': data.name,
        'email': data.email,
        'role_id': data.role_id,
        'is_active': data.is_active,
        'updated_at': date,
        "is_deleted": data.is_deleted ? data.is_deleted : false
    }

    if(process == 'created'){
        serialize.created_at = date
    }

    let key = Object.keys(serialize).toString()
    let value = Object.values(serialize)
    return {key, value}
}
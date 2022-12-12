const core = require('../utils/core.js')
const encryptPassword = require('../libs/secret.js').encryptPassword;


var date = core.date_now();

exports.serialize_users = (data, process) => {
    let serialize = {
        'username': data.username,
        'password': encryptPassword(data.password, data.username),
        'name': data.name,
        'email': data.email ,
        'role_id': data.role_id ,
        'updated_at': date
    }

    if(process == 'created'){
        serialize.created_at = date
    }

    let key = Object.keys(serialize).toString()
    let value = Object.values(serialize)
    return {key, value}
}
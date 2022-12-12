var moment = require('moment-timezone');

function response(res, response){
    if (response.status == '400') {
        res.status(400).json({ response });
    }else {
        res.status(200).json({ response });
    }
}

function date_now (){
    var date = moment().tz("Asia/jakarta").format();
    return date;
}

function processRequestWithJWT (req, callback, fallback){
    // let cookies = getCookies(req);
    // if ('jwt' in cookies) {
    //     fallback(errorUtils.getErrorTemplate('Sesi berakhir. Mohon login ulang.'));
    // } else {
    callback();
    // }
}

module.exports = {response, processRequestWithJWT, date_now}

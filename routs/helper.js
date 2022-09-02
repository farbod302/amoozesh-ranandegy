const jwt = require("jsonwebtoken")
const QRCode = require('qrcode')
const { base_url } = require("../static")
const fs = require("fs");


const reject = (res, msg) => {
    console.log(res);
    res.json({
        status: false,
        msg,
        data: {}
    })
}


const verify_token = (token, res) => {
    try {
        let data = jwt.verify(token, process.env.JWT)
        return data
    }
    catch {
        reject(res, "شناسه نامعتبر")
        return false
    }
}


const qr_code = (id) => QRCode.toDataURL(id, function (err, url) {
    let base64Data = url.replace(/^data:(.*?);base64,/, "");
    base64Data = base64Data.replace(/ /g, '+');
    fs.writeFile(`${__dirname}/../qrcode/${id}.png`, base64Data, 'base64', function (err) {
       
        if (err) return false
        return { url: `${base_url}/qrcode/${id}.png` }
    })

})

module.exports = { reject, verify_token, qr_code }
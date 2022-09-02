const express = require('express')
const router = express.Router()
const sha256 = require("sha256")
const Session = require('../db/training_session')
const User = require('../db/user')
const { base_url } = require('../static')
const { reject, verify_token } = require('./helper')



router.post("/join_training_session", (req, res) => {
    const { id, token } = req.body

    let user = verify_token(token)
    if (!user || user.access != 0) return reject(res, "شناسه نامعتبر")
    let session = await Session.findOne({ id: id })
    if (session.user !== user.id) return reject(res, "کد کاربر با کد آموزش همخوانی ندارد")
    Session.findOneAndUpdate({ id: id }, { $set: { start_date: Date.now(), used: true } })
    res.json({
        status: true,
        msg: "آموزش آغاز شد",
        data: {}
    })

})


router.post("/end_training_session", (req, res) => {
    const { id, token } = req.body

    let user = verify_token(token)
    if (!user || user.access != 0) return reject(res, "شناسه نامعتبر")
    let session = await Session.findOne({ id: id })
    if (session.user !== user.id) return reject(res, "کد کاربر با کد آموزش همخوانی ندارد")
    let spend_time = Date.now() = session.start_date
    let spend_time_minute = Math.floor(spend_time / (1000 * 60))
    res.json({
        status: true,
        msg: "درخواست محاسبه شد",
        data: {
            minute: spend_time_minute,
            accept_url: `${base_url}/user/end_session?id=${id}&token=${token}`
        }
    })
})

router.get("/end_session", (req, res) => {
    const { id, token } = req.query
    let user = verify_token(token)
    if (!user || user.access != 0) return reject(res, "شناسه نامعتبر")
    let session = await Session.findOne({ id: id })
    if (session.user !== user.id) return reject(res, "کد کاربر با کد آموزش همخوانی ندارد")
    let now = Date.now()
    Session.findOneAndUpdate({ id: id }, { $set: { end_time: now } })
    res.json({
        status: true,
        msg: "آموزش به اتمام رسید",
        data: {}
    })
})


module.exports = router
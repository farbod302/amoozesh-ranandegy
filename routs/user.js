const express = require('express')
const router = express.Router()
const sha256 = require("sha256")
const Fp = require('../db/forget_pass')
const Session = require('../db/training_session')
const User = require('../db/user')
const { base_url } = require('../static')
const { reject, verify_token } = require('./helper')



router.post("/join_training_session", async (req, res) => {
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


router.post("/end_training_session", async (req, res) => {
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

router.get("/end_session", async (req, res) => {
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


router.post("/user_history", async (req, res) => {
    const { id } = req.body

    let session = await Session.find({ user: id, start_date: { $gt: 0 } }, { start_date: 1, end_date: 1, _id: 0 })
    let orall = 0
    session.forEach(e => {
        orall += (e.end_date - e.start_date)
    })
    res.json({
        status: true,
        msg: "",
        data: { session, orall }
    })
})


router.post("/forget_req", async (req, res) => {
    const { id } = req.body

    let s_user = await User.findOne({ id: id })
    if (!s_user) { return reject(res, "کد ملی ثبت نشده") }
    let random_num = Math.floor((Math.random() * (9999 - 1000 + 1)))
    console.log(random_num);
    let new_fp = {
        user_id: id,
        phone: s_user.identity.phone,
        code: random_num,
    }

    await new Fp(new_fp).save()
    res.json({
        status: true,
        msg: "کد ارسال شد",
        data: {}
    })



})


router.post("/forget_action",async (req, res) => {
    const { code, id, new_password } = req.body
    let is_exist = await Fp.findOne({ user_id: id, code: code, used: false })
    if (!is_exist) { return reject(res, "کد وارد شده اشتباه است") }
    await User.findOneAndUpdate({ id: id }, { $set: { password: sha256(new_password) } })
    await Fp.findOneAndUpdate({ code: code, user_id: id }, { $set: { used: true } })
    res.json({
        status:true,
        msg:"تغییرات اعمال شد",
        data:{}
    })
})


module.exports = router
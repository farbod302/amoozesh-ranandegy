const express = require('express')
const User = require('../db/user')
const { reject } = require('./helper')
const router = express.Router()
const sha = require("sha256")
const Schedule = require('../db/schedule')
const { uid } = require('uid')

router.post("/add", async (req, res) => {
    const { name, lastName, phone, ins_id, id, acc } = req.body
    let is_exist = await User.findOne({ id: id })
    if (is_exist) { return reject(res, "کاربر تکراری") }
    if (!acc.includes(3) && !ins_id) { return reject(res, "کد آموزشگاه ثبت شود") }
    let new_user = {
        identity: { name, lastName, phone },
        institution: [ins_id] || [],
        access: acc || [{ ins: ins_id, acc: [0] }],
        password: sha(id),
        last_checkout: Date.now(),
        id
    }
    if (ins_id && acc.includes(0)) {
        let new_schedule = {
            id: uid(4),
            user: new_user.identity,
            user_id: id,
            mod: null,
            mod_id: null,
            compleate: false,
            regist_data: Date.now()
        }
        await Schedule.findOneAndUpdate({ id: ins_id }, { $push: { list: new_schedule } })
    }

    await new User(new_user).save()
    res.json({
        status: true,
        msg: "کاربر ثبت شد",
        data: {}
    })
})


router.post("/edit", async (req, res) => {

    const { name, lastName, phone, ins_id, id, prv_id, acc } = req.body
    let is_exist = await User.findOne({ id: id })
    if (is_exist) { return reject(res, "کاربر تکراری") }
    let _user = await User.findOne({ id: prv_id })
    let change_ins = _user.ins_id == ins_id ? false : true
    let prv_ins = _user.ins_id
    _user.identity = { name, lastName, phone }
    _user.ins_id = ins_id
    _user.acc = acc
    _user.save()
    res.json({
        status: true,
        msg: "کاربر وبرایش شد",
        data: {}
    })
    if (change_ins) {
        let new_schedule = {
            user: { name, lastName, phone },
            user_id: id,
            mod: null,
            mod_id: null,
            compleate: false,
            days: [],
            s_hour: null,
            e_hour: null,
            regist_data: Date.now()
        }
        Schedule.findOneAndUpdate({ id: prv_ins }, { $pull: { list: { user_id: id } } })
        Schedule.findOneAndUpdate({ id: ins_id }, { $push: { list: new_schedule } })
    }


})



router.post("/admin_acces", (req, res) => {
    const { id } = req.body
    User.findOneAndUpdate({ id: id, acc: { $nin: [3] } }, { $push: { acc: 3 } })
    res.json({
        status: true,
        msg: "کاربر وبرایش شد",
        data: {}
    })
})




module.exports = router
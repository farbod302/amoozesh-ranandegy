const express = require('express')
const router = express.Router()
const { uid } = require("uid")
const Institution = require('../db/institution')
const Schedule = require('../db/schedule')
const { reject } = require('./helper')

router.post("/add", (req, res) => {
    const { name, phone, address, code } = req.body
    let id=uid(6)
    let new_ins = {
        identity: { name, phone, address, code },
        id ,
        last_checkout: Date.now()
    }
    new Institution(new_ins).save()
    res.json({
        status: true,
        msg: "آموزشگاه اضافه شد",
        data: {}
    })
    new Schedule({ id }).save()
})

router.post("/edit", (req, res) => {
    const { name, phone, address, code, id } = req.body
    let new_identity = { name, phone, address, code }
    Institution.findOneAndUpdate({ id: id }, { $set: { identity: new_identity } })
    res.json({
        status: true,
        msg: "آموزشگاه ویرایش شد",
        data: {}
    })

})

router.post("/activation", async (req, res) => {
    const { id } = req.body
    let ins = await Institution.findOne({ id: id })
    if (!ins) { return reject(res, "شناسه نامعتبر") }
    ins = { ...ins, active: !ins.active }
    ins.save()
    res.json({
        status: true,
        msg: "آموزشگاه ویرایش شد",
        data: {}
    })
})

router.post("/chekout", (req, res) => {
    const { id, amount } = req.body
    let new_chekout = {
        date: Date.now(),
        from: "Admin",
        amount
    }
    Institution.findOneAndUpdate({ id: id }, { $push: { chekouts: new_chekout }, $inc: { balance: amount } })
    res.json({
        status: true,
        msg: "بدهی/بستانکاری ثبت شد",
        data: {}
    })
})


module.exports = router

const express = require('express')
const router = express.Router()
const User = require('../db/user')
const { verify_token, qr_code, reject } = require('./helper')
const { uid } = require("uid")
const Session = require('../db/training_session')
const Schedule = require('../db/schedule')

router.post("/create_training_session",async (req, res) => {
    const { token, user } = req.body
    let mod = verify_token(token)
    if (!mod || mod.access != 1) return reject(res, "شناسه نامعتبر")
    let id = uid(5)
    let new_session = {
        user,
        mod: mod.id,
        create_date: Date.now(),
        id

    }
    let url =await qr_code(id)
    console.log(url);
    if (!url) return reject(res, "مشکل در ثبت درخواست")
    new Session(new_session).save()
    res.json({
        status: true,
        msg: "درخواست ثبت شد",
        data: { url }
    })
})


router.post("/sch_list",async (req, res) => {
    const { token } = req.body
    let mod = verify_token(token,res)
    if (!mod) { return reject(res,"شناسه نامعتبر") }
    const { id, institution } = mod
    let all_sch = await Schedule.findOne({ id: institution })
    let user_sch = all_sch.list.filter(e => e.mod_id === id)
    let users=user_sch.map(e=>{return {...e.user,id:e.user_id}})
    res.json({
        status: true,
        msg: "",
        data: {
            list: users
        }
    })
})



module.exports = router
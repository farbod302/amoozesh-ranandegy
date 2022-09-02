const express = require('express')
const User = require('../db/user')
const router = express.Router()
const sha256 = require("sha256")
const { reject } = require('./helper')
const jwt = require("jsonwebtoken")


router.post("/log_in", async (req, res) => {
    const { userName, password } = req.body
    let hash_password = sha256(password)
    let user = await User.findOne({ id: userName, password: hash_password })
    if (!user) {
        return reject(res, "نام کاربری یا پسورد اشتباه است")
    }

    const { identity, id, institution } = user
    let tokens = user.access.map(access => {
        let payload = { ...identity, access, id, institution }
        let token = jwt.sign({ ...payload }, process.env.JWT)
        return { access, token }
    })

    res.json({
        status: true,
        msg: identity.name + " " + identity.lastName,
        data: { tokens, identity }
    })

})

router.post("/change_password", async (req, res) => {
    const { id, prv_password, new_password } = req.body
    let prv_password_hash = sha256(prv_password)
    let user = await User.find({ id: id, password: prv_password_hash })
    if (!user) { return reject(res, "نام کاربری یا پسورد اشتباه است") }
    user.password = sha256(new_password)
    user.save()
    res.json({
        status: true,
        msg: "تغییرات اعمال شد",
        data: {}
    })
})



module.exports = router
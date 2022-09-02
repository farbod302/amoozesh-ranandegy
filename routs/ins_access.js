const express = require('express')
const Schedule = require('../db/schedule')
const router = express.Router()


router.post("/add_mod_to_sch", async (req, res) => {
    const { mod, ins_id, sch_id, mod_id } = req.body
    await Schedule.findOneAndUpdate({
        id: ins_id, list: { $elemMatch: { id: sch_id } }
    },
        {
            $set: { "list.$.mod": mod, "list.$.mod_id": mod_id }
        })
    res.json({
        satus: true,
        msg: "تغییرات ثبت شد",
        data: {}
    })

})




module.exports = router
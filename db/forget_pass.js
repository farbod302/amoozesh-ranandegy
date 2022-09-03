const mongoose = require("mongoose")



const fp = mongoose.Schema({

    user_id: String,
    phone: String,
    code: Number,
    used: { type: Boolean, default: false },


})


module.exports = mongoose.model("Fp", fp)
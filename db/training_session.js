const mongoose = require("mongoose")



const session = mongoose.Schema({
    user: { type: String, default: "" },
    mod: String,
    id: String,
    create_date: Number,
    institution:String,
    start_date: { type: Number, default: 0 },
    end_date: { type: Number, default: 0 },
    used: { type: Boolean, default: true },
    depricate: { type: Boolean, default: false },
})


module.exports = mongoose.model("Session", session)
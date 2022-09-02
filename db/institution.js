const mongoose = require("mongoose")



const institution = mongoose.Schema({
    identity: Object,
    id: String,
    last_checkout: Number,
    chekouts: { type: Array, default: [] },
    balance: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    
})


module.exports = mongoose.model("Institution", institution)
const mongoose = require("mongoose")



const user = mongoose.Schema({

    identity: Object,
    id: String,
    password: String,
    institution: { type: String, default: []},
    access: Array,
    training_sessions: {
        type: Array,
        default: []
    },
    last_checkout: Number,
    balance: { type: Number, default: 0 },
    active: { type: Boolean, default: true },


})


module.exports = mongoose.model("User", user)
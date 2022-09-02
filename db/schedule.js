const mongoose = require("mongoose")



const schedule = mongoose.Schema({
    id: String,
    list: { type: Array, default: [] }

})


module.exports = mongoose.model("Schedule", schedule)
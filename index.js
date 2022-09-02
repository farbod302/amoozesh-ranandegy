const express = require("express")
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require("mongoose")
require('dotenv').config()
const bodyParser = require("body-parser");
const { qr_code, verify_token } = require("./routs/helper");
const Institution = require("./db/institution");
const Session = require("./db/training_session");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/qrcode", express.static('qrcode'))

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});




let sessions = []
let watch = []

let update_session = (async id => {

    let new_session = await Session.findOne({ id: id })
    let index = session.findIndex(e => e.id == id)
    sessions[index] = new_session

})

let update_locations = () => {

    watch.forEach(e => {
        io.to(e.mod_id).emit("update_location_req")
    })

}
setInterval(update_locations, 5000)

let users = []

io.on("connection", (client) => {

    console.log("mmd is cuming");
    users.push(client.id)




    client.on("create_session", async (data) => {

        const { token, user } = data
        let mod = verify_token(token)
        if (!mod || mod.access != 1) return client.emit("reject", { msg: "شناسه نامعتبر" })
        let id = uid(5)
        let new_session = {
            user,
            mod: mod.id,
            create_date: Date.now(),
            id,
            institution: mod.institution

        }
        let url = qr_code(id)
        if (!url) return client.emit("reject", { msg: "مشکل در ثبت درخواست" })
        let new_s = new Session(new_session).save()
        client.emit("create_res", {
            status: true,
            msg: "درخواست ثبت شد",
            data: { url, session_id: id }
        })

        new_s = { ...new_s, location: { x: 0, y: 0 }, mod_id: client.id }
        sessions.push(new_s)
        client.join(id)


    })

    client.on("join_session", async (data) => {
        const { id, token } = data
        let user = verify_token(token)
        if (!user || user.access != 0) return client.emit("reject", { msg: "شناسه نامعتبر" })
        let session = await Session.findOne({ id: id })
        if (session.user !== user.id) return client.emit("reject", { msg: "کد کاربر با کد آموزش همخوانی ندارد" })
        await Session.findOneAndUpdate({ id: id }, { $set: { start_date: Date.now(), used: true } })
        update_session(id)
        client.emit("join_res", {
            status: true,
            msg: "آموزش آغاز شد",
            data: {}
        })
        client.join(id)
        setTimeout(() => { client.to(id).emit("scan_confirm") }, 1000)
    })


    client.on("watch_session", (data) => {
        const { id } = data
        let s_session = session.find(e => e.id == id)
        watch.push({
            session: id,
            mod_id: s_session.mod_id,
            resiver: client.id
        })

    })


    client.on("update_location", (data) => {
        const { x, y } = data
        // let s_sessions = session.filter(e => e.mod_id === client.id)
        // s_sessions.forEach(s => {
        //     client.to(s.resiver).emit("location_res", { x, y })
        // })
        console.log(data);

    })


    client.on("stop_watch", () => {
        watch = watch.filter(e => e.resiver === client.id)
    })


    client.on("end_session_req", async (data) => {

        const { id, token } = req.query
        let user = verify_token(token)
        if (!user || user.access != 0) return client.emit("reject", (res, "شناسه نامعتبر"))
        let session = await Session.findOne({ id: id })
        if (session.user !== user.id) return client.emit("reject", (res, "کد کاربری با کد آموزش همخانی ندارد"))
        let now = Date.now()
        Session.findOneAndUpdate({ id: id }, { $set: { end_time: now } })
        res.json({
            status: true,
            msg: "آموزش به اتمام رسید",
            data: {}
        })
        sessions = sessions.filter(e => e.id === id)
        let s_watch = watch.filter(e => e.session === id)
        s_watch.forEach(e => {
            io.to(e.resiver).emit("watch_end")
        })

    })


    client.on("disconnect",()=>{
        console.log("mmd raft");
    })




})


app.get("/",(req,res)=>{

    users.forEach(e=>{
        io.to(e).emit("watch_req")

    })
})



mongoose.connect(process.env.DB, () => { console.log("Connected to DB"); })


const admin_ins = require("./routs/admin_institution")
app.use("/admin_ins", admin_ins)

const admin_user = require("./routs/admin_user")
app.use("/admin_user", admin_user)

const ins_acc = require("./routs/ins_access")
app.use("/ins_acc", ins_acc)


const registion = require("./routs/registion")
app.use("/registion", registion)


const mod = require("./routs/mod")
app.use("/mod", mod)



server.listen("6544", () => { console.log("Server run on port 6544"); })
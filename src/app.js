const express = require("express");
const cookieParser = require("cookie-parser");
require("./db/mongoose");
const userRouter = require("../src/routes/user");
const taskRouter = require("../src/routes/task");

const app = express();
const port = process.env.PORT;

// //middleware for auth
// app.use((req, res, next) => {
//     res.status(503).send("Site under maintenance.");
// });
app.use(express.static("public"));
app.use(express.urlencoded({extended: false})); //parses data from form
app.use(express.json()); 
app.use(cookieParser());// parses cookies from forms
app.use(userRouter);
app.use(taskRouter);





app.listen(Process.env.PORT, () =>{
    console.log("Server started on port "+ port);
})
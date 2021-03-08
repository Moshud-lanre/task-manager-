const express = require("express");
require("./db/mongoose");
const userRouter = require("../src/routes/user");
const taskRouter = require("../src/routes/task");

const app = express();
const port = process.env.PORT || 3000;

// //middleware for auth
// app.use((req, res, next) => {
//     res.status(503).send("Site under maintenance.");
// });

app.use(express.json()); 
app.use(userRouter);
app.use(taskRouter);





app.listen(port, () =>{
    console.log("Server started on port "+ port);
})
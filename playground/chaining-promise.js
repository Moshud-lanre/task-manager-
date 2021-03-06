require("../src/db/mongoose");
const Task = require("../src/models/task");

// Task.findByIdAndDelete("6040c0ca9199002524df0c39").then((tasks) => {
//     console.log(tasks);
//     return Task.countDocuments({completed: false })
// }).then((result) => {
//     console.log(result);
// }).catch(e => {
//     console.log(e);
// });

const deleteAndCount = async (id) => {
    const deleteTask = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed: false});
    return count
}

deleteAndCount("6040d6db1e66d92fb0df52a0").then((result) => {
    console.log(result);
}).catch(e => console.log(e));
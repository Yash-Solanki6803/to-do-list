//jshint esversion:6
//7tHwHeJSO$3umpn73CrN

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://thisisyashs:yashjklv06@yashs.zq8rhiu.mongodb.net/todolistDB");
}

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!.",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete the item",
});
const item4 = new Item({
  name: "Type /<List name> to create a new TodoList",
});

const defaultItems = [item1, item2, item3,item4];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length ===0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Data inserted"); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:customListName", (req, res) => {
  const customListName =_.capitalize(req.params.customListName) ;


  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {});
});

app.post("/", async (req, res) => {
  let itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({ name: listName })
      .exec()
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", function(req, res){
 
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
 
  if(listName === "Today") {
 
    Item.findByIdAndRemove(checkedItemId)
    .then(function(foundItem){
      Item.deleteOne({_id: checkedItemId})
    })
    .catch((err)=>{
      console.log(err);
    });
 
    res.redirect("/");
 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(function (foundList)
      {
        res.redirect("/" + listName);
      })
    .catch((err)=>{
      console.log(err);
    });
  }
 
});

app.listen(process.env.PORT, function () {
  console.log("Server started on port 3000");
});

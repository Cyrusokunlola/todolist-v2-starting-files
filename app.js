//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash');
// const date = require(__dirname + "/date.js");

mongoose.set('strictQuery', false);


const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//define server
mongoose.connect("mongodb+srv://admin-babz:babzshewa@cluster0.vleq03p.mongodb.net/todolistDB", { useNewUrlParser: true});


//Schema Creation
const itemsSchema = new mongoose.Schema({
  name: String
})

//Schema Model
const Item = mongoose.model("Item", itemsSchema)

//New document
const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add new item."
})
const item3 = new Item({
  name: "<--- Hit this to delete an item."
})

//Array to put items
const defaultItems = [item1, item2, item3]

//New Schma
const listSchema={
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {



  Item.find({}, function(err, foundItems){

// Inserting the array
    if (foundItems.length === 0){

        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err)
          }
  })
    res.redirect("/")
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }


  })

 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()

    res.redirect("/")
  
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/" + listName)
    })
  }

  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox.trim();

  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
  
      } else{
        console.log("Sucessful deleted")
        res.redirect("/")
      }
    })
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }



})

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err){
      if(!foundList){
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
       list.save()
       res.redirect("/" + customListName)
      }
      else{
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items} )

      }
    }
    
  })
  

  })



app.get("/about", function(req, res){
  res.render("about");
});

app.get("/favicon.ico", function (req, res) {
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

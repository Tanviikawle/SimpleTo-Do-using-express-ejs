const express=require("express");
const bodyParser=require("body-parser");
const _ = require("lodash")
// const date=require(__dirname+"/date.js")

const app=express();
// const listItems=["apple","cherry"]
// const workItems=["course","Arrange files"]
const mongoose = require("mongoose")

//connection to database
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true})
    .then(()=>{
        console.log("Mongo db connection active!")
    })
    .catch((err)=>{
        console.log(err)
    })

//making database schema and model
const itemSchema = {
    name : String
}

const Item=mongoose.model("Item",itemSchema)

//adding default items to database
const item1 = new Item({name:"Welcome todo list"})
const item2 = new Item({name:"Click on + to add new items"})
const item3 = new Item({name:"<--- Click here to delete an item."})

const items = [item1 , item2 , item3]

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List" , listSchema)

app.use(express.static("public"));


app.set('view engine','ejs')

app.use(bodyParser.urlencoded({extended:true}))

app.get("/",function(req,res){

    // let day="Today"
    Item.find({})
    .then((foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(items)
            .then(()=>{
                console.log("Data saved successfully.")
            })
            .catch(err=>{
                console.log(err)
            })
        }
        res.render("list",{
            listTitle:"Today",
            listItems:foundItems
        })    })
    .catch(err=>{
        console.log(err)
    })
    // res.send("Hello!")
});

app.get("/:customListName",function (req,res){
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name: customListName})
    .then(function(foundList){
        // console.log(foundList)
        if(!foundList){
            const list = new List({
                name: customListName,
                items:items
            });
            list.save()
            res.redirect("/" + customListName)
        }else{
            res.render("list",{listTitle:foundList.name,listItems:foundList.items})
        }
    })
    .catch(err=>{
        console.log(err)
    })
})

app.post("/",function(req,res){
    const newItem = req.body.newTodo
    const listName = req.body.listSubmit

    const item = new Item({name:newItem})
    if(listName === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName})
        .catch(err=>{
            console.log(err)
        })
        .then(function(foundList){
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
     
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(()=>{
            console.log("Successfully deleted ckecked item.")
        })
        .catch(err=>{
            console.log(err)
        })
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}})
        .then(function(foundList){
            res.redirect("/" + listName)
        })
        .catch(err=>{
            console.log(err)
        })
    }

})

app.listen(3000,function(){
    console.log("Server started at port 3000.")
});

const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js")

const app=express();
const listItems=["apple","cherry"]
const workItems=["course","Arrange files"]

app.use(express.static("public"));


app.set('view engine','ejs')

app.use(bodyParser.urlencoded({extended:true}))

app.get("/",function(req,res){
    let day=date.getDate()

    res.render("list",{
        listTitle:day,
        listItems:listItems
    })
    // res.send("Hello!")
});

app.get("/work",function(req,res){
    res.render("list",{
        listItems:workItems,
        listTitle:"Work",
    })
})

app.post("/",function(req,res){
    if(req.body.listSubmit=="Work"){
        workItems.push(req.body.newTodo)
        res.redirect("/work")
    }else{
        listItems.push(req.body.newTodo)
        res.redirect("/")
    }
})

app.listen(3000,function(){
    console.log("Server started at port 3000.")
});

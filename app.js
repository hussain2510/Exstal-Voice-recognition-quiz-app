const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require('mongoose');
const encrypt=require("mongoose-encryption");

const _ = require("lodash");
const { find } = require("lodash");
const app=express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-username:password@cluster0.xqekq.mongodb.net/extalDB",{useNewUrlParser:true,useUnifiedTopology: true});
const answerSchema=new mongoose.Schema({
    ans:Object
});
const Answer =mongoose.model("Answer",answerSchema);
const questionSchema=new mongoose.Schema({
    questionNum:String,
        questionContent:String,
        a:String,
        b:String,
        c:String,
        d:String,
});
const Question=mongoose.model("Question",questionSchema);

const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    ans:[]
  });
const User=new mongoose.model("User",userSchema);
app.get("/",function(req,res){
    res.render("landing");
})
app.get("/thankyou",function(req,res){
    res.sendFile(__dirname+"/i.html");
})
app.get("/compose",function(req,res){
    res.render("compose");
});
// app.get("/start",function(req,res){
//     res.render("start",{user:req.body.username});
// });
app.get("/reset",function(req,res){
    User.update({}, {'$set': {ans: []}},{multi:true},function(error, users){

        if(error){
            console.log(error);
        }

        if(!users){
            console.log('Something went wrong');
        }

        console.log('success update view');
    });
})
app.get("/register",function(req,res){
    res.render("register");
  });
  
  app.get("/login",function(req,res){
    res.render("login");
  });

app.post("/compose",function(req,res){
    const question=new Question({
        questionNum:req.body.questionNum,
        questionContent:req.body.questionContent,
        a:req.body.optionA,
        b:req.body.optionB,
        c:req.body.optionC,
        d:req.body.optionD,
    });
    question.save();
    res.render("landing");
});
app.post("/submit",function(req,res){
        var key=Object.keys(req.body)[0];
        var value=req.body[key];
        console.log({[key]:value});
        var userName=Object.keys(req.body)[1]
        // console.log(Object.keys(req.body)[1]);        
        let b=-1;
        // const answer=new Answer({
        //                     ans:{[key]:value}
        //                 });
        User.findOne({email:userName},function(err,foundUser){
            if(foundUser)
            {
                foundUser.ans.forEach(function(answer){
                    var keyInside=Object.keys(answer)[0];
                    console.log(keyInside+" "+key);
                    if(key==keyInside)
                    {
                        b=1;
                        console.log("second"+b);
                    }
                });
                if(b<0)
                {
                    console.log("first"+b);
                    User.updateOne({email:userName},{$push:{ans:{[key]:value}}},function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                });
                }
            }
        });
       
        // User.findOne({email:userName},function(err,foundUser){
        // if(foundUser)
        // {
        //     console.log(Object.keys(foundUser.ans));
            
        // foundUser.ans.find(function(err,answers){
        // answers.forEach(function(answer){
        //         var keyInside=Object.keys(answer.ans)[0];
        //         if(key==keyInside)
        //         {
        //             console.log("hello");
        //             a=1;
        //             Answer.updateOne({_id:""+answer._id},{ans:req.body},function(err){
        //                 if(err)
        //                 {
        //                   console.log(err);
        //                 }
        //                 else
        //                 {
        //                   console.log("successfully updated");
        //                 }
        //         })};
        //         });
        //         if(a<0)
        //         {
        //             const answer=new Answer({
        //                 ans:req.body
        //             });
        //             answer.save();
        //         }
        //         });
        // }
        //     });
        res.redirect("/"+userName+"="+key);
});
app.get('/:quesNum',function(req,res){
    var keyQues=Object.keys(req.params)[0];
    var valueQues=req.params[keyQues];
    valueQues=valueQues.split("=");
    var quesNum=_.lowerCase(valueQues[1]);
    Question.find(function(err,questions)
    {
    questions.forEach(function(question){
    var titleNum=_.lowerCase(question.questionNum);
    if(titleNum==quesNum)
      {
        res.render("list",{user:valueQues[0],title:question.questionNum,content:question.questionContent,optionA:question.a,optionB:question.b,optionC:question.c,optionD:question.d});
      }
  });
});
});
app.post("/register",function(req,res){
    const newUser=new User({
        email:req.body.username,
        password:req.body.password,
        ans:[]
    });
    newUser.save(function(err){
        if(!err)
        {
            res.render("start",{user:req.body.username});
            console.log("user added successfully");
        }
    });
});
app.post("/start",function(req,res){
    const username=req.body.username;
    const password=req.body.password;
    User.findOne({email:username},function(err,foundUser){
        if(foundUser)
        {
            if(foundUser.password===password)
            {
                res.render("start",{user:username});
            }
            else
            {
                res.sendFile(__dirname+"/i.html");
                
                console.log("type your password correctly");
            }
        }
        else{
            res.redirect("/register");
        }
    })
})
app.listen(process.env.PORT|| 3000,function(){
    console.log("server listening at  post 3000");
});
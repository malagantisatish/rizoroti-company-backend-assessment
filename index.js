const express = require("express")
const app = express()
app.use(express())

const jwt = require("jsonwebtoken")

const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

const path = require("path")
const dbPath = path.join(__dirname,"transactionDetails.db")

const bcrypt = require("bcrypt")

let db = null;

let initializationDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
  
      app.listen(3001, () => {
        console.log("Server starting at http://localhost:3001");
      });
    } catch (error) {
      console.log(`Error at ${error.message}`);
    }
  };



  initializationDBAndServer()

  // Registration API

  app.post("/register",async (request,response)=>{
    console.log(request.body)
    const {username, password,name,gender,job,location } = request.body;
    const hashedPassword = await bcrypt.hash(password,10);

    const selectUSerQuery = `SELECT * FROM user WHERE username=${username};`;
    const dbUser = await db.get(selectUSerQuery);

    if (dbUser===undefined){
      // creating new user account
      if (password.lenght<6){
          response.status(400)
          response.send("The Password should consist of atleast 6 characters")
      }
      else{
        const registerUserQuery = `INSERT INTO user
        (username,password,name,gender,location,job)
        VALUES ('${username}','${hashedPassword}','${name}','${gender}','${location}','${job}') ;`;
         await db.run(registerUserQuery);
         response.status(200);
         response.send("User Registered successfully");
      }
    }
    else{
      response.status(400);
      response.send("username already exists")
    } 

  })


  // login API

  app.post("/login",async (request,response)=>{
    const {username,password}=request.body;
    const selectUSerQuery = `SELECT * FROM user WHERE username=${username};`
    const dbUser = db.get(selectUSerQuery);

    if (dbUser===undefined){
      response.status(400)
      response.send("Invalid user")
    }
    else {
      //check the password is matched or not
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password); // gives true or false as result
      if (isPasswordMatched) {
        response.status(200);
        response.send("Login success!");
      } else {
        response.status(400);
        response.send("Invalid password");
      }
  })


  module.exports = app;
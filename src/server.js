const express = require("express");
const app = express();
require('dotenv').config()

app.listen(7613, () => {
  console.log("App is listening on port 7613!\n");
});

//this page contains the link to the spotify authorization page
//contains custom url queries that pertain to my specific app
app.get("/", (req, res) => {
    res.send(
      "<a href='https://accounts.spotify.com/authorize?client_id=" +
        process.env.CLIENT_ID +
        "&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A7613%2Fconnected&scope=user-top-read'>Sign in</a>"
    );
  });
  
  //this is the page user is redirected to after accepting data use on spotify's website
  //it does not have to be /account, it can be whatever page you want it to be
  app.get("/connected", async (req, res) => {
    console.log("spotify response code is " + req.query.code);
    res.send("account page");
  });
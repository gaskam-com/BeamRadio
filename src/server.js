const express = require("express");
const app = express();
const queryString = require("node:querystring");
const axios = require("axios");
const { access } = require("node:fs");
require("dotenv").config();

app.listen(7613, () => {
    console.log("App is listening on port 7613!\n");
});

//this page contains the link to the spotify authorization page
//contains custom url queries that pertain to my specific app
app.get("/", (req, res) => {
    res.send(
        "<a href='https://accounts.spotify.com/authorize?client_id=" +
            process.env.CLIENT_ID +
            "&response_type=code&redirect_uri=http%3A%2F%2F176.151.209.242%3A7613%2Fconnected&scope=user-top-read'>Sign in</a>"
    );
});

app.get("/connected", async (req, res) => {
    res.sendFile("/datas/Gaspard/Code/BeamRadio/src/index.html");

    const spotifyResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        queryString.stringify({
            grant_type: "authorization_code",
            code: req.query.code,
            redirect_uri: process.env.REDIRECT_URI_DECODED,
        }),
        {
            headers: {
                Authorization: "Basic " + process.env.BASE64_AUTHORIZATION,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    console.log(spotifyResponse.data);

    const resulte = await axios.get(
        "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=5&offset=0",
        {
            headers: {
                Authorization: "Bearer " + spotifyResponse.data.access_token,
            },
        }
    );

    console.log(resulte)
});
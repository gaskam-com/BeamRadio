const express = require("express");
const app = express();
const queryString = require("node:querystring");
const axios = require("axios");
const { access } = require("node:fs");
require("dotenv").config();

app.get("/", (req, res) => {
    res.send(
        "<a href='https://accounts.spotify.com/authorize?client_id=" +
            process.env.CLIENT_ID +
            "&response_type=code&redirect_uri=http%3A%2F%2F176.151.209.242%3A7613%2Fconnected&scope=user-top-read'>Sign in</a>"
    );
});

app.get("/connected", async (req, res) => {
    if (req.query.code === undefined) return res.redirect("/");

    res.sendFile("/datas/Gaspard/Code/BeamRadio/src/index.html");
});

app.use("/token", async (req, res) => {
    axios
        .post(
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
        )
        .then((spotifyResponse) => {
            res.send(JSON.stringify({
                refresh_token: spotifyResponse.data.refresh_token,
                auth_token: spotifyResponse.data.auth_token
            }));

            console.log(spotifyResponse.data);
        })
        .catch((err)=>{
            console.error(err.stack);
            console.log(req.query.code)
            res.status(500).send("Internal Server Error");
        });
});

app.use("/refresh-token", async (req, res) => {
    axios
        .post(
            "https://accounts.spotify.com/api/token",
            queryString.stringify({
                grant_type: "refresh_token",
                refresh_token: req.query.refresh_token,
                redirect_uri: process.env.REDIRECT_URI_DECODED,
            }),
            {
                headers: {
                    Authorization: "Basic " + process.env.BASE64_AUTHORIZATION,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        )
        .then((spotifyResponse) => {
            res.send(JSON.stringify({
                refresh_token: spotifyResponse.data.refresh_token,
                auth_token: spotifyResponse.data.auth_token
            }));

            console.log(spotifyResponse.data);
        })
        .catch((err)=>{
            console.error(err.stack);
            console.log(req.query.refresh_token)
            res.status(500).send("Internal Server Error");
        });
});

app.use("/static", express.static("./"));

app.listen(7613, () => {
    console.log("App is listening on port 7613!\n");
});

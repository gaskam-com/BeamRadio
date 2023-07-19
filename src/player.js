const data = await axios.get(
    "https://api.spotify.com/v1/me/top/artists?limit=5",
    {
        headers: {
            Authorization: "Bearer " + spotifyResponse,
        },
    }
);

document.getElementById("button").onclick (()=> {
    console.log(data);
});
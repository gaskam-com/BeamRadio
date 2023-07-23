let setToken;

let access_token = new Promise((resolve) => (setToken = resolve));

let refresh_token = localStorage.getItem("refresh_token");

if (refresh_token !== null) {
    fetch(`/refresh-token?refresh_token=${refresh_token}`)
        .then(async (res) => {
            res = await res.json();
            console.log(res);
            if (res.refresh_token !== undefined) {
                localStorage.setItem("refresh_token", res.refresh_token);
            }
            setToken(res.access_token);
        })
        .catch((err) => {
            console.error(err);
        });
} else {
    fetch(
        `/token?code=${new URL(
            window.location.toLocaleString()
        ).searchParams.get("code")}`
    )
        .then(async (res) => {
            res = await res.json();
            localStorage.setItem("refresh_token", res.refresh_token);
            setToken(res.access_token);
        })
        .catch((err) => {
            console.error(err);
        });
}

function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function () {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        };
        list.push(img);
        img.src = array[i];
    }
}

preloadImages([
    "/static/svg/backward-step-solid.svg",
    "/static/svg/forward-step-solid.svg",
    "/static/svg/volume-high-solid.svg",
    "/static/svg/volume-xmark-solid.svg",
    "/static/svg/radio-solid.svg",
    "/static/svg/spotify.svg",
    "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fis1.mzstatic.com%2Fimage%2Fthumb%2FPurple60%2Fv4%2F36%2F2b%2F5a%2F362b5afa-d557-d11e-adf2-147cc5ccc331%2Fsource%2F1024x1024bb.jpg&f=1&nofb=1&ipt=e0ac7c426dde4fd33ef14618663f2e3c5502ca8b8f168206b7cd6a802bab54a5&ipo=images",
]);

window.onSpotifyWebPlaybackSDKReady = () => {
    access_token.then((access_token) => {
        console.log(access_token);

        const player = new window.Spotify.Player({
            name: "BeamRadio",
            getOAuthToken: (cb) => {
                cb(access_token);
            },
            volume: 1,
        });

        player.getVolume().then((volume) => {
            let volume_percentage = volume * 100;
            console.log(`The volume of the player is ${volume_percentage}%`);
        });

        player.addListener("ready", ({ device_id }) => {
            console.log("Ready with Device ID", device_id);
            player.activateElement();
        });

        player.addListener("not_ready", ({ device_id }) => {
            console.log("Device ID has gone offline", device_id);
        });

        player.addListener("initialization_error", ({ message }) => {
            console.error(message);
        });

        player.addListener("authentication_error", ({ message }) => {
            console.error(message);
        });

        player.addListener("account_error", ({ message }) => {
            console.error(message);
        });

        player.on("playback_error", ({ message }) => {
            console.error("Failed to perform playback", message);
        });

        player.resume().then(() => {
            console.log("Resumed!");
        });

        document.getElementById("volume").onclick = function () {
            player.getVolume().then((volume) => {
                if (volume == 1) {
                    player.setVolume(0).then(() => {
                        document.getElementById("volume").innerHTML =
                            '<img src="/static/svg/volume-xmark-solid.svg" alt="mute">';
                    });
                } else {
                    player.setVolume(1).then(() => {
                        document.getElementById("volume").innerHTML =
                            '<img src="/static/svg/volume-high-solid.svg" alt="mute">';
                    });
                }
            });
        };

        document.getElementById("togglePlay").onclick = function () {
            player.getCurrentState().then((state) => {
                if (!state) {
                    console.error(
                        "User is not playing music through BeamRadio"
                    );
                    return;
                }

                let pauseState = state.paused;

                if (pauseState == true) {
                    player.togglePlay();
                    document
                        .getElementById("playButton")
                        .classList.add("paused");
                } else {
                    player.togglePlay();
                    document
                        .getElementById("playButton")
                        .classList.remove("paused");
                }
            });
        };

        document.getElementById("previous").onclick = function () {
            player.previousTrack();
        };

        document.getElementById("next").onclick = function () {
            player.nextTrack();
        };

        document.getElementById("toggleMode").onclick = function () {
            if (document.getElementById("toggleMode").classList == "toggleMode radio") {
                document.getElementById("toggleMode").classList.remove("radio");
                document.getElementById("toggleMode").classList.add("spotify")
                document.getElementById("toggleMode").innerHTML =
                "<img src='/static/svg/spotify.svg' alt='spotify'>";
            } else {
                document.getElementById("toggleMode").classList.remove("spotify");
                document.getElementById("toggleMode").classList.add("radio")
                document.getElementById("toggleMode").innerHTML =
                "<img src='/static/svg/radio-solid.svg' alt='radio'>";
            }
        };

        player.addListener(
            "player_state_changed",
            ({
                position,
                duration,
                track_window: { current_track },
                track_window: { next_tracks },
            }) => {
                console.log("Currently Playing", current_track);

                globalThis.trackDuration = duration;

                preloadImages([
                    `${current_track.album.images[2].url}`,
                    `${next_tracks[(0, 1)].album.images[2].url}`,
                ]);

                document.getElementById(
                    "cover"
                ).innerHTML = `<img src="${current_track.album.images[2].url}" alt="Album Cover">`;

                let musicTitle =
                    String(current_track.name).charAt(0).toUpperCase() +
                    String(current_track.name).slice(1);

                document.getElementById(
                    "title"
                ).innerHTML = `<p>${musicTitle} - ${current_track.artists[0].name}</p>`;

                if (position == 0) {
                    document.getElementById("progressTimeline").value = 0;
                } else {
                    return;
                }
            }
        );

        setInterval(() => {
            player.getCurrentState().then((state) => {
                if (!state) {
                    console.error(
                        "User is not playing music through BeamRadio"
                    );
                    return;
                }

                let currentPosition = state.position;

                document.getElementById("progressTimeline").value =
                    (currentPosition * 1000) / trackDuration;

                function msToMin(msTime) {
                    var minutes = Math.floor(msTime / 60000);
                    var seconds = ((msTime % 60000) / 1000).toFixed(0);
                    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
                }

                let symbole = "-";
                // let timeLeft = "00:00";

                // globalThis.timeMargin = document.getElementById("timeMargin");

                // if (msToMin(trackDuration - currentPosition).length == 5) {
                //     if (timeMargin.classList.lengths == 2) {
                //         timeMargin.classList.remove("min");
                //     } else {
                //         return;
                //     }
                //     symbole = "-";
                //     timeLeft = msToMin(trackDuration - currentPosition);
                // } else if (
                //     msToMin(trackDuration - currentPosition).length == 4
                // ) {
                //     if (timeMargin.classList.lengths == 2) {
                //         return;
                //     } else {
                //         timeMargin.classList.add("min");
                //     }
                //     symbole = "-";
                //     timeLeft = msToMin(trackDuration - currentPosition);
                // } else {
                //     if (timeMargin.classList.lengths == 2) {
                //         return;
                //     } else {
                //         timeMargin.classList.add("min");
                //     }
                //     symbole = "+";
                //     timeLeft = "1h40";
                // }

                document.getElementById(
                    "time"
                ).innerHTML = `<p class="">${symbole}${msToMin(
                    trackDuration - currentPosition
                )}</p>`;
            });
        }, 1000);

        setInterval(() => {
            player.getCurrentState().then((state) => {
                if (state.paused == true) {
                    document
                        .getElementById("playButton")
                        .classList.remove("paused");
                } else {
                    document
                        .getElementById("playButton")
                        .classList.add("paused");
                }
            });
        }, 200);

        player.addListener("autoplay_failed", () => {
            console.log(
                "Autoplay is not allowed by the browser autoplay rules"
            );
        });

        player.connect();
    });
};

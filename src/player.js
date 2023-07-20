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

window.onSpotifyWebPlaybackSDKReady = () => {
    access_token.then((access_token) => {
        console.log(access_token);

        const player = new window.Spotify.Player({
            name: "BeamRadio",
            getOAuthToken: (cb) => {
                cb(access_token);
            },
            volume: 0.5,
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

        document.getElementById("togglePlay").onclick = function () {
            player.togglePlay();  
        };

        document.getElementById("previous").onclick = function () {
            player.previousTrack();  
        };

        document.getElementById("next").onclick = function () {
            player.nextTrack();  
        };

        player.addListener(
            "player_state_changed",
            ({ position, duration, track_window: { current_track } }) => {
                console.log("Currently Playing", current_track);
                console.log("Position in Song", position);
                console.log("Duration of Song", duration);
            }
        );

        player.addListener("autoplay_failed", () => {
            console.log(
                "Autoplay is not allowed by the browser autoplay rules"
            );
        });

        player.connect();
    });
};

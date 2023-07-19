let auth_token = undefined;

let refresh_token = localStorage.getItem("refresh_token");
if (refresh_token !== null) {
    fetch(`/refresh-token?refresh_token=${refresh_token}`)
        .then(async (res) => {
            res = await res.json();
            console.log(res);
            if (res.refresh_token !== undefined) {
                localStorage.setItem("refresh_token", res.refresh_token);
                auth_token = res.auth_token;
            }
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
            console.log(res);
            localStorage.setItem("refresh_token", res.refresh_token);
            auth_token = res.auth_token;
        })
        .catch((err) => {
            console.error(err);
        });
}

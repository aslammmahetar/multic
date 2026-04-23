export const getGeoLocation = () => {
    return new Promise((res, rej) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                res({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                rej({
                    error: error.message || "Location access denied"
                })
            })
        } else {
            rej({ error: "Geolocation not supported!" })
        }
    })
}
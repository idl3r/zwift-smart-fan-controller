const {Observable, Subject} = require("rxjs");
const axios = require("axios");

module.exports = function ({apiUrl, pollingInterval}) {
    const subject= new Subject();
    const power$ = new Observable(observer => {
        subject.subscribe(({power}) => {
            console.log(`⚡️ Sauce4Zwift Power: ${power}`);
            observer.next(power);
        })
    });
    const speed$ = new Observable(observer => {
        subject.subscribe(({speed}) => {
            console.log(`🏎️ Sauce4Zwift Speed: ${speed}`);
            observer.next(speed);
        })
    });
    const hr$ = new Observable(observer => {
        subject.subscribe(({hr}) => {
            console.log(`🧡 Sauce4Zwift HR: ${hr}`);
            observer.next(hr);
        })
    });

    setInterval(async () => {
        try {
            const athleteInfoUrl = apiUrl + "/api/athlete/v1/self";
            const response = await axios.get(athleteInfoUrl, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                }
            });
            const data = response.data || {};
            // Turn on logging if needed
            // console.log(data)

            subject.next({
                power: data.state.power,
                speed: data.state.speed,
                hr: data.state.heartrate,
            })
        } catch (e) {
            console.error(e)
        }
    }, pollingInterval)

    return {
        power$,
        speed$,
        hr$,
    }
}

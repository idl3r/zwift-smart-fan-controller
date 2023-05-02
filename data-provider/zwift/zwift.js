const {Observable, Subject} = require("rxjs");
const axios = require("axios");

module.exports = function ({zwiftID, pollingInterval}) {
    const subject= new Subject();
    const power$ = new Observable(observer => {
        subject.subscribe(({power}) => {
            console.log(`⚡️ Zwift Power: ${power}`);
            observer.next(power);
        })
    });
    const speed$ = new Observable(observer => {
        subject.subscribe(({speed}) => {
            console.log(`🏎️ Zwift Speed: ${speed}`);
            observer.next(speed);
        })
    });
    const hr$ = new Observable(observer => {
        subject.subscribe(({hr}) => {
            console.log(`🧡 Zwift HR: ${hr}`);
            observer.next(hr);
        })
    });

    setInterval(async () => {
        try {
            const response = await axios.get('https://www.zwiftgps.com/world/', {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Cookie': 'zssToken=rider-'+zwiftID,
                }
            });
            const data = response.data.positions[0] || {};
            // Turn on logging if needed
            // console.log(data)

            // We need to check if the Zwift ID in data matches our own
            if (data.id == zwiftID) {
                subject.next({
                    power: data.powerOutput,
                    speed: data.speedInMillimetersPerHour / (1000 * 1000), // to kmh
                    hr: data.heartRateInBpm,
                })
            }
            else {
                subject.next({
                    power: undefined,
                    speed: undefined, 
                    hr: undefined,
                })
            }
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

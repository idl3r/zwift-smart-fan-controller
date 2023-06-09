const {interval, map} = require("rxjs");
const configExample = require("../../config-example.json");

function getThresholds(index, thresholds) {
    index = Math.floor(Math.random() * 3);
    ratio = 1 + ((Math.random() - 0.5) * 0.4);
    if (index % 3 === 2) {
        return Math.floor(thresholds.level3 * ratio);
    }
    if (index % 3 === 1) {
        return Math.floor(thresholds.level2 * ratio);
    }
    if (index % 3 === 0) {
        return Math.floor(thresholds.level1 * ratio);
    }
}
module.exports = function ({pollingInterval}) {
    const power$ = interval(pollingInterval).pipe(
        map(index => {
            const value = getThresholds(index, configExample.thresholds.power);
            console.log(`⚡️ Mock Power: ${value}`);
            return value;
        })
    )
    const speed$ = interval(pollingInterval).pipe(
        map(index => {
            const value = getThresholds(index, configExample.thresholds.speed);
            console.log(`🏎️ Mock Speed: ${value}`);
            return value;
        })
    )
    const hr$ = interval(pollingInterval).pipe(
        map(index => {
            const value = getThresholds(index, configExample.thresholds.hr);
            console.log(`🧡 Mock HR: ${value}`);
            return value;
        })
    )

    return {
        power$,
        speed$,
        hr$,
    }
}

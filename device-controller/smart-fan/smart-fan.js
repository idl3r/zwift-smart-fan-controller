const axios = require('axios');


module.exports = function ({fanIP}) {
    async function toggle(relayIndex) {
        return (await axios.get(`http://${fanIP}`, {
            params: {
                'm': '1',
                'o': `${relayIndex+1}`
            },
        })).data.match(/ON|OFF/g).map(onOff => onOff === "ON");
    }

    async function getStatus() {
        const axiosResponse = await axios.get(`http://${fanIP}`, {
            params: {
                'm': '1',
            },
        });
        return axiosResponse.data.match(/ON|OFF/g).map(onOff => onOff === "ON");
    }

    async function on(index) {
        const isOn = (await getStatus())[index];
        if (!isOn) {
            await toggle(index)
        }
    }

    async function off(index) {
        const isOn = (await getStatus())[index];
        if (isOn) {
            await toggle(index)
        }
    }

    async function fanLevel(level) {
        console.log(new Date().toISOString(), " 🌡 Fan Level: ", level)

        try {
            switch (level) {
                case 0:
                    return await Promise.all([off(0), off(1), off(2)]);
                case 1:
                    return await Promise.all([off(1), off(2), on(0)]);
                case 2:
                    return await Promise.all([off(0), off(2), on(1)]);
                case 3:
                    return await Promise.all([off(0), off(1), on(2)]);
            }
        } catch(e) {
            console.log(e);
        }
    }


    return {
        fanLevel
    }
}

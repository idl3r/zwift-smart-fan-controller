const axios = require('axios');
const util = require('util');


module.exports = function ({fanIP}) {
    async function setFanStatus_tasmota(status) {
        var strCmd = 'Backlog0 ';
        var count = 0;
        for (var i = 0; i < status.length; i++) {
            if (status[i] == 'off') {   // We turn off first and then turn on
                var cmdParam = '';
                if (count > 0) {
                    cmdParam = ';';
                }
                cmdParam = cmdParam.concat(util.format('Power%d off', i+1));
                strCmd = strCmd.concat(cmdParam);
                count++;
            }
        }
        for (var i = 0; i < status.length; i++) {
            if (status[i] == 'on') {
                var cmdParam = '';
                if (count > 0) {
                    cmdParam = ';';
                }
                cmdParam = cmdParam.concat(util.format('Power%d on', i+1));
                strCmd = strCmd.concat(cmdParam);
                count++;
            }            
        }

        const axiosResponse = await axios.get(`http://${fanIP}/cm`, {
            params: {
                'cmnd': strCmd,
            },
        });
    }

    async function fanLevel(level) {
        console.log(new Date().toISOString(), " 🌡 Fan Level: ", level)

        try {
            switch (level) {
                case 0:
                    return await Promise.all([setFanStatus_tasmota(['off', 'off', 'off'])]);
                case 1:
                    return await Promise.all([setFanStatus_tasmota(['on', 'off', 'off'])]);
                case 2:
                    return await Promise.all([setFanStatus_tasmota(['off', 'on', 'off'])]);
                case 3:
                    return await Promise.all([setFanStatus_tasmota(['off', 'off', 'on'])]);
            }
        } catch(e) {
            console.log(e);
        }
    }


    return {
        fanLevel
    }
}

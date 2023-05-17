#!/usr/bin/env node

const fs = require('fs');
const Ant = require('../data-provider/ant-plus/ant-plus');
const Zwift = require('../data-provider/zwift/zwift');
const Mock = require('../data-provider/mock/mock');
const SmartFan = require('../device-controller/smart-fan/smart-fan');
const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

var smoothVals = [];
var smoothValsIdx = 0;
var smoothCycles = 1;

var fanUpCycles = 0;
var fanDownCycles = 0;
var currFanLevel = 0;
var delayFanUp = 1;
var delayFanDown = 1;

const options = yargs(hideBin(process.argv))
    .option('config', {
        type: 'string',
        description: 'path to JSON config file',
    }).parseSync();


function getDataSource(config) {
    switch (config.dataProvider) {
        case "ant":
            return  new Ant({wheelCircumference: config.antConfig.wheelCircumference});
        case "zwift":
            return new Zwift({zwiftID: config.zwiftConfig.zwiftID, pollingInterval: config.zwiftConfig.pollingInterval})
        case "mock":
            return new Mock({pollingInterval: config.zwiftConfig.pollingInterval})
        default:
            throw new Error('Unsupported data provider:  ' + config.dataProvider);
    }
}

function getLevel(value, thresholds) {
    var avgValue = 0;

    if (value === undefined) {
        // Fill smoothVals with 0
        smoothVals.fill(0);
        return 0;
    }

    smoothVals[smoothValsIdx] = value;
    smoothValsIdx = (smoothValsIdx + 1) % smoothCycles;
    let sum = smoothVals.reduce((accumulator, current) => accumulator + current, 0);
    avgValue = Math.round(sum / smoothCycles);
    
    // Turn on logging if needed
    // console.log(smoothVals);
    console.log(`Smoothed value: ${avgValue}`);

    var newFanLevel = 0;

    if (avgValue >= thresholds.level3) {
        newFanLevel = 3;
    }
    else if (avgValue >= thresholds.level2) {
        newFanLevel = 2;
    }
    else if (avgValue >= thresholds.level1) {
        newFanLevel = 1;
    }
    console.log(`New fan level = ${newFanLevel}`);
    
    if (newFanLevel == currFanLevel) {
        fanUpCycles = 0;
        fanDownCycles = 0;
    }
    else if (newFanLevel > currFanLevel) {
        fanUpCycles++;
        if (fanUpCycles >= delayFanUp) {
            fanUpCycles = 0;
            fanDownCycles = 0;
            currFanLevel = newFanLevel;
        }
        else {
            console.log("! Ignore fan up");
        }
    }
    else if (newFanLevel < currFanLevel) {
        fanDownCycles++;
        if (fanDownCycles >= delayFanDown) {
            fanDownCycles = 0;
            fanUpCycles = 0;
            currFanLevel = newFanLevel;
        }
        else {
            console.log("! Ignore fan down");
        }
    }
    
    return currFanLevel;
}

if (fs.existsSync(options.config)) {
    const config = JSON.parse(fs.readFileSync(options.config).toString());
    const dataProvider = getDataSource(config);
    const smartFan = SmartFan({fanIP: config.fanIP});

    smoothCycles = config.zwiftConfig.smoothCycles;
    smoothVals.fill(0);
    delayFanUp = config.zwiftConfig.delayFanUp;
    delayFanDown = config.zwiftConfig.delayFanDown;

    switch (config.observedData) {
        case "power":
            dataProvider.power$.subscribe(value => smartFan.fanLevel(getLevel(value, config.thresholds.power)))
            break;
        case "speed":
            dataProvider.speed$.subscribe(value => smartFan.fanLevel(getLevel(value, config.thresholds.speed)))
            break;
        case "hr":
            dataProvider.hr$.subscribe(value => smartFan.fanLevel(getLevel(value, config.thresholds.hr)))
            break;
    }

    process.on('exit', () => {
        smartFan.fanLevel(0)
    });
}

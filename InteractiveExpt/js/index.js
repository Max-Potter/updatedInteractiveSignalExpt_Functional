//const TRIAL_FILE = "trial_" + EXPERIMENT_NAME + ".txt";
//GRID CHANGE
const DIM_COORDS = 2;
const GRID_NROW = 10;
//const GRID_NCOL = 9;
const GRID_NCOL = 10;
const SHAPE_DIR = "shape/";
const RECEIVER_MOVE_SPEED = 0.5;
const MAX_SAY_OPTION = 6;
const TRIAL_DICT = {};
const PRAC_TRIAL_DICT = {};
const MAX_BONUS = 8;
const CONSECUTIVE_QUIT_MAX = 3;
const CONSECUTIVE_FAST_DECISION_MAX = 3;
const FAST_DECISION_TIME = 1; //in seconds
const EXPONENTIAL_PARAMETER = 2; //mean of a exponential distribution; i.e., 1/lambda
const SIMULATED_SIGNALER_DECISION_TIME = 5.2655 / 5 * 3;

// object variables
var instr, subj, tryMove, trySay, expt; //practice


var idPairs = {"123":"321","321":"123"};
var startingRoles = {};
var partnersAction = {};
var partnersLists = {};
var testList = [];


var trial;
var reward;
var startTime;
var trialNum = 0;
var trialObj = {};
var goal;
var signalSpace;
var pathNum = 0;
var path;


/*
  #####  ####### ####### #     # ######
 #     # #          #    #     # #     #
 #       #          #    #     # #     #
  #####  #####      #    #     # ######
       # #          #    #     # #
 #     # #          #    #     # #
  #####  #######    #     #####  #
*/
// Preload all shapes and images
var images = new Array()
function preload() {
    for (i = 0; i < preload.arguments.length; i++) {
        images[i] = new Image()
        images[i].src = preload.arguments[i]
    }
}
preload(
    // "shape/greenCircle.png",
    // "shape/greenSquare.png",
    // "shape/greenTriangle.png",
    // "shape/purpleCircle.png",
    // "shape/purpleSquare.png",
    // "shape/purpleTriangle.png",
    // "shape/redCircle.png",
    // "shape/redSquare.png",
    // "shape/redTriangle.png",
    "shape/gCircle.png",
    "shape/gSquare.png",
    "shape/gTriangle.png",
    "shape/pCircle.png",
    "shape/pSquare.png",
    "shape/pTriangle.png",
    "shape/oCircle.png",
    "shape/oSquare.png",
    "shape/oTriangle.png",
    "shape/receiver.png",
    "shape/signaler.png",
    "exampleGrid.png",
    "sigRecPOV.png",
    "utilityHoverEffect.png",
    "2021_5-5_informedConsent.pdf"
)

const PIC_DICT = {
    "green circle": SHAPE_DIR + "gCircle.png",
    "green square": SHAPE_DIR + "gSquare.png",
    "green triangle": SHAPE_DIR + "gTriangle.png",
    "purple circle": SHAPE_DIR + "pCircle.png",
    "purple square": SHAPE_DIR + "pSquare.png",
    "purple triangle": SHAPE_DIR + "pTriangle.png",
    "orange circle": SHAPE_DIR + "oCircle.png",
    "orange square": SHAPE_DIR + "oSquare.png",
    "orange triangle": SHAPE_DIR + "oTriangle.png",
}

// Import data
var textString;
var lines, linesArray;
function PARSE_CSV(csvString) {
    var lines = csvString.split(/\r?\n/)
    var linesArray = [];
    //var found = false
    //while(found != true){

    //}
    var headerArray = lines[0].match(/,[A-Z]*/gi);
    predSignalIndex = headerArray.indexOf(",predSignalNoActionUtility") + 1;


    for (i = 1; i < lines.length - 1; i++) {
        linesArray[i - 1] = {};
        currLineArray = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        //linesArray[i - 1]["predSignalNoActionUtility"] = currLineArray[predSignalIndex].slice(1, -1); //remove ""
        linesArray[i-1]["predSignalNoActionUtility"] = currLineArray[predSignalIndex];

        tmp = lines[i].match(/\(\d, \d\)/g)[0];
        linesArray[i - 1]["signalerLocation"] = [parseInt(tmp.substring(1, 2)), parseInt(tmp.substring(4, 5))];

        tmp = lines[i].match(/\(\d, \d\)/g)[1];
        linesArray[i - 1]["receiverLocation"] = [parseInt(tmp.substring(1)), parseInt(tmp.substring(4))];

        linesArray[i - 1]["intention"] = lines[i].match(/\w+ \w+/)[0];

        linesArray[i - 1]["signalSpace"] = [];
        signalSpaceEntireEntry = lines[i].match(/\[(.*?)\]/)[1];
        tmp = signalSpaceEntireEntry.match(/'\w+'/g);
        for (j = 0; j < tmp.length; j++) {
            tmp[j] = tmp[j].substring(1, tmp[j].length - 1);
            linesArray[i - 1]["signalSpace"][j] = tmp[j];
        }

        linesArray[i - 1]["targetDictionary"] = {};
        tmp = lines[i].match(/\(\d, \d\): '\w+ \w+'/g);
        for (j = 0; j < tmp.length; j++) {
            tmpCoordinate = tmp[j].match(/\(\d, \d\)/)[0];
            coordinate = [parseInt(tmpCoordinate.substring(1, 2)), parseInt(tmpCoordinate.substring(4, 5))];
            item = tmp[j].match(/\w+ \w+/)[0];
            linesArray[i - 1]["targetDictionary"][coordinate] = item;
        }

        linesArray[i - 1]["nTargets"] = parseInt(lines[i].match(/,\d,/)[0].substring(1, 2));

        // linesArray[i - 1]["receiverIntentionDict"] = {};

        // tmp = lines[i].match(/'\w+': '\w+ \w+'/g);
        // for (j = 0; j < tmp.length; j++) {
        //     signal = tmp[j].match(/'\w+'/)[0];
        //     intention = tmp[j].match(/'\w+ \w+'/)[0];
        //     linesArray[i - 1]["receiverIntentionDict"][signal.substring(1, signal.length - 1)] = intention.substring(1, intention.length - 1);
        // }

        // tmp = null;
        // var comma = lines[i].lastIndexOf(",");
        // tmp = lines[i].substring(comma + 1);
        // linesArray[i - 1]["trialStrategy"] = tmp;

        // tmp = lines[i].match(/{'up'.*?}/g);
        // if (tmp != null){
        //     linesArray[i - 1]["barrierDict"] = {
        //         "up": tmp[0].match(/'([^']*)'/g)[1].substring(1, tmp[0].match(/'([^']*)'/g)[1].length - 1),
        //         "down":  tmp[0].match(/'([^']*)'/g)[3].substring(1, tmp[0].match(/'([^']*)'/g)[3].length - 1),
        //         "left":  tmp[0].match(/'([^']*)'/g)[5].substring(1, tmp[0].match(/'([^']*)'/g)[5].length - 1),
        //         "right": tmp[0].match(/'([^']*)'/g)[7].substring(1, tmp[0].match(/'([^']*)'/g)[7].length - 1)
        //     };
        // } else {
        //     linesArray[i - 1]["barrierDict"] = tmp;
        // }

        tmp = lines[i].match(/{'\w+ \w+': \['.*?}/g);
        if (tmp != null) {
            tmp = tmp[0].replace(/\'/g, "\"");
            linesArray[i - 1]["recActSeq"] = JSON.parse(tmp);
        } else {
            tmp = lines[i].match(/{'\w+': \['.*?}/g);
            if (tmp != null) {
                tmp = tmp[0].replace(/\'/g, "\"");
                linesArray[i - 1]["recActSeq"] = JSON.parse(tmp);
            } else {
                linesArray[i - 1]["recActSeq"] = tmp;
            }
        }

        tmp = lines[i].match(/{'\w+ \w+': \['.*?}/g);
        if (tmp != null) {
            tmp = tmp[1].replace(/\'/g, "\"");
            linesArray[i - 1]["sigActSeq"] = JSON.parse(tmp);
        } else {
            linesArray[i - 1]["sigActSeq"] = tmp;
        }
    }
    //console.log(linesArray[0]["predSignalNoActionUtility"]);
    return linesArray;
}

function SHUFFLE_ARRAY(array) {
    var j, temp;
    for (var i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function tempDeletePlease() {
    fetch("inputCSV/trial_signal.txt")
        .then(response => response.text())
        .then(textString => {
            //console.log(textString);
            var lines = textString.split(/\r?\n/);
            var linesArray = [];
            //console.log(lines);
            headerArray = lines[0].match(/;[A-Z]*/gi);
            console.log(headerArray);
            predSignalIndex = headerArray.indexOf(";decisionTime");
            for (i = 1; i < lines.length - 1; i++) {
                linesArray[i - 1] = {};
                currLineArray = lines[i].match(/[;][a-zA-Z0-9_.,-]*/g);
                linesArray[i - 1]["predSignalNoActionUtility"] = currLineArray[predSignalIndex];
                //console.log(linesArray[i-1]);
        }
        var sum = 0;
        var numelements = 0;
        var entryArray = [];
        for (i = 1; i < lines.length - 1; i++) {
            //console.log(i);
            testElement = linesArray[i - 1]["predSignalNoActionUtility"].substring(1);
            //console.log(testElement);
            if (!isNaN(testElement)) {
                numelements++;
                sum += parseFloat(linesArray[i - 1]["predSignalNoActionUtility"].substring(1));
                entryArray.push(parseFloat(linesArray[i - 1]["predSignalNoActionUtility"].substring(1)));
            }
        }
        console.log(sum);
        console.log(numelements);
        //console.log(entryArray);
        entryArray.sort((a, b) => a - b);
        console.log(entryArray);
        console.log(numelements / 2);
        console.log(entryArray[Math.floor(numelements / 2)]);
        console.log(entryArray[Math.ceil(numelements / 2)]);


})
}




function CREATE_RANDOM_LIST_FOR_EXPT(obj) {
    obj.randomizedTrialList = SHUFFLE_ARRAY(Object.keys(obj.inputData));
}


/*
 ######  #######    #    ######  #     #
 #     # #         # #   #     #  #   #
 #     # #        #   #  #     #   # #
 ######  #####   #     # #     #    #
 #   #   #       ####### #     #    #
 #    #  #       #     # #     #    #
 #     # ####### #     # ######     #

*/
$(document).ready(function () {
    //tempDeletePlease();
    subj = new subjObject(subj_options);
    //                                                                 //MAX:
    //subj.id = subj.getID("sonacode"); // getting subject number     //xxx: comment to run on local
    //subj.saveVisit();                                               //xxx: comment to run on local
    //if (subj.phone) { // asking for subj.phone will detect phone    //xxx: comment to run on local
    //    BLOCK_MOBILE();                                             //xxx: comment to run on local
    //} else if (subj.id !== null){                                   //xxx: comment to run on local
        //fetches CSV from file into a string
        fetch("inputCSV/sanityTest.csv")
            .then(response => response.text())
            .then(textString => {
                SANITY_CHECK_INPUT_DATA = PARSE_CSV(textString)
            })
            // .then( () => {fetch("practiceTrialsNItems_barriers_20210428.csv")
            //     .then(response => response.text())
            //     .then(textString => {
            //         PRACTICE_INPUT_DATA = PARSE_CSV(textString)
            //     })
                .then( () => {fetch("inputCSV/exptTest.csv")
                    .then(response => response.text())
                    .then(textString => {
                        EXPT_INPUT_DATA = PARSE_CSV(textString)
                    })
                    .then(() => {
                        instr = new instrObject(instr_options);
                        tryMove = new trialObject(trial_options);
                        trySay = new trialObject(trial_options);
                        sanityCheck = new trialObject(sanity_check_options);
                        sanityCheck.inputData = SANITY_CHECK_INPUT_DATA;
                        // practice = new trialObject(practice_trial_options);
                        // practice.inputData = PRACTICE_INPUT_DATA;
                        expt = new trialObject(trial_options);
                        expt.inputData = EXPT_INPUT_DATA;
                        instr.start();
                        ALLOW_SHORTCUTS_FOR_TESTING();
                        // console.log(sanityCheck.inputData);
                        // // console.log(practice.inputData);
                        // console.log(expt.inputData);
                        });
                    //});
                });
        sanity_check_options["subj"] = subj;
        trial_options["subj"] = subj;                                  //MAX:

    //} else {                                                        //xxx: comment to run on local
    //    alert("Please make sure you are directed from SONA.")       //xxx: comment to run on local
    //}                                                               //xxx: comment to run on local
});


/*
 ####### ######  ###    #    #
    #    #     #  #    # #   #
    #    #     #  #   #   #  #
    #    ######   #  #     # #
    #    #   #    #  ####### #
    #    #    #   #  #     # #
    #    #     # ### #     # #######

*/
const TRIAL_TITLES = [
    "subjNum",
    "sonaID",
    "startDate",
    "startTime",
    "trialType",
    "trialIndex",
    "exptId",
    "decision",
    "signal",
    "signalerPath",
    "signalerEndCoordinate",
    "signalerEndItem",
    "receiverPath",
    "receiverEndCoordinate",
    "receiverEndItem",
    "signalerAchievedGoal",
    "receiverAchievedGoal",
    "totalUtility",
    "simSigDecisionTime",
    "partiRecDecisionTime",
    "actionTime",
    "feedbackTime",
    "responseWarningPopup",
    "chosenItem",
    "confidence",
    "hoverItems"
    // "quitWarningPopup"
];

var sanity_check_options = {
    subj: 'pre-define', // assign after subj is created
    titles: TRIAL_TITLES,
    dataFile: SANITY_FILE,
    savingScript: SAVING_SCRIPT,
    savingDir: SAVING_DIR
}
// var practice_trial_options = {
//     subj: 'pre-define', // assign after subj is created
//     //trialN: TRIAL_N,
//     titles: TRIAL_TITLES,
//     //stimPath: STIM_PATH,
//     //dataFile: TRIAL_FILE,
//     savingScript: SAVING_SCRIPT,
//     savingDir: SAVING_DIR,
//     //trialFunc: TRIAL,
//     //endExptFunc: END_EXPT
// }
var trial_options = {
    subj: 'pre-define', // assign after subj is created
    titles: TRIAL_TITLES,
    dataFile: TRIAL_FILE,
    savingScript: SAVING_SCRIPT,
    savingDir: SAVING_DIR
}


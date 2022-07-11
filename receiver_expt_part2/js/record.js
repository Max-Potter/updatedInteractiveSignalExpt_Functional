const FORMAL = false;
const EXPERIMENT_NAME = "recPilot";
const SUBJ_NUM_FILE = "subjNum_" + EXPERIMENT_NAME + ".txt";
const VISIT_FILE = "visit_" + EXPERIMENT_NAME + ".txt";
const ATTRITION_FILE = 'attrition_' + EXPERIMENT_NAME + '.txt';
const SUBJ_FILE = 'subj_' + EXPERIMENT_NAME + '.txt';
const SANITY_FILE = "sanity_" + EXPERIMENT_NAME + ".txt";
const TRIAL_FILE = "trial_" + EXPERIMENT_NAME + ".txt";
const UID_FILE = "uid_" + EXPERIMENT_NAME + ".txt";
const VIEWPORT_MIN_W = 1000;
const VIEWPORT_MIN_H = 600;
const SAVING_SCRIPT = 'php/save.php';
const SAVING_DIR = FORMAL ? "data/formal":"data/testing";

function LIST_TO_FORMATTED_STRING(data_list, divider) {
    divider = (divider === undefined) ? ',' : divider;
    var string = '';
    for (var i = 0; i < data_list.length - 1; i++) {
        string += data_list[i] + divider;
    }
    string += data_list[data_list.length - 1] + '\n';
    return string;
}

function FORMAT_DATE(date_obj, time_zone, divider, padded) {
    date_obj = (date_obj === undefined) ? new Date() : date_obj;
    time_zone = (time_zone === undefined) ? 'UTC' : time_zone;
    divider = (divider === undefined) ? '.' : divider;
    padded = (padded === undefined) ? true : padded;
    const NOW_YEAR = (time_zone == 'UTC') ? date_obj.getUTCFullYear() : date_obj.getFullYear();
    var now_month = (time_zone == 'UTC') ? date_obj.getUTCMonth()+1 : date_obj.getMonth()+1;
    var now_date = (time_zone == 'UTC') ? date_obj.getUTCDate() : date_obj.getDate();
    if (padded) {
        now_month = ('0' + now_month).slice(-2);
        now_date = ('0' + now_date).slice(-2);
    }
    var now_full_date = NOW_YEAR + divider + now_month + divider + now_date;
    return now_full_date;
}

function FORMAT_TIME(date_obj, time_zone, divider, padded) {
    date_obj = (date_obj === undefined) ? new Date() : date_obj;
    time_zone = (time_zone === undefined) ? 'UTC' : time_zone;
    divider = (divider === undefined) ? ':' : divider;
    padded = (padded === undefined) ? true : padded;
    var now_hours = (time_zone == 'UTC') ? date_obj.getUTCHours() : date_obj.getHours();
    var now_minutes = (time_zone == 'UTC') ? date_obj.getUTCMinutes() : date_obj.getMinutes();
    var now_seconds = (time_zone == 'UTC') ? date_obj.getUTCSeconds() : date_obj.getSeconds();
    if (padded) {
        now_hours = ('0' + now_hours).slice(-2);
        now_minutes = ('0' + now_minutes).slice(-2);
        now_seconds = ('0' + now_seconds).slice(-2);
    }
    var now_full_time = now_hours + divider + now_minutes + divider + now_seconds;
    return now_full_time;
}

function LIST_FROM_ATTRIBUTE_NAMES(obj, string_list) {
    var list = []
    for (var i = 0; i < string_list.length; i++) {
        list.push(obj[string_list[i]]);
    }
    return list;
}
/*
 ####### #     # ######  #######
 #        #   #  #     #    #
 #         # #   #     #    #
 #####      #    ######     #
 #         # #   #          #
 #        #   #  #          #
 ####### #     # #          #

*/

//Records Answer to Likert scale for each trial
function RECORD_LIKERT_ANSWER(obj, value){
    obj.confidence = value;
}

function RECORD_CHOSEN_ITEM(obj, item){
    //var chosenItemLog = String(item) + String(GRID_NROW - row - 1);
    obj.chosenItem = String(item);
}

function RECORD_HOVER_ITEMS(obj, uniqueId){
    //var uniqueId = String(name) + ": " + String(coordinates[0]) + ", " + String(coordinates[1]);
    if(obj.hoverItems === "N/A"){
        var innerDict = {};
        innerDict[uniqueId] = 1;
        obj.hoverItems = innerDict;
    } else{
        innerDict = obj.hoverItems;
        var newVal = 0;
        if(!(uniqueId in innerDict)){
            newVal = 1;
        }
        else{
            newVal = innerDict[uniqueId] + 1;
        }
        obj.hoverItems[uniqueId] = newVal;
    }
    // if(obj.isSanityCheck){
    //     if(obj.hoverItems == "N/A"){
    //         // var itemDict = {};
    //         var innerDict = {};
    //         innerDict[uniqueId] = 1;
    //         // itemDict[obj.trialIndex] = innerDict;
    //         // obj.hoverItems = itemDict;
    //         obj.hoverItems = innerDict;
    //     }
    //     else{
    //         // if(obj.hoverItems[obj.trialIndex] == "N/A"){
    //         //     obj.hoverItems[obj.trialIndex] = {};
    //         // }
    //         //innerDict = obj.hoverItems[obj.trialIndex];
    //         innerDict = obj.hoverItems;
    //         var newVal = 0;
    //         if(!(uniqueId in innerDict)){
    //             newVal = 1;
    //         }
    //         else{
    //             newVal = innerDict[uniqueId] + 1;
    //         }
    //         //obj.hoverItems[obj.trialIndex][uniqueId] = newVal;
    //         obj.hoverItems[uniqueId] = newVal;
    //     }

    // }
    // else if(obj.isExptTrial){
    //     if(obj.hoverItems == "N/A"){
    //         console.log("First Hover");
    //         var itemDict = {};
    //         var innerDict = {};
    //         innerDict[uniqueId] = 1;
    //         itemDict[obj.randomizedTrialList[obj.trialIndex]] = innerDict;
    //         obj.hoverItems = itemDict;
    //     }
    //     else{
    //         if(obj.hoverItems[obj.randomizedTrialList[obj.trialIndex]] == "N/A"){
    //             obj.hoverItems[obj.randomizedTrialList[obj.trialIndex]] = {};
    //         }
    //         innerDict = obj.hoverItems[obj.randomizedTrialList[obj.trialIndex]];
    //         var newVal = 0;
    //         if(!(uniqueId in innerDict)){
    //             console.log("First Hover of this item");
    //             newVal = 1;
    //         }
    //         else{
    //             newVal = innerDict[uniqueId] + 1;
    //         }
    //         obj.hoverItems[obj.randomizedTrialList[obj.trialIndex]][uniqueId] = newVal;
    //     }
    //     console.log(obj.hoverItems);
    // }
}

//Records time from round starting to signal being sent
function RECORD_SIMULATED_SIG_DECISION_TIME(obj, waitoutTime) {
    obj.simSigDecisionTime = waitoutTime;
}

//Records the decision time. This is the elapsed time from the signal being sent -> participant making a decision
function RECORD_PARTI_DECISION_DATA(obj, decision) {
    if(!obj.decisionRecorded){
        obj.decision = decision;
        var currentTime = Date.now();
        obj.partiRecDecisionTime = (currentTime - obj.startTime)/1000 - obj.simSigDecisionTime;
        CHECK_CONSECUTIVE_QUICK_DECISION(obj);
        obj.decisionRecorded = true;
    }
}

//Checks if user is answering too quickly
function CHECK_CONSECUTIVE_QUICK_DECISION(obj) {
    //If user responds faster than a static, set FAST_DECISION_TIME, augment number of consecutive quick decisions by 1
    if (obj.partiRecDecisionTime < FAST_DECISION_TIME)
        obj.consecutiveQuickDecisionNum += 1;
    //If user does not respond faster than static, set FAST_DECISION_TIME, reset number of consecutive quick decisions to 0
    else
        obj.consecutiveQuickDecisionNum = 0;
    //Test if user has made more consecutive quick decisions than static, set CONSECUTIVE_FAST_DECISION_MAX (integer). Triggers a warning if they have. 
    if (obj.consecutiveQuickDecisionNum >= CONSECUTIVE_FAST_DECISION_MAX) {
        alert("You have been making decisions too fast! Please do the future rounds more carefully.")
        obj.responseWarningPopup = true;
    } else
        obj.responseWarningPopup = false;

}

//Records action time. This is the time elapsed from making a decision to arriving at object
function RECORD_ACTION_TIME(obj) {
    var currentTime = Date.now();
    obj.actionTime = (currentTime - obj.startTime)/1000 - obj.simSigDecisionTime - obj.partiRecDecisionTime;
}

function RECORD_SIGNAL_DATA(obj, decision) {
    if (obj.isSanityCheck){
        obj.signal = (decision == "say")? obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["predSignalNoActionUtility"]: "N/A";
        //obj.signal = (decision == "say")? obj.inputData[obj.trialIndex]["predSignalNoActionUtility"]: "N/A";
    }
    else if (obj.isExptTrial)
        obj.signal = (decision == "say")? obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["predSignalNoActionUtility"]: "N/A";
    // if(obj.isExptTrial || obj.isSanityCheck)
    //     obj.signal = (signal == undefined) ? "N/A" : signal;
}

function RECORD_SIGNALER_PATH(obj) {
    if(obj.isExptTrial || obj.isSanityCheck) {
        if (obj.exptSignalerPath == "N/A")
            obj.exptSignalerPath = "";
        obj.exptSignalerPath += CONVERT_COORD_ARRAY_TO_STR(CONVERT_ARRAY_COORD_TO_CSV_COORD(obj.signalerLocation[0], obj.signalerLocation[1]));
    }
}

function RECORD_RECEIVER_PATH(obj) {
    if(obj.isExptTrial || obj.isSanityCheck) {
        if (obj.exptReceiverPath == "N/A")
            obj.exptReceiverPath = "";
        obj.exptReceiverPath += CONVERT_COORD_ARRAY_TO_STR(CONVERT_ARRAY_COORD_TO_CSV_COORD(obj.receiverLocation[0], obj.receiverLocation[1]));
    }
}

// function FIND_SHAPENAME_FROM_SHAPEPIC (shapePic) {
//     var pictKeyIndex = 0;
//     while(PIC_DICT[Object.keys(PIC_DICT)[pictKeyIndex]] != shapePic ) {
//         pictKeyIndex++;
//     }
//     return Object.keys(PIC_DICT)[pictKeyIndex];
// }

function CONVERT_COORD_ARRAY_TO_STR (array) {
    return "(" + array.toString() + ")";
}

function RECORD_SIGNALER_END_LOCATION(obj, signalerLocation) {
    var startingCoord;
    if(obj.isSanityCheck) {
        //startingCoord = obj.inputData[obj.trialIndex]["signalerLocation"];
        startingCoord = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"];
    } else if(obj.isExptTrial){
        startingCoord = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"];
    } else {
        return
    }
    obj.signalerEndCoordinate = (signalerLocation == undefined) ? CONVERT_COORD_ARRAY_TO_STR(startingCoord): CONVERT_COORD_ARRAY_TO_STR(CONVERT_ARRAY_COORD_TO_CSV_COORD(signalerLocation[0], signalerLocation[1]));
    obj.signalerEndItem = (signalerLocation == undefined) ? "noChange": obj.gridArray[signalerLocation[0]][signalerLocation[1]];

}

function RECORD_RECEIVER_END_LOCATION(obj, receiverLocation) {
    var startingCoord;
    if (obj.isSanityCheck) {
        //startingCoord = obj.inputData[obj.trialIndex]["receiverLocation"];
        startingCoord = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"];
    } else if(obj.isExptTrial){
        startingCoord = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"];
    } else {
        return
    }
    obj.receiverEndCoordinate = (receiverLocation == undefined) ? CONVERT_COORD_ARRAY_TO_STR(startingCoord): CONVERT_COORD_ARRAY_TO_STR(CONVERT_ARRAY_COORD_TO_CSV_COORD(receiverLocation[0], receiverLocation[1]));
    obj.receiverEndItem = (receiverLocation == undefined) ? "noChange": obj.gridArray[receiverLocation[0]][receiverLocation[1]];
}

function RECORD_SIGNALER_ACHIEVED(obj, achieved) {
    if(obj.isExptTrial || obj.isSanityCheck){
        obj.signalerAchievedGoal = (achieved == undefined) ? false : true;
    }
}

function RECORD_RECEIVER_ACHIEVED(obj, achieved) {
    if(obj.isExptTrial || obj.isSanityCheck){
        obj.receiverAchievedGoal = (achieved == undefined) ? false : true;
    }
}

/*
 ######  ####### ######  ######  ### ####### ####### ### #     #  #####
 #     # #       #     # #     #  #  #       #        #  ##    # #     #
 #     # #       #     # #     #  #  #       #        #  # #   # #
 #     # #####   ######  ######   #  #####   #####    #  #  #  # #  ####
 #     # #       #     # #   #    #  #       #        #  #   # # #     #
 #     # #       #     # #    #   #  #       #        #  #    ## #     #
 ######  ####### ######  #     # ### ####### #       ### #     #  #####

*/

function RECORD_DEBRIEFING_ANSWERS(strategy, difference) {
    // subj.serious = serious;
    subj.strategy = strategy;
    subj.difference = difference;
    // subj.problems = problems;
    // subj.rating = rating;
    // subj.motivation = motivation;
}

function SAVE_UID(uid, email, totalBonus) {
    var uid = (uid === undefined || uid === null) ? "N/A": uid;
    var email = (email === undefined || email === null) ? "N/A": email;
    var totalBonus = (totalBonus === undefined)? "N/A": totalBonus.toFixed(2);
    var data = LIST_TO_FORMATTED_STRING(["uid", "email", "totalBonus"], ";");
    var dataList = [uid, email, totalBonus];
    data += LIST_TO_FORMATTED_STRING(dataList, ";");
    var postData = {
        'directory_path': SAVING_DIR,
        'file_name': UID_FILE,
        'data': data
    };
    $.ajax({
        type: 'POST',
        url: SAVING_SCRIPT,
        data: postData,
    });
}
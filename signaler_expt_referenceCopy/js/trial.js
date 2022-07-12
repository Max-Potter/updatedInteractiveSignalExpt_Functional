class trialObject {
    constructor(options = {}) {
        Object.assign(this, {
            subj: false,
            step: 0,
            totalScore: 0,
            nextButCreated: false,
            signalerMoved: false,
            receiverMoved: false,
            reached: false,
            allowMove: false,
            pathIndex: 0,
            trialN: 0,
            titles: '',
            dataFile: 'exptData.txt',
            savingScript: 'php/save.php',
            savingDir: '',
            trialFunc: false,
            endExptFunc: false,
            isTryMove:false,
            isTrySay: false,
            isSanityCheck: false,
            isPracTrial: false,
            isExptTrial: false,
            consecutiveQuitNum: 0,
            consecutiveQuickDecisionNum: 0,
            startTime: 0,
            signal: "N/A",
            gridArray: [
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,],
                [,,,,,,,,]
            ]
        }, options);
        this.subjID = this.subj.num;
        this.subjStartDate = this.subj.date;
        this.subjStartTime = this.subj.startTime;
        this.trialIndex = 0;
        this.decisionRecorded = false;
        this.exptDataToSave = LIST_TO_FORMATTED_STRING(this.titles, ";");
        this.complete = false;

        this.receiverPathNum = 0;

        // for sanity check
        this.sanityMoveFails = 0;
        this.sanitySayFails = 0;
        this.sanityQuitFails = 0;

        this.sanityMoveAttempts = 0;
        this.sanitySayAttempts = 0;
        this.sanityQuitAttempts = 0;
    }

    next(){
        if(this.isTryMove || this.isTrySay) {
            $(".tryExptInstr").show();
            this.end();
        } else if(this.isSanityCheck) {
            this.createDataToSave();
            this.startTime = Date.now();
            this.trialIndex++;
            this.trialIndexOnInterface++;
            if(this.trialIndex >= this.trialN) {
                this.end();
            } else {
            this.step = 0;
            this.decisionRecorded = false;
            this.exptSignalerPath = "N/A",
            this.exptReceiverPath = "N/A",
            TRIAL_SET_UP(this);
            CREATE_GRID(this);
            SETUP_SCOREBOARD(this);
            CREATE_SIGNAL_BUTTONS(this, this.signalSpace);
            setTimeout(console.log, 100000, "timeout done");
            $("#sanityCheckInstr").show();
            this.move();
            }
        }
        // else if(this.isPracTrial) {
        //     this.trialIndex++;
        //     if(this.trialIndex >= this.trialN) {
        //         this.end();
        //     } else {
        //         this.step = 0;
        //         TRIAL_SET_UP(this);
        //         CREATE_GRID(this);
        //         SETUP_SCOREBOARD(this);
        //         CREATE_SIGNAL_BUTTONS(this, this.signalSpace);
        //         $("#practiceExptInstr").show();
        //         this.move();
        //     }
        // }
        else if(this.isExptTrial) {
            this.createDataToSave();
            this.startTime = Date.now();
            this.trialIndex++;
            if(this.trialIndex >= this.trialN) {
                this.end();
            } else {
                this.step = 0;
                this.decisionRecorded = false;
                this.exptSignalerPath = "N/A",
                this.exptReceiverPath = "N/A",
                TRIAL_SET_UP(this);
                CREATE_GRID(this);
                SETUP_SCOREBOARD(this);
                CREATE_SIGNAL_BUTTONS(this, this.signalSpace);
                //setTimeout(console.log, 100, "timeout done");
                $("#exptInstr").show();
                this.move();
            }
        }
    }
    end() {
        if(this.isTryMove){
            $("#tryMovePage").hide();
            NEXT_INSTR();
        } else if (this.isTrySay) {
            $("#trySayPage").hide();
            NEXT_INSTR();
        } else if(this.isSanityCheck) {
           // console.log(this.exptDataToSave);
            this.saveExptData();
            $("#sanityCheckPage").hide();
            NEXT_INSTR();
            $("#instrBackBut").hide();
            $("#instrPage").show();
        }
        // else if(this.isPracTrial) {
        //     $("#practiceExptPage").hide();
        //     NEXT_INSTR();
        //     $("#instrBackBut").hide();
        //     $("#instrPage").show();
        // }
        else if(this.isExptTrial) {
            $("#exptPage").hide();
            NEXT_INSTR();
            $("#instrBackBut").hide();
            $("#instrPage").show();
        }
    }
    move() {
        this.allowMove = true;
        //MOVE(this);
    }

    createDataToSave () {
        var currentTime = Date.now();
        this.feedbackTime = (currentTime - this.startTime) / 1000 - this.actionTime; // in seconds
        if (this.isSanityCheck)
            this.trialType = "sanity";
        else if (this.isExptTrial)
            this.trialType = "expt";
        if (this.isSanityCheck || this.isExptTrial)
            this.exptId = this.randomizedTrialList[this.trialIndex];
        else
            this.exptId = -1;
        this.totalUtility = this.totalScore.toFixed(2);
        var dataList = [this.subjID, this.subjStartDate, this.subjStartTime,
            this.trialType,
            this.trialIndex, this.exptId,
            this.decision, this.signal,
            this.exptSignalerPath, this.signalerEndCoordinate, this.signalerEndItem,
            this.exptReceiverPath, this.receiverEndCoordinate, this.receiverEndItem,
            this.signalerAchievedGoal, this.receiverAchievedGoal,
            this.totalUtility,
            this.decisionTime, this.actionTime, this.feedbackTime, this.responseWarningPopup];
            // this.quitWarningPopup
        this.exptDataToSave += LIST_TO_FORMATTED_STRING(dataList, ";");
       // console.log(this.exptDataToSave);
        this.saveExptData();
        this.exptDataToSave = "";
    }

    saveExptData() {
        var postData = {
            'directory_path': this.savingDir,
            'file_name': this.dataFile,
            'data': this.exptDataToSave
        };
        $.ajax({
            type: 'POST',
            url: this.savingScript,
            data: postData,
        });
    }
}

function CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(str){
    if(str != "" && str != null) {
        var listOfString = str.match(/\d, \d/g);
        var resultList = [];
        for(var i = 0; i < listOfString.length; i++){
            var csvCoord = listOfString[i].match(/\d/g);
            var arrayCoord = CONVERT_CSV_COORD_TO_ARRAY_COORD(csvCoord[0], csvCoord[1]);
            resultList.push(arrayCoord);
        }
        return resultList;
    }
}

function CONVERT_CSV_COORD_TO_ARRAY_COORD(inputCol, inputRow) {
    var colInArray = inputCol;
    var rowInArray = GRID_NROW - inputRow - 1;
    return [rowInArray, colInArray]; // changed order from col, row -> row, col
}

function CONVERT_ARRAY_COORD_TO_CSV_COORD(inputRow, inputCol) {
    var colInCsv = inputCol;
    var rowInCsv = GRID_NROW - inputRow - 1;
    return [colInCsv, rowInCsv]; // changed order from row, col -> col, row
}

function FIND_PATH(receiverLocation, receiverIntentionLocation) {
    initialDirection = Math.floor(Math.random() * 2); // 0 or 1

    horizontalDiff = receiverLocation[0] - receiverIntentionLocation[0];
    verticalDiff = receiverLocation[1] - receiverIntentionLocation[1];

    path = [];
    switch (initialDirection) {
        case 0: // initialDirection is vertical
            if (verticalDiff > 0) {
                for (i = 0; i < Math.abs(verticalDiff); i++) {
                    path[i] = "down";
                }
            } else if (verticalDiff < 0) {
                for (i = 0; i < Math.abs(verticalDiff); i++) {
                    path[i] = "up";
                }
            }

            currentPathLength = path.length;
            if (horizontalDiff > 0) {
                for (i = currentPathLength; i < currentPathLength + Math.abs(horizontalDiff); i++) {
                    path[i] = "left";
                }
            } else if (horizontalDiff < 0) {
                for (i = currentPathLength; i < currentPathLength + Math.abs(horizontalDiff); i++) {
                    path[i] = "right";
                }
            }

            break;

        case 1: // initialDirection is horizontal
            if (horizontalDiff > 0) {
                for (i = 0; i < Math.abs(horizontalDiff); i++) {
                    path[i] = "left";
                }
            } else if (horizontalDiff < 0) {
                for (i = 0; i < Math.abs(horizontalDiff); i++) {
                    path[i] = "right";
                }
            }

            currentPathLength = path.length;
            if (verticalDiff > 0) {
                for (i = currentPathLength; i < currentPathLength+ Math.abs(verticalDiff); i++) {
                    path[i] = "down";
                }
            } else if (verticalDiff < 0) {
                for (i = currentPathLength; i < currentPathLength + Math.abs(verticalDiff); i++) {
                    path[i] = "up";
                }
            }
            break;

        default:
            console.log("ERROR: invalid initialDirection");
            break;
    }
    return path;
}

function CREATE_RECEIVER_PATH_DICT(obj) {
//     // Below section finds a path for each signal from signalSpace and assigns them into a dict for receiverPath
//     // TEMPORARY TO REVERSE KEY:VALUE ORDER OF A DICTIONARY FOR TARGET_DICTIONARY
//     if(obj.isPracTrial) {
//         obj.receiverPath = obj.inputData[obj.trialIndex]["recActSeq"];
//     } else
    if (obj.isSanityCheck){
        obj.receiverPath = obj.inputData[obj.trialIndex]["recActSeq"]
        obj.signalerPath = obj.inputData[obj.trialIndex]["sigActSeq"]
    } else if (obj.isExptTrial) {
        obj.receiverPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["recActSeq"]
        obj.signalerPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["sigActSeq"]
    }

}

function SET_RECEIVER_SIGNALER_LOCATION(obj) {
    if (obj.isSanityCheck)  { //obj.isPracTrial
        obj.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.trialIndex]["receiverLocation"][0], obj.inputData[obj.trialIndex]["receiverLocation"][1]);
        obj.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.trialIndex]["signalerLocation"][0], obj.inputData[obj.trialIndex]["signalerLocation"][1]);
    } else if (obj.isExptTrial) {
        obj.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][1]);
        obj.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][1]);
    }
}

function SET_BARRIER(obj) {
    if (obj.isTryMove || obj.isTrySay) {
        obj.barrier = {
            "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.up),
            "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.down),
            "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.left),
            "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.right)
        }
    }
    else if (obj.isSanityCheck) { //obj.isPracTrial
        obj.barrier = {
            "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.up),
            "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.down),
            "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.left),
            "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.right)
        }
    }
    else if (obj.isExptTrial) {
        obj.barrier = {
            "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.up),
            "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.down),
            "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.left),
            "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.right)
        }
    }
}

function TRIAL_SET_UP (obj) {
    $(".gridItem").remove();
    $(".gridEmpty").remove();

    obj.gridArray = [
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,]
    ];

    SET_RECEIVER_SIGNALER_LOCATION(obj);
    SET_BARRIER(obj);

    obj.gridArray[obj.receiverLocation[0]][obj.receiverLocation[1]] = SHAPE_DIR + "receiver.png";
    obj.gridArray[obj.signalerLocation[0]][obj.signalerLocation[1]] = SHAPE_DIR + "signaler.png";

    if (obj.isSanityCheck) {
        obj.signalSpace = obj.inputData[obj.trialIndex].signalSpace;
        obj.gridString= obj.inputData[obj.trialIndex].targetDictionary;
        $("#sanityCheckRound").html(obj.trialIndexOnInterface + 1);
    }
    // else if (obj.isPracTrial) {
    //     obj.signalSpace = obj.inputData[obj.trialIndex].signalSpace;
    //     obj.gridString = obj.inputData[obj.trialIndex].targetDictionary;
    //     $("#practiceRound").html(obj.trialIndex + 1);
    // }
    else if (obj.isExptTrial) {
        obj.signalSpace = obj.inputData[obj.randomizedTrialList[obj.trialIndex]].signalSpace;
        obj.gridString= obj.inputData[obj.randomizedTrialList[obj.trialIndex]].targetDictionary;
    }

    var coordinates = Object.keys(obj.gridString);
    var shape = Object.values(obj.gridString);

    for (var i = 0; i < shape.length; i++) {
        var coordFromCSV = coordinates[i].split(",");
        var coordInArray = CONVERT_CSV_COORD_TO_ARRAY_COORD(coordFromCSV[0], coordFromCSV[1])
        var row = coordInArray[0];
        var col = coordInArray[1];
        obj.gridArray[row][col] = shape[i];
        if(!obj.isExptTrial) {
            if (shape[i] == obj.inputData[obj.trialIndex].intention)
                obj.goalCoord = [row, col];
        } else {
            if (shape[i] == obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention)
                obj.goalCoord = [row, col];
        }
    }

    obj.signalerMoved = false;
    obj.receiverMoved = false;

    CREATE_RECEIVER_PATH_DICT(obj);
}

function UPDATE_RESULT_IN_OBJ(obj,reward) {
    obj.allowMove = false;
    obj.totalScore = obj.totalScore - obj.cost + reward;
    obj.reached = true;
}

function SIGNALER_AUTO_MOVE(obj) {
    DISABLE_HOVER_INFO();
    if(obj.isTryMove) {
        $("#instrBackBut").css({
            "cursor": "auto",
            "pointer-events": "none"
        });
        $("#instrNextBut").css({
            "cursor": "auto",
            "pointer-events": "none"
        });
    }

    DISABLE_DEFAULT_KEYS();
    if(!obj.decisionRecorded) {
        RECORD_DECISION_DATA(obj, "do");
        RECORD_SIGNAL_DATA(obj);
    }
    CHANGE_IN_TRIAL_INSTR("do");
    obj.allowMove = false;

    if(obj.isTryMove)
        var path = ["up", "up", "left", "left", "up", "up", "up", "up", "right", "right", "right", "right", "right"];
    else if (obj.isSanityCheck)
        var path = obj.signalerPath[obj.inputData[obj.trialIndex].intention];
    else if (obj.isExptTrial)
        var path = obj.signalerPath[obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention];


    var stepOnGrid = path[obj.pathIndex];

    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID(obj, stepOnGrid, "signaler");

    if(obj.pathIndex == path.length - 1) {
        setTimeout(SIGNALER_AUTO_MOVE_ARRIVE, 1000, obj);

    } else {
        obj.pathIndex++;
        setTimeout(SIGNALER_AUTO_MOVE, RECEIVER_MOVE_SPEED * 1000, obj, signal);
    }
}

function SIGNALER_AUTO_MOVE_ARRIVE(obj) {
    if(obj.isTryMove) {
        $("#instrBackBut").css({
            "cursor": "pointer",
            "pointer-events": "revert"
        });
        $("#instrNextBut").css({
            "cursor": "pointer",
            "pointer-events": "revert"
        });
    }
    RECORD_ACTION_TIME(obj);
    RECORD_SIGNALER_END_LOCATION(obj, obj.signalerLocation);
    RECORD_RECEIVER_END_LOCATION(obj);
    RECORD_SIGNALER_ACHIEVED(obj, "achieved")
    RECORD_RECEIVER_ACHIEVED(obj);
    UPDATE_RESULT_IN_OBJ(obj, REWARD);
    SHOW_WIN_RESULT_BOX_FOR_MOVE(obj, true);

    obj.pathIndex = 0;
    obj.step = 0;
}

// function MOVE(obj) {
//     var arrowClicked = false; //to prevent clicking on ENTER before arrow keys
//     DISABLE_DEFAULT_KEYS();
//     document.onkeydown = function(e) {
//         if(obj.allowMove) {
//             if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {// arrow keys
//                 obj.consecutiveQuitNum = 0;
//                 if(!obj.decisionRecorded) {
//                     RECORD_DECISION_DATA(obj, "move");
//                     RECORD_SIGNAL_DATA(obj);
//                 }
//                 arrowClicked = true;
//                 CHANGE_IN_TRIAL_INSTR("do");
//                 UPDATE_STEPS(obj);
//                 UPDATE_GAME_GRID(obj, e.keyCode, "signaler");
//             } else if (e.keyCode == 13) { // ENTER key
//                 if(arrowClicked){
//                     if(obj.signalerLocation[0] == obj.goalCoord[0] && obj.signalerLocation[1] == obj.goalCoord[1]){ //reached
//                         RECORD_ACTION_TIME(obj);
//                         RECORD_SIGNALER_END_LOCATION(obj, obj.signalerLocation);
//                         RECORD_RECEIVER_END_LOCATION(obj);
//                         RECORD_SIGNALER_ACHIEVED(obj, "achieved")
//                         RECORD_RECEIVER_ACHIEVED(obj);
//                         UPDATE_RESULT_IN_OBJ(obj, REWARD);
//                         SHOW_WIN_RESULT_BOX_FOR_MOVE(obj, true);
//                         obj.step = 0;
//                     } else if ($("#shape"+ obj.signalerLocation[0] + "v" + obj.signalerLocation[1]).hasClass("gridEmpty") || (obj.signalerLocation[0] == obj.receiverLocation[0] && obj.signalerLocation[1] == obj.receiverLocation[1])){
//                         alert("You cannot stop on an empty square or the receiver's position! Please move to an item on the grid.")
//                     } else {
//                         RECORD_ACTION_TIME(obj);
//                         RECORD_SIGNALER_END_LOCATION(obj, obj.signalerLocation);
//                         RECORD_RECEIVER_END_LOCATION(obj);
//                         RECORD_SIGNALER_ACHIEVED(obj);
//                         RECORD_RECEIVER_ACHIEVED(obj);
//                         UPDATE_RESULT_IN_OBJ(obj, 0);
//                         SHOW_WIN_RESULT_BOX_FOR_MOVE(obj, false);
//                         obj.step = 0;
//                     }
//                 } else
//                     alert("Please use arrow keys on your keyboard to move.");
//             } else
//                 alert("Please use arrow keys on your keyboard to move.");
//         }
//     }
// };

// Use to do something like this: ie. "1, 2" -> [1, 2]
function CONVERT_STR_TO_ARRAY(input) {
    return input.split(',').map(Number);
}

function RECEIVER_WALK(obj, signal) {
    DISABLE_HOVER_INFO();
    if(obj.isTrySay) {
        $("#instrBackBut").css({
            "cursor": "auto",
            "pointer-events": "none"
        });
        $("#instrNextBut").css({
            "cursor": "auto",
            "pointer-events": "none"
        });
    }
    obj.consecutiveQuitNum = 0;
    DISABLE_DEFAULT_KEYS();
    RECORD_DECISION_DATA(obj, "say");
    RECORD_SIGNAL_DATA(obj, signal);
    CHANGE_IN_TRIAL_INSTR("say");
    obj.allowMove = false;

    var randUni = Math.random();
    var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
    setTimeout(RECEIVER_WALK_AFTER_WAIT, randExpo * 1000, obj, signal);
}

function RECEIVER_WALK_AFTER_WAIT(obj, signal) {
    if (obj.isTrySay) {
        var path = obj.receiverPath[signal];
    } else if (obj.isSanityCheck){
        var intendedItem = obj.inputData[obj.trialIndex].receiverIntentionDict[signal];
        var path = obj.receiverPath[intendedItem];
    } else if (obj.isExptTrial){
        var intendedItem = obj.inputData[obj.randomizedTrialList[obj.trialIndex]].receiverIntentionDict[signal];
        var path = obj.receiverPath[intendedItem];
    }
    var stepOnGrid = path[obj.pathIndex];


    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID(obj, stepOnGrid, "receiver");

    if(obj.pathIndex == path.length - 1) {
        setTimeout(RECEIVER_ARRIVE, 1000, obj);
    } else {
        obj.pathIndex++;
        setTimeout(RECEIVER_WALK_AFTER_WAIT, RECEIVER_MOVE_SPEED * 1000, obj, signal);
    }
}

function RECEIVER_ARRIVE(obj) {
    if(obj.isTrySay) {
        $("#instrBackBut").css({
            "cursor": "pointer",
            "pointer-events": "revert"
        });
        $("#instrNextBut").css({
            "cursor": "pointer",
            "pointer-events": "revert"
        });
    }
    if(obj.receiverLocation[0] == obj.goalCoord[0] && obj.receiverLocation[1] == obj.goalCoord[1]) {
        RECORD_ACTION_TIME(obj);
        RECORD_SIGNALER_END_LOCATION(obj);
        RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
        RECORD_SIGNALER_ACHIEVED(obj);
        RECORD_RECEIVER_ACHIEVED(obj, "achieved");
        UPDATE_RESULT_IN_OBJ(obj, REWARD);
        SHOW_WIN_RESULT_BOX_FOR_SAY(obj, true);
        obj.step = 0;
        obj.pathIndex = 0;
    } else {
        RECORD_ACTION_TIME(obj);
        RECORD_SIGNALER_END_LOCATION(obj);
        RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
        RECORD_SIGNALER_ACHIEVED(obj);
        RECORD_RECEIVER_ACHIEVED(obj);
        UPDATE_RESULT_IN_OBJ(obj, 0);
        SHOW_WIN_RESULT_BOX_FOR_SAY(obj, false);
        obj.step = 0;
        obj.pathIndex = 0;
    }
}

function SUCCESS(){
    //console.log("DATA saved!");
}

function ERROR(){
    alert("Error occurred!");
}

function POST_DATA(page, trial_obj, success_func, error_func) {
    trial_obj = (trial_obj === undefined) ? null : trial_obj;
    success_func = (success_func === undefined) ? function() {return;} : success_func;
    error_func = (error_func === undefined) ? function() {return;} : error_func;
    $.ajax({
        type: "POST",
        url: page,
        data: trial_obj,
        success: success_func,
        error: error_func
    });
}


function NEXT_TRIAL(obj) {
    if(obj.isTryMove || obj.isTrySay){
        obj.next()
        $("#instrText").show();
        $("#instrNextBut").show();
    } else if(obj.isSanityCheck){
        RESET_GAMEBOARD();
        SANITY_CHECK_INSTR_APPEAR();
        sanityCheck.next();
    }
    // else if(obj.isPracTrial){
    //     RESET_GAMEBOARD();
    //     PRACTICE_EXPT_INSTR_APPEAR();
    //     obj.next()
    // }
    else if(obj.isExptTrial){
        RESET_GAMEBOARD();
        EXPT_INSTR_APPEAR();
        obj.next()
    }
}



/*
 ####### ######  #     #
    #    #     #  #   #
    #    #     #   # #
    #    ######     #
    #    #   #      #
    #    #    #     #
    #    #     #    #

*/

function TRY_GRID_SETUP(obj) {
    $(".gridItem").remove();
    $(".gridEmpty").remove();
    obj.gridArray[obj.receiverLocation[0]][obj.receiverLocation[1]] = SHAPE_DIR + "receiver.png";
    obj.gridArray[obj.signalerLocation[0]][obj.signalerLocation[1]] = SHAPE_DIR + "signaler.png";
    CREATE_GRID(obj);
}

// function TRY_SCOREBOARD_SETUP(obj) {
//     $("#tryMoveGoal").attr("src", PIC_DICT["red circle"]);
//     $("#trySayGoal").attr("src", PIC_DICT["red circle"]);
// }

function TRY_MOVE_GAMEBOARD_SETUP() {
    $(".trySay").hide();
    $(".tryDo").show();
    $("#tryMovePage").show();
}

function TRY_SAY_GAMEBOARD_SETUP() {
    $(".trySay").show();
    $(".tryDo").hide();
    $("#trySayPage").show();
}

function TRY_MOVE() {
    tryMove.isTryMove = true;
    tryMove.signalerMoved = false;
    tryMove.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 7);
    tryMove.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 0);
    if(!tryMove.reached)
        $("#instrNextBut").hide();
    CREATE_EXPT_BUTTONS(tryMove);
    tryMove.gridArray = [
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,PIC_DICT["red circle"],],
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,,],
            [,,,,,,,,]
        ];
    tryMove.barrierInput = {
        "up": "(3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2)",
        "down": "(3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3)",
        "left": "",
        "right": ""
    }
    tryMove.step = 0;
    SET_BARRIER(tryMove);
    tryMove.goalCoord=[3,7];
    TRY_GRID_SETUP(tryMove);
    SETUP_SCOREBOARD(tryMove);
    TRY_MOVE_GAMEBOARD_SETUP();
    tryMove.move();
}

function TRY_SAY(){
    trySay.isTrySay = true;
    trySay.receiverMoved = false;
    trySay.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 7);
    trySay.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 0);
    if(!trySay.reached)
        $("#instrNextBut").hide();
    CREATE_EXPT_BUTTONS(trySay);

    trySay.gridArray = [
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,PIC_DICT["red circle"],],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,PIC_DICT["green circle"],,,],
        [,,,,,,,,]
    ];
    trySay.barrierInput = {
        "up": "(3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (8, 5)",
        "down": "(3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6)",
        "left": "",
        "right": ""
    }
    trySay.receiverPath = {
        "red": ["right","right","right","down"],
        "green": ["left","left", "down","down","down","down","down","down", "right", "right", "right"],
        "circle": ["right","right","right","down"]
    };

    SET_BARRIER(trySay);
    trySay.step = 0;
    trySay.goalCoord = [3,7];
    var trySayOptions = ["red", "circle", "green"];
    CREATE_SIGNAL_BUTTONS(trySay, trySayOptions);
    TRY_GRID_SETUP(trySay);
    SETUP_SCOREBOARD(trySay);
    TRY_SAY_GAMEBOARD_SETUP();
}



/*
  #####     #    #     # ### ####### #     #     #####  #     # #######  #####  #    #
 #     #   # #   ##    #  #     #     #   #     #     # #     # #       #     # #   #
 #        #   #  # #   #  #     #      # #      #       #     # #       #       #  #
  #####  #     # #  #  #  #     #       #       #       ####### #####   #       ###
       # ####### #   # #  #     #       #       #       #     # #       #       #  #
 #     # #     # #    ##  #     #       #       #     # #     # #       #     # #   #
  #####  #     # #     # ###    #       #        #####  #     # #######  #####  #    #

*/

function SANITY_CHECK_GAMEBOARD_SETUP() {
    $("#sanityCheckSay").show();
    $("#sanityCheckDo").show();
    $("#sanityCheckQuit").show();
    $("#sanityCheckPage").show();
}

function START_SANITY_CHECK_TRIAL() {
    subj.saveAttrition();
    $("#instrPage").hide();
    $("#sanityCheckInfo").css("opacity", 1);
    sanityCheck.isSanityCheck = true;
    sanityCheck.trialN = sanityCheck.inputData.length;
    sanityCheck.trialIndexOnInterface = sanityCheck.trialIndex;

    // random sampling for first trial; the following trials are handled in next()
    // idea: copy a random third trial of each type, remove that from object -- repeat for all three types
    // then randomize, then add the conditionals at the end in order of (communicate, quit, do)
    // randomIndexCommunicate = Math.floor(Math.random() * 3);
    // conditionalCommunicateTrial = JSON.parse(JSON.stringify(sanityCheck.inputData[randomIndexCommunicate]));
    // sanityCheck.inputData.splice(randomIndexCommunicate, 1);

    // randomIndexQuit = Math.floor(Math.random() * 3) + 3 - 1;
    // conditionalQuitTrial = JSON.parse(JSON.stringify(sanityCheck.inputData[randomIndexQuit]));
    // sanityCheck.inputData.splice(randomIndexQuit, 1);

    // randomIndexDo = Math.floor(Math.random() * 3) + 3 * 2 - 2;
    // conditionalDoTrial = JSON.parse(JSON.stringify(sanityCheck.inputData[randomIndexDo]));
    // sanityCheck.inputData.splice(randomIndexDo, 1);


    CREATE_RANDOM_LIST_FOR_EXPT(sanityCheck);

    // sanityCheck.inputData.push(conditionalCommunicateTrial, conditionalQuitTrial, conditionalDoTrial);
    // sanityCheck.randomizedTrialList.push("6", "7", "8");

    sanityCheck.startTime = Date.now();
    sanityCheck.exptSignalerPath = "N/A",
    sanityCheck.exptReceiverPath = "N/A",

    TRIAL_SET_UP(sanityCheck);
    CREATE_GRID(sanityCheck);
    //
    CREATE_SIGNAL_BUTTONS(sanityCheck, sanityCheck.signalSpace);
    //setTimeout(CREATE_SIGNAL_BUTTONS,100000,sanityCheck,sanityCheck.signalSpace);


    SETUP_SCOREBOARD(sanityCheck);
    SANITY_CHECK_GAMEBOARD_SETUP();
    //setTimeout(CREATE_EXPT_BUTTONS,100000,sanityCheck);
    CREATE_EXPT_BUTTONS(sanityCheck);
    sanityCheck.move();
    //setTimeout(console.log, 100000, "timeout done");
    console.log("here");
    
    //setTimeout(sanityCheck.move,100000);
}

/*
 ######  ######     #     #####  ####### ###  #####  #######
 #     # #     #   # #   #     #    #     #  #     # #
 #     # #     #  #   #  #          #     #  #       #
 ######  ######  #     # #          #     #  #       #####
 #       #   #   ####### #          #     #  #       #
 #       #    #  #     # #     #    #     #  #     # #
 #       #     # #     #  #####     #    ###  #####  #######

*/
function PRACTICE_GAMEBOARD_SETUP() {
    $("#practiceSay").show();
    $("#practiceDo").show();
    $("#practiceQuit").show();
    $("#practiceExptPage").show();
}

// function START_PRACTICE_TRIAL() {
//     $("#instrPage").hide();
//     $("#practiceInfo").css("opacity", 1);
//     practice.isPracTrial = true;
//     practice.trialN = practice.inputData.length;
//     TRIAL_SET_UP(practice);
//     CREATE_GRID(practice);
//     CREATE_SIGNAL_BUTTONS(practice, practice.signalSpace);
//     SETUP_SCOREBOARD(practice);
//     PRACTICE_GAMEBOARD_SETUP();
//     CREATE_EXPT_BUTTONS(practice);
//     practice.move();
// }

function NEXT_INSTR() {
    instr.next();
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

function EXPT_GAMEBOARD_SETUP() {
    $("#say").show();
    $("#do").show();
    $("#quit").show();
    $("#exptPage").show();
}

function START_EXPT(){
    $("#instrPage").hide();
    $("#exptPracticeInfo").css("opacity", 0);
    expt.isExptTrial = true;
    expt.trialN = expt.inputData.length;
    CREATE_RANDOM_LIST_FOR_EXPT(expt);
    TRIAL_SET_UP(expt);
    CREATE_GRID(expt);
    CREATE_SIGNAL_BUTTONS(expt, expt.signalSpace);
    SETUP_SCOREBOARD(expt);
    EXPT_GAMEBOARD_SETUP();
    CREATE_EXPT_BUTTONS(expt);
    expt.move();

    expt.startTime = Date.now();
    expt.exptSignalerPath = "N/A",
    expt.exptReceiverPath = "N/A",
    $("#exptPage").show();
}


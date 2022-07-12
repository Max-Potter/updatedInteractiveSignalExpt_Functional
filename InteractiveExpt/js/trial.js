var timeoutId = -1;

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
            savingScript: 'save',
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
            //GRID CHANGE
            //gridArray: [
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,],
            //    [,,,,,,,,]
            //]
            gridArray: [
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,],
                [,,,,,,,,,]
            ]
        }, options);
        this.subjID = this.subj.num;
        this.sonaID = this.subj.id;
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

        //for switch-role condition:
        this.currentRole = "";
    }

    next(){
        if(this.isTryMove || this.isTrySay) {
            $(".tryExptInstr").show();
            this.end();
        } else if(this.isSanityCheck) {
            //MPOTTER -- SANITY CHECK "SAY" SET-UP. Look up CHANGE_INSTRUCTION for all locations (CHANGE_INSTRUCTION_EXPT)
            //trysay buttons added to index.html These should be always present but disabled and hidden if not signaler
            //In the same vein, clicking on an object should be disabled if not receiver
            //If receiver, need to wait for a signal. IF signaller, no wait.
            //Should add a time limit to signaller too -- same 10 seconds

            //I think the way this will work is:
            //Write two different setups here: one for receiver, one for signaller
            //There will be a obj.currentPlayer that tracks, and we if/elif for either branch

            //Signaller acts first, receiver waits first
            //Signaller waits second, receiver acts second
            //Before each trial, if there exists a sona-id pair (for 2 person), must wait for both
            //to have hit next to move on 

            //When generating the file to read, first 6 should be sonaId1 + sonaId2
            //SORT beforehand, so that they match across both people

            //Simulate the file writing by just writing the file yourself
            //THIS FILE NEEDS TO UPDATE IF TIMEDOUT TOO
            this.createDataToSave();
            this.startTime = Date.now();
            this.trialIndex++;
            this.trialIndexOnInterface++;
            if(this.trialIndex >= this.trialN) {
                this.end();
            } else {
            this.step = 0;
            this.decisionRecorded = false;
            this.exptSignalerPath = "N/A";
            this.exptReceiverPath = "N/A";
            this.chosenItem = "N/A";
            this.confidence = "N/A";
            this.hoverItems = "N/A";
            TRIAL_SET_UP(this);
            buttonDict = CREATE_GRID(this);
            SETUP_SCOREBOARD(this);
            CREATE_SIGNAL_BUTTONS(this, this.signalSpace);
            RESET_INSTRUCTION();
            var randUni = Math.random();
            var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
            //var signal = "red";
            //var signal = "do";
            //var signal = this.inputData[this.trialIndex]["predSignalNoActionUtility"];
            var signal = this.inputData[this.randomizedTrialList[this.trialIndex]]["predSignalNoActionUtility"];
            //console.log("prechange");
            //console.log(signal);
            var waitoutTime = SIMULATED_SIGNALER_DECISION_TIME*1000;
            setTimeout(CHANGE_INSTRUCTION, waitoutTime + randExpo * 300, signal);
            if(signal == "do"){
                setTimeout(SIGNALER_WALK_TWO,waitoutTime + randExpo*300,sanityCheck);
                RECORD_SIMULATED_SIG_DECISION_TIME(this, (waitoutTime + randExpo*300)/1000);
            }
            else{
                setTimeout(ENABLE_GRID_BUTTONS,waitoutTime + randExpo*400,buttonDict);
                RECORD_SIMULATED_SIG_DECISION_TIME(this, (waitoutTime + randExpo*400)/1000);
                setTimeout(setResponseConstraint, waitoutTime + randExpo*400,this);
            }

            //ENABLE_GRID_BUTTONS(buttonDict);
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
                this.chosenItem = "N/A";
                this.confidence = "N/A";
                this.hoverItems = "N/A";

                TRIAL_SET_UP(this);
                buttonDict = CREATE_GRID(this);
                SETUP_SCOREBOARD(this);
                CREATE_SIGNAL_BUTTONS(this, this.signalSpace);
                RESET_INSTRUCTION_EXPT();
                var randUni = Math.random();
                var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
                //var signal = "red";
                //var signal = "do";
                var signal = this.inputData[this.randomizedTrialList[this.trialIndex]]["predSignalNoActionUtility"];
                //console.log(signal);
                var waitoutTime = SIMULATED_SIGNALER_DECISION_TIME*1000;
                setTimeout(CHANGE_INSTRUCTION_EXPT, waitoutTime + randExpo * 300, signal);
                if(signal == "do"){
                    setTimeout(SIGNALER_WALK_TWO,waitoutTime + randExpo*300,expt);
                    RECORD_SIMULATED_SIG_DECISION_TIME(this, (waitoutTime + randExpo*300)/1000);
                }
                else{
                    setTimeout(ENABLE_GRID_BUTTONS,waitoutTime + randExpo*400,buttonDict);
                    RECORD_SIMULATED_SIG_DECISION_TIME(this, (waitoutTime + randExpo*400)/1000);
                    setTimeout(setResponseConstraint, waitoutTime + randExpo*400,this);
                }
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
        this.feedbackTime = (currentTime - this.startTime) / 1000 - this.simSigDecisionTime - this.partiRecDecisionTime - this.actionTime; // in seconds
        if (this.isSanityCheck){
            this.trialType = "sanity";
            //this.exptId = this.trialIndex;
            this.exptId = this.randomizedTrialList[this.trialIndex];
        } else if (this.isExptTrial) {
            this.trialType = "expt";
            this.exptId = this.randomizedTrialList[this.trialIndex];
        }
        this.totalUtility = this.totalScore.toFixed(2);
        this.hoverItems = JSON.stringify(this.hoverItems);
        var dataList = [this.subjID, this.sonaID, this.subjStartDate, this.subjStartTime,
            this.trialType,
            this.trialIndex, this.exptId,
            this.decision, this.signal,
            this.exptSignalerPath, this.signalerEndCoordinate, this.signalerEndItem,
            this.exptReceiverPath, this.receiverEndCoordinate, this.receiverEndItem,
            this.signalerAchievedGoal, this.receiverAchievedGoal,
            this.totalUtility,
            this.simSigDecisionTime, this.partiRecDecisionTime, this.actionTime, this.feedbackTime, this.responseWarningPopup,
            this.chosenItem,
            this.confidence,
            this.hoverItems];
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


function cancelTimeout(){
    if(timeoutId != -1){
        console.log("timeout cleared");
        clearTimeout(timeoutId);
        timeoutId = -1;
    }
    else{
        console.log("no timeout to clear")
    }
}

function timeLimitReached(obj){
    console.log("limit reached");
    DISABLE_DEFAULT_KEYS();
    RECORD_PARTI_DECISION_DATA(obj, "timeout");
    RECORD_SIGNAL_DATA(obj, "timeout");
    CHANGE_IN_TRIAL_INSTR("say");
    obj.allowMove = false;

    //RECORDING
    //var row = signal.id[5];
    //var col = signal.id[7];
    //selectedItem = obj.gridArray[row][col];
    RECORD_CHOSEN_ITEM(obj, "timeout");

    //Receiver_arrive copy
    //console.log(REWARD);
    RECORD_ACTION_TIME(obj);
    RECORD_SIGNALER_END_LOCATION(obj);
    RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
    RECORD_SIGNALER_ACHIEVED(obj);
    RECORD_RECEIVER_ACHIEVED(obj, "timedout");
    UPDATE_RESULT_IN_OBJ(obj, 0);
    //console.log("init");
    SHOW_WIN_RESULT_BOX_FOR_SAY(obj, false);
    //console.log("init 2");
    obj.step = 0;
    obj.pathIndex = 0;
}

function setResponseConstraint(obj){
    //console.log("baaaa");
    //console.log(timeoutId);
    timeoutId = setTimeout(timeLimitReached, 10000, obj);
    //console.log(timeoutId);
    //console.log("pt 2");
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
            //console.log("ERROR: invalid initialDirection");
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
        // obj.receiverPath = obj.inputData[obj.trialIndex]["recActSeq"]
        // obj.signalerPath = obj.inputData[obj.trialIndex]["sigActSeq"]
        obj.receiverPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["recActSeq"]
        obj.signalerPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["sigActSeq"]
    } else if (obj.isExptTrial) {
        obj.receiverPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["recActSeq"]
        obj.signalerPath = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["sigActSeq"]
    }

}

function SET_RECEIVER_SIGNALER_LOCATION(obj) {
    if (obj.isSanityCheck)  { //obj.isPracTrial
        // obj.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.trialIndex]["receiverLocation"][0], obj.inputData[obj.trialIndex]["receiverLocation"][1]);
        // obj.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.trialIndex]["signalerLocation"][0], obj.inputData[obj.trialIndex]["signalerLocation"][1]);
        obj.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][1]);
        obj.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][1]);

    } else if (obj.isExptTrial) {
        obj.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["receiverLocation"][1]);
        obj.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][0], obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["signalerLocation"][1]);
    }
}

// function SET_BARRIER(obj) {
//     if (obj.isTryMove || obj.isTrySay) {
//         obj.barrier = {
//             "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.up),
//             "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.down),
//             "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.left),
//             "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.barrierInput.right)
//         }
//     }
//     else if (obj.isSanityCheck) { //obj.isPracTrial
//         obj.barrier = {
//             "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.up),
//             "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.down),
//             "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.left),
//             "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.trialIndex].barrierDict.right)
//         }
//     }
//     else if (obj.isExptTrial) {
//         obj.barrier = {
//             "up": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.up),
//             "down": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.down),
//             "left": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.left),
//             "right": CONVERT_BARRIER_STRING_TO_LIST_OF_ARRAY_COORD(obj.inputData[obj.randomizedTrialList[obj.trialIndex]].barrierDict.right)
//         }
//     }
// }

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
    //GRID CHANGE
    obj.gridArray = [
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,],
        [,,,,,,,,,]
    ]

    SET_RECEIVER_SIGNALER_LOCATION(obj);
    //SET_BARRIER(obj);

    obj.gridArray[obj.receiverLocation[0]][obj.receiverLocation[1]] = SHAPE_DIR + "receiver.png";
    obj.gridArray[obj.signalerLocation[0]][obj.signalerLocation[1]] = SHAPE_DIR + "signaler.png";

    if (obj.isSanityCheck) {
        // obj.signalSpace = obj.inputData[obj.trialIndex].signalSpace;
        // obj.gridString= obj.inputData[obj.trialIndex].targetDictionary;
        obj.signalSpace = obj.inputData[obj.randomizedTrialList[obj.trialIndex]].signalSpace;
        obj.gridString= obj.inputData[obj.randomizedTrialList[obj.trialIndex]].targetDictionary;
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
    //console.log(coordinates);
    //console.log(shape);
    //console.log("-------- HERE");

    for (var i = 0; i < shape.length; i++) {
        var coordFromCSV = coordinates[i].split(",");
        var coordInArray = CONVERT_CSV_COORD_TO_ARRAY_COORD(coordFromCSV[0], coordFromCSV[1])
        var row = coordInArray[0];
        var col = coordInArray[1];
        //console.log(row);
        //console.log(col);
        obj.gridArray[row][col] = shape[i];
        // if(!obj.isExptTrial) {
        //     if (shape[i] == obj.inputData[obj.trialIndex].intention)
        //         obj.goalCoord = [row, col];
        // } else {
        //     if (shape[i] == obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention)
        //         obj.goalCoord = [row, col];
        // }
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
        RECORD_PARTI_DECISION_DATA(obj, "do");
        RECORD_SIGNAL_DATA(obj, "do");
    }
    CHANGE_IN_TRIAL_INSTR("do");
    obj.allowMove = false;

    if(obj.isTryMove)
        var path = ["up", "up", "left", "left", "up", "up", "up", "up", "right", "right", "right", "right", "right"];
    else if (obj.isSanityCheck){
        var path = obj.signalerPath[obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention];
        //var path = obj.signalerPath[obj.inputData[obj.trialIndex].intention];
    }
    else if (obj.isExptTrial)
        var path = obj.signalerPath[obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention];


    var stepOnGrid = path[obj.pathIndex];

    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID(obj, stepOnGrid, "signaler");

    if(obj.pathIndex == path.length - 1) {
        setTimeout(SIGNALER_AUTO_MOVE_ARRIVE, 1000, obj);

    } else {
        obj.pathIndex++;
        setTimeout(SIGNALER_AUTO_MOVE, RECEIVER_MOVE_SPEED * 1000, obj);
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

// function RECEIVER_AUTO_MOVE(obj) {
//     DISABLE_HOVER_INFO();
//     if(obj.isTryMove) {
//         $("#instrBackBut").css({
//             "cursor": "auto",
//             "pointer-events": "none"
//         });
//         $("#instrNextBut").css({
//             "cursor": "auto",
//             "pointer-events": "none"
//         });
//     }

//     DISABLE_DEFAULT_KEYS();
//     if(!obj.decisionRecorded) {
//         RECORD_PARTI_DECISION_DATA(obj, "do");
//         RECORD_SIGNAL_DATA(obj);
//     }
//     CHANGE_IN_TRIAL_INSTR("do");
//     obj.allowMove = false;

//     if(obj.isTryMove)
//         var path = ["down","right","right","right"];
//     else if (obj.isSanityCheck)
//         var path = obj.signalerPath[obj.inputData[obj.trialIndex].intention];
//     else if (obj.isExptTrial)
//         var path = obj.signalerPath[obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention];


//     var stepOnGrid = path[obj.pathIndex];

//     UPDATE_STEPS(obj);
//     UPDATE_GAME_GRID(obj, stepOnGrid, "receiver");

//     if(obj.pathIndex == path.length - 1) {
//         setTimeout(RECEIVER_AUTO_MOVE_ARRIVE, 1000, obj);

//     } else {
//         obj.pathIndex++;
//         setTimeout(RECEIVER_AUTO_MOVE, RECEIVER_MOVE_SPEED * 1000, obj, signal);
//     }
// }

// function RECEIVER_AUTO_MOVE_ARRIVE(obj) {
//     if(obj.isTryMove) {
//         $("#instrBackBut").css({
//             "cursor": "pointer",
//             "pointer-events": "revert"
//         });
//         $("#instrNextBut").css({
//             "cursor": "pointer",
//             "pointer-events": "revert"
//         });
//     }
//     RECORD_ACTION_TIME(obj);
//     RECORD_SIGNALER_END_LOCATION(obj, obj.signalerLocation);
//     RECORD_RECEIVER_END_LOCATION(obj);
//     RECORD_SIGNALER_ACHIEVED(obj, "achieved")
//     RECORD_RECEIVER_ACHIEVED(obj);
//     UPDATE_RESULT_IN_OBJ(obj, REWARD);
//     SHOW_WIN_RESULT_BOX_FOR_MOVE(obj, true);

//     obj.pathIndex = 0;
//     obj.step = 0;
// }

// function MOVE(obj) {
//     var arrowClicked = false; //to prevent clicking on ENTER before arrow keys
//     DISABLE_DEFAULT_KEYS();
//     document.onkeydown = function(e) {
//         if(obj.allowMove) {
//             if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {// arrow keys
//                 obj.consecutiveQuitNum = 0;
//                 if(!obj.decisionRecorded) {
//                     RECORD_PARTI_DECISION_DATA(obj, "move");
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

// function RECEIVER_WALK(obj, signal) {
//     DISABLE_HOVER_INFO();
//     if(obj.isTrySay) {
//         $("#instrBackBut").css({
//             "cursor": "auto",
//             "pointer-events": "none"
//         });
//         $("#instrNextBut").css({
//             "cursor": "auto",
//             "pointer-events": "none"
//         });
//     }
//     obj.consecutiveQuitNum = 0;
//     DISABLE_DEFAULT_KEYS();
//     RECORD_PARTI_DECISION_DATA(obj, "say");
//     RECORD_SIGNAL_DATA(obj, "say");
//     CHANGE_IN_TRIAL_INSTR("say");
//     obj.allowMove = false;

//     var randUni = Math.random();
//     var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
//     setTimeout(RECEIVER_WALK_AFTER_WAIT, randExpo * 1000, obj, signal);
// }

function RECEIVER_WALK_AFTER_WAIT(obj, signal) {
    if (obj.isTrySay) {
        var path = obj.receiverPath[signal];
    } else if (obj.isSanityCheck){
        //var intendedItem = obj.inputData[obj.trialIndex].receiverIntentionDict[signal];
        var intendedItem = obj.inputData[obj.randomizedTrialList[obj.trialIndex]].receiverIntentionDict[signal];
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

function DISABLE_GRID_BUTTONS(buttonDict){
    //console.log("attempting disable")
    //console.log(Object.keys(buttonDict).length)
    for (const [key,value] of Object.entries(buttonDict)){
        //console.log(key)
        //console.log("disabling button")
        $(key).css("pointer-events","none");
    }
}

function ENABLE_GRID_BUTTONS(buttonDict){
    for (const [key,value] of Object.entries(buttonDict)){
        $(key).css("pointer-events","auto");
        $(key).css("cursor","pointer");
}
}

//mpotter
function SIGNALER_WALK_TWO(obj){
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
    RECORD_PARTI_DECISION_DATA(obj, "do");
    RECORD_SIGNAL_DATA(obj, "do");
    CHANGE_IN_TRIAL_INSTR("do");
    obj.allowMove = false;


    var trueItem = getHTMLandCoordsofIntendedItem(obj);
    var trueCoords = trueItem[1];
    var row = trueCoords[0];
    var col = trueCoords[1];
    selectedItem = obj.gridArray[row][col];

    var sigSquare = document.querySelector("#shape"+ obj.signalerLocation[0] + "v" + obj.signalerLocation[1]);
    var selectSquare = document.querySelector("#shape"+ String(row) + "v" + String(col));
    //console.log("recSquare style: ", recSquare.style.left);
    //recSquare.style.position = "absolute";
    //recSquare.style.left = "300px";
    //https://stackoverflow.com/questions/614962/how-to-insert-an-element-in-div-at-position-x-y
    //console.log("recSquare style: ", recSquare.style.left);

    var sigRect = sigSquare.getBoundingClientRect();
    var selectRect = selectSquare.getBoundingClientRect();
    //console.log("position of selectedItem: ", [selectRect.x,selectRect.y]);
    //console.log("position of recLocation: ", [recRect.x,recRect.y]);
    RECORD_CHOSEN_ITEM(obj, selectedItem);


    //mpotter
    //setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT, 500, obj, myButton);

    totalSteps = Math.round(euclideanDistance((obj.signalerLocation), [row,col]));
    //console.log("toitalsteps:", totalSteps);
    eachStep = calculate_Euclidean_Steps(obj, row, col, "signaler");
    eachCoordStep = calculate_Euclidean_Steps_IntermittentCoord(obj, selectRect.x, selectRect.y, "signaler", totalSteps);
    //console.log(eachStep);
    var finalDestination = [row,col];

    mySigPic = document.getElementById('signalerImg');
    //YOU NEED TO MANUALLY SET ITS TOP AND LEFT I THINK
    mySigPic.style.top = sigRect.y + "px";
    mySigPic.style.left = sigRect.x + 10 + "px" ;
    mySigPic.style.zIndex = "1000"; 
    //myRecPic.style.top = "50px";
    //myRecPic.style.left = "50px";
    //console.log("recpic: ", myRecPic);
    //console.log("visibility: ", myRecPic.style.visibility);
    //console.log("top, and left", myRecPic.style.top, myRecPic.style.left);
    mySigPic.style.visibility = "visible";
    //console.log("total steps again:", totalSteps);
    



    setTimeout(SIGNALER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN, 500, obj, totalSteps, eachStep, eachCoordStep, finalDestination);
}

//mpotter
function SIGNALER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN(obj, totalSteps, eachStep, eachCoordStep, finalDestination){
    //console.log("rec euclid call", totalSteps);
    //console.log(obj);
    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID_EUCLIDEAN(obj, eachStep, eachCoordStep, "signaler");
    //console.log("rec location after step: ", obj.receiverLocation);

    if (totalSteps == 1){
        //console.log("Arriving");
        setTimeout(SIGNALER_ARRIVE_EUCLIDEAN, 1000, obj, finalDestination);
    } else {
        setTimeout(SIGNALER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN, RECEIVER_MOVE_SPEED * 1000, obj, totalSteps-1, eachStep, eachCoordStep, finalDestination)
    }
    
}

//mpotter
function SIGNALER_ARRIVE_EUCLIDEAN(obj, finalDestination){
    mySigPic = document.getElementById('signalerImg');
    //console.log("my Rec Pic arrive: ", myRecPic);
    mySigPic.style.visibility = "hidden";

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
    //if(obj.receiverLocation[0] == obj.goalCoord[0] && obj.receiverLocation[1] == obj.goalCoord[1]) {

        REMOVE_PREVIOUS(obj.signalerLocation); //
        obj.signalerLocation = finalDestination;//
        //console.log("rec loc:", obj.receiverLocation);
        //console.log("???");
        NEW_SIGNALER_POSITION(obj.signalerLocation);//

        
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


//mpotter
function getHTMLandCoordsofIntendedItem(obj){
    var intent = obj.inputData[obj.randomizedTrialList[obj.trialIndex]].intention;
    console.log(intent);
    intentx = intent.slice(-2,-1);
    intenty = intent.slice(-1);
    convertedCoords = convertRealGridToExpRepresentation(intentx,intenty)
    intendedShape = document.querySelector("#shape"+ convertedCoords[0] + "v" + convertedCoords[1]);
    console.log("Original: ", intentx, intenty, "Converted: ", convertedCoords);
    return [intendedShape, convertedCoords];
}

//mpotter
function convertRealGridToExpRepresentation(realX, realY){
    convertedX = String((GRID_NROW-1) - realY);
    convertedY = realX;
    return [convertedX, convertedY];

}

//mpotter -- changed 'signal' to 'myButton' in func below
function RECEIVER_WALK_TWO(obj, myButton) {
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
    //console.log("index: ", obj.trialIndex);
    var intent = getHTMLandCoordsofIntendedItem(obj);
    obj.consecutiveQuitNum = 0;
    DISABLE_DEFAULT_KEYS();
    RECORD_PARTI_DECISION_DATA(obj, "say");
    RECORD_SIGNAL_DATA(obj, "say");
    CHANGE_IN_TRIAL_INSTR("say");
    obj.allowMove = false;

    //RECORDING
    var row = myButton.id[5];
    var col = myButton.id[7];
    selectedItem = obj.gridArray[row][col];
    console.log("True row/col: ", row, col);

    var recSquare = document.querySelector("#shape"+ obj.receiverLocation[0] + "v" + obj.receiverLocation[1]);
    var selectSquare = document.querySelector("#shape"+ String(row) + "v" + String(col));
    //console.log("recSquare style: ", recSquare.style.left);
    //recSquare.style.position = "absolute";
    //recSquare.style.left = "300px";
    //https://stackoverflow.com/questions/614962/how-to-insert-an-element-in-div-at-position-x-y
    //console.log("recSquare style: ", recSquare.style.left);

    var recRect = recSquare.getBoundingClientRect();
    var selectRect = selectSquare.getBoundingClientRect();
    //console.log("position of selectedItem: ", [selectRect.x,selectRect.y]);
    //console.log("position of recLocation: ", [recRect.x,recRect.y]);
    RECORD_CHOSEN_ITEM(obj, selectedItem);


    //mpotter
    //setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT, 500, obj, myButton);

    totalSteps = Math.round(euclideanDistance((obj.receiverLocation), [row,col]));
    //console.log("toitalsteps:", totalSteps);
    eachStep = calculate_Euclidean_Steps(obj, row, col, "receiver");
    eachCoordStep = calculate_Euclidean_Steps_IntermittentCoord(obj, selectRect.x, selectRect.y, "receiver", totalSteps);
    //console.log(eachStep);
    var finalDestination = [row,col];

    myRecPic = document.getElementById('receiverImg');
    //YOU NEED TO MANUALLY SET ITS TOP AND LEFT I THINK
    myRecPic.style.top = recRect.y + "px";
    myRecPic.style.left = recRect.x + 10 + "px" ;
    myRecPic.style.zIndex = "1000"; 
    //myRecPic.style.top = "50px";
    //myRecPic.style.left = "50px";
    //console.log("recpic: ", myRecPic);
    //console.log("visibility: ", myRecPic.style.visibility);
    //console.log("top, and left", myRecPic.style.top, myRecPic.style.left);
    myRecPic.style.visibility = "visible";
    //console.log("total steps again:", totalSteps);
    



    setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN, 500, obj, totalSteps, eachStep, eachCoordStep, finalDestination);
}

//mpotter
function RECEIVER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN(obj, totalSteps, eachStep, eachCoordStep, finalDestination){
    //console.log("rec euclid call", totalSteps);
    //console.log(obj);
    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID_EUCLIDEAN(obj, eachStep, eachCoordStep, "receiver");
    //console.log("rec location after step: ", obj.receiverLocation);

    if (totalSteps == 1){
        //console.log("Arriving");
        setTimeout(RECEIVER_ARRIVE_EUCLIDEAN, 1000, obj, finalDestination);
    } else {
        setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT_EUCLIDEAN, RECEIVER_MOVE_SPEED * 1000, obj, totalSteps-1, eachStep, eachCoordStep, finalDestination)
    }
    
}

//mpotter
function RECEIVER_ARRIVE_EUCLIDEAN(obj, finalDestination){
    myRecPic = document.getElementById('receiverImg');
    //console.log("my Rec Pic arrive: ", myRecPic);
    myRecPic.style.visibility = "hidden";

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
    //if(obj.receiverLocation[0] == obj.goalCoord[0] && obj.receiverLocation[1] == obj.goalCoord[1]) {

        REMOVE_PREVIOUS(obj.receiverLocation); //
        obj.receiverLocation = finalDestination;//
        //console.log("rec loc:", obj.receiverLocation);
        //console.log("???");
        NEW_RECEIVER_POSITION(obj.receiverLocation);//

        
        RECORD_ACTION_TIME(obj);
        RECORD_SIGNALER_END_LOCATION(obj);
        RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
        RECORD_SIGNALER_ACHIEVED(obj);
        RECORD_RECEIVER_ACHIEVED(obj, "achieved");
        UPDATE_RESULT_IN_OBJ(obj, REWARD);
        SHOW_WIN_RESULT_BOX_FOR_SAY(obj, true);
        obj.step = 0;
        obj.pathIndex = 0;
}



function RECEIVER_WALK_TO_CHOSEN_OBJECT(obj, intendedItemtemp) {
    //Change ? -- Button should be disabled at start. Once "waiting for..." changes to a signal, people should be able to click
    //Change 1 -- hover over item changes cursor to hand
        //"pointer-events": "revert",
        //"cursor": "pointer"
    //Change 2 -- once they click on a button, should not be able to click on other buttons / should disable other fxns
        //Can use pointer-events to disable clicking on buttons
    //Also need to update the changing text so that it sends right signal for each trial
    //console.log(intendedItemtemp.id);

    //if(intendedItemtemp == 0){
    //    var row = 3;
    //    var col = 7;
    //}
    //else{
    var row = intendedItemtemp.id[5];
    var col = intendedItemtemp.id[7];
    //}

    intendedItem = obj.gridArray[row][col];
    var path = obj.receiverPath[intendedItem];
    var stepOnGrid = path[obj.pathIndex];


    ///mpotter euclid update

    UPDATE_STEPS(obj);

    //UPDATE_GAME_GRID_EUCLIDEAN(obj, stepOnGrid, "receiver");
    UPDATE_GAME_GRID(obj, stepOnGrid, "receiver");

    if(obj.pathIndex == path.length - 1) {
        setTimeout(RECEIVER_ARRIVE, 1000, obj);
    } else {
        obj.pathIndex++;
        setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT, RECEIVER_MOVE_SPEED * 1000, obj, intendedItemtemp);
    }
    //intendedItemtemp
    //id = "shape" row "v" col
    //"shape1v3" --> str[5] = 1, str[7] = 3

    //console.log("This item was: ");
    //console.log(intendedItem);
    //console.log(obj.inputData[obj.trialIndex].receiverIntentionDict["triangle"]);
    /*
    var intendedItem = obj.inputData[intendedItemtemp].receiverIntentionDict["triangle"];

    //obj.inputData[obj.trialIndex].receiverIntentionDict[signal];

    "red triangle"

    console.log(intendedItem);
    console.log(obj);
    var path = obj.receiverPath[intendedItem];
    console.log(path);
    var stepOnGrid = path[obj.pathIndex];
    UPDATE_STEPS(obj);
    UPDATE_GAME_GRID(obj, stepOnGrid, "receiver");

    if(obj.pathIndex == path.length - 1) {
        setTimeout(RECEIVER_ARRIVE, 1000, obj);
    } else {
        obj.pathIndex++;
        setTimeout(RECEIVER_WALK_TO_CHOSEN_OBJECT, RECEIVER_MOVE_SPEED * 1000, obj, signal);
    }
    */
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
    //if(obj.receiverLocation[0] == obj.goalCoord[0] && obj.receiverLocation[1] == obj.goalCoord[1]) {
        RECORD_ACTION_TIME(obj);
        RECORD_SIGNALER_END_LOCATION(obj);
        RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
        RECORD_SIGNALER_ACHIEVED(obj);
        RECORD_RECEIVER_ACHIEVED(obj, "achieved");
        UPDATE_RESULT_IN_OBJ(obj, REWARD);
        SHOW_WIN_RESULT_BOX_FOR_SAY(obj, true);
        obj.step = 0;
        obj.pathIndex = 0;
    // } else {
    //     RECORD_ACTION_TIME(obj);
    //     RECORD_SIGNALER_END_LOCATION(obj);
    //     RECORD_RECEIVER_END_LOCATION(obj, obj.receiverLocation);
    //     RECORD_SIGNALER_ACHIEVED(obj);
    //     RECORD_RECEIVER_ACHIEVED(obj);
    //     UPDATE_RESULT_IN_OBJ(obj, 0);
    //     SHOW_WIN_RESULT_BOX_FOR_SAY(obj, false);
    //     obj.step = 0;
    //     obj.pathIndex = 0;
    // }
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
        //var trialStrategy = obj.inputData[obj.trialIndex]["predSignalNoActionUtility"];
        var trialStrategy = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["predSignalNoActionUtility"];
        var selected = $("input[name='ConfidenceScale']:checked");
        var click = selected.val();
        $("input[name='ConfidenceScale']").prop('checked',false);
        if(click == undefined && trialStrategy != "do"){
            var checkHidden = document.getElementById("sanityLikertScale");
            if(checkHidden.style.display != "none"){
                alert("Please select a response on the scale. Thank you!");
            }
            else{
                //console.log("attempting pass")
                RECORD_LIKERT_ANSWER(obj, -1);
                RESET_GAMEBOARD();
                SANITY_CHECK_INSTR_APPEAR();
                obj.next();
            }
        }
        else{
            if (trialStrategy != "do"){
                RECORD_LIKERT_ANSWER(obj, click);
            }
        RESET_GAMEBOARD();
        SANITY_CHECK_INSTR_APPEAR();
        obj.next();
        }
    }
    // else if(obj.isPracTrial){
    //     RESET_GAMEBOARD();
    //     PRACTICE_EXPT_INSTR_APPEAR();
    //     obj.next()
    // }
    else if(obj.isExptTrial){
        var trialStrategy = obj.inputData[obj.randomizedTrialList[obj.trialIndex]]["predSignalNoActionUtility"];
        var selected = $("input[name='ConfidenceScale']:checked");
        var click = selected.val();
        $("input[name='ConfidenceScale']").prop('checked',false);
        if(click == undefined && trialStrategy != "do"){
            var checkHidden = document.getElementById("exptLikertScale");
            if(checkHidden.style.display != "none"){
                alert("Please select a response on the scale. Thank you!");
            }
            else{
                //console.log("attempting pass")
                RECORD_LIKERT_ANSWER(obj, -1);
                RESET_GAMEBOARD();
                EXPT_INSTR_APPEAR();
                obj.next();
            }
        }
        else{
            if (trialStrategy != "do"){
                RECORD_LIKERT_ANSWER(obj, click);
            }
        RESET_GAMEBOARD();
        EXPT_INSTR_APPEAR();
        obj.next()
        }
    }
}
/*
function SUBMIT_DEBRIEFING_Q() {
    var serious = $("input[name='serious']:checked").val();
    var strategy = $("#strategy").val();
    var problems = $("#problems").val();
    var rating = $("input[name='rating']:checked").val();
    // var motivation = $("input[name='motivation']:checked").val();
    if (serious == undefined || strategy == "" || problems == "" || rating === undefined)
    //if (serious == undefined || strategy == "" || problems == "" || rating === undefined || motivation === undefined)
        alert("Please finish all the questions. Thank you!")
    else {
        // RECORD_DEBRIEFING_ANSWERS(serious, strategy, problems, rating, motivation);
        RECORD_DEBRIEFING_ANSWERS(serious, strategy, problems, rating);
        subj.submitQ();
        $("#uidText").html("You have earned " + expt.totalScore.toFixed(2) + " in total. Please put down both your UID and email address if you'd like to receive the money bonus.")
        $("#questionsBox").hide();
        // $("#uidPage").show();
        NEXT_INSTR();
        $("#lastPage").show();
    }
}
*/


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

// function TRY_MOVE() {
//     tryMove.isTryMove = true;
//     tryMove.signalerMoved = false;
//     tryMove.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 7);
//     tryMove.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 0);
//     if(!tryMove.reached)
//         $("#instrNextBut").hide();
//     CREATE_EXPT_BUTTONS(tryMove);

//     tryMove.gridArray = [
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,PIC_DICT["red circle"],],
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,,],
//             [,,,,,,,,]
//         ];
//     tryMove.barrierInput = {
//         "up": "(3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2)",
//         "down": "(3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3)",
//         "left": "",
//         "right": ""
//     }
//  //NEED TO, IN THIS PROCESS, CREATE A BUTTON ON [3,7]
//     var item = tryMove.gridArray[3,7];
//     shapeId = "shape3v7"
//     $("#" + shapeId).append($("<img>", {class: "shape", src: PIC_DICT[item]}));
//     //var receiverDist = tryMove.receiverPath[item].length;
//     //var signalerDist = tryMove.signalerPath[item].length;
//     ADD_HOVER_INFO("#" + shapeId, 4, 13);
//     $("#"+shapeId).click(function(){
//         $("#"+shapeId).css("pointer-events","none");
//         //console.log(row_save);
//         RECEIVER_AUTO_MOVE(tryMove);
//         $("#"+shapeId).css("pointer-events","auto");
//     });
//     $("#"+shapeId).css("pointer-events","auto");
//     $("#"+shapeId).css("cursor","pointer");
// //THIS CURRENTLY DOES NOT WORK ^


//     tryMove.step = 0;
//     SET_BARRIER(tryMove);
//     tryMove.goalCoord=[3,7];
//     TRY_GRID_SETUP(tryMove);
//     SETUP_SCOREBOARD(tryMove);
//     TRY_MOVE_GAMEBOARD_SETUP();
//     tryMove.move();
// }

// function TRY_SAY(){
//     trySay.isTrySay = true;
//     trySay.receiverMoved = false;
//     trySay.receiverLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 7);
//     trySay.signalerLocation = CONVERT_CSV_COORD_TO_ARRAY_COORD(4, 0);
//     if(!trySay.reached)
//         $("#instrNextBut").hide();
//     CREATE_EXPT_BUTTONS(trySay);

//     trySay.gridArray = [
//         [,,,,,,,,],
//         [,,,,,,,,],
//         [,,,,,,,,],
//         [,,,,,,,PIC_DICT["red circle"],],
//         [,,,,,,,,],
//         [,,,,,,,,],
//         [,,,,,,,,],
//         [,,,,,,,,],
//         [,,,,,PIC_DICT["green circle"],,,],
//         [,,,,,,,,]
//     ];
//     trySay.barrierInput = {
//         "up": "(3, 5), (4, 5), (5, 5), (6, 5), (7, 5), (8, 5)",
//         "down": "(3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6)",
//         "left": "",
//         "right": ""
//     }
//     trySay.receiverPath = {
//         "red": ["right","right","right","down"],
//         "green": ["left","left", "down","down","down","down","down","down", "right", "right", "right"],
//         "circle": ["right","right","right","down"]
//     };

//     SET_BARRIER(trySay);
//     trySay.step = 0;
//     trySay.goalCoord = [3,7];
//     var trySayOptions = ["red", "circle", "green"];
//     CREATE_SIGNAL_BUTTONS(trySay, trySayOptions);
//     TRY_GRID_SETUP(trySay);
//     SETUP_SCOREBOARD(trySay);
//     TRY_SAY_GAMEBOARD_SETUP();
// }



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
    sanityCheck.startTime = Date.now();
    sanityCheck.exptSignalerPath = "N/A",
    sanityCheck.exptReceiverPath = "N/A",
    sanityCheck.chosenItem = "N/A";
    sanityCheck.confidence = "N/A";
    sanityCheck.hoverItems = "N/A";

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

    // sanityCheck.inputData.push(conditionalCommunicateTrial, conditionalQuitTrial, conditionalDoTrial);
    // sanityCheck.randomizedTrialList.push("6", "7", "8");



    CREATE_RANDOM_LIST_FOR_EXPT(sanityCheck);
    TRIAL_SET_UP(sanityCheck);
    buttonDict = CREATE_GRID(sanityCheck);
    CREATE_SIGNAL_BUTTONS(sanityCheck, sanityCheck.signalSpace);


    
    
    SETUP_SCOREBOARD(sanityCheck);
    SANITY_CHECK_GAMEBOARD_SETUP();
    CREATE_EXPT_BUTTONS(sanityCheck);
    DISABLE_DEFAULT_KEYS();

    //
    //TRY_SAY_GAMEBOARD_SETUP();

    //mpotter test try say
    //TRY_SAY_GAMEBOARD_SETUP(); <-- THIS FXN WORKS, CSS WILL NEED TO BE ADJUSTED


    var randUni = Math.random();
    var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
    //
    //console.log(sanityCheck.trialIndex);
    //var signal = sanityCheck.inputData[sanityCheck.trialIndex]["predSignalNoActionUtility"];
    var signal = sanityCheck.inputData[sanityCheck.randomizedTrialList[sanityCheck.trialIndex]]["predSignalNoActionUtility"];
    //console.log(newsignal);
    //
    //console.log("prechange");
    //console.log(signal);
    //console.log(sanityCheck.inputData[sanityCheck.randomizedTrialList[sanityCheck.trialIndex]]);
    //var signal = "red";
    var waitoutTime = SIMULATED_SIGNALER_DECISION_TIME*1000;
    setTimeout(CHANGE_INSTRUCTION, waitoutTime + randExpo * 300, signal);
    if(signal == "do"){
        setTimeout(SIGNALER_WALK_TWO,waitoutTime + randExpo*300,sanityCheck);
        RECORD_SIMULATED_SIG_DECISION_TIME(sanityCheck, (waitoutTime + randExpo*300)/1000);
    }
    else{
        setTimeout(ENABLE_GRID_BUTTONS,waitoutTime + randExpo*400,buttonDict);
        RECORD_SIMULATED_SIG_DECISION_TIME(sanityCheck, (waitoutTime + randExpo*400)/1000);
        setTimeout(setResponseConstraint, waitoutTime + randExpo*400,this);
    }


    //NEED TO DISABLE BUTTONS BEFORE THIS IS CALLED ^ --> RE-ENABLE AFTER THIS IS CALLED
    //setTimeout(RECEIVER_WALK_AFTER_WAIT, randExpo * 1000, obj, signal);
    sanityCheck.move();
}

function CHANGE_INSTRUCTION(signal){
    //console.log(signal);
    //console.log("changing");
    var signalString = signal.charAt(0).toUpperCase() + signal.slice(1);
    $("#instruction").hide();
    if(signal == "do"){
        $("#instruction_2").html( '<img class="inlineShape" src="' + SHAPE_DIR + 'signaler.png">' + ' is walking to the target.');

    }
    else{
        $("#instruction_2").html( '<img class="inlineShape" src="' + SHAPE_DIR + 'signaler.png">' + ' says: "' + signalString + '".');
    }
    $("#instruction_2").show();
}


function RESET_INSTRUCTION(){
    $("#instruction_2").hide();
    $("#instruction").show();
}

function CHANGE_INSTRUCTION_EXPT(signal){
    var signalString = signal.charAt(0).toUpperCase() + signal.slice(1);
    $("#exptInstruct1").hide();
    if(signal == "do"){
        $("#exptInstruct2").html( '<img class="inlineShape" src="' + SHAPE_DIR + 'signaler.png">' + ' is walking to the target.');

    }
    else{
        $("#exptInstruct2").html( '<img class="inlineShape" src="' + SHAPE_DIR + 'signaler.png">' + ' says: "' + signalString + '".');
    }
    $("#exptInstruct2").show();
}

function RESET_INSTRUCTION_EXPT(){
    $("#exptInstruct2").hide();
    //$("#instruction_2").html("Signaler says: Red");
    $("#exptInstruct1").show();
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
    //console.log("HERE");
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

    var randUni = Math.random();
    var randExpo = - (EXPONENTIAL_PARAMETER) * Math.log(randUni);
    var signal = expt.inputData[expt.randomizedTrialList[expt.trialIndex]]["predSignalNoActionUtility"];
    //var signal = "red";
    var waitoutTime = SIMULATED_SIGNALER_DECISION_TIME*1000;
    setTimeout(CHANGE_INSTRUCTION_EXPT, waitoutTime + randExpo * 300, signal);
    if(signal == "do"){
        setTimeout(SIGNALER_WALK_TWO,waitoutTime + randExpo*300,expt);
        RECORD_SIMULATED_SIG_DECISION_TIME(expt, (waitoutTime + randExpo*300)/1000);
    }
    else{
        setTimeout(ENABLE_GRID_BUTTONS,waitoutTime + randExpo*400,buttonDict);
        RECORD_SIMULATED_SIG_DECISION_TIME(expt, (waitoutTime + randExpo*400)/1000);
        setTimeout(setResponseConstraint, waitoutTime + randExpo*400,this);
    }


    expt.move();

    expt.startTime = Date.now();
    expt.exptSignalerPath = "N/A";
    expt.exptReceiverPath = "N/A";
    expt.chosenItem = "N/A";
    expt.confidence = "N/A";
    expt.hoverItems = "N/A";
    $("#exptPage").show();
}


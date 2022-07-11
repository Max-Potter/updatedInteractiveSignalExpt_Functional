/*
  #####  #     # ######        # #######  #####  #######
 #     # #     # #     #       # #       #     #    #
 #       #     # #     #       # #       #          #
  #####  #     # ######        # #####   #          #
       # #     # #     # #     # #       #          #
 #     # #     # #     # #     # #       #     #    #
  #####   #####  ######   #####  #######  #####     #

*/
class subjObject {
    constructor(options = {}) {
        Object.assign(this, {
            num: "pre-post",
            subjNumScript: "subjNum",
            subjNumFile: "",
            titles: [""],
            invalidIDFunc: false,
            viewportMinW: 0,
            viewportMinH: 0,
            savingScript: 'save',
            attritionFile: "attrition.txt",
            visitFile: "visit.txt",
            subjFile: "subj.txt",
            savingDir: "",
            //handleVisibilityChange: function(){},
        }, options);
        if (this.num == "pre-post") {
            this.obtainSubjNum();
        }
        this.data = LIST_TO_FORMATTED_STRING(this.titles, ";");
        this.dateObj = new Date();
        this.date = FORMAT_DATE(this.dateObj, "UTC", "-", true);
        this.startTime = FORMAT_TIME(this.dateObj, "UTC", ":", true);
        this.userAgent = window.navigator.userAgent;
        // this.hiddenCount = 0;
        // this.hiddenDurations = [];
    }

    obtainSubjNum() {
        var that = this;
        function SUBJ_NUM_UPDATE_SUCCEEDED(number) {
            that.num = number;
        }
        function SUBJ_NUM_UPDATE_FAILED() {
            that.num = -999;
        }
        POST_DATA(this.subjNumScript, {'directory_path': this.savingDir, 'file_name': this.subjNumFile}, SUBJ_NUM_UPDATE_SUCCEEDED, SUBJ_NUM_UPDATE_FAILED);
    }

    saveVisit() {
        var data = "subjNum;startDate;startTime;id;userAgent;inView;viewportW;viewportH\n";
        this.viewport = this.viewportSize;
        this.inView = this.viewport["inView"];
        this.viewportW = this.viewport["w"];
        this.viewportH = this.viewport["h"];
        var dataList = [this.num, this.date, this.startTime, this.id, this.userAgent, this.inView, this.viewportW, this.viewportH];
        data += LIST_TO_FORMATTED_STRING(dataList, ";");
        var postData = {
            "directory_path": this.savingDir,
            "file_name": this.visitFile,
            "data": data
        };
        $.ajax({
            type: "POST",
            url: this.savingScript,
            data: postData,
        });
    }

    getID(get_variable) {
        var id = GET_PARAMETERS(get_variable, null);
        var invalid_id = (id == null);
        if (!invalid_id) {
            id = id.replace(/\s+/g, '');
            invalid_id = (id == '');
        }
        if (invalid_id) {
            if (this.invalidIDFunc !== false) {
                this.invalidIDFunc();
            }
            return null;
        } else {
            return id;
        }
    }

    checkID(id) {
        var invalid_id = (id == null);
        if (!invalid_id) {
            id = id.replace(/\s+/g, '');
            invalid_id = (id == '');
        }
        if (invalid_id) {
            return null;
        } else {
            return id;
        }
    }

    get phone() { // getter runs when you ask for the property
        var md = new MobileDetect(this.userAgent);
        return md.mobile() ? true : false;
    }

    get viewportSize() {
        var w = $(window).width();
        var h = $(window).height();
        var inView = (w >= this.viewportMinW) && (h >= this.viewportMinH);
        return { "h": h, "w": w, "inView": inView };
    }

    saveAttrition() {
        var data = 'subjNum;startDate;startTime;id;userAgent;inView;viewportW;viewportH\n';
        this.viewport = this.viewportSize;
        this.inView = this.viewport['inView'];
        this.viewportW = this.viewport['w'];
        this.viewportH = this.viewport['h'];
        var dataList = [this.num, this.date, this.startTime, this.id, this.userAgent, this.inView, this.viewportW, this.viewportH];
        data += LIST_TO_FORMATTED_STRING(dataList, ";");
        var postData = {
            'directory_path': this.savingDir,
            'file_name': this.attritionFile,
            'data': data
        };
        $.ajax({
            type: 'POST',
            url: this.savingScript,
            data: postData,
        });
    }

    submitQ() {
        var endTimeObj = new Date();
        this.endTime = FORMAT_TIME(endTimeObj, 'UTC', ':', true);
        this.duration = (endTimeObj - this.dateObj) / 60000; // in minutes
        var dataList = [this.num, this.date, this.startTime, this.id, this.endTime, this.duration, this.qAttemptN,
            this.serious, this.strategy, this.problems, this.rating,
            //this.motivation,
            this.inView, this.viewportW, this.viewportH];
        this.data += LIST_TO_FORMATTED_STRING(dataList);
        var postData = {
            'directory_path': this.savingDir,
            'file_name': this.subjFile,
            'data': this.data
        };
        $.ajax({
            type: 'POST',
            url: this.savingScript,
            data: postData,
        });
    }

    // detectVisibilityStart() {
    //     var that = this;
    //     document.addEventListener('visibilitychange', that.handleVisibilityChange);
    // }

    // detectVisibilityEnd() {
    //     var that = this;
    //     document.removeEventListener('visibilitychange', that.handleVisibilityChange);
    // }
}

const SUBJ_TITLES = ['subjNum',
                     'startDate',
                     'startTime',
                     'id',
                     'endTime',
                     'duration',
                     "instrQAttemptN",
                     "serious",
                     "strategy",
                     "problems",
                     "rating",
                    //"motivation",
                    //  'instrReadingTimes',
                    //  'quickReadingPageN',
                    //  'hiddenCount',
                    //  'hiddenDurations',
                     'inView',
                     'viewportW',
                     'viewportH'
                    ];

function GET_PARAMETERS(var_name, default_value) {
    const REGEX_STRING = "[\?&]" + var_name + "=([^&#]*)";
    const REGEX = new RegExp(REGEX_STRING);
    const URL = location.href;
    const RESULTS = REGEX.exec(URL);
    if (RESULTS == null) {
        return default_value;
    } else {
        return RESULTS[1];
    }
}

function INVALID_ID_FUNC() {
    $("#instrText").html("We can't identify a valid code from subject pool website. Please reopen the study from the subject pool website again. Thank you!");
    $("#instrBut").hide();
    $("#instrPage").show();
}

// function HANDLE_VISIBILITY_CHANGE() {
//     if (document.hidden) {
//         subj.hiddenCount += 1;
//         subj.hiddenStartTime = Date.now();
//     } else  {
//         subj.hiddenDurations.push((Date.now() - subj.hiddenStartTime)/1000);
//     }
// }

var subj_options = {
    subjNumFile: SUBJ_NUM_FILE,
    titles: SUBJ_TITLES,
    invalidIDFunc: INVALID_ID_FUNC,
    viewportMinW: VIEWPORT_MIN_W,
    viewportMinH: VIEWPORT_MIN_H,
    savingScript: SAVING_SCRIPT,
    visitFile: VISIT_FILE,
    attritionFile: ATTRITION_FILE,
    subjFile: SUBJ_FILE,
    savingDir: SAVING_DIR,
    //handleVisibilityChange: HANDLE_VISIBILITY_CHANGE
};
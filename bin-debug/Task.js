var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["UNACCEPTABLE"] = 0] = "UNACCEPTABLE";
    TaskStatus[TaskStatus["ACCEPTABLE"] = 1] = "ACCEPTABLE";
    TaskStatus[TaskStatus["DURING"] = 2] = "DURING";
    TaskStatus[TaskStatus["CAN_SUBMIT"] = 3] = "CAN_SUBMIT";
    TaskStatus[TaskStatus["SUBMITTED"] = 4] = "SUBMITTED";
})(TaskStatus || (TaskStatus = {}));
var EventEmitter = (function () {
    function EventEmitter() {
        this.observerList = [];
    }
    var d = __define,c=EventEmitter,p=c.prototype;
    p.addObserver = function (o) {
        this.observerList.push(o);
    };
    p.notify = function (task) {
        for (var _i = 0, _a = this.observerList; _i < _a.length; _i++) {
            var observer = _a[_i];
            observer.onChange(task);
        }
    };
    return EventEmitter;
}());
egret.registerClass(EventEmitter,'EventEmitter');
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(id, name, desc, total, status, taskcondition, conditiontype, fromNpcId, toNpcId, preTaskListId, rewardEquipmentId) {
        _super.call(this);
        this.current = 0;
        this.total = 100;
        this.preTaskListId = [];
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.status = status;
        this.total = total;
        this.taskCondition = taskcondition;
        this.fromNpcId = fromNpcId;
        this.toNpcId = toNpcId;
        this.conditionType = conditiontype;
        this.preTaskListId = preTaskListId;
        this.addObserver(TaskService.getInstance());
        this.rewardEquipmentId = rewardEquipmentId;
    }
    var d = __define,c=Task,p=c.prototype;
    p.setMain = function (main) {
        this._tmain = main;
    };
    p.getCurrent = function () {
        return this.current;
    };
    p.setCurrent = function (n) {
        this.current += n;
        this.checkStatus();
    };
    p.checkStatus = function () {
        if (this.current >= this.total) {
            TaskService.getInstance().canFinish(this.id);
            this.notify(this);
        }
    };
    p.onChange = function (task) {
        if (this.id == task.id) {
            this.updateProccess(1);
        }
    };
    p.canAccept = function () {
        if (this.status == TaskStatus.UNACCEPTABLE) {
            this.status = TaskStatus.ACCEPTABLE;
            this.notify(this);
        }
    };
    ;
    p.accept = function () {
        if (this.status == TaskStatus.ACCEPTABLE) {
            this.status = TaskStatus.DURING;
            this.notify(this);
        }
    };
    ;
    p.submit = function () {
        if (this.status == TaskStatus.CAN_SUBMIT) {
            this.status = TaskStatus.SUBMITTED;
            this._tmain.HeroEquipWeapon(this.rewardEquipmentId);
            this.notify(this);
        }
    };
    ;
    p.updateProccess = function (n) {
        if (this.status == TaskStatus.DURING) {
            this.taskCondition.updateProccess(this, n);
        }
    };
    return Task;
}(EventEmitter));
egret.registerClass(Task,'Task',["TaskConditionContext","Observer"]);
var NPCTalkTaskCondition = (function () {
    function NPCTalkTaskCondition() {
    }
    var d = __define,c=NPCTalkTaskCondition,p=c.prototype;
    p.canAccept = function (task) { };
    p.onSubmit = function (task) { };
    p.getCondition = function () {
        return this;
    };
    p.updateProccess = function (task, num) {
        task.setCurrent(num);
    };
    return NPCTalkTaskCondition;
}());
egret.registerClass(NPCTalkTaskCondition,'NPCTalkTaskCondition',["TaskCondition"]);
var KillMonsterTaskCondition = (function () {
    function KillMonsterTaskCondition() {
        this.MonsterList = {};
    }
    var d = __define,c=KillMonsterTaskCondition,p=c.prototype;
    p.onAccept = function (task) { };
    p.onSubmit = function (task) { };
    p.getCondition = function () {
        return this;
    };
    p.updateProccess = function (task, num) {
        task.setCurrent(num);
    };
    return KillMonsterTaskCondition;
}());
egret.registerClass(KillMonsterTaskCondition,'KillMonsterTaskCondition',["TaskCondition"]);
var TaskService = (function (_super) {
    __extends(TaskService, _super);
    function TaskService() {
        _super.apply(this, arguments);
        this.taskList = {};
    }
    var d = __define,c=TaskService,p=c.prototype;
    TaskService.getInstance = function () {
        if (TaskService.instance == null) {
            TaskService.instance = new TaskService();
        }
        return TaskService.instance;
    };
    p.addTask = function (task) {
        this.taskList[task.id] = task;
    };
    p.getTaskByCustomRule = function (rule) {
        return rule(this.taskList);
    };
    p.finish = function (id) {
        if (this.taskList[id].status == TaskStatus.CAN_SUBMIT) {
            this.taskList[id].status = TaskStatus.SUBMITTED;
        }
        this.notify(this.taskList[id]);
    };
    p.accept = function (id) {
        if (this.taskList[id].status == TaskStatus.ACCEPTABLE) {
            this.taskList[id].status = TaskStatus.DURING;
        }
        this.notify(this.taskList[id]);
    };
    p.canAccept = function (id) {
        if (this.taskList[id].status == TaskStatus.UNACCEPTABLE) {
            this.taskList[id].status = TaskStatus.ACCEPTABLE;
        }
        this.notify(this.taskList[id]);
    };
    p.canFinish = function (id) {
        if (this.taskList[id].status == TaskStatus.DURING) {
            this.taskList[id].status = TaskStatus.CAN_SUBMIT;
        }
        this.notify(this.taskList[id]);
    };
    p.onChange = function (task) {
        this.taskList[task.id] = task;
        this.notify(this.taskList[task.id]);
        for (var taskId in this.taskList) {
            if (this.taskList[taskId].status == TaskStatus.UNACCEPTABLE) {
                var canAccept = true;
                for (var _i = 0, _a = this.taskList[taskId].preTaskListId; _i < _a.length; _i++) {
                    var preId = _a[_i];
                    if (preId != "null") {
                        if (this.taskList[preId].status != TaskStatus.SUBMITTED) {
                            canAccept = false;
                            break;
                        }
                    }
                }
                if (canAccept) {
                    this.canAccept(taskId);
                }
            }
        }
    };
    return TaskService;
}(EventEmitter));
egret.registerClass(TaskService,'TaskService',["Observer"]);
function creatTaskCondition(id) {
    var data = {
        "npctalk": { condition: new NPCTalkTaskCondition() },
        "killmonster": { condition: new KillMonsterTaskCondition() }
    };
    var info = data[id];
    if (!info) {
        console.error('missing task');
    }
    return info.condition;
}
function creatTask(id) {
    var data = {
        "task_00": { name: "任务01", desc: "点击NPC01,在NPC02交任务", total: 1, status: TaskStatus.ACCEPTABLE, condition: "npctalk", fromNpcId: "npc_0", toNpcId: "npc_1", preTaskListId: ["null"], rewardEquipmentId: "W001" },
        "task_01": { name: "任务02", desc: "点击NPC02,杀死一只史莱姆后点NPC02交任务", total: 1, status: TaskStatus.UNACCEPTABLE, condition: "killmonster", fromNpcId: "npc_1", toNpcId: "npc_1", preTaskListId: ["task_00"], rewardEquipmentId: "W002" },
    };
    var info = data[id];
    if (!info) {
        console.error('missing task');
    }
    var condition = this.creatTaskCondition(info.condition);
    return new Task(id, info.name, info.desc, info.total, info.status, condition, info.condition, info.fromNpcId, info.toNpcId, info.preTaskListId, info.rewardEquipmentId);
}
var TaskPanel = (function (_super) {
    __extends(TaskPanel, _super);
    function TaskPanel() {
        var _this = this;
        _super.call(this);
        this.show = [];
        this.taskList = [];
        this.width = 256;
        this.height = 317;
        this.background = this.createBitmapByName("Informationbg1_png");
        this.addChild(this.background);
        this.background.width = 256;
        this.background.height = 317;
        this.background.x = 0;
        this.background.y = 640;
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.x = this.width / 2 - 100;
        this.textField.y = this.height / 2;
        this.textField.size = 20;
        this.textField.textColor = 0x000000;
        this.addChild(this.textField);
        this.textField.width = 200;
        this.textField.x = 30;
        this.textField.y = 720;
        this.alpha = 0;
        var rule = function (taskList) {
            for (var taskId in taskList) {
                _this.taskList.push(taskList[taskId]);
            }
        };
        TaskService.getInstance().getTaskByCustomRule(rule);
    }
    var d = __define,c=TaskPanel,p=c.prototype;
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    p.onChange = function (task) {
        var _this = this;
        var i = 0;
        var rule = function (taskList) {
            for (var taskId in taskList) {
                _this.taskList[i] = taskList[taskId];
                i++;
            }
        };
        TaskService.getInstance().getTaskByCustomRule(rule);
        for (var i = 0; i < this.taskList.length; i++) {
            if (this.taskList[i].id == task.id) {
                egret.Tween.get(this).to({ alpha: 1 }, 500);
                var statusText = "";
                switch (this.taskList[i].status) {
                    case TaskStatus.UNACCEPTABLE:
                        statusText = "不可接";
                        break;
                    case TaskStatus.ACCEPTABLE:
                        statusText = "可接";
                        break;
                    case TaskStatus.DURING:
                        statusText = "进行中";
                        break;
                    case TaskStatus.CAN_SUBMIT:
                        statusText = "可交付";
                        break;
                    case TaskStatus.SUBMITTED:
                        statusText = "已完成";
                        break;
                }
                this.show[i] = "任务名 ：" + this.taskList[i].name + " :\n " + "任务内容：" + this.taskList[i].desc + " :\n " + " 任务状态 ： " + statusText;
                this.duringTaskId = this.taskList[i].id;
                this.textField.text = "";
                for (var i = 0; i < this.show.length; i++) {
                    if (this.taskList[i].status == TaskStatus.DURING || this.taskList[i].status == TaskStatus.CAN_SUBMIT || this.taskList[i].status == TaskStatus.ACCEPTABLE)
                        this.textField.text += this.show[i] + "\n";
                }
                this.alpha = 1;
                break;
            }
        }
    };
    return TaskPanel;
}(egret.DisplayObjectContainer));
egret.registerClass(TaskPanel,'TaskPanel',["Observer"]);
//# sourceMappingURL=Task.js.map
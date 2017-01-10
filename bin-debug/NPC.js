var NPC = (function (_super) {
    __extends(NPC, _super);
    function NPC(npcId, npcCode, dialogue) {
        var _this = this;
        _super.call(this);
        this.dialogue = [];
        this.taskAcceptDialogue = [];
        this.taskSubmitDialogue = [];
        this.taskList = {};
        this.canAcceptTaskList = {};
        this.canSumbitTaskList = {};
        for (var i = 0; i < dialogue.length; i++) {
            this.dialogue[i] = dialogue[i];
        }
        this.NPCId = npcId;
        this.width = 64;
        this.height = 64;
        this.NPCBitmap = this.createBitmapByName(npcCode);
        this.addChild(this.NPCBitmap);
        this.NPCBitmap.x = 0;
        this.NPCBitmap.y = 0;
        this.NPCBitmap.touchEnabled = true;
        this.touchEnabled = true;
        this.NPCBitmap.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            NPC.npcIsChoose = _this;
        }, this);
        this.emoji = new egret.Bitmap();
        var rule = function (taskList) {
            for (var taskId in taskList) {
                if (taskList[taskId].fromNpcId == _this.NPCId || taskList[taskId].toNpcId == _this.NPCId) {
                    _this.taskList[taskId] = taskList[taskId];
                }
                if (taskList[taskId].fromNpcId == _this.NPCId) {
                    _this.canAcceptTaskList[taskId] = taskList[taskId];
                }
                if (taskList[taskId].toNpcId == _this.NPCId) {
                    _this.canSumbitTaskList[taskId] = taskList[taskId];
                }
                if (taskList[taskId].fromNpcId == _this.NPCId && taskList[taskId].status == TaskStatus.ACCEPTABLE) {
                    var texture = RES.getRes("isaccept_png");
                    _this.emoji.texture = texture;
                    _this.taskList[taskId] = taskList[taskId];
                }
                if (_this.NPCId == taskList[taskId].toNpcId && taskList[taskId].status == TaskStatus.CAN_SUBMIT) {
                    var texture = RES.getRes("canputin_png");
                    _this.emoji.texture = texture;
                    _this.taskList[taskId] = taskList[taskId];
                }
            }
        };
        TaskService.getInstance().getTaskByCustomRule(rule);
        this.addChild(this.emoji);
        this.emoji.x = 20;
        this.emoji.y = -20;
    }
    var d = __define,c=NPC,p=c.prototype;
    p.setTaskAcceptDialogue = function (acceptDialogue) {
        this.taskAcceptDialogue = acceptDialogue;
    };
    p.setTaskSubmitDialogue = function (submitDialogue) {
        this.taskSubmitDialogue = submitDialogue;
    };
    p.onChange = function (task) {
        if (this.NPCId == task.fromNpcId && task.status == TaskStatus.ACCEPTABLE) {
            this.emoji.alpha = 1;
            var texture = RES.getRes("isaccept_png");
            this.emoji.texture = texture;
            this.taskList[task.id].status = TaskStatus.ACCEPTABLE;
            return;
        }
        if (this.NPCId == task.toNpcId && task.status == TaskStatus.CAN_SUBMIT) {
            this.emoji.alpha = 1;
            var texture = RES.getRes("canputin_png");
            this.emoji.texture = texture;
            this.taskList[task.id].status = TaskStatus.CAN_SUBMIT;
            this.canSumbitTaskList[task.id] = task;
            return;
        }
        if (this.NPCId == task.fromNpcId && task.status != TaskStatus.ACCEPTABLE && task.status != TaskStatus.SUBMITTED) {
            this.emoji.alpha = 0;
            this.taskList[task.id].status = task.status;
            for (var taskId in this.canSumbitTaskList) {
                if (this.NPCId == this.canSumbitTaskList[taskId].toNpcId
                    && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT) {
                    this.emoji.alpha = 1;
                    var texture = RES.getRes("canputin_png");
                    this.emoji.texture = texture;
                    return;
                }
            }
            for (var taskId in this.taskList) {
                if (this.NPCId == this.taskList[taskId].fromNpcId
                    && this.taskList[taskId].status == TaskStatus.ACCEPTABLE) {
                    this.emoji.alpha = 1;
                    var texture = RES.getRes("isaccept_png");
                    this.emoji.texture = texture;
                    return;
                }
            }
            return;
        }
        if (this.NPCId == task.toNpcId && task.status != TaskStatus.CAN_SUBMIT) {
            this.emoji.alpha = 0;
            this.taskList[task.id].status = task.status;
            for (var taskId in this.canSumbitTaskList) {
                if (this.NPCId == this.canSumbitTaskList[taskId].toNpcId
                    && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT) {
                    this.emoji.alpha = 1;
                    var texture = RES.getRes("canputin_png");
                    this.emoji.texture = texture;
                    return;
                }
            }
            for (var taskId in this.taskList) {
                if (this.NPCId == this.taskList[taskId].fromNpcId
                    && this.taskList[taskId].status == TaskStatus.ACCEPTABLE) {
                    this.emoji.alpha = 1;
                    var texture = RES.getRes("isaccept_png");
                    this.emoji.texture = texture;
                    return;
                }
            }
            return;
        }
    };
    p.onNPCClick = function () {
        var x = 0;
        for (var taskId in this.canSumbitTaskList) {
            if (this.NPCId == this.canSumbitTaskList[taskId].toNpcId && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT) {
                DialoguePanel.getInstance().alpha = 0.8;
                DialoguePanel.getInstance().buttonTouchEnable(true);
                DialoguePanel.getInstance().setButtonBitmap("Canfinish_png");
                DialoguePanel.getInstance().setIfAccept(false);
                DialoguePanel.getInstance().setDuringTask(this.canSumbitTaskList[taskId]);
                DialoguePanel.getInstance().setDialogueText(this.taskSubmitDialogue);
                DialoguePanel.getInstance().setBackgroundBitmap("duihuakuang_png");
                TaskService.getInstance().canFinish(taskId);
                return;
            }
        }
        for (var taskId in this.taskList) {
            if (this.NPCId == this.taskList[taskId].fromNpcId && this.taskList[taskId].status == TaskStatus.ACCEPTABLE) {
                DialoguePanel.getInstance().alpha = 0.8;
                DialoguePanel.getInstance().buttonTouchEnable(true);
                DialoguePanel.getInstance().setButtonBitmap("Canaccept_png");
                DialoguePanel.getInstance().setIfAccept(true);
                DialoguePanel.getInstance().setDuringTask(this.taskList[taskId]);
                DialoguePanel.getInstance().setDialogueText(this.taskAcceptDialogue);
                DialoguePanel.getInstance().setBackgroundBitmap("duihuakuang_png");
                x++;
                break;
            }
            if (this.NPCId == this.taskList[taskId].toNpcId && this.taskList[taskId].status == TaskStatus.CAN_SUBMIT) {
                DialoguePanel.getInstance().alpha = 0.8;
                DialoguePanel.getInstance().buttonTouchEnable(true);
                DialoguePanel.getInstance().setButtonBitmap("Canfinish_png");
                DialoguePanel.getInstance().setIfAccept(false);
                DialoguePanel.getInstance().setDuringTask(this.taskList[taskId]);
                DialoguePanel.getInstance().setDialogueText(this.taskSubmitDialogue);
                DialoguePanel.getInstance().setBackgroundBitmap("duihuakuang_png");
                x++;
                break;
            }
        }
        if (x <= 0)
            TalkCommand.canFinish = true;
    };
    p.getNPC = function () {
        var _this = this;
        this.NPCBitmap.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            NPC.npcIsChoose = _this;
        }, this);
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return NPC;
}(egret.DisplayObjectContainer));
egret.registerClass(NPC,'NPC',["Observer"]);
var DialoguePanel = (function (_super) {
    __extends(DialoguePanel, _super);
    function DialoguePanel() {
        _super.call(this);
        this.dialogue = [];
        this.ifAccept = false;
        this.width = 300;
        this.height = 200;
        this.background = this.createBitmapByName("duihuakuang_png");
        this.addChild(this.background);
        this.background.x = 0;
        this.background.y = 0;
        this.background.width = 300;
        this.background.height = 200;
        this.button = this.createBitmapByName("cannotaccept_png");
        this.addChild(this.button);
        this.button.width = 100;
        this.height = 50;
        this.button.x = 100;
        this.button.y = 135;
        this.button.touchEnabled = false;
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.width = 200;
        this.textField.x = 40;
        this.textField.y = 40;
        this.textField.size = 20;
        this.textField.textColor = 0xffffff;
        this.onClick();
    }
    var d = __define,c=DialoguePanel,p=c.prototype;
    DialoguePanel.getInstance = function () {
        if (DialoguePanel.instance == null) {
            DialoguePanel.instance = new DialoguePanel();
        }
        return DialoguePanel.instance;
    };
    p.SetMain = function (main) {
        this._tmain = main;
    };
    p.setButtonBitmap = function (buttonBitmapCode) {
        var texture = RES.getRes(buttonBitmapCode);
        this.button.texture = texture;
    };
    p.setDuringTaskCondition = function (taskCondition) {
        this.duringTaskCondition = taskCondition;
    };
    p.setDialogueText = function (dialogue) {
        this.dialogue = [];
        for (var i = 0; i < dialogue.length; i++) {
            this.dialogue[i] = dialogue[i];
        }
        for (var j = 0; j < this.dialogue.length; j++) {
            this.textField.text = this.dialogue[j] + "\n";
        }
    };
    p.setIfAccept = function (b) {
        this.ifAccept = b;
    };
    p.buttonTouchEnable = function (b) {
        this.button.touchEnabled = b;
    };
    p.setDuringTask = function (task) {
        this.duringTask = task;
    };
    p.setDuringTaskConditionType = function (taskConditionType) {
        this.duringTaskConditionType = taskConditionType;
    };
    p.setBackgroundBitmap = function (backgroundCode) {
        var textureBackground = RES.getRes("duihuakuang_png");
        this.background.texture = textureBackground;
    };
    p.onClick = function () {
        var _this = this;
        this.button.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            console.log("dialogue on click");
            if (_this.ifAccept) {
                _this.duringTask.accept();
                var texture = RES.getRes("Unfinished_png");
                _this.button.texture = texture;
                if (_this.duringTask.conditionType == "npctalk") {
                    _this.duringTask.updateProccess(1);
                }
                egret.Tween.get(_this).to({ alpha: 0 }, 1000);
                TalkCommand.canFinish = true;
            }
            if (!_this.ifAccept) {
                _this.duringTask.submit();
                var texture = RES.getRes("cannotaccept_png");
                _this.button.texture = texture;
                egret.Tween.get(_this).to({ alpha: 0 }, 1000);
                TalkCommand.canFinish = true;
            }
        }, this);
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    DialoguePanel.instance = new DialoguePanel();
    return DialoguePanel;
}(egret.DisplayObjectContainer));
egret.registerClass(DialoguePanel,'DialoguePanel');
//# sourceMappingURL=NPC.js.map
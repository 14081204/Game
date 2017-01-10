var ScreenService = (function (_super) {
    __extends(ScreenService, _super);
    function ScreenService() {
        var _this = this;
        _super.call(this);
        this.taskList = {};
        var rule = function (taskList) {
            for (var taskId in taskList) {
                if (taskList[taskId].conditionType == "killmonster") {
                    _this.taskList[taskId] = taskList[taskId];
                    _this.addObserver(taskList[taskId]);
                }
            }
        };
        TaskService.getInstance().getTaskByCustomRule(rule);
    }
    var d = __define,c=ScreenService,p=c.prototype;
    p.monsterBeenKilled = function (taskId) {
        this.notify(this.taskList[taskId]);
    };
    return ScreenService;
}(EventEmitter));
egret.registerClass(ScreenService,'ScreenService');
//# sourceMappingURL=ScreenService.js.map
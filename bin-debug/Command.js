var WalkCommand = (function () {
    function WalkCommand(_tmain) {
        this._tmain = _tmain;
        WalkCommand.canFinish = false;
    }
    var d = __define,c=WalkCommand,p=c.prototype;
    p.execute = function (callback) {
        var _this = this;
        if (this._tmain.ifFindAWay) {
            this._tmain.Player.SetState(new WalkingState(), this._tmain);
            this._tmain.ifStartMove = true;
            egret.Ticker.getInstance().register(function () {
                if (_this._tmain.ifStartMove == false && WalkCommand.canFinish) {
                    callback();
                    WalkCommand.canFinish = false;
                }
            }, this);
        }
    };
    p.cancel = function (callback) {
        callback();
    };
    WalkCommand.canFinish = false;
    return WalkCommand;
}());
egret.registerClass(WalkCommand,'WalkCommand',["Command"]);
var FightCommand = (function () {
    function FightCommand(player, main, monster, damage) {
        this._hasBeenCancelled = false;
        this.player = player;
        this._tmain = main;
        this.target = monster;
        this.damage = damage;
    }
    var d = __define,c=FightCommand,p=c.prototype;
    p.execute = function (callback) {
        var _this = this;
        console.log("开始战斗");
        this.player.SetState(new FightState(), this._tmain);
        egret.setTimeout(function () {
            if (!_this._hasBeenCancelled) {
                console.log("结束战斗");
                _this.target.BeenAttacked(_this.damage);
                _this.player.SetState(new IdleState(), _this._tmain);
                if (_this._tmain.monsterAttacking.getMonsterState() == MonsterState.DEAD) {
                    _this._tmain.screenService.monsterBeenKilled("task_01");
                    _this._tmain.removeChild(_this._tmain.monsterAttacking);
                }
                callback();
            }
        }, this, 500);
    };
    p.cancel = function (callback) {
        console.log("脱离战斗");
        this._hasBeenCancelled = true;
        egret.setTimeout(function () {
            this.player.SetState(new IdleState(), this._tmain);
            callback();
        }, this, 100);
    };
    return FightCommand;
}());
egret.registerClass(FightCommand,'FightCommand',["Command"]);
var TalkCommand = (function () {
    function TalkCommand(_tmain, npc) {
        this._tmain = _tmain;
        TalkCommand.canFinish = false;
        this.NPCToTalk = npc;
    }
    var d = __define,c=TalkCommand,p=c.prototype;
    p.execute = function (callback) {
        var _this = this;
        TalkCommand.canFinish = false;
        this.NPCToTalk.onNPCClick();
        this._tmain.canMove = false;
        egret.Ticker.getInstance().register(function () {
            if (TalkCommand.canFinish) {
                TalkCommand.canFinish = false;
                NPC.npcIsChoose = null;
                _this._tmain.canMove = true;
                callback();
            }
        }, this);
    };
    p.cancel = function (callback) {
        this._tmain.canMove = true;
        callback();
    };
    TalkCommand.canFinish = false;
    return TalkCommand;
}());
egret.registerClass(TalkCommand,'TalkCommand',["Command"]);
var CommandList = (function () {
    function CommandList() {
        this._list = [];
        this._frozen = false;
    }
    var d = __define,c=CommandList,p=c.prototype;
    p.addCommand = function (command) {
        this._list.push(command);
    };
    p.cancel = function () {
        var _this = this;
        this._frozen = true;
        var command = this.currentCommand;
        if (command) {
            command.cancel(function () {
                _this._frozen = false;
            });
            this._list = [];
        }
    };
    p.execute = function () {
        var _this = this;
        if (this._frozen) {
            egret.setTimeout(this.execute, this, 100);
            return;
        }
        var command = this._list.shift();
        this.currentCommand = command;
        if (command) {
            console.log("执行下一命令", command);
            command.execute(function () {
                _this.execute();
            });
        }
        else {
            console.log("全部命令执行完毕");
        }
    };
    return CommandList;
}());
egret.registerClass(CommandList,'CommandList');
//# sourceMappingURL=Command.js.map
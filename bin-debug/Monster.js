var MonsterState;
(function (MonsterState) {
    MonsterState[MonsterState["LIVE"] = 0] = "LIVE";
    MonsterState[MonsterState["DEAD"] = 1] = "DEAD";
})(MonsterState || (MonsterState = {}));
var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster(id, name, pictureId, maxHP, x, y) {
        _super.call(this);
        this.width = 64;
        this.height = 64;
        this.monsterPicture = new egret.Bitmap();
        this.monsterPicture.texture = RES.getRes(pictureId);
        this.addChild(this.monsterPicture);
        this.monsterPicture.x = 0;
        this.monsterPicture.y = 0;
        this.name = name;
        this.monsterID = id;
        this.monsterPictureId = pictureId;
        this.maxHP = maxHP;
        this.currentHP = maxHP;
        this.state = MonsterState.LIVE;
        this.posX = x;
        this.posY = y;
    }
    var d = __define,c=Monster,p=c.prototype;
    p.BeenAttacked = function (damage) {
        this.currentHP -= damage;
        this.checkState();
    };
    p.checkState = function () {
        if (this.currentHP <= 0) {
            this.state = MonsterState.DEAD;
        }
    };
    p.getMonsterState = function () {
        return this.state;
    };
    return Monster;
}(egret.DisplayObjectContainer));
egret.registerClass(Monster,'Monster');
var MonsterService = (function () {
    function MonsterService() {
        this.monsterList = {};
    }
    var d = __define,c=MonsterService,p=c.prototype;
    MonsterService.getInstance = function () {
        if (MonsterService.instance == null) {
            MonsterService.instance = new MonsterService();
        }
        return MonsterService.instance;
    };
    p.addMonster = function (monster) {
        this.monsterList[monster.monsterID] = monster;
    };
    p.getMonster = function (id) {
        return this.monsterList[id];
    };
    return MonsterService;
}());
egret.registerClass(MonsterService,'MonsterService');
function creatMonster(id) {
    var data = {
        "slime01": { id: "slime01", name: "slime", pictureId: "monster_png", maxHP: 100, x: 64 * 7, y: 64 * 2 },
        "slime02": { id: "slime02", name: "slime", pictureId: "monster_png", maxHP: 100, x: 64 * 5, y: 64 * 7 },
    };
    var info = data[id];
    if (!info) {
        console.error('missing monster');
    }
    return new Monster(info.id, info.name, info.pictureId, info.maxHP, info.x, info.y);
}
//# sourceMappingURL=Monster.js.map
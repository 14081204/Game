//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.EventPoint = new egret.Point();
        this.IdlePictures = [
            this.createBitmapByName("stand_0001_png"), this.createBitmapByName("stand_0002_png"),
            this.createBitmapByName("stand_0003_png"), this.createBitmapByName("stand_0004_png"),
            this.createBitmapByName("stand_0005_png"), this.createBitmapByName("stand_0006_png"),
            this.createBitmapByName("stand_0007_png"), this.createBitmapByName("stand_0008_png")];
        this.WalkingRightPictures = [
            this.createBitmapByName("166-1_png"), this.createBitmapByName("166-2_png"),
            this.createBitmapByName("166-3_png"), this.createBitmapByName("166-4_png"),
            this.createBitmapByName("166-5_png"), this.createBitmapByName("166-5_png"),
            this.createBitmapByName("166-7_png"), this.createBitmapByName("166-8_png")];
        this.WalkingLeftPictures = [
            this.createBitmapByName("166-1_1_png"), this.createBitmapByName("166-2_1_png"),
            this.createBitmapByName("166-3_1_png"), this.createBitmapByName("166-4_1_png"),
            this.createBitmapByName("166-5_1_png"), this.createBitmapByName("166-5_1_png"),
            this.createBitmapByName("166-7_1_png"), this.createBitmapByName("166-8_1_png")];
        this.GoalPoint = new egret.Point();
        this.DistancePoint = new egret.Point();
        this.MoveTime = 0;
        this.tileSize = 64;
        this.ifFindAWay = false;
        this.currentPath = 0;
        this.movingTime = 32;
        this.ifOnGoal = false;
        this.ifStartMove = false;
        this.Npc01Dialogue = ["您好我是NPC01"];
        this.Npc01AcceptDialogue = ["您好，请和NPC02对话，完成以后能拿到装备"];
        this.Npc02Dialogue = ["您好我是NPC02"];
        this.Npc02AcceptDialogue = ["您好，请完成杀怪任务，完成以后能拿到传说装备"];
        this.Npc02SubmitDialogue = ["您变强了！！！可打开人物信息面板检查"];
        this.npcList = [];
        this.monsterIdList = ["slime01", "slime02"];
        this.disx = 0;
        this.disy = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var _this = this;
        this.commandList = new CommandList();
        this.canMove = true;
        this.userPanelIsOn = false;
        this.ifFight = false;
        this.Player = new Person();
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        this.map01 = new TileMap();
        this.addChild(this.map01);
        TaskService.getInstance();
        this.task01 = creatTask("task_00");
        this.task01.setMain(this);
        TaskService.getInstance().addTask(this.task01);
        this.task02 = creatTask("task_01");
        this.task02.setMain(this);
        TaskService.getInstance().addTask(this.task02);
        this.taskPanel = new TaskPanel();
        TaskService.getInstance().addObserver(this.taskPanel);
        this.addChild(this.taskPanel);
        this.taskPanel.x = this.stage.width - this.taskPanel.width;
        this.taskPanel.y = 0;
        this.NPC01 = new NPC("npc_0", "NPC03_png", this.Npc01Dialogue);
        this.NPC01.setTaskAcceptDialogue(this.Npc01AcceptDialogue);
        this.npcList.push(this.NPC01);
        this.NPC02 = new NPC("npc_1", "NPC04_png", this.Npc02Dialogue);
        this.NPC02.setTaskAcceptDialogue(this.Npc02AcceptDialogue);
        this.NPC02.setTaskSubmitDialogue(this.Npc02SubmitDialogue);
        this.npcList.push(this.NPC02);
        TaskService.getInstance().addObserver(this.NPC01);
        TaskService.getInstance().addObserver(this.NPC02);
        this.screenService = new ScreenService();
        for (var _i = 0, _a = this.monsterIdList; _i < _a.length; _i++) {
            var id = _a[_i];
            var temp = creatMonster(id);
            this.addChild(temp);
            temp.x = temp.posX;
            temp.y = temp.posY;
            MonsterService.getInstance().addMonster(temp);
        }
        this.addChild(this.NPC01);
        this.NPC01.x = 128;
        this.NPC01.y = 192;
        this.addChild(this.NPC02);
        this.NPC02.x = 0;
        this.NPC02.y = 448;
        this.dialoguePanel = DialoguePanel.getInstance();
        this.dialoguePanel.SetMain(this);
        this.addChild(this.dialoguePanel);
        this.dialoguePanel.x = 200;
        this.dialoguePanel.y = 200;
        this.userPanelButton = this.createBitmapByName("userPanelButton_png");
        this.addChild(this.userPanelButton);
        this.userPanelButton.x = 10 * 64 - this.userPanelButton.width;
        this.userPanelButton.y = 0;
        this.addChild(this.Player.PersonBitmap);
        this.Player.PersonBitmap.x = 0;
        this.Player.PersonBitmap.y = 0;
        this.map01.startTile = this.map01.getTile(0, 0);
        this.map01.endTile = this.map01.getTile(0, 0);
        this.astar = new AStar();
        this.user = new User("Player01", 1);
        this.hero = new Hero("H001", "Hero02", Quality.ORAGE, 1, "02_png", HeroType.SABER);
        this.sword = new Weapon("W001", "Weapon01", Quality.ORAGE, WeaponType.HANDSWORD, "Weapon_jpg");
        this.sword01 = new Weapon("W002", "Weapon02", Quality.ORAGE, WeaponType.HANDSWORD, "Sword_jpg");
        this.helment = new Armor("A001", "Helment01", Quality.PURPLE, ArmorType.LIGHTARMOR, "Helment_jpg");
        this.corseler = new Armor("A002", "LightArmor01", Quality.GREEN, ArmorType.LIGHTARMOR, "LightArmor_jpg");
        this.shoes = new Armor("A003", "Shoes01", Quality.BLUE, ArmorType.LIGHTARMOR, "Shoes_jpg");
        this.weaponJewel = new Jewel("J001", "传说武器宝石", Quality.ORAGE);
        this.armorJewel = new Jewel("J002", "普通防具宝石", Quality.WHITE);
        this.sword.addJewl(this.weaponJewel);
        this.helment.addJewl(this.armorJewel);
        this.corseler.addJewl(this.armorJewel);
        this.shoes.addJewl(this.armorJewel);
        this.hero.addHelment(this.helment);
        this.hero.addCorseler(this.corseler);
        this.hero.addShoes(this.shoes);
        this.user.addHeroInTeam(this.hero);
        this.user.addHeros(this.hero);
        EquipmentServer.getInstance();
        EquipmentServer.getInstance().addWeapon(this.sword);
        EquipmentServer.getInstance().addWeapon(this.sword01);
        EquipmentServer.getInstance().addArmor(this.helment);
        EquipmentServer.getInstance().addArmor(this.corseler);
        EquipmentServer.getInstance().addArmor(this.shoes);
        this.userPanel = new UserPanel();
        this.userPanel.showHeroInformation(this.hero);
        this.userPanel.x = (this.stage.width - this.userPanel.width) / 2;
        this.userPanel.y = (this.stage.height - this.userPanel.height) / 4;
        /*this.userPanel.x = 0;
        this.userPanel.y = 640;*/
        this.userPanelButton.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            _this.addChild(_this.userPanel);
            _this.userPanel.showHeroInformation(_this.hero);
        }, this);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        //RES.getResAsync("description_json", this.startAnimation, this)
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            NPC.npcIsChoose = null;
            _this.ifFight = false;
            if (_this.userPanelIsOn && (e.stageX < _this.userPanel.x || e.stageX > _this.userPanel.x + _this.userPanel.width || e.stageY < _this.userPanel.y || e.stageY > _this.userPanel.y + _this.userPanel.height)) {
                _this.removeChild(_this.userPanel);
                _this.userPanelIsOn = false;
            }
            _this.playerx = Math.floor(_this.Player.PersonBitmap.x / _this.tileSize);
            _this.playery = Math.floor(_this.Player.PersonBitmap.y / _this.tileSize);
            _this.playerBitX = _this.Player.PersonBitmap.x;
            _this.playerBitY = _this.Player.PersonBitmap.y;
            _this.map01.startTile = _this.map01.getTile(_this.playerx, _this.playery);
            _this.Player.PersonBitmap.x = _this.playerx * 64;
            _this.Player.PersonBitmap.y = _this.playery * 64;
            _this.currentPath = 0;
            _this.EventPoint.x = e.stageX;
            _this.EventPoint.y = e.stageY;
            _this.tileX = Math.floor(_this.EventPoint.x / _this.tileSize);
            _this.tileY = Math.floor(_this.EventPoint.y / _this.tileSize);
            for (var _i = 0, _a = _this.npcList; _i < _a.length; _i++) {
                var npc = _a[_i];
                if (npc.x / 64 == _this.tileX && npc.y / 64 == _this.tileY)
                    NPC.npcIsChoose = npc;
            }
            for (var _b = 0, _c = _this.monsterIdList; _b < _c.length; _b++) {
                var monsterId = _c[_b];
                var monster = MonsterService.getInstance().getMonster(monsterId);
                if (monster.x / 64 == _this.tileX && monster.y / 64 == _this.tileY) {
                    _this.ifFight = true;
                    _this.monsterAttacking = monster;
                }
            }
            _this.map01.endTile = _this.map01.getTile(_this.tileX, _this.tileY);
            _this.ifFindAWay = _this.astar.findPath(_this.map01);
            if (_this.ifFindAWay) {
                _this.currentPath = 0;
            }
            for (var i = 0; i < _this.astar.pathArray.length; i++) {
                console.log(_this.astar.pathArray[i].x + " And " + _this.astar.pathArray[i].y);
            }
            if (_this.astar.pathArray.length > 0) {
                _this.disx = Math.abs(_this.playerx * _this.tileSize - _this.Player.PersonBitmap.x);
                _this.disy = Math.abs(_this.playery * _this.tileSize - _this.Player.PersonBitmap.y);
            }
            if (_this.ifFindAWay)
                _this.map01.startTile = _this.map01.endTile;
            if (_this.EventPoint.x >= _this.userPanelButton.x && _this.EventPoint.y <= _this.userPanelButton.height) {
                _this.addChild(_this.userPanel);
                _this.userPanel.showHeroInformation(_this.hero);
                _this.userPanelIsOn = true;
            }
            if (_this.commandList._list.length > 0)
                _this.commandList.cancel();
            if (_this.canMove && !_this.userPanelIsOn)
                _this.commandList.addCommand(new WalkCommand(_this));
            if (NPC.npcIsChoose != null && !_this.userPanelIsOn)
                _this.commandList.addCommand(new TalkCommand(_this, NPC.npcIsChoose));
            if (_this.ifFight)
                _this.commandList.addCommand(new FightCommand(_this.Player, _this, _this.monsterAttacking, _this.hero.getAttack()));
            _this.commandList.execute();
        }, this);
        this.PlayerMove();
        this.PlayerAnimation();
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    p.PlayerMove = function () {
        var _this = this;
        var self = this;
        var getDistance;
        egret.Ticker.getInstance().register(function () {
            if (_this.ifStartMove && self.ifFindAWay) {
                if (self.currentPath < self.astar.pathArray.length - 1) {
                    var distanceX = self.astar.pathArray[self.currentPath + 1].x - self.astar.pathArray[self.currentPath].x;
                    var distanceY = self.astar.pathArray[self.currentPath + 1].y - self.astar.pathArray[self.currentPath].y;
                    if (distanceX < 0)
                        distanceX = distanceX - _this.disx;
                    else
                        distanceX = distanceX + _this.disx;
                    if (distanceY < 0)
                        distanceY = distanceY - _this.disy;
                    else
                        distanceY = distanceY + _this.disy;
                    if (distanceX > 0) {
                        self.Player.SetRightOrLeftState(new GoRightState(), self);
                    }
                    if (distanceX <= 0) {
                        self.Player.SetRightOrLeftState(new GoLeftState(), self);
                    }
                    if (!self.IfOnGoal(self.astar.pathArray[self.currentPath + 1])) {
                        self.Player.PersonBitmap.x += distanceX / self.movingTime;
                        self.Player.PersonBitmap.y += distanceY / self.movingTime;
                    }
                    else {
                        self.currentPath += 1;
                    }
                }
                if (self.IfOnGoal(self.map01.endTile)) {
                    self.Player.SetState(new IdleState(), self);
                    _this.ifStartMove = false;
                    WalkCommand.canFinish = true;
                    console.log("PM");
                }
            }
            if (_this.ifStartMove && !self.ifFindAWay) {
                var distanceX = self.map01.startTile.x - self.playerBitX;
                var distanceY = self.map01.startTile.y - self.playerBitY;
                if (distanceX > 0) {
                    self.Player.SetRightOrLeftState(new GoRightState(), self);
                }
                if (distanceX <= 0) {
                    self.Player.SetRightOrLeftState(new GoLeftState(), self);
                }
                if (!self.IfOnGoal(self.map01.startTile)) {
                    self.Player.PersonBitmap.x += distanceX / self.movingTime;
                    self.Player.PersonBitmap.y += distanceY / self.movingTime;
                }
                else {
                    self.Player.SetState(new IdleState(), self);
                    _this.ifStartMove = false;
                    WalkCommand.canFinish = true;
                    console.log("PM");
                }
            }
        }, self);
    };
    p.PlayerAnimation = function () {
        var self = this;
        var n = 0;
        var GOR = 0;
        var GOL = 0;
        var fight = 0;
        var zhen = 0;
        var zhen2 = 0;
        var zhen3 = 0;
        var standArr = ["1", "2", "3", "4", "5", "6", "7", "8"];
        var walkRightArr = ["1", "2", "3", "4", "5", "6", "7", "8"];
        var fightArr = ["1", "2", "3", "4", "5", "6", "7"];
        var MoveAnimation = function () {
            egret.Ticker.getInstance().register(function () {
                if (zhen % 4 == 0) {
                    if (self.Player.GetIfIdle() && !self.Player.GetIfWalk() && !self.Player.GetIfFight()) {
                        GOR = 0;
                        GOL = 0;
                        fight = 0;
                        var textureName = "stand_000" + standArr[n] + "_png";
                        var texture = RES.getRes(textureName);
                        self.Player.PersonBitmap.texture = texture;
                        n++;
                        if (n >= standArr.length) {
                            n = 0;
                        }
                    }
                    if (self.Player.GetIfWalk() && self.Player.GetIfGoRight() && !self.Player.GetIfIdle() && !self.Player.GetIfFight()) {
                        n = 0;
                        GOL = 0;
                        fight = 0;
                        var textureName = "166-" + walkRightArr[GOR] + "_png";
                        var texture = RES.getRes(textureName);
                        self.Player.PersonBitmap.texture = texture;
                        GOR++;
                        if (GOR >= walkRightArr.length) {
                            GOR = 0;
                        }
                    }
                    if (self.Player.GetIfWalk() && self.Player.GetIfGoLeft() && !self.Player.GetIfIdle() && !self.Player.GetIfFight()) {
                        n = 0;
                        GOR = 0;
                        fight = 0;
                        var textureName = "166-" + walkRightArr[GOL] + "_1_png";
                        var texture = RES.getRes(textureName);
                        self.Player.PersonBitmap.texture = texture;
                        GOL++;
                        if (GOL >= walkRightArr.length) {
                            GOL = 0;
                        }
                    }
                    if (self.Player.GetIfFight() && !self.Player.GetIfWalk() && !self.Player.GetIfIdle()) {
                        GOR = 0;
                        GOL = 0;
                        n = 0;
                        var textureName = "165-" + fightArr[fight] + "_png";
                        var texture = RES.getRes(textureName);
                        self.Player.PersonBitmap.texture = texture;
                        fight++;
                        if (fight >= fightArr.length) {
                            fight = 0;
                        }
                    }
                }
            }, self);
        };
        var FramePlus = function () {
            egret.Ticker.getInstance().register(function () {
                zhen++;
                if (zhen == 400)
                    zhen = 0;
            }, self);
        };
        MoveAnimation();
        FramePlus();
    };
    p.PictureMove = function (pic) {
        var self = this;
        var MapMove = function () {
            egret.Tween.removeTweens(pic);
            var dis = self.Player.PersonBitmap.x - self.EventPoint.x;
            if (self.Player.GetIfGoRight() && pic.x >= -(pic.width - self.stage.stageWidth)) {
                egret.Tween.get(pic).to({ x: pic.x - Math.abs(dis) }, self.MoveTime);
            }
            if (self.Player.GetIfGoLeft() && pic.x <= 0) {
                egret.Tween.get(pic).to({ x: pic.x + Math.abs(dis) }, self.MoveTime);
            }
        };
        MapMove();
    };
    p.IfOnGoal = function (tile) {
        var self = this;
        if (self.Player.PersonBitmap.x == tile.x && self.Player.PersonBitmap.y == tile.y)
            this.ifOnGoal = true;
        else
            this.ifOnGoal = false;
        return this.ifOnGoal;
    };
    p.HeroEquipWeapon = function (weaponId) {
        var temp = this.hero.getEquipment(EquipementType.WEAPON);
        if (temp) {
            this.user.package.InPackage(temp);
        }
        this.hero.addWeapon(EquipmentServer.getInstance().getWeapon(weaponId));
        console.log(weaponId);
    };
    p.HeroEquipHelement = function (helmentId) {
        var temp = this.hero.getEquipment(EquipementType.HELMENT);
        if (temp) {
            this.user.package.InPackage(temp);
        }
        this.hero.addHelment(EquipmentServer.getInstance().getHelement(helmentId));
    };
    p.HeroEquipArmor = function (Id) {
        var temp = this.hero.getEquipment(EquipementType.CORSELER);
        if (temp) {
            this.user.package.InPackage(temp);
        }
        this.hero.addCorseler(EquipmentServer.getInstance().getArmor(Id));
    };
    p.HeroEquipShoes = function (Id) {
        var temp = this.hero.getEquipment(EquipementType.SHOES);
        if (temp) {
            this.user.package.InPackage(temp);
        }
        this.hero.addShoes(EquipmentServer.getInstance().getShoe(Id));
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var Person = (function () {
    function Person() {
        this.GoRight = false;
        this.GoLeft = false;
        this.PersonBitmap = new egret.Bitmap();
        this.PersonBitmap.width = 49;
        this.PersonBitmap.height = 64;
        this.IsIdle = true;
        this.IsWalking = false;
        this.IsFight = false;
        this.IdleOrWalkStateMachine = new StateMachine();
        this.LeftOrRightStateMachine = new StateMachine();
    }
    var d = __define,c=Person,p=c.prototype;
    p.SetPersonBitmap = function (picture) {
        this.PersonBitmap = picture;
    };
    p.SetIdle = function (set) {
        this.IsIdle = set;
    };
    p.GetIfIdle = function () {
        return this.IsIdle;
    };
    p.SetWalk = function (set) {
        this.IsWalking = set;
    };
    p.GetIfWalk = function () {
        return this.IsWalking;
    };
    p.SetFight = function (set) {
        this.IsFight = set;
    };
    p.GetIfFight = function () {
        return this.IsFight;
    };
    p.SetGoRight = function () {
        this.GoRight = true;
        this.GoLeft = false;
    };
    p.GetIfGoRight = function () {
        return this.GoRight;
    };
    p.SetGoLeft = function () {
        this.GoLeft = true;
        this.GoRight = false;
    };
    p.GetIfGoLeft = function () {
        return this.GoLeft;
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    p.SetState = function (e, _tmain) {
        this.IdleOrWalkStateMachine.setState(e, _tmain);
    };
    p.SetRightOrLeftState = function (e, _tmain) {
        this.LeftOrRightStateMachine.setState(e, _tmain);
    };
    return Person;
}());
egret.registerClass(Person,'Person');
var PeopleState = (function () {
    function PeopleState() {
    }
    var d = __define,c=PeopleState,p=c.prototype;
    p.OnState = function (_tmain) { };
    ;
    p.ExitState = function (_tmain) { };
    ;
    return PeopleState;
}());
egret.registerClass(PeopleState,'PeopleState',["State"]);
var StateMachine = (function () {
    function StateMachine() {
    }
    var d = __define,c=StateMachine,p=c.prototype;
    p.setState = function (e, _tmain) {
        if (this.CurrentState != null) {
            this.CurrentState.ExitState(_tmain);
        }
        this.CurrentState = e;
        this.CurrentState.OnState(_tmain);
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
var IdleState = (function () {
    function IdleState() {
    }
    var d = __define,c=IdleState,p=c.prototype;
    p.OnState = function (_tmain) {
        _tmain.Player.SetIdle(true);
        _tmain.Player.SetWalk(false);
        _tmain.Player.SetFight(false);
    };
    ;
    p.ExitState = function (_tmain) {
        _tmain.Player.SetIdle(false);
    };
    ;
    return IdleState;
}());
egret.registerClass(IdleState,'IdleState');
var WalkingState = (function () {
    function WalkingState() {
    }
    var d = __define,c=WalkingState,p=c.prototype;
    p.OnState = function (_tmain) {
        _tmain.Player.SetIdle(false);
        _tmain.Player.SetWalk(true);
        _tmain.Player.SetFight(false);
    };
    ;
    p.ExitState = function (_tmain) {
        _tmain.Player.SetWalk(false);
    };
    ;
    return WalkingState;
}());
egret.registerClass(WalkingState,'WalkingState');
var FightState = (function () {
    function FightState() {
    }
    var d = __define,c=FightState,p=c.prototype;
    p.OnState = function (_tmain) {
        _tmain.Player.SetFight(true);
        _tmain.Player.SetIdle(false);
        _tmain.Player.SetWalk(false);
    };
    p.ExitState = function (_tmain) {
        _tmain.Player.SetFight(false);
    };
    return FightState;
}());
egret.registerClass(FightState,'FightState');
var GoRightState = (function () {
    function GoRightState() {
    }
    var d = __define,c=GoRightState,p=c.prototype;
    p.OnState = function (_tmain) {
        _tmain.Player.SetGoRight();
    };
    ;
    p.ExitState = function (_tmain) { };
    ;
    return GoRightState;
}());
egret.registerClass(GoRightState,'GoRightState');
var GoLeftState = (function () {
    function GoLeftState() {
    }
    var d = __define,c=GoLeftState,p=c.prototype;
    p.OnState = function (_tmain) {
        _tmain.Player.SetGoLeft();
    };
    ;
    p.ExitState = function (_tmain) { };
    ;
    return GoLeftState;
}());
egret.registerClass(GoLeftState,'GoLeftState');
//# sourceMappingURL=Main.js.map
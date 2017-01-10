enum MonsterState{
    LIVE,
    DEAD
}

class Monster extends egret.DisplayObjectContainer{
    public name : string;
    public monsterID : string;
    private monsterPictureId : string;
    public monsterPicture : egret.Bitmap;
    private maxHP : number;
    private currentHP : number;
    private state : MonsterState;
    public posX : number;
    public posY : number;

    constructor(id,name,pictureId,maxHP,x,y){
        super();
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

    public BeenAttacked(damage : number){
        this.currentHP -= damage;
        this.checkState();
    }

    public checkState(){
        if(this.currentHP <= 0){
            this.state = MonsterState.DEAD;
        }
    }

    public getMonsterState(){
        return this.state;
    }
}

class MonsterService{
    private static instance;
    private monsterList: {
        [index: string]: Monster
    } = {};
    static getInstance(): MonsterService {
        if (MonsterService.instance == null) {
            MonsterService.instance = new MonsterService();
        }
        return MonsterService.instance;
    }

    public addMonster(monster: Monster) {
        this.monsterList[monster.monsterID] = monster;
    }

    public getMonster(id : string){
        return this.monsterList[id];
    }
}

function creatMonster(id:string){
    var data = {
         "slime01":{id:"slime01",name:"slime",pictureId:"monster_png",maxHP:100,x:64 * 7,y:64*2},
         "slime02":{id:"slime02",name:"slime",pictureId:"monster_png",maxHP:100,x:64 * 5,y:64*7},
    }
    var info = data[id];
    if (!info) {
        console.error('missing monster')
    }
    return new Monster(info.id,info.name,info.pictureId,info.maxHP,info.x,info.y);
}
enum TaskStatus {
    UNACCEPTABLE = 0,
    ACCEPTABLE = 1,
    DURING = 2,
    CAN_SUBMIT = 3,
    SUBMITTED = 4
}

interface TaskConditionContext {
    getCurrent();
    setCurrent(n: number);
    canAccept();
    accept();
    submit();
    updateProccess(n : number);
}

class EventEmitter {
    public observerList: Observer[] = [];
    public addObserver(o: Observer) {
        this.observerList.push(o);
    }

    public notify(task: Task) {
        for (var observer of this.observerList) {
            observer.onChange(task);
        }
    }
}

class Task extends EventEmitter implements TaskConditionContext,Observer {

    public id: string;
    public name: string;
    public desc: string;
    public status: TaskStatus;
    public fromNpcId: string;
    public toNpcId: string;
    public current = 0;
    public total = 100;
    public conditionType : string;
    public preTaskListId : string[] = [];
    private taskCondition: TaskCondition;
    private rewardEquipmentId : string;
    private _tmain : Main;

    public setMain(main : Main){
        this._tmain = main;
    }

    public getCurrent() {
        return this.current;
    }
    public setCurrent(n: number) {
        this.current += n;
        this.checkStatus();
    }
    private checkStatus() {
        if (this.current >= this.total) {
            TaskService.getInstance().canFinish(this.id);
            this.notify(this);
        }
    }

    public onChange(task : Task){
        if(this.id == task.id){
            this.updateProccess(1);
        }
    }
    public canAccept(){
        if(this.status == TaskStatus.UNACCEPTABLE){
            this.status = TaskStatus.ACCEPTABLE;
            this.notify(this);
        }
    };
    public accept(){
        if(this.status == TaskStatus.ACCEPTABLE){
            this.status = TaskStatus.DURING;
            this.notify(this);
        }
    };
    public submit(){
        if(this.status == TaskStatus.CAN_SUBMIT){
            this.status = TaskStatus.SUBMITTED;
            this._tmain.HeroEquipWeapon(this.rewardEquipmentId);
            this.notify(this);
        }
    };
    public updateProccess(n : number){
        if(this.status == TaskStatus.DURING){
        this.taskCondition.updateProccess(this,n);
        }
    }
    constructor(id: string, name: string, desc: string, total: number, status: TaskStatus, taskcondition: TaskCondition,conditiontype,
      fromNpcId: string, toNpcId: string,preTaskListId : string[],rewardEquipmentId : string) {
        super();
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
}


interface TaskCondition {
    updateProccess(task, num);
}

class NPCTalkTaskCondition implements TaskCondition {
    canAccept(task : TaskCondition){}
    onSubmit(task){}
    getCondition(){
        return this;
    }
    public updateProccess(task: TaskConditionContext, num: number) {
        task.setCurrent(num);
    }
}

class KillMonsterTaskCondition implements TaskCondition {    
    public MonsterList:{
      [Index : string] : number
    } = {}

    onAccept(task) { }
    onSubmit(task) { }
    getCondition(){
        return this;
    }
    public updateProccess(task: TaskConditionContext, num: number) {
        task.setCurrent(num);
    }
}

interface Observer {
    onChange(task: Task);
}

class TaskService extends EventEmitter implements Observer {
    private static instance;
    private taskList: {
        [index: string]: Task
    } = {};
    static getInstance(): TaskService {
        if (TaskService.instance == null) {
            TaskService.instance = new TaskService();
        }
        return TaskService.instance;
    }

    public addTask(task: Task) {
        this.taskList[task.id] = task;
    }

    public getTaskByCustomRule(rule: Function): Task {
        return rule(this.taskList);
    }

    public finish(id: string) {
        if (this.taskList[id].status == TaskStatus.CAN_SUBMIT) {
            this.taskList[id].status = TaskStatus.SUBMITTED;
        }
       this.notify(this.taskList[id]);
    }

    public accept(id: string) {
        if (this.taskList[id].status == TaskStatus.ACCEPTABLE) {
            this.taskList[id].status = TaskStatus.DURING;
        }
        this.notify(this.taskList[id]);
    }

    public canAccept(id: string) {
        if (this.taskList[id].status == TaskStatus.UNACCEPTABLE) {
            this.taskList[id].status = TaskStatus.ACCEPTABLE;
        }
        this.notify(this.taskList[id]);
    }

    public canFinish(id: string) {
        if (this.taskList[id].status == TaskStatus.DURING) {
            this.taskList[id].status = TaskStatus.CAN_SUBMIT;
        }
        this.notify(this.taskList[id]);
    }

    public onChange(task: Task) {
        this.taskList[task.id] = task;
        this.notify(this.taskList[task.id]);
        for(var taskId in this.taskList){
            if(this.taskList[taskId].status == TaskStatus.UNACCEPTABLE){
               var canAccept = true;
               for(var preId of this.taskList[taskId].preTaskListId){
                if(preId != "null"){
                   if(this.taskList[preId].status != TaskStatus.SUBMITTED ){
                       canAccept = false;
                      break;
                      }
                   }
                   }
                   if(canAccept){
                    this.canAccept(taskId);
                   }
            }
        }
    }
}

function creatTaskCondition(id: string) {
        var data = {
            "npctalk" : {condition : new NPCTalkTaskCondition()},
            "killmonster":{condition : new KillMonsterTaskCondition()} 
        }
        var info = data[id];
        if (!info) {
            console.error('missing task')
        }
            return info.condition;
    }

    function creatTask(id: string) {
        var data = {
            "task_00": { name: "任务01", desc: "点击NPC01,在NPC02交任务", total: 1, status: TaskStatus.ACCEPTABLE, condition: "npctalk", fromNpcId: "npc_0", toNpcId: "npc_1" ,preTaskListId : ["null"],rewardEquipmentId:"W001"},
            "task_01": { name: "任务02", desc: "点击NPC02,杀死一只史莱姆后点NPC02交任务", total: 1, status: TaskStatus.UNACCEPTABLE, condition: "killmonster", fromNpcId: "npc_1", toNpcId: "npc_1" ,preTaskListId : ["task_00"],rewardEquipmentId:"W002"},
        }
        var info = data[id];
        if (!info) {
            console.error('missing task')
        }
        var condition = this.creatTaskCondition(info.condition);
        return new Task(id, info.name, info.desc, info.total, info.status, condition, info.condition,info.fromNpcId, info.toNpcId,info.preTaskListId,info.rewardEquipmentId);
    }

class TaskPanel extends egret.DisplayObjectContainer implements Observer {

    textField: egret.TextField;
    background: egret.Bitmap;
    show: string[] = [];
    private taskList: Task[] = [];
    private ifAccept: boolean;
    private duringTaskId: string;

    constructor() {
        super();
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

        let rule = (taskList) => {
            for (var taskId in taskList) {
                this.taskList.push(taskList[taskId]);
            }
        }
        TaskService.getInstance().getTaskByCustomRule(rule);
    }

    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    onChange(task: Task) {
        var i = 0;
        let rule = (taskList) => {
            for (var taskId in taskList) {
                this.taskList[i] = taskList[taskId];
                i++;
            }
        }
        TaskService.getInstance().getTaskByCustomRule(rule);
        for (var i = 0; i < this.taskList.length; i++) {
            if (this.taskList[i].id == task.id) {
                egret.Tween.get(this).to({ alpha: 1 }, 500);
                var statusText : string = "";
                switch(this.taskList[i].status){
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
    }
}

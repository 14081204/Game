class NPC  extends egret.DisplayObjectContainer implements Observer {
    public NPCId : string;
    private NPCBitmap : egret.Bitmap;
    private emoji : egret.Bitmap;
    private dialogue : string[] = [];
    private taskAcceptDialogue : string[] = [];
    private taskSubmitDialogue : string[] = [];
    public static npcIsChoose : NPC;
    private taskList:{
        [index : string]:Task
    } = {};

    private canAcceptTaskList:{
        [index : string]:Task
    } = {};

    private canSumbitTaskList:{
        [index : string]:Task
    } = {};

    constructor(npcId : string ,npcCode : string,dialogue : string[]){
        super();

        for( var i = 0 ; i < dialogue.length; i++){
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
         this.NPCBitmap.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
            NPC.npcIsChoose = this;
        },this)

        this.emoji = new egret.Bitmap();

        let rule = (taskList) => {
            for(var taskId in taskList){
                if( taskList[taskId].fromNpcId == this.NPCId || taskList[taskId].toNpcId == this.NPCId){
                this.taskList[taskId] = taskList[taskId];
                }
                if(taskList[taskId].fromNpcId == this.NPCId){
                   this.canAcceptTaskList[taskId] = taskList[taskId];
                }
                if(taskList[taskId].toNpcId == this.NPCId){
                    this.canSumbitTaskList[taskId] = taskList[taskId];
                }

                if(taskList[taskId].fromNpcId == this.NPCId && taskList[taskId].status == TaskStatus.ACCEPTABLE){
                   var texture : egret.Texture = RES.getRes("isaccept_png");
                   this.emoji.texture = texture;
                   this.taskList[taskId] = taskList[taskId];
                }

                if(this.NPCId  == taskList[taskId].toNpcId && taskList[taskId].status == TaskStatus.CAN_SUBMIT){
                   var texture : egret.Texture = RES.getRes("canputin_png");
                   this.emoji.texture = texture;
                   this.taskList[taskId] = taskList[taskId];
                }
            }
        }
        TaskService.getInstance().getTaskByCustomRule(rule);

        this.addChild(this.emoji);
        this.emoji.x = 20;
        this.emoji.y = -20;
    }

    public setTaskAcceptDialogue(acceptDialogue : string[]){
        this.taskAcceptDialogue = acceptDialogue;
    }

    public setTaskSubmitDialogue(submitDialogue : string[]){
        this.taskSubmitDialogue = submitDialogue;
    }

    onChange(task : Task){

            if(this.NPCId == task.fromNpcId && task.status == TaskStatus.ACCEPTABLE){
               this.emoji.alpha = 1;
               var texture : egret.Texture = RES.getRes("isaccept_png");
               this.emoji.texture = texture;
               this.taskList[task.id].status = TaskStatus.ACCEPTABLE;
               return;
            }

            if(this.NPCId == task.toNpcId && task.status == TaskStatus.CAN_SUBMIT){
                this.emoji.alpha = 1;
               var texture : egret.Texture = RES.getRes("canputin_png");
               this.emoji.texture = texture;
               this.taskList[task.id].status = TaskStatus.CAN_SUBMIT;
               this.canSumbitTaskList[task.id] = task;
               return;
            }

            if(this.NPCId == task.fromNpcId && task.status != TaskStatus.ACCEPTABLE && task.status != TaskStatus.SUBMITTED){
                this.emoji.alpha = 0;
                this.taskList[task.id].status = task.status;
                for(var taskId in this.canSumbitTaskList){
                    if(this.NPCId == this.canSumbitTaskList[taskId].toNpcId 
                    && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT){
                        this.emoji.alpha = 1;
                        var texture : egret.Texture = RES.getRes("canputin_png");
                        this.emoji.texture = texture;
                        return;
                    }
                }
                for(var taskId in this.taskList){
                    if(this.NPCId == this.taskList[taskId].fromNpcId 
                    && this.taskList[taskId].status == TaskStatus.ACCEPTABLE){
                       this.emoji.alpha = 1;
                       var texture : egret.Texture = RES.getRes("isaccept_png");
                       this.emoji.texture = texture;
                       return;
                    }
                }
                return;
            }

            if(this.NPCId == task.toNpcId && task.status != TaskStatus.CAN_SUBMIT){
                this.emoji.alpha = 0;
                this.taskList[task.id].status = task.status;
                for(var taskId in this.canSumbitTaskList){
                    if(this.NPCId == this.canSumbitTaskList[taskId].toNpcId 
                    && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT){
                        this.emoji.alpha = 1;
                        var texture : egret.Texture = RES.getRes("canputin_png");
                        this.emoji.texture = texture;
                        return;
                    }
                }
                for(var taskId in this.taskList){
                    if(this.NPCId == this.taskList[taskId].fromNpcId 
                    && this.taskList[taskId].status == TaskStatus.ACCEPTABLE){
                       this.emoji.alpha = 1;
                       var texture : egret.Texture = RES.getRes("isaccept_png");
                       this.emoji.texture = texture;
                       return;
                    }
                }
                return;
            }
    }

    public onNPCClick(){
            var x = 0;            
            for(var taskId in this.canSumbitTaskList){
                if(this.NPCId == this.canSumbitTaskList[taskId].toNpcId && this.canSumbitTaskList[taskId].status == TaskStatus.CAN_SUBMIT){
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

            for(var taskId in this.taskList){
                if(this.NPCId == this.taskList[taskId].fromNpcId && this.taskList[taskId].status == TaskStatus.ACCEPTABLE){
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

                if(this.NPCId == this.taskList[taskId].toNpcId && this.taskList[taskId].status == TaskStatus.CAN_SUBMIT){
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
            if(x <= 0)
            TalkCommand.canFinish = true;
    }

    public getNPC(){
        this.NPCBitmap.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
            NPC.npcIsChoose = this;
        },this)
    }
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}

class DialoguePanel extends egret.DisplayObjectContainer{

    private textField : egret.TextField;
    private button : egret.Bitmap;
    private dialogue : string[] = [];
    private background : egret.Bitmap;
    private ifAccept : boolean = false;
    private duringTask : Task;
    private duringTaskConditionType : string;
    private duringTaskCondition : TaskCondition;
    private _tmain : Main;
    private static instance = new DialoguePanel();

    static getInstance():DialoguePanel{
        if(DialoguePanel.instance == null){
            DialoguePanel.instance = new DialoguePanel();
        }        
        return DialoguePanel.instance;
    }
    constructor(){
        super();
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

    public SetMain(main : Main){
        this._tmain = main;
    }

    public setButtonBitmap(buttonBitmapCode : string){
        var texture : egret.Texture = RES.getRes(buttonBitmapCode);
        this.button.texture = texture;
    }

    public setDuringTaskCondition(taskCondition : TaskCondition){
        this.duringTaskCondition = taskCondition;
    }

    public setDialogueText(dialogue : string[]){
        this.dialogue = [];
        for( var i = 0 ; i < dialogue.length; i++){
            this.dialogue[i] = dialogue[i];
        }
        for(var j = 0 ; j < this.dialogue.length;j++){
        this.textField.text = this.dialogue[j] + "\n";
        }
    }

    public setIfAccept(b : boolean){
        this.ifAccept = b;
    }

    public buttonTouchEnable(b : boolean){
        this.button.touchEnabled = b;
    }

    public setDuringTask(task : Task){
        this.duringTask = task;
    }

    public setDuringTaskConditionType(taskConditionType : string){
        this.duringTaskConditionType = taskConditionType;
    }

    public setBackgroundBitmap(backgroundCode :string){
        var textureBackground : egret.Texture = RES.getRes("duihuakuang_png");
                this.background.texture = textureBackground;
    }

    private onClick(){
        this.button.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
            console.log("dialogue on click");
            if(this.ifAccept){
               this.duringTask.accept();
                var texture : egret.Texture = RES.getRes("Unfinished_png");
                this.button.texture = texture;
                if(this.duringTask.conditionType == "npctalk"){
                    this.duringTask.updateProccess(1);
                }
                egret.Tween.get(this).to({alpha : 0},1000);
                TalkCommand.canFinish = true;
            }

            if(!this.ifAccept){
                this.duringTask.submit();
                var texture : egret.Texture = RES.getRes("cannotaccept_png");
                this.button.texture = texture;                
                egret.Tween.get(this).to({alpha : 0},1000);
                TalkCommand.canFinish = true;
            }
        },this)
    }

    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}
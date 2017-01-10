var Package = (function () {
    function Package() {
        this.backpack = [];
        this.currentSize = 0;
    }
    var d = __define,c=Package,p=c.prototype;
    p.InPackage = function (equipemt) {
        this.backpack.push(equipemt);
        equipemt.numInPackage = this.currentSize;
        this.currentSize++;
    };
    p.OutPackage = function (equipemt) {
        this.backpack.splice(equipemt.numInPackage);
        this.currentSize--;
    };
    return Package;
}());
egret.registerClass(Package,'Package');
//# sourceMappingURL=Package.js.map
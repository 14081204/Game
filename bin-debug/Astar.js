var AStar = (function () {
    function AStar() {
        this.straightCost = 1.0;
        this.diagCost = Math.SQRT2;
        this.heuristic = this.diagonal;
    }
    var d = __define,c=AStar,p=c.prototype;
    ;
    p.findPath = function (tileMap) {
        var h = 0;
        var g = 0;
        this.pathArray = [];
        this.tileMap = tileMap;
        this.openArray = [];
        this.closedArray = [];
        this.startTile = tileMap.startTile;
        this.endTile = tileMap.endTile;
        this.startTile.tileData.g = 0;
        this.startTile.tileData.h = this.heuristic(this.startTile);
        this.startTile.tileData.f = this.startTile.tileData.g + this.startTile.tileData.h;
        return this.search();
    };
    p.isOpen = function (tile) {
        for (var i = 0; i < this.openArray.length; i++) {
            if (tile == this.openArray[i]) {
                return true;
            }
        }
        return false;
    };
    p.isClosed = function (tile) {
        for (var i = 0; i < this.closedArray.length; i++) {
            if (tile == this.closedArray[i]) {
                return true;
            }
        }
        return false;
    };
    p.findMinFInOpenArray = function () {
        var i = 0;
        var temp;
        for (var j = 0; j < this.openArray.length; j++) {
            if (this.openArray[i].tileData.f > this.openArray[j].tileData.f) {
                i = j;
            }
        }
        temp = this.openArray[i];
        for (j = i; j < this.openArray.length - 1; j++) {
            this.openArray[j] = this.openArray[j + 1];
        }
        this.openArray.pop();
        return temp;
    };
    p.search = function () {
        var tile = this.startTile;
        while (tile != this.endTile) {
            var startX = Math.max(0, tile.tileData.x - 1);
            var endX = Math.min(this.tileMap.numCols - 1, tile.tileData.x + 1);
            var startY = Math.max(0, tile.tileData.y - 1);
            var endY = Math.min(this.tileMap.numRows - 1, tile.tileData.y + 1);
            for (var i = startX; i <= endX; i++) {
                for (var j = startY; j <= endY; j++) {
                    var test = this.tileMap.getTile(i, j);
                    if (test == tile || !test.tileData.walkable || !this.tileMap.getTile(tile.tileData.x, test.tileData.y).tileData.walkable || !this.tileMap.getTile(test.tileData.x, tile.tileData.y).tileData.walkable) {
                        continue;
                    }
                    var cost = this.straightCost;
                    if (!((tile.tileData.x == test.tileData.x) || (tile.tileData.y == test.tileData.y))) {
                        cost = this.diagCost;
                    }
                    var g = tile.tileData.g + cost * test.tileData.costMultiplier;
                    var h = this.heuristic(test);
                    var f = g + h;
                    if (this.isOpen(test) || this.isClosed(test)) {
                        if (test.tileData.f > f) {
                            test.tileData.f = f;
                            test.tileData.g = g;
                            test.tileData.h = h;
                            test.tileParent = tile;
                        }
                    }
                    else {
                        test.tileData.f = f;
                        test.tileData.g = g;
                        test.tileData.h = h;
                        test.tileParent = tile;
                        this.openArray.push(test);
                    }
                }
            }
            this.closedArray.push(tile);
            if (this.openArray.length == 0) {
                console.log("no path found");
                return false;
            }
            tile = this.findMinFInOpenArray();
        }
        this.buildPath();
        return true;
    };
    p.buildPath = function () {
        var tile = this.endTile;
        this.pathArray.push(tile);
        while (tile != this.startTile) {
            tile = tile.tileParent;
            this.pathArray.unshift(tile);
        }
    };
    p.emanhattan = function (tile) {
        return Math.abs(tile.x - this.endTile.tileData.x) * this.straightCost + Math.abs(tile.y + this.endTile.tileData.y) * this.straightCost;
    };
    p.euclidian = function (tile) {
        var dx = tile.x - this.endTile.tileData.x;
        var dy = tile.y - this.endTile.tileData.y;
        return Math.sqrt(dx * dx + dy * dy) * this.straightCost;
    };
    p.diagonal = function (tile) {
        var dx = Math.abs(tile.tileData.x - this.endTile.tileData.x);
        var dy = Math.abs(tile.tileData.y - this.endTile.tileData.y);
        var diag = Math.min(dx, dy);
        var straight = dx + dy;
        return this.diagCost * diag + this.straightCost * (straight - 2 * diag);
    };
    return AStar;
}());
egret.registerClass(AStar,'AStar');
//# sourceMappingURL=Astar.js.map
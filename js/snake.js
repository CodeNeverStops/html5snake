/**
 * @author loki
 */
;
(function(){
    function Map(rows, cols){
        var self = this;
        self.rows = rows;
        self.cols = cols;
        self.cellSize = 12;
        self.topPadding = 10;
        self.leftPadding = 10;// 0:floor 1:snake 2:food 3:wall
    }
    Map.prototype = {
        create: function(){
            var self = this;
            ctx.fillStyle = "gray";
            ctx.beginPath();
            for (var x = 0; x < self.rows; x++) {
                for (var y = 0; y < self.cols; y++) {
                    ctx.fillRect(self.leftPadding + self.cellSize * y, self.topPadding + self.cellSize * x, self.cellSize, self.cellSize);
                }
            }
            ctx.fill();
        }
    };
    
    function Food(){
        this.fillStyle = "#F00";
        this.cells = [];
    }
    
    Food.prototype = {
        generate: function(){
            this.cells.push({
                x : Math.floor(Math.random() * game.map.rows),
                y : Math.floor(Math.random() * game.map.cols)
            });
        },
        remove: function(x, y){
            var self = this;
            for (var i in self.cells) {
                if (self.cells[i].x == x && self.cells[i].y == y) {
                    delete self.cells[i];
                    break;
                }
            }  
        },
        render: function(){
            var self = this, map = game.map, cellLen, tmp;
            ctx.beginPath();
            ctx.fillStyle = self.fillStyle;
            cellLen = self.cells.length;
            for (var i in self.cells) {
                tmp = self.cells[i];
                ctx.fillRect(map.leftPadding + tmp.x * map.cellSize, map.topPadding + tmp.y * map.cellSize, map.cellSize, map.cellSize);
            }
            ctx.fill();
        }
    };
    
    function Snake(x, y, direct, len, speed){
        var self = this;
        self.body = [];
        self.rmTail = [];
        self.len = (len > 3 && len < 5) ? len : 4;
        self.speed = (speed >= 1 && speed <= 10) ? speed : 5;
        for (var i = 0; i < len; i++) {
            var tmp_x = x + direct.x * i;
            var tmp_y = y + direct.y * i;
            this.body.unshift({
                x: tmp_x,
                y: tmp_y
            });
        }
        self.direct = direct;
        self.timer = null;
        if (self.timer == null) {
            self.resume();
        }
    }
    Snake.prototype = {
        move: function(){
            var self = this, map = game.map, i = 0;
            var cell, head = self.body[0], newhead = {
                x: head.x + self.direct.x,
                y: head.y + self.direct.y
            };
            if (newhead.x < 0 || newhead.x > map.rows - 1 || newhead.y < 0 ||
            newhead.y > map.cols - 1) {
                self.die();
                return false;
            }
            var len = self.body.length;
            for (; i < len; i++) {
                var current = self.body[i];
                if (newhead.x == current.x && newhead.y == current.y) { // check whether the snake hit his body
                    self.die();
                    return false;
                }
            }
            self.body.unshift(newhead);
            for (var j in game.food.cells) {
                var currentFood = game.food.cells[j];
                game.log(currentFood);
                if (currentFood.x == newhead.x && currentFood.y == newhead.y) {
                    self.eat(currentFood.x, currentFood.y);
                }
                else {
                    self.rmTail.push(self.body[self.body.length - 1]);
                    self.body.pop();
                }
            }
            self.render();
            game.food.render();
        },
        eat: function(x, y){
            game.food.remove(x, y);
            game.food.generate();
            // score.add(score_per_food);
            // score_panel.update(score.get());
        },
        changeDirect: function(e){
            var self = this;
            var newdirect = game.direct.getByKeyCode(e.keyCode);
            // if the direction is available, then change the direction
            if (!newdirect) {
                return false;
            }
            if (newdirect.x == -self.direct.x && newdirect.y == self.direct.y) {
                return false;
            }
            else 
                if (newdirect.y == -self.direct.y &&
                newdirect.x == self.direct.x) {
                    return false;
                }
            self.direct = newdirect;
        },
        stop: function(){
            var self = this;
            if (self.timer) {
                clearInterval(self.timer);
                self.timer = null;
            }
        },
        resume: function(){
            var self = this;
            if (!self.timer) {
                self.timer = setInterval(function(){
                    self.move();
                }, 1000 / self.speed);
            }
        },
        die: function(){
            this.stop();
            alert('snake die.');
        },
        render: function(){
            var self = this, i = 0, map = game.map;
            ctx.beginPath();
            ctx.fillStyle = '#FF0';
            for (i = 0; i < self.body.length; i++) {
                ctx.fillRect(map.leftPadding + self.body[i].x * map.cellSize, map.topPadding + self.body[i].y * map.cellSize, map.cellSize, map.cellSize);
            }
            ctx.fillStyle = 'gray';
            for (i = self.rmTail.length - 1; i >= 0; i--) {
                ctx.fillRect(map.leftPadding + self.rmTail[i].x * map.cellSize, map.topPadding + self.rmTail[i].y * map.cellSize, map.cellSize, map.cellSize);
                self.rmTail.pop();
            }
            ctx.fill();
        }
    };
    
    function Direction(){
        this.direct = {
            37: {
                x: -1,
                y: 0
            },
            38: {
                x: 0,
                y: -1
            },
            39: {
                x: 1,
                y: 0
            },
            40: {
                x: 0,
                y: 1
            }
        };
    }
    Direction.prototype = {
        getByKeyCode: function(code){
            var direct = this.direct[code];
            // console.debug(direct);
            return direct;
        },
        getByRandom: function(){
            var key = Math.floor(Math.random() * 4 + 37);
            // console.debug(key);
            var result = this.direct[key];
            // console.debug(result);
            return result;
        }
    };
    
    function Score(){
        var self = this;
        self.score = 0;
    }
    Score.prototype = {
        add: function(score){
            var self = this;
            self.score += parseInt(score);
        },
        get: function(){
            return this.score;
        }
    };
    
    function Game(){
        var self = this;
        self.snake = null, self.map = null, self.direct = null, self.food = null;
    }
    
    Game.prototype = {
        options: {
            debug: 0,
            mapWidth: 20,
            mapHeight: 20,
            snakeLength: 5,
            snakeSpeed: 10
        },
        start: function(){
            var self = this;
            var options = self.options;
            self.direct = new Direction();
            self.map = new Map(options.mapWidth, options.mapHeight);
            self.map.create();
            x = Math.floor(Math.random() *
            (options.mapWidth - options.snakeLength * 2) +
            parseInt(options.snakeLength));
            y = Math.floor(Math.random() *
            (options.mapHeight - options.snakeLength * 2) +
            parseInt(options.snakeLength));
            self.snake = new Snake(x, y, self.direct.getByRandom(), options.snakeLength, options.snakeSpeed);
            self.food = new Food();
            self.food.generate();
        },
        log: function(str) {
            game.options.debug && window.console && console.debug && console.debug(str);
        }
    };
    
    var canvas = document.getElementById('canvas1'), ctx = canvas.getContext('2d'), game = new Game();
    document.addEventListener('keydown', function(e){
        game.snake.changeDirect(e);
    }, false);
    game.start();
})();

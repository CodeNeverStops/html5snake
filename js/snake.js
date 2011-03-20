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
        self.leftPadding = 10;// 0:floor 1:snake 2:food
        self.cells = [];
    }
    Map.prototype = {
        create: function(){
            var self = this;
            ctx.fillStyle = "gray";
            ctx.beginPath();
            for (var x = 0; x < self.rows; x++) {
                var tmp = [];
                for (var y = 0; y < self.cols; y++) {
                    ctx.fillRect(self.leftPadding + self.cellSize * y, self.topPadding + self.cellSize * x, self.cellSize, self.cellSize);
                    tmp.push({
                        state : 0
                    });
                }
                self.cells.push(tmp);
            }
            ctx.fill();
        },
        getCellByXY: function(x, y) {
            return this.cells[x][y];
        }
    };
    
    function Food(){
        var self = this;
        self.x = Math.floor(Math.random() * game.map.rows);
        self.y = Math.floor(Math.random() * game.map.cols);
        self.fillStyle = '#F00';
        self.onSnake = 0;
        if (game.map.getCellByXY(self.x, self.y).state == 1) {
            self.onSnake = 1;
            game.map.getCellByXY(self.x, self.y).state = 2;
        }
        self.render();
    }
    
    Food.prototype = {
        render: function(){
            var self = this, map = game.map;
            ctx.beginPath();
            ctx.fillStyle = self.fillStyle;
            ctx.fillRect(map.leftPadding + self.x * map.cellSize, map.topPadding + self.y * map.cellSize, map.cellSize, map.cellSize);
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
            game.map.getCellByXY(tmp_x, tmp_y).state = 1;
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
            var self = this, map = game.map;
            // console.debug(this.direct);
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
            for (var i = 0; i < len; i++) {
                var current = self.body[i];
                game.map.getCellByXY(current.x,current.y).state = 1;
                if (newhead.x == current.x && newhead.y == current.y) { // check whether the snake hit his body
                    self.die();
                    return false;
                }
            }
            self.body.unshift(newhead);
            for (var i in game.foods) {
                var currentFood = game.foods[i];
                if (currentFood.x == newhead.x && currentFood.y == newhead.y) {
                    delete game.foods[i];
                    game.map.getCellByXY(currentFood.x, currentFood.y).state = 1;
                    self.eat();
                }
                else {
                    var tail = self.body[self.body.length - 1];
                    self.rmTail.push(tail);
                    game.map.getCellByXY(tail.x, tail.y).state = 0;
                    self.body.pop();
                }
            }
            self.render();
        },
        eat: function(){
            game.foods.push(new Food());
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
            var self = this, i, map = game.map;
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
            for (var i in game.foods) {
                var food = game.foods[i];
                if (food.onSnake == 1) {
                    ctx.fillStyle = food.fillStyle;
                    ctx.fillRect(map.leftPadding + food.x * map.cellSize, map.topPadding + food.y * map.cellSize, map.cellSize, map.cellSize);
                }
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
        self.foods = [], self.walls = [];
        self.snake = null, self.map = null, self.direct = null, self.food = null;
    }
    
    Game.prototype = {
        options: {
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
            self.foods.push(new Food());
        }
    };
    
    var canvas = document.getElementById('canvas1'), ctx = canvas.getContext('2d'), game = new Game();
    document.addEventListener('keydown', function(e){
        game.snake.changeDirect(e);
    }, false);
    game.start();
})();

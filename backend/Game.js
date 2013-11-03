function Game ( options ){
    options = options || {};
    var _players  = options.players || []
      , _id = Game.prototype.generateId()
      , sockets = options.sockets
      , step = 0
      , field = [ [ -1, -1, -1],
                  [ -1, -1, -1],
                  [ -1, -1, -1] ];
    
    function start () {
        putInRoom();
        emitOpponent();
        bindEvents();
    }

    function bindEvents () {
        _players.forEach(function (player) {
            player.socket.on('makeMove', function (move) {
                makeMove(move, player);
            }); // Подписываемся на события этого игрока
        });
    }

    function makeMove (move, player) {
        field[ move.move[0] ][ move.move[1] ] = move.color;
        step++;
        if ( step >= 4 ) {checkWin(move.color, player);}
        player.socket.broadcast.to(_id).emit('makeMove', move);
    }

    function checkWin ( color, player) {
        var globalCounter = 0;

        // Проверяем строки
        field.forEach(function ( line, i ) {
            var counter = 0;
            line.forEach(function ( cell, j ) {
                if ( cell === color ) { counter++; }
            });
            if ( counter === 3 ) { win(player); }
        });

        // Проверяем столбцы
        field[0].forEach(function ( cell, i ) {
            var counter = 0;
            field.forEach(function ( line, j ) {
               if ( line[i] === color ) { counter++; } 
            });
            if ( counter === 3 ) { win(player); }
        });

        // Диагональ
        field.forEach(function ( line, i ) {
            if ( line[i] === color ) { globalCounter++; }
            if ( globalCounter === 3 ) { win(player); globalCounter = 0; }
        });

        // Обратная диагональ
        field.forEach(function ( line, i ) {
            var item = line[ (line.length-1) - i ];
            if ( item === color ) { globalCounter++; }
            if ( globalCounter === 3 ) { win(player); globalCounter = 0; }
        });

    }

    function win ( player ) {
        console.log('winner: ', player.name);
        sockets.in(_id).emit('win', player.name);
    }

    // Отправляем данные об оппоненте
    function emitOpponent () {
        _players.forEach(function (player, i) {
            var nextIndex = Math.abs(i-1);
            player.socket.emit('getOpponent', {name: _players[nextIndex].name, score: _players[nextIndex].score, color: i}); 
        });
    }

    // Записываем игроков в комнату для игры
    function putInRoom () {
        _players.forEach(function ( player ) {
            player.socket.join(_id);
        })
    }

    start();
    
    return {
        get players () {return _players;},
        get id () {return _id;}
    }
}

// В прототипе содержатся функции и поля общие для всех классов. Например генератор ID
Game.prototype = { 
    _id: 0,
    generateId : function(){
        return ++this._id;
    }
};

module.exports = Game;
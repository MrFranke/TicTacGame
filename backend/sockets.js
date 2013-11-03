var io
  , Player = require('./Player')
  , Game = require('./Game')
  , games = []
  , clients = { free   : [],
                all    : [] }; // Объект с игроками
function init( server ){
    io = require("socket.io").listen(server, { log: false });

    // Клиент подключается к серверу
    io.sockets.on('connection', addNewClient);
}


function addNewClient ( socket ) {
    console.log('client is connected!');
    socket.on('getInfo', function ( info ) {
        var player = new Player({socket: socket, name: info.name });
       // Если оппонента не нашлось, то пушим клиента в список свободных и ждем появление нового игрока
        if( !clients.free.length ){
            // Получаем информацию о клиенте
            clients.free.push(player);
        }else{
            toPlay(player);
        } 
    });
}

function toPlay ( player ) {
    var opponent = clients.free[0]
      , game = new Game({ players: [player, opponent], sockets: io.sockets });

    clients.free = clients.free.slice(1, clients.free.length);
    games.push(game);
}




exports.listen = init;
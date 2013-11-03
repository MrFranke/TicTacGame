var connect = require('connect')
  , sockets = require('./sockets');

// Подключаем статику для frontend-a
var server = connect.createServer(
    connect.static("frontend")
).listen(8080);
// Подключаем сокеты
sockets.listen(server);

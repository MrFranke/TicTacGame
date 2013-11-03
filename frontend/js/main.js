require([
    'controller/game'
], function(
    GameController
) {
    var game
      , model = {
            field: [ [ 0, 0, 0],
                     [ 0, 0, 0],
                     [ 0, 0, 0] ],
            player: {
                name: 'Franke',
                score: '000',
                color: 1
            },
            opponent: {
                name: 'Numezon',
                score: '000',
                color: -1
            }
        };

    game = new GameController();

});
define([
], function(

) {

    var gameModel =  Backbone.Model.extend({
        defaults: {
            field: [ [ -1, -1, -1],
                     [ -1, -1, -1],
                     [ -1, -1, -1] ],
            player: {
                name: 'Franke',
                score: 0,
                color: 1
            },
            opponent: {
                name: 'Numezon',
                score: 0,
                color: 0
            },
            status: 'ready'
        }
    });
    
    var Game = Backbone.View.extend({
        el: $('.js-game-field'),
        $el: $(this.el),
        $player: $('.players__player'),
        $opponent: $('.players__opponent'),
        model: new gameModel(),
        socket: null,
        
        events: {
            'click td': 'makeMove'
        },
        
        initialize: function () {
            this.bindEvents();
            this.bindSocets();
            this.render();
        },

        // Навешиваем события на модель
        bindEvents: function () {
            this.model.bind('change:field'   , this.render        , this);
            this.model.bind('change:opponent', this.changeOpponent, this);
            this.model.bind('change:player'  , this.changePlayer  , this);
            this.model.bind('change:status'  , this.changeStatus  , this);

            $('.js-set-name').on('click', {controller: this}, this.setPlayer);
        },

        // События сокетов
        bindSocets: function () {
            var socket
              , controller = this;

            this.socket = socket = io.connect(location.href);

            socket.on('connecting', function(){
                controller.model.set('status', 'connecting');
            });

            socket.on('connect', function(){
                controller.model.set('status', 'connect');
            });
             
            socket.on('getOpponent', function( opponent ){
                var playerColor = Math.abs(opponent.color-1)
                  , player = controller.model.get('player');

                controller.model.set('opponent', opponent);
                controller.model.set('player', {name: player.name, score: 0, color: playerColor});

                //После того как получили информацию об оппоненте и его цвете мы можем запускать игру

                if(opponent.color === 0){
                    controller.model.set('status', 'play');
                }else{
                    controller.model.set('status', 'waitOpponent');
                }
            });

            socket.on('makeMove', function( move ){
                controller.model.get('field')[ move.move[0] ][ move.move[1] ] = move.color;
                controller.model.trigger("change");
                controller.model.trigger("change:field");
                
                if ( controller.model.get('status') != 'win' ) {
                    controller.model.set('status', 'play');
                }
            });

            socket.on('win', function(name){
                controller.model.set('status', 'win');
                $('.js-player-win').text(name);
                $('.layout__win').show();
            });
        },
        
        // Делает ход, записывая его в модель
        makeMove: function (e) {
            var $target = $(e.target)
              , column  = $target.index()
              , stroke  = $target.parents('tr').index()
              , color   = this.model.get('player').color
              ;

            this.model.get('field')[stroke][column] = color;
            this.model.trigger("change");
            this.model.trigger("change:field");

            this.socket.emit('makeMove', {move: [stroke, column], color: color});
            this.model.set('status', 'waitOpponent');
        },

        setPlayer: function (e) {
            var name = $('.js-set-name-input').val() || 'Kakashka'
              , controller = e.data.controller;

            controller.model.set('player', {name: name, score: 0, color: 0});
            controller.model.set('status', 'waitOpponent');

            controller.socket.emit('getInfo', controller.model.get('player'));

            controller.socket.emit('move', controller.model.get('player'));
            return false;
        },
        
        // Отрисовываем игровое поле
        render: function ( model ) {
            var field = this.model.get('field');
            // проходимся по каждой строке и в ней по каждой ячейке 
            for (var i = 0; i < field.length; i++) {
                for (var j = 0; j < field[i].length; j++) {
                  /*If -1  => Пустая строка
                    If 0  => Черные (крестики)
                    If 1 => Белые (нолики)*/
                    switch ( field[i][j] ){
                        case -1:
                            this.$el.find('tr:eq('+i+') td:eq('+j+')').removeClass('black').removeClass('white');
                            break;
                        case 0:
                            this.$el.find('tr:eq('+i+') td:eq('+j+')').addClass('black');
                            break;
                        case 1:
                            this.$el.find('tr:eq('+i+') td:eq('+j+')').addClass('white');
                            break;
                    }
                }
            }
        },

        changeStatus: function (model, status) {
            var $layout = $('.layout__'+status);
            $('[class^="layout"]').fadeOut();
            $layout.fadeIn();

            switch(status){
                case 'connecting':
                    console.log('Присоединяемся к серверу');
                    break;
                case 'connect':
                    console.log('Присоеденились к серверу');
                    break;
                case 'find-opponent':
                    console.log('Присоеденились к серверу, ищем оппонента')
                    break;
                case 'waitOpponent':
                    console.log('Ждем другого игрока')
                    break;
                case 'play':
                    console.log('Ваш ход!');
                    break;
                case 'win':
                    console.log('Игра завершена');
                    break;
            }
        },
        
        // Меняем имя и счет оппонента
        changeOpponent: function (model, opponent) {
            var $name = this.$opponent.find('.name')
              , $score = this.$opponent.find('.score');

            $name.text(opponent.name).textEffect();
            $score.text(opponent.score).textEffect();
        },
        
        // Меняем имя и счет игрока
        changePlayer: function () {
            var player = this.model.get('player')
              , $name = this.$player.find('.name')
              , $score = this.$player.find('.score')
              , $game = $('.game')
              , color = player.color? 'white' : 'black'
              , oldColor = player.color? 'black' : 'white';

            $name.text(player.name).textEffect();
            $score.text(player.score).textEffect();
            $game.removeClass(oldColor);
            $game.addClass(color);
        }
    });
    
    return Game;
});
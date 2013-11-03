function Player ( options ){
    
    var _name  = options.name   || 'player'
      , _score = options.score  || 0
      , _socket = options.socket || null;
    
    return {
        get name () {return _name;},
        set name (val) {_name = val;},
        get socket () {return _socket},
        get score () {return _score;}
    }
}

module.exports = Player; 
var conf = {
    // should be strict json.
    
    
    // server configurations
    "port" : process.env.C9_PORT || 81,
    
    // extensions
    "extList"               : ['ttt'],
    "extensions"            : {
                                "ttt"  : 'extensions/tictactoe.js'
                            },
                            
    // matchMaking settings
    "mm_tick_timer"         : 5000,

    // user settings
    "maximum_ticks_missed"  : 4,
    "tick_timer"            : 20000, //ms // logs user out after (missed-1)*timer miliseconds
    
    // room settings
    "room_maximum_ticks_missed"  : 4,
    "room_tick_timer"            : 20000 //ms // removes room after (missed-1)*timer miliseconds
    
}

exports.conf = conf;
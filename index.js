'use strict'

var mongoose = require('mongoose');
var port = 3300;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/Twitter', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(()=> {
    console.log('Conexión con la base de datos establecida');
    app.listen(port, ()=> {
        console.log('Servidor de express corriendo en el puerto', port);
    });
}).catch(err=>{
    console.log('Error al establecer conexión', err);
});
'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const key = 'TwitterJS'

exports.ensureAuth = (req, res, next) => {
    let params = req.body;
    let userInf = Object.values(params);
    let resp = userInf.toString().split(" ");

    if(!req.headers.authorization) {
        if(resp [0] === 'register') {
            next();
        }else if(resp [0] === 'login') {
            next();
        }else{
            return res.status(500).send({message: 'Debes estar logueado para acceder a la ruta especificada' + resp [0]});
        }        
    }else{
        var token = req.headers.authorization.replace(/["']+/g, '');
        try {
            var payload = jwt.decode(token, key, true);
            var idUser = payload.sub;
            module.exports.idUser = idUser;
            if(payload.exp <= moment().unix()) {
                return res.status(401).send({message: 'Token expirado'});
            }
        }catch(ex) {
            return res.status(404).send({message: 'Token invalido'});
        }
        req.user = payload;
        next();
    }
}
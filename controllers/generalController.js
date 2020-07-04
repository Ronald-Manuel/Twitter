'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/tweet.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var authenticated = require('../middlewares/authenticated');

function commands(req, res) {
    let user = new User();
    let tweet = new Tweet();
    let params = req.body;
    let userData = Object.values(params); 
    let resp = userData.toString().split(" ");


        if (resp[0] == 'register') {
            console.log(resp);
            if (resp[1] != null && resp[2] != null && resp[3] != null && resp[4] != null) {
                User.findOne({ $or: [{email: resp[2]}, {username: resp[3]}]}, (err, userFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (userFind) {
                        res.send({message: 'El correo u usuario ya está en uso'});
                    } else {
                        user.name = resp[1];
                        user.email = resp[2];
                        user.username = resp[3];
                        user.password = resp[4];

                        bcrypt.hash(resp[4], null, null, (err, hashPassword) => {
                            if (err) {
                                res.status(500).send({message: 'No se pudo encriptar'});
                            } else {
                                user.password = hashPassword;

                                user.save((err, userSaved) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (userSaved) {
                                        res.send({user: userSaved});
                                    } else {
                                        res.status(404).send({message: 'Error al guardar el usuario'});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({message: 'Porfavor, ingrese todos los datos'});
            }
        }


        if (resp[0] == 'login') {
            if (resp[1] != null && resp[2] != null) {
                User.findOne({$or: [{username: resp[1]}, {email: resp[1] }]}, (err, userFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (userFind) {
                        bcrypt.compare(resp[2], userFind.password, (err, checkPassword) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (checkPassword) {
                                if (resp[3] == 'true') {
                                    res.send({token: jwt.createToken(userFind)});
                                } else {
                                    res.send({user: userFind});
                                }
                            } else {
                                res.send({message: 'Contraseña incorrecta'});
                            }
                        });
                    } else {
                        res.send({message: 'Usuario no encontrado'});
                    }
                });
            } else {
                res.send({message: 'Porfavor, ingrese el usuario y la contraseña'});
            }
        }


        if (resp[0] == 'add_tweet') {
            if (resp[1] != null) {

                tweet.info = resp.join(' ');
                tweet.info = tweet.info.replace('add_tweet', '');
                tweet.info = tweet.info.replace(' ', '');

                tweet.save((err, tweetSaved) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (tweetSaved) {
                        res.send({tweet: tweetSaved});
                    } else {
                        res.status(404).send({message: 'Error al guardar el tweet'});
                    }
                });
            } else {
                res.send({message: 'Ingrese el contenido del tweet'});
            }
        }


        if (resp[0] == 'set_tweet') {
            if (resp[1] != null) {
                Tweet.findById(resp[1], (err, tweetFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (tweetFind) {
                        User.findByIdAndUpdate(resp[2], {$push: {tweets: resp[1]}}, {new: true}, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (userUpdated) {
                                res.send({user: userUpdated});
                            } else {
                                res.status(500).send({message: 'No se ha podido ingresar el tweet'});
                            }
                        });
                    } else {
                        res.send({message: 'Tweet no encontrado'});
                    }
                });
            } else {
                res.send({message: 'Ingrese el ID del tweet'});
            }
        }


        if (resp[0] == 'edit_tweet') {
            if (resp[1] != null) {
                if (resp[2] != null) {
                    tweet.info = resp.join(' ');
                    tweet.info = tweet.info.replace('edit_tweet', '');
                    tweet.info = tweet.info.replace(resp[1], '');
                    tweet.info = tweet.info.replace('  ', '');

                    var update = tweet.info;
                    
                    Tweet.findByIdAndUpdate(resp[1], {$set: {info: update}}, {new: true}, (err, tweetUpdated) => {
                        if (err) {
                            res.status(500).send({message: 'Error en el servidor'});
                        } else if (tweetUpdated) {
                            res.send({tweet: tweetUpdated});
                        } else {
                            res.status(404).send({message: 'Error al actualizar el tweet'});
                        }
                    });
                }else{
                    res.send({message: 'Ingrese la modificación del tweet'});
                }
            }else{
                res.send({message: 'Ingrese el ID del tweet'});
            }
        }

        if (resp[0] == 'delete_tweet') {
            if (resp[1] != null) {
                User.findByIdAndUpdate(authenticated.idUser, {$pull: {tweets: resp[1]}}, {new: true}, (err, deleted) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (deleted) {
                        Tweet.findByIdAndRemove(resp[1], (err, tweetFind) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            }else if(tweetFind) {
                                res.send({ user: deleted });
                            }else{
                                res.status(404).send({message: 'No se ha podido encontrar el tweet'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'No se ha podido eliminar el tweet'});
                    }
                });
            }else{
                res.send({message: 'Ingrese el ID del tweet que quiere eliminar'});
            }
        }


        if (resp[0] == 'view_tweets') {
            if (resp[1] != null) {
                User.findOne({username: {$regex: resp[1], $options: 'i'}}, (err, userFind) => {
                    if(err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    }else if(userFind) {
                        User.find({username: resp[1]}, {tweets: 1, _id: 0}, (err, tweets) => {
                            if(err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            }else{
                                Tweet.populate(tweets, {path: "tweets"}, (err, tweets) => {
                                    if(err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    }else if(tweets) {
                                        res.send({user: resp[1], tweets});
                                    }else{
                                        res.status(404).send({message: 'Error al mostrar los tweets'});
                                    }
                                });
                            }
                        });
                    }else{
                        res.send({message: 'Usuario no encontrado'});
                    }
                });
            }else{
                res.send({message: 'Ingrese el usuario para ver sus tweets'});
            }
        }


        if (resp[0] == 'follow') {
            if (resp[1] != null) {
                User.findOne({username: {$regex: resp[1], $options: 'i'}}, (err, userFind) => {
                    if(err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    }else if(userFind) {
                        User.findOneAndUpdate({username: resp[1]}, {$push:{followers: authenticated.idUser}}, {new: true}, (err, followed) => {
                            if(err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            }else if(followed) {
                                res.send({user: followed});
                            }else{
                                res.status(404).send({message: 'Error al tratar de seguir este usuario'});
                            }
                        });
                    }else{
                        res.send({message: 'Usuario no encontrado'});
                    }
                });
            }else{
                res.send({message: 'Ingrese el usuario que desee seguir'});
            }
        }


        if (resp[0] == 'unfollow') {
            if(resp[1] != null){
                User.findOne({username: {$regex: resp[1], $options: 'i'}}, (err, userFind)=>{
                    if(err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    }else if(userFind) { 
                                User.findOneAndUpdate({username: resp[1]}, {$pull:{followers: authenticated.idUser}}, {new:true}, (err, unfollow)=>{
                                    if(err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    }else if(unfollow) {
                                        res.send({message: 'Se ha dejado de seguir ' + resp[1]});
                                    }else{
                                        res.status(404).send({message: 'Error al dejar de seguir al usuario'});
                                    }
                                });
                    }else{
                        res.status(404).send({message: 'Usuario no encontrado'});
                    }
                });
            }else{
                res.send({message: 'Ingrese el usuario que desea dejar de seguir'});
            }
        }
}


module.exports = {
    commands
}
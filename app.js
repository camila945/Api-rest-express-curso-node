const debug = require('debug')('app:inicio');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
//middleware morgan como registro de logger
const morgan = require('morgan');
const Joi = require('@hapi/joi');
const { request } = require('express');
const app = express();

app.use(express.json());
//permite trabajar con formatos diferentes a Json
app.use(express.urlencoded({extend:true}));
//recursos u archivos estaticos
app.use(express.static('Public'));


//uso de middleware
//app.use(logger);

/* app.use(function(req, res, next) {
    console.log('Autenticando...');
    next();
});
 */



 //Configuracion de entornos
 console.log('Aplicacion:' + config.get('nombre'));
 console.log('BD server:' + config.get('configDB.host'));

 //Uso de middleware desde cero
 if(app.get('env') === 'development')
 {
    app.use(morgan('tiny'));
    //console.log('Morgan Habilitado');
    debug('Morgan esta habilitado');
 }

 //Trabajos con la base de datos
 debug('Conectando con la bd....');


const port = process.env.PORT || 3000;
const usuarios = [
    {id:1, nombre: 'camila'},
    {id:2, nombre: 'luz'},
    {id:3, nombre: 'karen'}
]
app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express prueba');
});

//API GET
app.get('/api/usuarios', (req,res)=> {
    res.send(usuarios);
});

//API GET POR ID
app.get('/api/usuarios/:id', (req,res)=>{
    let usuario = ExisteUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

//API POST 
app.post('/api/usuarios', (req,res)=>{

    //esquema definido para validar con modulo joi
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    //Como usar este esquema
    const {error, value } = ValidarUsuario(req.body.nombre);
    if(!error)
    {
        const usuario = {
            id : usuarios.length + 1,
            nombre: value.nombre
        };
    
        usuarios.push(usuario);
        res.send(usuario);
    }
    else
    {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
  

    //Validaciones sencillas sin modulo
   /*  if(!req.body.nombre || req.body.nombre.length <= 2)
    {
        //error 400
        res.status(400).send('Debe Ingresar un nombre, ingrese nombre con minimo 3 letras ')
    }
    const usuario = {
        id : usuarios.length + 1,
        nombre: req.body.nombre
    };

    usuarios.push(usuario);
    res.send(usuario); */
});


//API PUT
app.put('/api/usuarios/:id', (req,res)=>{
    //Encontrar si existe el objeto usuario que voy a modificar
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = ExisteUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 
    //Como usar este esquema
    const {error, value } = ValidarUsuario(req.body.nombre);
    if(error)
    {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    
    usuario.nombre = value.nombre;
    res.send(usuario);
    
});

app.delete('/api/usuarios/:id',(req, res) => {
    let usuario = ExisteUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    //encuentra el indice del usuario a eliminar
    const index = usuarios.indexOf(usuario);
    //elimina indice
    usuarios.splice(index,1);

    res.send(usuario);
});

app.listen(port,()=>{
    console.log(`Escuchando desde el puerto ${port}...`);
});
/* app.post();
app.put();
app.delete(); */

function ExisteUsuario(id) {
    return(usuarios.find(u => u.id === parseInt(id)));
}

function ValidarUsuario(nombre) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({nombre: nombre}));
}
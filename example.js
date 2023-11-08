const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

const request=require('request');
const Telegrambot=require('node-telegram-bot-api');
const token = '5810150538:AAHSGOFRMd5-h1ExwhHa-CbFQUFC9zVvL8Y';

const bot=new Telegrambot(token,{polling:true});

var serviceAccount = require("./index.json");

initializeApp({
  credential: cert(serviceAccount)
});
const db=getFirestore();

bot.on('message',function(msg){
  if (msg.text === 'history') {
    db.collection("places").where('userId', '==', msg.from.id).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        bot.sendMessage(msg.chat.id, JSON.stringify(doc.data()));
      });
    });
  }
  
  else{
    request('http://api.weatherapi.com/v1/forecast.json?key=1eb303fa6fb843c3b06104706230106&q='+msg.text+'&days=7',function(err,response,body){
        if("error" in JSON.parse(body)){
            if((JSON.parse(body).error.code.toString()).length>0){
              bot.sendMessage(msg.chat.id,"Error"+JSON.parse(body).error.message)
            }
        }
          else{ 
            bot.sendMessage(msg.chat.id,"Location :"+JSON.parse(body).location.name)
            bot.sendMessage(msg.chat.id,"Region :"+JSON.parse(body).location.region)
            bot.sendMessage(msg.chat.id,"latitude :"+JSON.parse(body).location.lat)
            bot.sendMessage(msg.chat.id,"longitude :"+JSON.parse(body).location.lon)
            bot.sendMessage(msg.chat.id,"Country :"+JSON.parse(body).location.country)
            bot.sendMessage(msg.chat.id,"last update time :"+JSON.parse(body).current.last_updated)
            bot.sendMessage(msg.chat.id,"In celsius :"+JSON.parse(body).current.temp_c)
            bot.sendMessage(msg.chat.id,"In Fahrenheit: "+JSON.parse(body).current.temp_f)
            bot.sendMessage(msg.chat.id,"wind speed : "+JSON.parse(body).current.wind_kph)
          }
          
          db.collection("weatherReport").add({
            Country :JSON.parse(body).location.country,
            Location:JSON.parse(body).location.name,
            Region :JSON.parse(body).location.region,
            latitude :JSON.parse(body).location.lat,
            longitude :JSON.parse(body).location.lon,
            lastupdatetime :JSON.parse(body).current.last_updated,
            Incelsius :JSON.parse(body).current.temp_c,
            InFahrenheit:JSON.parse(body).current.temp_f,
            windspeed :JSON.parse(body).current.wind_kph
          })
          db.collection("places").add({
            Name: msg,
            userId:msg.from.id
          })

    });
  }
});

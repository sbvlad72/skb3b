import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import _ from 'lodash';


const app = express();
app.use(bodyParser.json());
app.use(cors());

// импорт модели Pets
const urlModel = 'https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json';
let modelPets = {};
getModel(urlModel);
//fetch(urlModel)
//  .then(async (res) => {
//    modelPets = await res.json();
//  })
//  .catch(err => {
//    console.log('ошибка чтения модели:', err);
//    return {'error': 'ошибка чтения модели:' + err};
//  });
console.log('modelPets = ', modelPets);

app.get(/^\/users.*\/populate/, async (req, res) => {
  console.log('users populate  req.path= ' + req.path);
    let arrKey = req.path.slice(1).split(/\//);
    let resp = [];
    let filteredPets = {};
    let findKey;
    let cntParam = 0;
    let cntValidParam = 0;
    const workingKey = 'havePet=id=username=';
    let needObj = false;
    let respU = [];
  try {
    console.log('arrKey.length=', arrKey.length, arrKey);
    switch (arrKey.length) {
      case 1: // вернуть всех юзеров
        throw 'Not Found';
        break;
      case 3: // вернуть pets'a c вложенным user'om
        findKey = getKeyName(arrKey[1]);
        console.log('case 2 findKey=', arrKey[1], findKey);
        req.query[findKey] = arrKey[1];
        needObj = true;
      case 2: // вернуть users'ov c вложенными pet'ami
        for ( let key in req.query ) {
          console.log('key=', key);
          if ( workingKey.indexOf(key) >= 0 ) {
            if (key == 'havePet') {
              filteredPets = getItemsOnFilter(modelPets['pets'], 'type', req.query[key]);
              filteredPets = _.uniqBy(filteredPets, pet => pet.userId);
              filteredPets = _.sortBy(filteredPets, pet => pet.userId);
              console.log('filteredPets=', filteredPets);
              for ( let key1 in filteredPets ) {
                console.log('key1=', key1, filteredPets[key1]['userId']);
                //ind = (resp.length == undefined) ? 0 : resp.length;
                console.log('ind=', resp.length );
                resp[resp.length] = getItemModel(modelPets[arrKey[0]], 'id', filteredPets[key1]['userId']);
              };

            } else {
              resp.push(getItemModel(modelPets[arrKey[0]], key, req.query[key]));
            }
            cntValidParam++;
          };
          cntParam++;
        };
        console.log('cntParam=', cntParam);
        //console.log('modelPets[arrKey[0]]=', modelPets[arrKey[0]]);
        if ( cntParam == 0 ) {
          resp = modelPets[arrKey[0]];
        };
        //console.log('resp=', resp);
        if ( cntParam > 0 && cntValidParam == 0) {
          throw 'Not Found';
        };
        //добавим pets'ов в модель
        let popU = {};
        for ( let key2 in resp ) {
          //filteredPets = getItemsOnFilter(modelPets['pets'], 'userId', resp[key]['id']);
          filteredPets = getItemsOnFilter(modelPets['pets'], 'userId', resp[key2]['id']);
          //popU = resp[key2];
          popU = {};
          for (let ik in resp[key2]) {
            popU[ik] = resp[key2][ik];
          };
          popU['pets'] = filteredPets;
          //console.log('popU=', popU);
          //respU[respU.length] = popU;
          respU.push(popU);
          //console.log('respU=', respU);
        };
        //console.log('modelPets=', modelPets);
        break;
    };
    if (needObj) {
      res.status(200).json(respU[0]);
    } else {
      res.status(200).json(respU);
    };
  } catch (err) {
    return res.status(404).send(err);
  }
    //console.log(resp);
});


app.get(/^\/pets.*\/populate/, async (req, res) => {
  console.log('pets populate  req.path= ' + req.path);
    //let cModel = modelPets.slice(0);
    let arrKey = req.path.slice(1).split(/\//);
    let resp = [];
    let filteredPets = {};
    let findKey;
    let cntParam = 0;
    let cntValidParam = 0;
    const workingKey = 'type=age_lt=age_gt=id=';
    let needObj = false;
    let respP = [];
  try {
    console.log('arrKey.length=', arrKey.length, arrKey);
    switch (arrKey.length) {
      case 1: // вернуть всех юзеров
        throw 'Not Found';
        break;
      case 3: // вернуть pets'a c вложенным user'om
        findKey = getKeyName(arrKey[1]);
        console.log('case 2 findKey=', arrKey[1], findKey);
        if ( findKey !== 'id' ) {
          throw 'Not Found';
        };
        req.query[findKey] = arrKey[1];
        needObj = true;
      case 2: // вернуть pets'ov c вложенным user'om
        resp = modelPets[arrKey[0]];
        for ( let key in req.query ) {
          if ( workingKey.indexOf(key) >= 0 ) {
            resp = getItemsOnFilter(resp, key, req.query[key]);
            cntValidParam++;
          };
          cntParam++;
        };
        if ( cntParam > 0 && cntValidParam == 0) {
          throw 'Not Found';
        };
        //добавим юзеров в модель
        let popP = {};
        for ( let key1 in resp ) {
          popP = {};
          for (let ik in resp[key1]) {
            popP[ik] = resp[key1][ik];
          };
          popP['user'] = getItemModel(modelPets['users'], 'id', resp[key1]['userId']);
          //console.log('popP=', popP);
          //respP[respP.length] = popP;
          respP.push(popP);
          //console.log('respP=', respP);
        };
        //console.log('modelPets=', modelPets);
        break;
    };
    if (needObj) {
      res.status(200).json(respP[0]);
    } else {
      //const sortResp = _.sortBy(respP, pet => pet.id);
      res.status(200).json(respP);
    };
  } catch (err) {
    return res.status(404).send(err);
  }
    //console.log(resp);
});


app.get(/^\/users/, async (req, res) => {
  console.log('users  req.path= ' + req.path);
    let arrKey = req.path.slice(1).split(/\//);
    let resp = [];
    let filteredPets = {};
    let findKey;
    let cntParam = 0;
    let cntValidParam = 0;
    const workingKey = 'havePet=';
    let ind;
  try {
    console.log('arrKey.length=', arrKey.length, arrKey);
    switch (arrKey.length) {
      case 1: // вернуть всех юзеров
        for ( let key in req.query ) {
          if ( workingKey.indexOf(key) >= 0 ) {
            console.log('key=', key, req.query[key]);
            filteredPets = getItemsOnFilter(modelPets['pets'], 'type', req.query[key]);
            cntValidParam++;
            console.log('filteredPets=', filteredPets);
            for ( let key1 in filteredPets ) {
              console.log('key1=', key1, filteredPets[key1]['userId']);
              //ind = (resp.length == undefined) ? 0 : resp.length;
              console.log('ind=', resp.length );
              resp[resp.length] = getItemModel(modelPets[arrKey[0]], 'id', filteredPets[key1]['userId']);
            };
          };
          cntParam++;
        };
        if ( cntParam == 0 ) {
          resp = modelPets[arrKey[0]];
        };
        resp = _.uniqBy(resp, user => user.id);
        resp = _.sortBy(resp, user => user.id);
        break;
      case 2: // вернуть пользователя по id или username
        //resp = {};
        findKey = getKeyName(arrKey[1]);
        console.log('case 2 findKey=', arrKey[1], findKey);
        resp = getItemModel(modelPets[arrKey[0]], findKey, arrKey[1])
        //return res.status(200).json(resp);
        break;
      case 3: // вернуть всех pets'ов пользователя по id или username
        findKey = getKeyName(arrKey[1]);
        console.log('1case 3 findKey=', arrKey[1], findKey);
        if ( findKey == 'username') {
          arrKey[1] = getItemModel(modelPets[arrKey[0]], findKey, arrKey[1])['id'];
        };
        console.log('2case 3 findKey=', arrKey[1], arrKey[2]);
        resp = getItemsOnFilter(modelPets[arrKey[2]], 'userId', arrKey[1])
        //return res.status(200).json(resp);
        break;
    };
    res.status(200).json(resp);
  } catch (err) {
    return res.status(404).send(err);
  }
    //console.log(resp);
});

app.get(/^\/pets/, async (req, res) => {
  console.log('pets  req.params= ', req.params);
  console.log('pets  req.query= ', req.query.length, req.query);
  console.log('pets  req.query[0]= ', req.query['type']);
    let arrKey = req.path.slice(1).split(/\//);
    let resp = {};
    let findKey;
    let cntParam = 0;
    let cntValidParam = 0;
    const workingKey = 'type=age_lt=age_gt=';
  try {
    console.log('arrKey.length=', arrKey.length, arrKey);
    switch (arrKey.length) {
      case 1: // вернуть всех юзеров
        resp = modelPets[arrKey[0]];
        for ( let key in req.query ) {
          if ( workingKey.indexOf(key) >= 0 ) {
            resp = getItemsOnFilter(resp, key, req.query[key]);
            cntValidParam++;
          };
          cntParam++;
        };
        if ( cntParam > 0 && cntValidParam == 0) {
          throw 'Not Found';
        };
        break;
      case 2: // вернуть пользователя по id или username
        findKey = getKeyName(arrKey[1]);
        console.log('case 2 findKey=', arrKey[1], findKey);
        if ( findKey !== 'id' ) {
          throw 'Not Found';
        };
        resp = getItemModel(modelPets[arrKey[0]], findKey, arrKey[1])
        //return res.status(200).json(resp);
        break;
    };
    res.status(200).json(resp);
  } catch (err) {
    return res.status(404).send(err);
  }
    //console.log(resp);
});


//app.get(/(\/)|(^users)|(^pets)/, async (req, res) => {
app.get('/', async (req, res) => {
  console.log('root req.path= ' + req.path);
  res.status(200).json(modelPets);
});

app.get(/\/.*/, async (req, res) => {
  console.log('root req.path= ' + req.path);
  return res.status(404).send('Not Found');
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

// импорт модели Pets
function getModel(urlModel) {
  fetch(urlModel)
    .then(async (res) => {
      modelPets = await res.json();
      modelPets.freeze;
  })
  .catch(err => {
    console.log('ошибка чтения модели:', err);
    modelPets = {'error': 'ошибка чтения модели:' + err};
  });
};

//получить имя ключа для поиска
function getKeyName(value) {
  if ( isNaN(value) ){
    // следующий ключ строка - пришло наименование
    return 'username';
  };
  return 'id';
};

//получить объект из массива по имени ключа=nameKey и значению=value
function getItemModel(items, nameKey, value) {
  let item;
  for (let i in items) {
    item = items[i];
    if ( item[nameKey] == value ) {
      return item;
    };
  };
  throw 'Not Found';
};

//получить массив объектов из массива по имени ключа=nameKey и значению=value
function getItemsOnFilter(items, nameKey, value) {
  let item;
  let retItems = [];
  //console.log('getArrItemsOnKey items=', items);
  let arrNameKey = nameKey.split(/_/);
  for (let i in items) {
    item = items[i];
    //console.log('getArrItemsOnKey i=', i, nameKey, item[nameKey], value);
    if ( (arrNameKey.length == 1 && item[arrNameKey[0]] == value) ||
         (arrNameKey[1] == 'lt' && item[arrNameKey[0]] < value) ||
         (arrNameKey[1] == 'gt' && item[arrNameKey[0]] > value) ) {
      retItems[retItems.length] = item;
    };
  };
  //if ( retItems.length > 0 ) {
    return retItems;
  //};
  //throw 'Not Found';
};

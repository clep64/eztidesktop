import {  msgBox } from './src/commonFunc.js';
import { fetchGetJson} from './src/fetchFunc.js'; 
import { readTextFile, writeTextFile, exists  } from '@tauri-apps/api/fs';
import { resolveResource } from '@tauri-apps/api/path';
import './src/ezti.js';
import { engine } from './src/engine';
import { setUserId } from './src/context.js';
/*
//const remoteUrl = 'https://clep.hd.free.fr/coders/wp-content/plugins/ezti-booking/';
const remoteUrl = 'https://eztitasuna.fr/wp-content/plugins/ezti-booking/';
window.pluginUrl = './';
window.phpUrl = `${remoteUrl}php/`;
window.configUrl = `${remoteUrl}admin/config.json`;
window.wpParm = {programme: 'non', mode: 'desktop'};
window.userField = '';
*/

let resourceidjson;
let idList; 

firstTime();

//====================================================================================
//
async function firstTime() {
  
//  initialize the first page  (LOGIN)
  document.getElementById("usrconn").innerHTML = "Vous n'êtes pas encore identifié";  
  document.getElementById("menuside").style.display = 'none';    
  const divmain = document.getElementById("divmain");
  divmain.innerHTML = '';
  const h2 = document.createElement("h2");
  h2.innerText = "Bienvenue sur la Pré-inscriptions aux activités";
  divmain.appendChild(h2);
  
  let p3 = document.createElement("p");
  p3.innerText = "Pour vous identifier, cliquer un nom dans la liste ou saisir votre identifiant FFRS"; 
  p3.className = "maintitle" 
  divmain.appendChild(p3);

  // if users in the id.json file display them 
  // if one of the id is clicked the program continue
  resourceidjson = await resolveResource('id.json');
  idList = await readIdjson(); 
  if (idList) { 
    crIdButtons(idList);
  }

  // display form to get a new id
  // if an id is input the program continue and
  // stores the id for next connections
  let userId = null;
  formId();
  
  // id:
  // nom: window.userFields.nom,
  // prenom: window.userFields.prenom,
  // mail: window.userFields.mail,
  // tel: window.userFields.tel,
  // saison: window.userFields.saison,
  // ffrs: window.userFields.ffrs,
  // codeChecked: false,
  // grpcode: '',
  // grpManager: false,
  
} 
//====================================================================================
async function readIdjson()  {
  let reponse;
  try { 
    reponse = await readTextFile(resourceidjson);
  } catch (e) {
    console.log(e);
  }
  if (reponse) {
    return JSON.parse(reponse);
  } else {
    return [];
  }
       
}
//====================================================================================
async function storeIdjson(data) {  
  try {
    await writeTextFile(resourceidjson, JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}
//====================================================================================
async function crIdButtons(idList) { 
  idList.forEach(element => {
    const but = document.createElement("p");
    but.innerText = `${element.id} ${element.prenom} ${element.nom}`; 
    but.className = "butidlist";
    const id =  element.id;
    but.addEventListener('click', async () => {
      const isOK = await checkinIsOK(id)      
    });
    divmain.appendChild(but);
  }); 
  

}
//====================================================================================
async function checkinIsOK(userId) {   
  const userField = await fetchGetJson(
    `${window.phpUrl}checkin.php?ffrs=${userId.toUpperCase()}`
  );
  if (userField.length === 0) { 
    msgBox('!!! id not OK !!!'); 
    return false; 
  }
  setUserId(userField[0]);
  // import('./src/ezti.js');
  engine();
  return true;
}
//====================================================================================
async function formId() {  
    const f = document.createElement('form'); // create form
    f.className = 'formContainer';
    f.onsubmit = async function (e) { //  function executed when submit button clicked
      e.preventDefault();
      const codeRaw = document.getElementById('i1id').value; //  get the text which has been input
      let code = codeRaw.trim().toUpperCase();     
      if (await checkinIsOK(code)) {
        const found = idList.find(element => element.id === code);  
        if (!found) {
          const newList = idList.concat([
            {"id":window.userFields.ffrs, prenom:window.userFields.prenom, nom:window.userFields.nom}
          ]);
          storeIdjson(newList);
        }
      }
    }; 
    // add label
    const label = document.createElement('label');
    label.textContent = 'identification : '
    label.style.width = '9em';
    f.appendChild(label);
    // add the input area
    const i1 = document.createElement('input');
    i1.setAttribute('type', 'text');
    i1.name = 'saisie';
    i1.style.width = '7em';
    i1.id = 'i1id';
    f.appendChild(i1);
    // add Submit button
    const s = document.createElement('button'); 
    s.setAttribute('type', 'submit');
    s.innerHTML = 'envoi';
    f.appendChild(s);
    divmain.appendChild(f);
}
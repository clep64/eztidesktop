import {  inputOne } from './src/commonFunc.js';
import { fetchGetJson} from './src/fetchFunc.js'; 
//import './ezti.js';

window.pluginUrl = './';
window.phpUrl = 'https://clep.hd.free.fr/coders/wp-content/plugins/ezti-booking/php/';
window.configUrl = 'https://clep.hd.free.fr/coders/wp-content/plugins/ezti-booking/admin/config.json'
window.wpParm = {programme: 'non', mode: 'desktop'};
window.userField = '';

firstTime();

//====================================================================================
//
async function firstTime() {
//console.log("entering firstTime");


  
//  initialize the first page
  
  document.getElementById("usrconn").innerHTML = "Vous n'êtes pas encore identifié";  
  document.getElementById("menuside").style.display = 'none';    
  let divmain = document.getElementById("divmain");
  divmain.innerHTML = '';
  let h2 = document.createElement("h2");
  h2.innerText = "Bienvenue sur la Pré-inscriptions aux activités";
  divmain.appendChild(h2);
  
  let p3 = document.createElement("p");
  p3.innerText = "merci de vous identifier"; 
  p3.className = "maintitle" 
  divmain.appendChild(p3);

  let userId = null;  
  while (!userId) {
    userId = await inputOne("identifiant");   
  }
  const userField = await fetchGetJson(
    `${window.phpUrl}checkin.php?ffrs=${userId.toUpperCase()}`
  );    
  window.userFields = {...userField[0]};
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

  import('./src/ezti.js');
} 
  

//====================================================================================


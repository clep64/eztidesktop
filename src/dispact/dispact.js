import './dispact.css';
import {
  spinner, clearNodeChildren,
  // msgBox, clearMsgBox,
} from '../commonFunc';
import * as context from '../context';
import { setHeader } from '../header/header';
import { getConfig } from '../config';

async function dispAct(handleActClicked, headerIcon, actList) {
/*
   display the activities to be cliked on
*/
  const conf = getConfig();
  const user = context.getUser();

  // clear spinner and msgBox if any
  spinner(false);
  // clearMsgBox();
  // await msgBox(`largeur : ${window.innerWidth} hauteur : ${window.innerHeight}`);
  //  set the header and the buttons
  setHeader('Activités', headerIcon);

  //     clear maindiv
  const divmain = clearNodeChildren('#divmain');

  //     some text to welcome people
  const h2 = document.createElement('p');
  h2.style.margin = '0 15px';
  let h2Content = `Bonjour ${user.prenom}, <br>`;
  if (conf.checkTelMail) {
    const telFormat = user.tel.match(/.{2}/g).join(' ');
    if (context.isPortrait()) {
      h2Content = `${h2Content}Merci de vérifier si vos mail et tel sont corrects<br>`
                    + `mail: ${user.mail} <br> tel: ${telFormat}<br>`;
    } else {
      h2Content = `${h2Content}Merci de vérifier si vos mail et tel sont corrects<br>`
                    + `mail: ${user.mail} &nbsp tel: ${telFormat}<br>`;
    }
  }
  h2Content += '<br>Pour voir les différents groupes cliquer sur l\'activité à gauche<br>';
  h2Content += '<br>Si vous avez besoin d\'aide sur le fonctionnement de ce programme, '
              + 'cliquer sur aide en haut <br>'
              + 'Vous pourrez continuer à utiliser le programme dans un onglet '
              + 'et l\'aide en parallele dans un autre.';
  h2.innerHTML = h2Content;
  divmain.appendChild(h2);

  // populate and display side menu with activities

  //  clear side menu + make it visible
  const sideMenu = document.querySelector('#menuside');
  sideMenu.style.display = 'block';
  clearNodeChildren(sideMenu);

  // fill side menu
  actList.forEach((elem) => {
    const bout = document.createElement('button');
    bout.innerText = elem.actdesc;
    bout.className = 'bouton';
    bout.style.cssText += 'width:95%;border-radius: 20px;margin-bottom: 0.5em;';
    bout.onclick = () => {
      handleActClicked(elem);
    };
    sideMenu.appendChild(bout);
  });
  /*
  // display size of the window
  // to get the message whatever the breakpoint change context.isportrait
  clearMsgBox();
  context.isPortrait();
  const hauteur = window.innerHeight;
  const largeur = window.innerWidth;
  const sens = (hauteur > largeur) ? 'portrait' : 'paysage';
  msgBox(`sens = ${sens} <br>hauteur = ${hauteur} px<br>largeur = ${largeur} px`);
  */
}
export { dispAct };

// ====================================================================================

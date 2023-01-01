import {
  clearMsgBox, spinner, clearNodeChildren, dateReverse,
  msgBox,
} from '../commonFunc';
import * as context from '../context';
import { setHeader } from '../header/header';
import './planning.css';

export function planning(callback, $titre, headerIcon, data) {
  /*  display all the sessions received in data
      the context for the activity must have been loaded
      parm received in data :
        list of sessions,
        list of groups with detailed info,
        and if the list of sessions is covering only one group
          parm giving if user is the group manager
      callback is a list of handlers for clicks on button
  */

  // clear spinner and msgBox if any
  spinner(false);
  clearMsgBox();

  //  set the header and the buttons
  setHeader($titre, headerIcon);

  //  clear maindiv
  const divmain = clearNodeChildren('#divmain');

  // add a button to expand all sessions at once
  const butTitre = document.createElement('button');
  butTitre.textContent = 'Moins';
  butTitre.id = 'butexpand';
  // butTitre.style.float = 'right';
  butTitre.style.color = 'white';
  butTitre.style.marginTop = '+0.2em';
  butTitre.title = 'montrer/cacher les détails';
  butTitre.onclick = (() => { butTitre.textContent = expandFromTitre('toggleClass', butTitre); });
  document.querySelector('#topbuttonspan').appendChild(butTitre);
  /*
     if the user is the group manager
     create 3 buttons to :
        create a  new session
        change group access code
        create deputy
  */
  if (data.mngr) {
    // const pmng = document.createElement('p');
    if (!document.getElementById('newsessbutton')) {
      const boutNewSess = document.createElement('button');
      boutNewSess.textContent = 'créer session';
      boutNewSess.setAttribute('style', 'width:6.3em');
      boutNewSess.id = 'newsessbutton';
      boutNewSess.addEventListener('click', () => { callback.newSession(); });
      document.getElementById('divmain').appendChild(boutNewSess);
    }

    if (!document.getElementById('newcodebutton')) {
      const boutNewCode = document.createElement('button');
      boutNewCode.textContent = 'changer code';
      boutNewCode.setAttribute('style', 'width:6.6em');
      boutNewCode.id = 'newcodebutton';
      boutNewCode.addEventListener('click', () => {
        const { grpcode } = context.getCurGrp();
        callback.newCode(grpcode);
      });
      document.getElementById('divmain').appendChild(boutNewCode);
    }

    if (!document.getElementById('deputybutton')) {
      const deputyButton = document.createElement('button');
      deputyButton.textContent = 'gérer délégation';
      deputyButton.setAttribute('style', 'width:7.8em');
      deputyButton.id = 'deputybutton';
      deputyButton.addEventListener('click', () => {
        callback.handleDeputy();
      });
      document.getElementById('divmain').appendChild(deputyButton);
    }
  }

  //  display sessions
  if (data.sessList.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Aucune Session programmée pour le moment';
    divmain.appendChild(p);
    return;
  }
  // display the list of sessions
  let previousDate = '';

  data.sessList.forEach((session) => {
    const grp = data.groupList.filter((grpObj) => session.sessgrp === grpObj.grpid)[0];
    const datsess = dateReverse('display', session.sessdate);

    // display date only when it changes
    if (datsess !== previousDate) {
      const dayName = new Date(session.sessdate).toLocaleString('fr', { weekday: 'long' });
      // const divDate = document.createElement('div');
      const pDate = document.createElement('p');
      pDate.style.textAlign = 'left';
      pDate.style.margin = '1em 0 0.3em 5em';
      pDate.innerHTML = `<span style='font-weight:bold;font-size:1.1em;'>
      ${dayName} ${datsess}</span>`;
      document.getElementById('divmain').appendChild(pDate);
      previousDate = datsess;
    }

    const divsess = document.createElement('div');
    const psess = document.createElement('p');
    psess.style.textAlign = 'left';
    psess.style.marginBottom = '1em';
    psess.style.backgroundColor = '#aed581';
    psess.style.padding = '0 0 0 10px';
    const telFormat = grp.grpresptel.match(/.{2}/g).join(' ');
    psess.innerHTML = `${grp.grpdesc} <br /> `;

    if (session.sesslink) {
      const linkLieu = document.createElement('a');
      linkLieu.textContent = `${session.sesslieu}`;
      linkLieu.setAttribute('href', session.sesslink);
      linkLieu.setAttribute('target', '_blank');
      psess.appendChild(linkLieu);
    } else {
      psess.innerHTML += `${session.sesslieu}`;
    }
    psess.insertAdjacentHTML(
      'beforeend',
      `<br />avec ${grp.grprespprenom} ${grp.grprespnom} - ${telFormat}`,
    );
    divsess.appendChild(psess);

    const detail = document.createElement('p');
    detail.insertAdjacentHTML('afterbegin', `départ ${session.sessrdv}`);
    if (session.sessinfo) {
      detail.insertAdjacentHTML('beforeend', `<br>${session.sessinfo}`);
    }
    /*
    // to display a link if it is not set at lieu level
    if (session.sesslink) {
      detail.insertAdjacentHTML('beforeend', '<br>Lien vers site externe cliquer : ');
      const link = document.createElement('a');
      link.setAttribute('href', session.sesslink);
      link.setAttribute('target', '_blank');
      link.style.fontWeight = 'bold';
      link.textContent = 'ICI';
      detail.appendChild(link);
    }
    */
    detail.style.display = 'block';
    detail.className = 'toggleClass';
    detail.style.textAlign = 'left';
    detail.style.padding = '0 0 0 10px';
    detail.style.marginTop = '-1em';
    detail.style.backgroundColor = '#FFFACD';

    //  si l'utilisateur est connecté créer un bouton d'inscription
    if (context.userId.id !== '0') {
      const butIns = document.createElement('button');
      butIns.className = 'butins';
      butIns.textContent = 'inscription';
      butIns.style.fontSize = '0.7em';
      butIns.style.float = 'right';
      butIns.style.color = 'white';
      if (session.sessinscrit !== '0') {
        butIns.style.backgroundColor = '#cb410b';
        butIns.textContent = 'Déjà inscrit';
      }
      butIns.addEventListener('click', () => {
        callback.handleSessClicked(session);
      });
      detail.appendChild(butIns);
    }

    // if group manager add a button for modification
    if (data.mngr) {
      const butMod = document.createElement('button');
      butMod.className = 'butmod';
      butMod.textContent = 'modif session';
      butMod.style.fontSize = '0.7em';
      butMod.style.float = 'right';
      butMod.style.color = 'white';
      butMod.addEventListener('click', () => {
        callback.handleModSessClicked(session);
      });
      detail.appendChild(butMod);
    }

    // then append session to the dom
    divsess.appendChild(detail);
    document.getElementById('divmain').appendChild(divsess);
  });
}

// ============================================================================

function expandFromTitre(toggleClass, button) {
  // classname is the class of the elements to show/hide
  // button is the button to click to get show/hide
  // return the text of the button when toggled
  const detailList = document.getElementsByClassName(toggleClass);
  if (button.textContent === 'Plus') {
    [...detailList].forEach((det, index) => { detailList[index].style.display = 'block'; });
    return 'Moins';
  }
  [...detailList].forEach((det, index) => { detailList[index].style.display = 'none'; });
  return 'Plus';
}

// ============================================================================

export function sessDisplay(callback, headerIcon) {
  /*
      display a session + the list of subscribers
      Receive the handler for subscription/unsubscription button
      and the icon to put in the header
      the current session must be set
  */
  // clear spinner and msgBox if any
  spinner(false);
  const session = context.getCurSession();

  //  set the header and the buttons
  const datsess = dateReverse('display', session.sessdate);
  setHeader(`Session du ${datsess}`, headerIcon);

  //  clear maindiv
  const divmain = clearNodeChildren('#divmain');
  const node = []; // array of node to append

  //  session  title
  const h3 = document.createElement('h3');
  const date = dateReverse('display', session.sessdate);
  h3.textContent = `${date} - sortie : ${session.sesslieu} `;
  node.push(h3); // push element for later append

  // display appointment
  const p2 = document.createElement('p');
  p2.textContent = `- rdv : ${session.sessrdv}`;
  p2.classList.add('soustitre');
  p2.style = 'font-weight: bold';
  node.push(p2);

  // display additional info if any
  if (session.sessinfo) {
    const info = document.createElement('p');
    info.innerHTML = session.sessinfo;
    node.push(info);
  }

  // display link if any
  if (session.sesslink) {
    const linklabel = document.createElement('p');
    linklabel.innerHTML = 'lien vers site externe cliquer : ';
    const link = document.createElement('a');
    link.setAttribute('href', session.sesslink);
    link.setAttribute('target', '_blank');
    link.textContent = 'ICI';
    linklabel.appendChild(link);
    node.push(linklabel);
  }

  // create button  session management
  // if the user is the group manager
  // this button open submenu
  if (context.userId.grpManager) {
    const bout3 = document.createElement('p');
    bout3.textContent = 'gestion session';
    bout3.className = 'bouton menuderoulparent';
    bout3.style.display = 'inline-block';
    node.push(bout3);

    const ul = document.createElement('ul');
    ul.className = 'menuderoul';

    // create first submenu (download)
    const li1 = document.createElement('li');
    const libout1 = document.createElement('button');
    libout1.textContent = 'télécharger';
    libout1.className = 'bouton gestionsess';
    libout1.addEventListener('click', () => { callback.sessDownload(session); });
    li1.appendChild(libout1);
    ul.appendChild(li1);

    // create second submenu (modify session)
    const li2 = document.createElement('li');
    const libout2 = document.createElement('button');
    libout2.textContent = 'modifier';
    libout2.className = 'bouton gestionsess';
    libout2.addEventListener('click', () => { callback.sessModif(session); });
    li2.appendChild(libout2);
    ul.appendChild(li2);

    // create third submenu (delete session)
    const li3 = document.createElement('li');
    const libout3 = document.createElement('button');
    libout3.textContent = 'supprimer';
    libout3.className = 'bouton gestionsess';
    libout3.addEventListener('click', () => { callback.sessDelete(session); });
    li3.appendChild(libout3);
    ul.appendChild(li3);

    // create fourth submenu (send mail to registered people)
    const li4 = document.createElement('li');
    const libout4 = document.createElement('button');
    libout4.textContent = 'envoi mail';
    libout4.className = 'bouton gestionsess';
    libout4.addEventListener('click', () => { callback.sendmail(session); });
    li4.appendChild(libout4);
    ul.appendChild(li4);
    bout3.appendChild(ul);
  }
  // create button subscribe/unsbscibe
  const bout = document.createElement('button');
  bout.className = 'bouton';
  // check whether the user is already registered
  if (session.inscrit.some((user) => user.usrid === context.userId.id)) {
    bout.textContent = 'se désinscrire';
    bout.addEventListener('click', () => { callback.handleSubscribe(false, session); });
  } else {
    bout.textContent = "s'inscrire";
    bout.addEventListener('click', () => { callback.handleSubscribe(true, session); });
  }
  node.push(bout);
  divmain.append(...node);
  node.length = 0;

  //  create list of people for this session
  if (session.inscrit.length === 0) {
    const pno = document.createElement('p');
    pno.innerHTML = " pas d'inscrit pour cette session";
    divmain.appendChild(pno);
  } else {
    const tab = document.createElement('table');
    tab.id = 'tabinscrit';
    document.getElementById('divmain').appendChild(tab);
    let i = 0;
    for (const y of session.inscrit) {
      i += 1; // insert a line number for each user
      const nline = tab.insertRow(-1);
      const insNumber = nline.insertCell(-1);
      insNumber.innerHTML = i.toString();

      const usrnom = nline.insertCell(-1);
      usrnom.innerHTML = y.usrnom;
      if (context.userId.grpManager) {
        usrnom.addEventListener('click', () => { callback.unsubscribeByMng(session, y); });
      }

      const usrprenom = nline.insertCell(-1);
      usrprenom.innerHTML = y.usrprenom;
      const usrvoiture = nline.insertCell(-1);
      usrvoiture.innerHTML = (y.usrvoiture === '0') ? '' : 'voiture';

      // prepare date time of registering
      let lt;
      if (y.usrtime) {
        const utcdate = `${y.usrtime.replace(' ', 'T')}.000Z`;
        const d = new Date(utcdate);
        lt = `${(`0${d.getDate()}`).slice(-2)}/${
          (`0${d.getMonth() + 1}`).slice(-2)}/${
          d.getFullYear()} ${
          (`0${d.getHours()}`).slice(-2)}-${
          (`0${d.getMinutes()}`).slice(-2)}`;
      }
      // if group manager and large screen -> give addirional info (tel, mail, registration date)
      //      if (context.userId.grpManager && window.innerWidth >= 1080) {
      if (context.userId.grpManager) {
        if (!context.isPortrait()) {
          const usrmail = nline.insertCell(-1);
          usrmail.style.textTransform = 'none';
          usrmail.innerHTML = y.usrmail;
          const usrtel = nline.insertCell(-1);
          usrtel.innerHTML = y.usrtel;

          const usrtime = nline.insertCell(-1);

          usrtime.innerHTML = lt;
        } else {
          // if group manager and small screen -> option for additional info
          //      if (context.userId.grpManager && window.innerWidth < 1080) {
          const plus = nline.insertCell(-1);
          plus.innerText = ' + ';
          // eslint-disable-next-line no-loop-func
          plus.onclick = () => {
            const msg = `mail: ${y.usrmail}<br>`
                      + `tel : ${y.usrtel}<br>`
                      + `date : ${lt}`;
            msgBox(msg);
          };
        }
      }
      // if group manager or user connected and message exist => display message
      if ((context.userId.grpManager || y.usrid === context.userId.id) && y.usrmessage !== '') {
        const nbcol = nline.cells.length;
        const linemessage = tab.insertRow(-1);
        // const firstcol = linemessage.insertCell(-1);
        const usrmessage = linemessage.insertCell(-1);
        usrmessage.colSpan = (nbcol).toString();
        usrmessage.innerHTML = `message : ${y.usrmessage}`;
        usrmessage.style.textTransform = 'none';
        usrmessage.style.textAlign = 'left';
      }
    }
  }
}

//= ===================================================================================

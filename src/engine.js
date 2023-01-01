import {
  msgBox, loadImage, funcAide, dateReverse, validDate,
  returnFunc, inputOne, optionBox, capitalizeFirst, clearMsgBox,
} from './commonFunc';
import * as context from './context';
import { Database } from './database';
import { loadConfig } from './config';
import { dispAct } from './dispact/dispact';
import { dispGrp } from './dispgrp/dispgrp';
import { planning, sessDisplay } from './planning/planning';
import { sessionform } from './sessionform/sessionform';
import { deputyForm } from './deputyform/deputyform';
/*
    core module of this application.
    dispatch to the requested function according to the user request (events)
    each page has a controller function to manage the events from the page
    Before going to the controller set the state and push the newPage
*/

const DB = new Database();

// load icon for navigation (help, exit, backward)
const iconAide = loadImage(
  `${context.imgUrl}aide32.jpg`,
  'aide',
  () => funcAide(`${context.homeUrl}/inscription-guide-utilisateur/`),
);
const iconExit = loadImage(
  `${context.imgUrl}exit32.jpg`,
  'exit',
  () => { window.location.href = context.homeUrl; },
);
const iconRetour = loadImage(
  `${context.imgUrl}retour32.jpg`,
  'retour',
  () => returnFunc(),
);
let Aide; let Exit; let Retour; // will contain the image when promise resolved
let conf; // will contain the config parameters
const actLoaded = DB.loadAct(); // load list of activities

// ============================================================================

async function engine() {
  /*
        Controller for the application
        get info from the database and distribute info to pages for display
  */
  // load users from wp only in wordpress context and not when standalone application (web or mobile)
  if (context.wpParm.mode === 'wp') {DB.loadUsers();}
  
  await actLoaded; // in all case list of activity must be ready
  if (DB.actList.length === 0) {
    await msgBox(
      'il n\'y a pas d\'activité de créée.',
      'fatal',
      context.homeUrl,
    );
  }
  /*
    at the beginning of the program depending on the parm from the wp shortcode
   either it is a request to display an activity planning so call the planning controller
   or display intro message (if any) and move on to display activities
  */
  if (context.wpParm.programme !== 'non') {
    // a planning has been requested
    // get the data of the activity requested for the planning (in wpParm)
    const actOk = DB.actList.filter(
      (actObj) => context.wpParm.programme.toLowerCase() === actObj.actdesc.toLowerCase(),
    );
    if (!actOk) {
      await msgBox(
        `l'activité demandée '${context.wpParm.programme}' n'existe pas`,
        'fatal',
        context.homeUrl,
      );
    } else {
      // set the current activity in the context and pushup the page
      context.setCurAct(actOk[0]);
      context.newPage('replace', 'planning', actPlanningControl);
    }
  } else {
    // no planning requested so display activities to subscribe in session
    // if there is a message as introduction, display it
    // check if user has a valid subscription
    // then display activities
    if (!conf) conf = await loadConfig();
    if (conf.messageIntro) { await msgBox(conf.messageIntro); }
    userRegistered();
    context.newPage('replace', 'dispact', dispActControl);
  }
}
export { engine };

// ============================================================================

async function actPlanningControl() {
  /*
        Manage the display of the planning (list of sessions) for an activity
        The display will be executed by the module planning
        registered users may go to subscription
  */
  const handleSessClicked = (session) => {
    /* the subscription button of a session has been clicked
       set the current session and move to session update
    */
    context.setCurSession(session);
    context.newPage('push', 'sessDisplay', sessDisplayControl);
  };
  const groupList = await DB.loadGroups(); // load list of groups;
  const sessList = await DB.loadActPlanning(context.getCurAct().actid, context.userId.id);
  const act = capitalizeFirst(context.getCurAct().actdesc);
  planning({ handleSessClicked }, `Programme de ${act}`, [], { sessList, groupList });
}

// ============================================================================

async function sessDisplayControl() {
  /*  prepare display of the chosen session and participants
      the current session must be set
      check if user has a valid subscription
      the user can subscribe or unsubscribe
      the manager can modify or delete the session
  */
  // get icons for header
  Aide = await iconAide;
  Exit = await iconExit;
  Retour = await iconRetour;

  const handleSubscribe = (inscrire, session) => {
    // subscribe/unsubscribe button clicked
    //  param inscrire is a boolean if true -> subscribe  false  unsubscribe
    if (inscrire) {
      subscribe(session);
    } else {
      const xusrid = context.userId.id;
      const xsessid = session.sessid.toString();
      msgBox('L\'inscription est annulée');
      unsubscribe(xusrid, xsessid);
    }
  };
  const sessModif = (session) => {
    // modify session clicked
    if (!context.userId.grpManager) {
      msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
      return;
    }
    context.setCurSession(session);
    sessionform(validForm, [Aide, Exit, Retour], false, session);
  };
  const sessDelete = async (session) => {
    // delete session clicked
    if (!context.userId.grpManager) {
      msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
      return;
    }
    if (session.inscrit.length > 0) {
      msgBox('la session a des inscrits, ne peut être supprimée');
      return;
    }
    DB.deleteSession(session.sessid);
    await msgBox('Session supprimée');
    returnFunc();
  };
  const sessDownload = (session) => {
    /* create a pdf to download the session clicked
        the user must be the group manager
    */
    if (!context.userId.grpManager) {
      msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
      return;
    }
    const a = document.createElement('a');
    a.href = `${DB.phpUrl}pdfsession.php?sess=${session.sessid}`;
    a.target = '_blank';
    a.click();
  };

  const sendmail = (session) => {
    envoimail(session);
  };

  const unsubscribeByMng = (session, sessInscrit) => {
    optionBox(
      `voulez vous désinscrire ${sessInscrit.usrprenom} ${sessInscrit.usrnom}`,
      (response) => {
        if (response) {
          // prepare json to be sent to php with mails ad and message
          const jsonobj = {
            mails: [],
            msg: '',
            subject: '',
          };
          jsonobj.subject = `Désinscription de la sortie du 
                            ${dateReverse('display', session.sessdate)}`;
          jsonobj.mails.push(sessInscrit.usrmail);
          jsonobj.msg = `Bonjour ${sessInscrit.usrprenom}, <br>`
                        + `${context.userId.prenom} ${context.userId.nom} `
                        + 'vous a désinscrit de la sortie du '
                        + `${dateReverse('display', session.sessdate)}`
                        + '<br> Amicalement<br> Eztitasuna';

          DB.sendMail(jsonobj);
          const xusrid = sessInscrit.usrid;
          const xsessid = session.sessid.toString();
          msgBox('L\'inscription est annulée<br> un mail a été envoyé à '
                  + `${sessInscrit.usrprenom} ${sessInscrit.usrnom}`);
          unsubscribe(xusrid, xsessid);
        }
      },
    );
  };

  const session = context.getCurSession();
  // set current group - filter result is an array so get first element
  const grp = DB.groupList.filter((grpObj) => session.sessgrp === grpObj.grpid)[0];
  context.setCurGrp(grp);

  // load users registered for this session
  const promLoadInscrits = DB.loadSessionInscrits(session.sessid);

  // check if the user is registered for this season
  await userRegistered();

  //  check whether the user is the group manager
  //  and set grpmngr to true or false
  checkgrpmngr(context.getCurGrp());

  // if the user is not manager and has not input the code yet
  // ask for the group code before displaying any planned event
  if (!context.userId.grpManager && context.userId.grpcode !== grp.grpcode) {
    const code = await checkgrpCode(grp.grpid, grp.grpcode);
    if (!code) {
      returnFunc();
      return;
    }
  }
  const sess = await promLoadInscrits;
  context.setCurSession(sess);
  sessDisplay(
    {
      handleSubscribe, sessModif, sessDelete, sessDownload, sendmail, unsubscribeByMng,
    },
    [Aide, Exit, Retour],
  );
}
// ============================================================================

async function dispActControl() {
  /*
        Manage the display of activities
        The display will be executed by the module dispact
        this controller handle the user request
  */
  const handleActClicked = (act) => {
    // an activity has been clicked
    // set the current activity and move to dislay of groups controller
    context.setCurAct(act);
    context.newPage('push', 'dispgrp', dispGrpControl);
  };

  Aide = await iconAide;
  Exit = await iconExit;
  DB.loadGroups(); // load list of groups
  dispAct(handleActClicked, [Aide, Exit], DB.actList);
}
// ============================================================================

async function dispGrpControl() {
  /*
        Manage the display of groups
        The display will be executed by the module dispGrp
        this controller handle the user request
  */
  const handleGrpClicked = (grp) => {
    // a group has been clicked
    // set the current group and move to dislay of sessions for this group
    context.setCurGrp(grp);
    checkgrpmngr(context.getCurGrp());
    context.newPage('push', 'dispsession', grpPlanningControl);
  };
  Retour = await iconRetour;
  await DB.groupsLoaded;
  dispGrp(handleGrpClicked, [Aide, Exit, Retour], DB.groupList);
}

// ============================================================================

async function grpPlanningControl() {
  /*
        Manage the display of the planning of the current group
        The display will be executed by the module planning
        registered users may go to subscription
        the group manager can create session, change access code of the group, manage deputies
  */
  const handleSessClicked = (session) => {
    /* a session has been clicked
        Check if user has a valid subscription
        set the current group and move to session display
    */
    context.setCurSession(session);
    context.newPage('push', 'sessDisplay', sessDisplayControl);
  };
  const newCode = async (code) => {
    //  change the code of the group
    //  check if user is the owner of the group
    //  display form to get the new code
    if (!context.userId.grpManager) {
      msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
      return;
    }
    // display form to change the code of the groupe
    const newcode = await inputOne(`le code est '${code}' saisir le nouveau code : `);
    if (newcode == null) { // input window has been closed using the cross
      return;
    }
    const codeL = newcode.toLowerCase();

    //    change the code in the current group and update DB + groupList
    context.getCurGrp().grpcode = codeL;
    DB.setGrpCode(context.getCurGrp().grpid, codeL);
  };
  const newSession = () => {
    //  Creation of a new session has been clicked
    //  check if user is the owner of the group
    //  Move to control of a new page (sessionForm)
    //  onclick call validForm  which will send the DB update if form is ok
    //
    if (!context.userId.grpManager) {
      msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
      return;
    }
    context.newPage('push', 'sessForm', newSessControl);
  };
  const handleModSessClicked = (session) => {
    /* a session modification has been clicked
        set the current group and move to session update
    */
    context.setCurSession(session);
    sessionform(validForm, [Aide, Exit, Retour], false, session);
  };
  const handleDeputy = async () => {
    /* the deputy button has been clicked
    */
    await deputyControl(context.getCurGrp());
  };

  const { groupList } = DB;
  const grp = DB.groupList.filter((grpObj) => context.getCurGrp().grpid === grpObj.grpid)[0];
  context.setCurGrp(grp); // update curGrp from DB in case deputy list has changed
  const sessList = await DB.loadGrpPlanning(context.getCurGrp().grpid, context.userId.id);
  planning(
    {
      handleSessClicked, newCode, newSession, handleModSessClicked, handleDeputy,
    },
    context.getCurGrp().grpdesc, // group description for title
    [Aide, Exit, Retour],
    { sessList, groupList, mngr: context.userId.grpManager },
  );
}
// ============================================================================

async function newSessControl() {
  sessionform(validForm, [Aide, Exit, Retour], 'create'); // callback + header + parms
}
//= ===================================================================================

async function userRegistered() {
  //  check the season if the user is registered for the current season
  if (context.userId.saison !== context.season.current && !context.season.checked) {
    if (!conf) conf = await loadConfig();
    if (context.today < conf.refusalDate
      && parseInt(context.userId.saison, 10) === context.season.current - 1) {
      await msgBox(`ATTENTION : <br>Vous n'êtes pas ré-inscrit à Eztitasuna <br>pour la saison 
      ${context.season.current}.<br>bientôt, vous ne pourrez plus participer!`, 'warning');
    } else {
      await msgBox(`ATTENTION !!!: <br>Vous n'êtes pas ré-inscrit à Eztitasuna <br>pour la saison 
      ${context.season.current}.<br>IMPOSSIBLE de participer!`, 'fatal', context.homeUrl);
    }
  }
  context.season.checked = 1;
}
// ============================================================================

async function checkgrpCode(grpid, grpcode) {
  /*  display form to ask for the code of the chosen group
      check if it is the right code
      return null if close button has been clicked
      return false if input code is wrong
      return code if ok
  */
  /*
      if groupe code = default code(0000) do not ask the user for a code
  */
  if (grpcode === '0000') {
    context.userId.grpcode = '0000';
    return grpcode;
  }
  const code = await inputOne('Saisir le code de ce groupe : ');
  if (code == null) { return null; } // the close (x) button has been clicked
  const codeL = code.trim().toLowerCase();
  if (codeL !== grpcode.toLowerCase()) {
    await msgBox(
      'Code Erroné.<br>demandez le code au responsable du groupe.',
      'warning',
    );
    return false;
  }
  context.userId.grpcode = codeL;
  return grpcode;
}
//= ===================================================================================

function checkgrpmngr(grp) {
  //  check if the user is the manager or a deputy of the group passed in parameter
  //  if he is update user info

  // build a list of licence nb of manager + deputies
  let ffrsList = [grp.grprespffrs];
  if (grp.grpdeputy) {
    ffrsList = [grp.grprespffrs, ...grp.grpdeputy];
  }
  context.userId.grpManager = false;
  if (ffrsList.includes(context.userId.ffrs)) {
    context.userId.grpManager = true;
    context.userId.codeChecked = true;
  }
}
//= ===================================================================================
function subscribe(session) {
  /*  register a user for a session
      ask whether he will have a car
      then ask whether he wants to input a message for the group manager
  */

  // ask the user whether he will have a car or not
  //  after this choice ask for an optional message to the group manager
  let voiture = 0;
  if (context.getCurAct().actvoit === '1') { // check if this group manages cars
    optionBox('prendrez vous votre voiture?', askmessage);
  } else {
    askmessage(0);
  }
  // callback function for optionBox called when the user tells if car or not
  //  it receives the voiture parameter he will include in the subscription
  async function askmessage(car) {
    //  ask the user whether he wants to input a message
    //
    voiture = car;
    const message = await inputOne(
      `facultatif : message (max 100c) pour ${context.getCurGrp().grprespprenom}<br>`
      + 'si pas de message cliquer envoi ou la croix',
      'textarea',
    );
    //  ask the server to register the user in the database
    //  and display again the session
    const xusrid = context.userId.id.toString();
    const xsessid = session.sessid.toString();
    const xvoiture = voiture.toString();
    const xmess = message == null ? '' : message.trim();
    msgBox('Vous etes bien inscrit(e)');
    await DB.subscribe(xusrid, xsessid, xvoiture, xmess);
    sessDisplayControl();
  }
}
//= ===================================================================================
async function unsubscribe(xusrid, xsessid) {
  //  remove a user in a session
  //
//  const xusrid = context.userId.id.toString();
//  const xsessid = session.sessid.toString();
  await DB.unsubscribe(xusrid, xsessid);
  sessDisplayControl();
}

//= ===================================================================================
async function validForm(create = true, session = null) {
  //  validate fields input by the user in the session form
  //  if ok call the server to create the session in the DB
  //
  let info = document.getElementById('i4id').value.trim().replace(/\r\n/g, '\n');
  info = info.replace(/\n/g, '<br>');

  const sessData = {
    sessid: session ? session.sessid : null,
    sessdate: dateReverse('', document.getElementById('i1id').value.toLowerCase().trim()),
    sesslieu: document.getElementById('i2id').value.trim(),
    sessrdv: document.getElementById('i3id').value.trim(),
    sessinfo: encodeURIComponent(info),
    sesslink: encodeURIComponent(document.getElementById('i5id').value.trim()),
    sessgrp: context.getCurGrp().grpid,
  };
  //  check if date is valid
  //  the function validDate returns an oject with
  //  a validation code and if not valid a message explaining the error
  const ret = validDate(sessData.sessdate);
  sessData.sessdate = ret.gooddate;
  if (!ret.isvalid) {
    msgBox(ret.msg);
    return false;
  }

  //  check date is not in the past
  //  for creation do not allow today, for mod allow it
  if (create) {
    if (sessData.sessdate <= context.today) {
      msgBox('vous ne pouvez pas créer une session dans le passé ou le jour même');
      return false;
    }
  } else if (sessData.sessdate < context.today) {
    msgBox('vous ne pouvez pas modifier une session dans le passé');
    return false;
  }

  //  if creation check session date is not already in sessionList
  if (create || (sessData.sessdate !== session.sessdate)) {
    for (const x of DB.grpSessionList) {
      if (x.sessdate === sessData.sessdate) {
        msgBox(` Une session est déjà prévu pour le : ${sessData.sessdate}`);
        return false;
      }
    }
  }
  // call newsession.php to create a new session in the DB
  // or sessupdate.php
  // if create ok back to display session
  let newsess = { ...sessData };
  if (create) {
    newsess = await DB.crNewSession(context.userId.id, sessData);
    msgBox('Session créée');
    // returnFunc();
  } else {
    await DB.updateSession(context.userId.id, sessData);
    msgBox('Session mise à jour');

    // returnFunc();
  }
  context.setCurSession(newsess);
  context.newPage('push', 'sessDisplay', sessDisplayControl);
  return false; // to stop action of the form
}
//= ===================================================================================
/*
function downloadCSV(session, csvStr) {
  // download a file containing the string received as parameter
  // it is for group manager to download people registered in the session
  //
  const hiddenElement = document.createElement('a');
  hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(csvStr)}`;
  hiddenElement.target = '_blank';
  // build the file name
  const dat = dateReverse('display', session.sessdate).replace(/\//g, '_');
  const lieu = session.sesslieu.split(' ');
  hiddenElement.download = `${dat}-${lieu[0]}.csv`;
  optionBox(
    `Voulez vous télécharger la session:<br>${dat}-${lieu[0]}.csv `,
    (ok) => {
      if (ok) hiddenElement.click();
    },
  );
}
*/
// ====================================================================================
async function envoimail(session) {
  //  send a mail to all users of the session in parm
  //  the user must be the group manager
  //  the message is requested in a form and sent to the server for emailing
  //
  if (!context.userId.grpManager) {
    msgBox(`${context.userId.prenom} ${context.userId.nom} n'est pas le responsable du groupe`);
    return;
  }
  if (session.inscrit.length === 0) {
    msgBox("la session n'a pas d'inscrit");
    return;
  }
  // prepare json to be sent to php with mails address and message
  const jsonobj = {
    mails: [],
    msg: '',
    subject: '',
  };
    // the subject is date + place of the event
  jsonobj.subject = `${context.userId.prenom} : Sortie du ${dateReverse('display', session.sessdate)
  } à ${session.sesslieu}`;

  // in the list of mails for all registered people set the manager as the first of the list
  jsonobj.mails.push(context.userId.mail);
  for (const y of session.inscrit) {
    if (y.usrmail !== context.userId.mail) { jsonobj.mails.push(y.usrmail); }
  }

  // ask the user to input the message
  const msginput = await inputOne('entrer le texte de votre mail ', 'textarea');
  // if close icon has been clicked
  if (msginput == null) { return; }
  // prepare mail content as json object
  const msg1 = 'Bonjour, <br>';
  if (msginput.trim() === '') {
    msgBox('le message est vide.<br>Le mail ne sera pas envoyé', 'warning');
    return;
  }
  jsonobj.msg = msg1 + msginput;

  DB.sendMail(jsonobj);
  msgBox('mail envoyé');
}
// ====================================================================================
async function deputyControl(grp) {
  /*
    call deputyForm to display current deputies (if any) for delete
     and propose to create new deputy
    receives the current group
  */
  const promArray = []; // array of promises, return users from DB.getUsersFfrs
  let deputyUsers = []; // list of object users with all user info

  // build list of ffrs
  const deputyL = (Array.isArray(grp.grpdeputy) && grp.grpdeputy.length)
    ? [...grp.grpdeputy] : [];

  // if deputies get users fields for each ant put it in array to be passed to display form
  if (deputyL) {
    deputyL.forEach((dep) => promArray.push(DB.getUserFfrs(dep)));
    deputyUsers = await Promise.all(promArray);
  }

  return new Promise((resolve) => {
    // callback functions for buttons in the form

    const quitForm = () => {
      resolve(context.getCurGrp());
    };

    const crDeputy = async (deputyList, crVal) => {
      /*
          creation of a deputy is asked
            if field is empty -> do nothing
            else check if licence is ok and get name
            if ok update database
      */
      let newDepList = [...deputyList];
      const crVal1 = crVal.toUpperCase();
      if (crVal1 === '') {
        clearMsgBox();
        await msgBox('un no de licence est requis pour création');
      } else {
        const user = await DB.getUserFfrs(crVal1);
        if (!user) {
          clearMsgBox();
          await msgBox(`le no de licence ${crVal1} est invalide `);
        } else {
          deputyUsers.push(user);
          newDepList = [...deputyList, crVal1];
          context.setCurGrp(DB.setDeputy(grp.grpid, newDepList));
        }
      }
      // eslint-disable-next-line no-use-before-define
      deputyForm({ delDeputy, crDeputy, quitForm }, deputyUsers);
    };

    const delDeputy = (deputyList, dep) => {
      /*
        delete of a deputy as been asked
        receives the list of deputies and the deputy to remove
      */
      // const deputyUsersTmp = deputyUsers.filter((usr) => usr.ffrs !== dep);
      const idx = deputyUsers.findIndex((usr) => usr.ffrs === dep);
      deputyUsers.splice(idx, 1);
      const newDepList = deputyList.filter((deptmp) => deptmp !== dep);
      context.setCurGrp(DB.setDeputy(grp.grpid, newDepList));

      deputyForm({ delDeputy, crDeputy, quitForm }, deputyUsers);
    };

    deputyForm({ delDeputy, crDeputy, quitForm }, deputyUsers);
  });
}
// ====================================================================================

import { formatDate, clearMsgBox } from './commonFunc';

const maxWidth = '590px'; // define size under which we use portrait format
const mediaQuery = window.matchMedia(`(max-width: ${maxWidth})`);
const currentSaison = getSaison(); // get the year of the season
const today = formatDate(Date());
const season = {
  checked: 0, // to display warning "you are not registered" only once
  current: currentSaison,
};

const wpParm = JSON.parse(JSON.stringify(window.wpParm));
const homeUrl = window.pluginUrl.replace(/\/wp-content.*$/, '/');
//const imgUrl = `${window.pluginUrl}assets/images/`; // path to icons
const imgUrl = `/images/`; // path to icons
let curAct = {
  actid: 0,
  actdesc: '',
  actvoit: 0,
};

let curGrp = {
  grpid: 0,
  grpact: 0,
  grpdesc: '',
  grplevel: '',
  grprespid: 0,
  grprespnom: '',
  grprespprenom: '',
  grpresptel: '',
  grprespmail: '',
  grprespsaison: 0,
  grprespffrs: '',
  grpcode: '',
  grpdeputy: null,
};

let curSession = {
  sessdate: '2022/01/01',
  sessgrp: '',
  sessid: '',
  sessinfo: '',
  sesslieu: '',
  sessrdv: '',
  inscrit: [],
};

let userId = { ...window.userFields };
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

const statePage = [];

export {
  season, today, userId, wpParm, homeUrl, imgUrl, statePage, maxWidth, mediaQuery,
};
// ====================================================================================

export function setUserId(userObj) {
  userId = { ...userObj};
  window.userFields = { ...userObj};
}
// ====================================================================================

function getSaison() {
//   return the year of the current saison as a string
//     the saison Y starts from september Y-1 to august Y
//
  const d = new Date();
  const month = (d.getMonth() + 1);
  //  const day = d.getDate();
  const year = d.getFullYear();

  if (month >= 9 && month <= 12) {
    return (year + 1).toString();
  }
  return year.toString();
}

// ======================================================================================
/*
    functions necessary to implement routing (use of back and forth arrow of the browser)

    before calling the module displaying a new page, call newPage function
    since newPage set the state of the pushState function, the context to be kept in the state
    must have been set before calling newPage.
    newPage stores the function to be called when user is back in an array statePage
    The key is the hash of the location
    when an arrow is clicked, the onpop function calls the pageControl function
    pageControl finds the function to be called in the array statePage.

*/
function setFromState(mapState) {
/*   Set the context objects from a map. the mapSate usually comes from the onpop event
      objects in the state are : userId, curact, curGrp
     the parameter is a map with those three objects
*/
  curAct = { ...mapState.curAct };
  curGrp = { ...mapState.curGrp };
  // console.log('on bakward set from state'); console.log(curGrp);
  curSession = { ...mapState.curSession };
}
export { setFromState };

// --------------------------------------------------------------------------------------

function getStateFromContext() {
/*   prepare state object for pushstate
      this state is saved by pushState and restored by popSate
*/
  // console.log('set state from context'); console.log(curGrp);
  const state = {
    userId,
    curAct,
    curGrp,
    curSession,
  };
  return state;
}

// --------------------------------------------------------------------------------------

function newPage(action, pageid, func) {
/*
    push the current page in the history
    receive 4 parms:
      action = push or replace
      pageid = id of the page (hash to be used without the sharp)
      function = function to execute to display page
    The data from context that are included in the state must have been set
*/

  const url1 = document.location.toString();
  const url = url1.replace(/#[^#]*$/, ''); // delete hash if any
  const state = getStateFromContext();
  if (!statePage[pageid]) statePage[pageid] = func;
  if (action === 'push') { window.history.pushState(state, pageid, `${url}#${pageid}`); }
  if (action === 'replace') { window.history.replaceState(state, pageid, `${url}#${pageid}`); }
  func();
}
export { newPage };

// --------------------------------------------------------------------------------------

function pageControl(event) {
  // get the hash for routing to the corresponding page
  const page = window.location.hash;
  if (page === '') { // no hash then do nothing
    //  engine();
  } else {
    const pageid = page.slice(1);
    if (!statePage[pageid]) { return };
    // clear msgBox if any
    clearMsgBox();

    // update data in context from the state delivered by popstate
    if (event.state) { setFromState(event.state); }
    statePage[pageid]();
  }
}
export { pageControl };

// ======================================================================================

function isPortrait() {
/*
    if mobile orientation changed re-diplay to take the new width into account
    return if portrait or not based on the size predefined by mediaquery
*/
  // if you want to re-display only when mediaQuery change
  mediaQuery.addEventListener('change', orientChanged);

  // if you want to redisplay when the window size change independant of mediaquery
  // window.addEventListener('resize', orientChanged);

  const portrait = mediaQuery.matches;
  return portrait;
}
export { isPortrait };

function orientChanged() {
  const pageid = window.location.hash.slice(1); // get hash of the current url
  if (pageid !== '') {
    statePage[pageid](); // call the function associated to this page hash
  }
}
// ====================================================================================

function setCurAct(curact) {
  curAct = { ...curact };
}
export { setCurAct };

// ====================================================================================

function getCurAct() {
  return curAct;
}
export { getCurAct };

// ====================================================================================

function setCurGrp(curgrp) {
  curGrp = { ...curgrp };
}
export { setCurGrp };

// ====================================================================================

function getCurGrp() {
  return curGrp;
}
export { getCurGrp };

// ====================================================================================
function getUser() {
  return userId;
}
export { getUser };

// ====================================================================================

function setCurSession(cursession) {
  curSession = { ...cursession };
}
export { setCurSession };

// ====================================================================================

function getCurSession() {
  return curSession;
}
export { getCurSession };

// ====================================================================================

function xxx(yyy) {
  return yyy;
}
export { xxx };

// ====================================================================================

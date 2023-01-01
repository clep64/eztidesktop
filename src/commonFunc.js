/* eslint-disable func-names */

function dateReverse(display, dat) {
  //  reverse the date from dd/mm/yyyy to yyyy/mm/dd if display not= "display"
  //               and from yyyy/mm/dd to dd/mm/yyyy if display = "display"

  const dateExplode = dat.split('/');
  let dateReversed;
  if (display === 'display') {
    //  parameter is a date  at format : aaaa/mm/dd
    //  the function reverse the date to return : dd/mm/aaaa
    const yyyy = dateExplode[0];
    const mm = dateExplode[1];
    const dd = dateExplode[2];
    dateReversed = `${dd}/${mm}/${yyyy}`;
  } else {
    //  parameter is a date  at format : dd/mm/aaaa
    //  the function reverse the date to return : aaaa/mm/dd
    const yyyy = dateExplode[2];
    const mm = dateExplode[1];
    const dd = dateExplode[0];
    dateReversed = `${yyyy}/${mm}/${dd}`;
  }
  return dateReversed;
}
export { dateReverse };
//= ===================================================================================
function formatDate(date) {
  //  receive a date at js format function date()
  //  and return this date as yyyy/mm/dd

  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('/');
}
export { formatDate };
//= ===================================================================================
function validDate(date) {
  // check whether a string "yyyy/mm/dd" is a valid date
  //  valid year is checked between 2020 and 2030
  // return an object with 3 properties
  //    isvalid : a boolean
  //    msg : if not valid a message explaining the error
  //    gooddate: if valid the reverse date (yyyy/mm/dd)

  const retour = {
    gooddate: date,
    isvalid: false,
    msg: '',
  };
  const regex = /(202[0-9]{1})[/](0[1-9]|1[0-2])[/]([0-2]{1}[0-9]{1}|3[0-1]{1})/;
  const dateOk = regex.test(date);
  if (!dateOk) {
    retour.msg = "la date n'est pas correcte<br>format : jj/mm/aaaa";
    retour.isvalid = false;
    return retour;
  }
  const dateExplode = date.split('/');
  const yyyy = dateExplode[0];
  let mm = dateExplode[1];
  let dd = dateExplode[2];

  if (dd.length < 2) { dd = `0${dd}`; }
  if (mm.length < 2) { mm = `0${mm}`; }
  // if (yyyy.length < 4 || isNaN(yyyy) == true){
  let yyyyNum = 0;
  yyyyNum = (Number.isNaN(yyyy) === true) ? yyyyNum = 0 : yyyyNum = Number(yyyy);
  if (yyyyNum < 2020 || yyyyNum > 2030) {
    retour.msg = "l'année n'est pas correcte";
    retour.isvalid = false;
  } else if (mm < '01' || mm > '12' || Number.isNaN(mm) === true) {
    retour.msg = 'le mois doit etre compris entre 01 et 12';
    retour.isvalid = false;
  } else if (dd < '01' || dd > '31' || Number.isNaN(dd) === true) {
    retour.msg = 'le jour doit etre compris entre 01 et 31';
    retour.isvalid = false;
  } else {
    retour.isvalid = true;
    retour.gooddate = `${yyyy}/${mm}/${dd}`;
  }
  return retour;
}
export { validDate };

// ====================================================================================
function getjsDate(date) {
  //  receive a date at format aaaa/mm/dd
  //  and return this date at js format (millisecond)
  const dateExplode = date.split('/');
  const yyyy = dateExplode[0];
  const mm = dateExplode[1];
  const dd = dateExplode[2];
  return new Date(yyyy, mm, dd).getTime();
}
export { getjsDate };

// ====================================================================================
function crBox() {
  //  create a modal popup box
  //  and return the div to which you must append elements and buttons
  //  the screen is disabled by adding a class ("noentry") to the all-encompassing div "masterdiv"
  document.getElementById('masterdiv').classList.add('noentry');
  const divmsg = document.createElement('div'); // create div for input window
  divmsg.id = 'msgbox';
  divmsg.className = 'classmsg';
  document.body.appendChild(divmsg);
  return divmsg;
}
export { crBox };
//= ===================================================================================
function msgBox(texte = 'texte absent', type = 'info', url = null) {
  /*
    display a message in a box
      3 input parameters:
        the text,
        a type for different display "info"(default value) or "warning" or "fatal",
        an optional url used when type = "fatal"
    "fatal" displays the message with a red background.then move to the received url
    "warning" displays with a yellow background color

    the screen is disabled by adding a class ("noentry") to the all-encompassing div "masterdiv"
    if there were input in the screen sending the message, give the focus again to the first input
  */
  return new Promise((resolve) => {
    // create div for message
    const divmsg = crBox();
    if (type === 'warning') { divmsg.style.backgroundColor = 'yellow'; }
    if (type === 'fatal') { divmsg.style.backgroundColor = 'red'; }

    // create pargraph for the text and button

    const textElem = document.createElement('p');
    textElem.innerHTML = texte;
    divmsg.appendChild(textElem);

    const bout0 = document.createElement('button');
    bout0.textContent = 'OK';
    bout0.id = 'butok';
    bout0.className = 'bouton';
    divmsg.appendChild(bout0);
    bout0.focus();

    bout0.onclick = function () {
      if (type === 'fatal') {
        window.location.href = url;
      } else {
        clearMsgBox();
        // if there is an input on the page  -> give it the focus
        const input = document.getElementById('divmain').querySelector('input');
        if (input) input.focus();
        resolve();
      }
      return true;
    };

    // scroll to the top of the document
    //   in order to see the box since it is position absolute

    // window.scrollTo(0,0);
  });
}
export { msgBox };

function clearMsgBox() {
  // if a popup box has been created with the function crBox
  // this function clear it
  if (document.querySelector('#msgbox')) {
    document.getElementById('msgbox').remove();
    document.getElementById('masterdiv').classList.remove('noentry');
  }
}
export { clearMsgBox };
//= ===================================================================================

//= ===================================================================================
function optionBox(texte, callback) {
  /*  display a message in a box
      and call the callback function when answer got
      return  yes (1) or no (0)
  */

  // create the popup box
  const divmsg = crBox();

  const textElem = document.createElement('p'); // create pargraph for the text
  textElem.innerHTML = texte;
  divmsg.appendChild(textElem);
  const bout0 = document.createElement('button'); //  create button ok
  bout0.textContent = 'Oui';
  bout0.id = 'butok';
  bout0.className = 'bouton';
  bout0.onclick = function () {
    document.getElementById('msgbox').remove();
    document.getElementById('masterdiv').classList.remove('noentry');
    callback(1);
  };
  divmsg.appendChild(bout0);
  const bout1 = document.createElement('button'); //  create button no
  bout1.textContent = 'Non';
  bout1.id = 'butno';
  bout1.className = 'bouton';
  bout1.onclick = function () {
    clearMsgBox();
    callback(0);
  };

  divmsg.appendChild(bout1);

  // scroll to the top of the document
  //   in order to see the box since it is position absolute

  // window.scrollTo(0,0);
}
export { optionBox };

//= ===================================================================================

async function inputOne(texte, area = 'text') {
/*  display a message and an input field in a box
    if area = 'text' input text if = 'textarea' input textarea
    and call the callback function with answer got
     if the close image(cross) has been clicked null is passed to the callback
*/
  // create the popup box
  const divmsg = crBox();

  // create button close (cross)
  const boutClose = await loadImage(
  //  `${window.pluginUrl}assets/images/close.png`,
    `/images/close.png`,
    'close',
    () => {
      clearMsgBox();
    },
  );
  return new Promise((resolve) => {
    document.body.appendChild(divmsg);
    const textElem = document.createElement('p'); // create pargraph for the text
    textElem.innerHTML = texte; // and display text
    divmsg.appendChild(textElem);
    const f = document.createElement('form'); // create form
    f.className = 'formContainer';
    f.onsubmit = function (e) { //  function executed when submit button clicked
      e.preventDefault();
      const codeRaw = document.getElementById('i1id').value; //  get the text which has been input
      let code = codeRaw.trim().replace(/\r\n/g, '\n');
      code = code.replace(/\n/g, '<br>');
      clearMsgBox();
      resolve(code);
      return false; // return false to stop standard submission process
    };
    divmsg.appendChild(f);
    let i1;
    if (area === 'text') { // add the input area
      i1 = document.createElement('input');
      i1.setAttribute('type', 'text');
      i1.required = 'required';
    }
    if (area === 'textarea') { // or the textarea input area
      i1 = document.createElement('textarea');
      i1.maxLength = '500';
      i1.cols = '40';
      i1.rows = '2';
    }
    i1.name = 'saisie';
    i1.id = 'i1id';
    f.appendChild(i1);
    i1.focus();

    const s = document.createElement('button'); // add Submit button
    s.setAttribute('type', 'submit');
    s.innerHTML = 'envoi';
    if (area === 'textarea') { s.setAttribute('style', 'display: block;margin:auto;'); }
    f.appendChild(s);

    // create cross to exit window

    boutClose.className = 'boutclose';
    boutClose.id = 'boutcloseid';
    boutClose.onclick = () => {
      clearMsgBox();
      resolve(null);
    };
    divmsg.appendChild(boutClose);

  // scroll to the top of the document
  //   in order to see the box since it is position absolute
  // window.scrollTo(0,0);
  });
}
export { inputOne };

//= ===================================================================================

// function funcAide(aideurl = `${window.pluginUrl}assets/aide.pdf`) {
function funcAide(aideurl = 'https://eztitasuna.fr/inscription-guide-utilisateur/') {
//  display help in a new tab
  window.open(aideurl);
}
export { funcAide };

// ====================================================================================

function loadImage(url, id, fonclick = null, title = id) {
/*
    create an image
      url = source url for the image
      id = used to assign the id of the image
      fonclick =  callback function when image is clicked
      title = to set the infobulle. Default value is the id
    return a promise which returns the element
*/
  return new Promise((resolve) => {
    const ldimg = new Image();
    ldimg.onload = function () {
      resolve(ldimg);
    };
    ldimg.src = url;
    ldimg.id = id;
    ldimg.title = title;
    ldimg.onclick = fonclick;
  });
}
export { loadImage };

// ====================================================================================

async function setImgButton(name, cback, imgnode, text) {
/*
    set a button in the top menu
    if the button already exist change the onclick method
    otherwise create the image and put it in the menu
      name =  id to check whether the node exist or not
      cback = callback when image is clicked
      imgnode = node or url to be used to create the button
      text = to be used in  title(infobulle) . If no text and no title use the name
    return the image node
*/
  let imgButton = document.getElementById(name);
  if (!imgButton) {
    if (imgnode instanceof Element) {
      // create the button from the img element
      imgButton = imgnode.cloneNode();
    } else {
      // it's not an element so check if it's a valid url to create the img element
      let urlTmp;
      try {
        urlTmp = new URL(imgnode);
      } catch (e) {
        msgBox("Le parametre imgnode n'est ni un element img ni une url");
      }
      imgButton = await loadImage(urlTmp);
    }
    imgButton.id = name;
    imgButton.className = 'topicon';
    document.getElementById('topbuttonspan').appendChild(imgButton);
  }
  if (text) {
    imgButton.title = text;
  } else {
    imgButton.title = (imgButton.title) ? imgButton.title : name;
  }
  imgButton.onclick = () => { cback(); };
  return imgButton;
}
export { setImgButton };

//= ===================================================================================

function spinner(spinOn = true, text = 'chargement en cours') {
  //
  //   if spinOn -> display a spinner and lock the background
  //   if !spinOn -> clear the spinner
  //   return true if requested action ok
  //   false if no action (start when active or stop when not active)

  if (spinOn) {
    // start of spinner requested
    // check that spinner is not active
    // if already active do nothing + return false
    if (!document.getElementById('divspin')) {
      // make page inactive
      document.getElementById('masterdiv').classList.add('noentry');

      // create div for display
      const divmsg = document.createElement('div');
      divmsg.id = 'divspin';
      divmsg.className = 'classmsg';
      document.body.appendChild(divmsg);

      // create "p" for spinner and text
      const pspin = document.createElement('p');
      pspin.classList = 'loader loader7';
      divmsg.appendChild(pspin);
      const spintext = document.createElement('p');
      spintext.id = 'spintext';
      spintext.innerText = text;
      divmsg.appendChild(spintext);
      return true;
    }
    // spinner is already active
    return false;
  }
  // spinOn=false clear spinner
  // check that spinner is active
  // if not active do nothing + return false
  const divspin = document.getElementById('divspin');
  if (divspin) {
    divspin.remove();
    document.getElementById('masterdiv').classList.remove('noentry');
    return true;
  }
  return false;
}
export { spinner };

//= ===================================================================================
function capitalizeFirst(arr) {
  /*
      capitalize the first letter of a string
  */
  if (typeof arr === 'string') { return arr[0].toUpperCase() + arr.slice(1); }
  return arr.map((elem) => elem[0].toUpperCase() + elem.slice(1));
}
export { capitalizeFirst };

//= ===================================================================================
function clearNodeChildren(element) {
  /*
      Remove all children of an element
      receive either an element or a an id
  */
  const elem = (element instanceof HTMLElement) ? element : document.querySelector(element);
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
  return elem;
}
export { clearNodeChildren };

// ====================================================================================
function returnFunc() {
  /*
      Function used by the return button
      get back in history (previous page)
  */
  window.history.back();
}
export { returnFunc };

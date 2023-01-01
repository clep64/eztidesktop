import { spinner, clearNodeChildren, clearMsgBox } from '../commonFunc';
import * as context from '../context';
import { setHeader } from '../header/header';

async function dispGrp(handleGrpClicked, headerIcon, groupList) {
  /*
     display the groups to be cliked on
  */

  // clear spinner and msgBox if any
  spinner(false);
  clearMsgBox();

  //  set the header and the buttons
  const act = context.getCurAct();
  setHeader(`Groupes de ${act.actdesc}`, headerIcon);

  //  clear maindiv
  clearNodeChildren('#divmain');

  //  clear side menu + make it visible
  const sideMenu = document.querySelector('#menuside');
  sideMenu.style.display = 'none';
  clearNodeChildren(sideMenu);

  // display title and groups

  const p = document.createElement('p');
  p.innerHTML = 'Pour accéder aux prochains événements d\'un groupe <br>'
                + 'cliquer sur le groupe (en vert)';
  document.getElementById('divmain').appendChild(p);

  // display list of groups
  const tab = document.createElement('table');
  groupList.forEach((x) => {
    if (x.grpact === act.actid) {
      const nline = tab.insertRow(-1);
      const grpdesc = nline.insertCell(-1);
      // grpdesc.rowSpan = 2;                     // commented lines to not display email
      const grprespnom = nline.insertCell(-1);
      grprespnom.style.borderBottom = 1;
      const grpresptel = nline.insertCell(-1);
      grpresptel.style.borderBottom = 1;
      /*
      const nline2 = tab.insertRow(-1);
      const grprespmail = nline2.insertCell(-1);
      grprespmail.colSpan = 2;
      grprespmail.style.borderTop = 0;
      grprespmail.style.borderLeft = 0;
      */
      grpdesc.innerHTML = x.grpdesc;
      grpdesc.className = 'grptoevent';
      grpdesc.style.verticalAlign = 'middle';
      grpdesc.addEventListener('click', () => {
        handleGrpClicked(x);
      });
      const telFormat = x.grpresptel.match(/.{2}/g).join(' ');
      /*
      grprespmail.innerHTML = x.grprespmail;
      grprespmail.style.textTransform = 'none';
      */
      if (!context.isPortrait()) {
        grprespnom.innerHTML = ` <strong>${x.grprespprenom}</strong>, ${x.grprespnom}`;
        grpresptel.innerHTML = telFormat;
      } else {
        grprespnom.innerHTML = ` <strong>${x.grprespprenom}</strong>, ${x.grprespnom
        }<br>${telFormat}`;
        grprespnom.style.borderRight = 0;
        grpresptel.innerHTML = '';
      }
    }
  });
  document.getElementById('divmain').appendChild(tab);
}

//= ===================================================================================
export { dispGrp };

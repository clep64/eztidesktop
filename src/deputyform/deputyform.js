import {
  clearMsgBox, crBox,
} from '../commonFunc';
import './deputyform.css';

export async function deputyForm(callback, deputyUsers) {
  /*
      display current deputies (if any) for delete
      propose to create one
      receives an object with callback functions to be used on click events
      and an array of the users of the list of deputies
    */
  clearMsgBox();

  // build list of ffrs licence
  const deputyList = (deputyUsers) ? deputyUsers.map((usr) => usr.ffrs) : [];

  // create popup box
  const divmsg = crBox();

  // fill the box
  const titre = document.createElement('p');
  titre.innerText = 'Délégations de pouvoir';
  titre.className = 'deptitre';
  divmsg.appendChild(titre);

  // display the list of deputies and a delete button for each
  deputyUsers.forEach((dep) => {
    const div1 = document.createElement('div');

    const dep1 = document.createElement('p');
    dep1.innerText = dep.ffrs;
    dep1.className = 'deplicence';

    const dep2 = document.createElement('p');
    const n = `${dep.nom} ${dep.prenom}`;
    const nom = (n.length > 20) ? n.slice(0, 20) : n;
    dep2.innerText = nom;
    dep2.className = 'depnom';

    const deleteButton = document.createElement('button');
    deleteButton.onclick = (e) => {
      e.preventDefault();
      clearMsgBox();
      callback.delDeputy(deputyList, dep.ffrs);
    };
    deleteButton.innerText = 'supprimer';
    deleteButton.className = 'depsup';
    div1.appendChild(dep1);
    div1.appendChild(dep2);
    div1.appendChild(deleteButton);
    divmsg.appendChild(div1);
  });

  // ask for creation of a new deputy
  const div2 = document.createElement('div');
  const f = document.createElement('form');
  f.style.display = 'flex';
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const crVal = document.getElementById('depinput').value;
    callback.crDeputy(deputyList, crVal);
  });

  const depInput = document.createElement('input');
  depInput.setAttribute('type', 'text');
  depInput.setAttribute('placeholder', 'licence');
  depInput.setAttribute('id', 'depinput');
  depInput.setAttribute('maxlength', '8');

  const crButton = document.createElement('button');
  crButton.setAttribute('type', 'submit');
  crButton.innerHTML = 'créer';
  crButton.id = 'crbut';
  f.appendChild(depInput);
  f.appendChild(crButton);
  div2.appendChild(f);
  divmsg.appendChild(div2);

  const quitButton = document.createElement('button');
  quitButton.innerText = 'Quitter';
  quitButton.className = 'depquit';
  quitButton.onclick = (e) => {
    e.preventDefault();
    clearMsgBox();
    callback.quitForm();
  };
  divmsg.appendChild(quitButton);
}
// ====================================================================================

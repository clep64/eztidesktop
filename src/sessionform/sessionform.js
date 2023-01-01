import { clearNodeChildren, msgBox, dateReverse } from '../commonFunc';
import * as context from '../context';
import { setHeader } from '../header/header';

export function sessionform(validForm, headerIcon, create = true, session = null) {
  /* display form to input session data
      parameters:
        callback function to validate the form input
        icons to display in the header
        "create"= true or false if false it is an update
          if update,  a session from session list is required
      onclik call validForm
  */
  //  set the header and the buttons

  //     clear maindiv
  const divmain = clearNodeChildren('#divmain');

  if (!create && !session) { msgBox('pour mise à jour il faut une session!!'); }

  // set title
  let titre = '';
  let date = '';
  if (create) {
    titre = 'nouvelle Session ';
  } else {
    date = dateReverse('display', session.sessdate);
    titre = `mise à jour Session du ${date} : `;
  }
  titre = `${context.getCurGrp().grpdesc} \n ${titre}`;
  setHeader(titre, headerIcon);

  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  const p3 = document.createElement('p');

  const f = document.createElement('form');
  f.className = 'formContainer';
  f.onsubmit = (e) => {
    e.preventDefault();
    validForm(create, session);
  };
  const i1 = document.createElement('input'); // input date
  i1.setAttribute('type', 'text');
  i1.setAttribute('name', 'newsessdate');
  if (create) {
    i1.setAttribute('placeholder', 'jj/mm/aaaa');
    i1.required = 'required';
  } else {
    i1.value = date;
  //  i1.readOnly = true;
  }
  i1.setAttribute('id', 'i1id');
  const i1Label = document.createElement('Label');
  i1Label.setAttribute('for', 'i1id');
  i1Label.innerText = 'date ';

  const i2 = document.createElement('input'); // input lieu
  i2.setAttribute('type', 'text');
  i2.setAttribute('name', 'newsesslieu');
  if (create) {
    i2.setAttribute('placeholder', 'lieu ');
  } else {
    i2.value = session.sesslieu;
  }
  i2.setAttribute('id', 'i2id');
  i2.required = 'required';
  const i2Label = document.createElement('Label');
  i2Label.setAttribute('for', 'i2id');
  i2Label.innerHTML = 'lieu ';

  const i3 = document.createElement('input'); // input rdv
  i3.setAttribute('type', 'text');
  i3.setAttribute('name', 'newsessrdv');
  if (create) {
    i3.setAttribute('placeholder', 'lieu rdv ');
  } else {
    i3.value = session.sessrdv;
  }
  i3.setAttribute('id', 'i3id');
  i3.required = 'required';
  const i3Label = document.createElement('Label');
  i3Label.setAttribute('for', 'i3id');
  i3Label.innerHTML = 'rdv ';

  const i4 = document.createElement('textarea'); // input info additionnelle
  i4.name = 'sessinfo';
  if (create) {
    i4.setAttribute('placeholder', 'infos');
  } else {
    i4.value = session.sessinfo;
  }
  i4.id = 'i4id';
  i4.rows = 2;
  i4.cols = 26;
  const i4Label = document.createElement('Label');
  i4Label.setAttribute('for', 'i4id');
  i4Label.innerHTML = 'info suppl.';
  i4Label.style.width = '10em';

  const i5 = document.createElement('input'); // input link
  i5.setAttribute('type', 'text');
  i5.setAttribute('name', 'newsesslink');
  if (create) {
    i5.setAttribute('placeholder', 'lien ');
  } else {
    i5.value = session.sesslink;
  }
  i5.setAttribute('id', 'i5id');
  const i5Label = document.createElement('Label');
  i5Label.setAttribute('for', 'i5id');
  i5Label.innerHTML = 'lien vers un site ';
  i5Label.style.width = '10em';

  const s = document.createElement('button'); //  Submit button
  s.setAttribute('type', 'submit');
  s.style.display = 'block';
  s.style.margin = '1em auto';
  s.innerHTML = 'envoi';

  f.appendChild(i1Label);
  f.appendChild(i1);
  f.appendChild(p1);
  f.appendChild(i2Label);
  f.appendChild(i2);
  f.appendChild(p2);
  f.appendChild(i3Label);
  f.appendChild(i3);
  f.appendChild(p3);
  f.appendChild(i4Label);
  f.appendChild(i4);
  f.appendChild(i5Label);
  f.appendChild(i5);
  f.appendChild(s);

  divmain.appendChild(f);
  if (create) {
    document.getElementById('i1id').focus();
  } else {
    document.getElementById('i2id').focus();
  }
}

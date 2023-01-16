import {
  msgBox, spinner,
} from './commonFunc';
import * as context from './context';
import { engine } from './engine';
/*
  variables received from wordpress
    pluginUrl    url of the plugin, used in :
       configurl set in config
       phpurl    set in database
       homeUrl   set in context
    userFields   details of the user -> set in context
    wpParm       parm coming from the shortcode (eg program="randonnee") -> set in context
*/
/* ====================================================================================
    Handle errors
*/
window.onerror = (msg, url, line) => {
  spinner(false);
  const myRe = /\/[a-zA-Z0-9\-_]*\.js/;
  const jsArray = myRe.exec(url); //  get program name from the url
  const jsInError = jsArray[0].substring(1); // delete leading '/'
  msgBox(
    'Une erreur grave s\'est produite. <br> impossible de continuer. <br>'
    + 'Prévenez l\'administrateur du site en lui communiquant les infos ci-dessous:'
    + `<br>Message : ${msg}<br>Module : ${jsInError} - Ligne  : ${line}`
    + '<br>cliquer sur ok pour revenir à l\'accueil.',
    'fatal',
    context.homeUrl,
  );
};
window.addEventListener(
  'unhandledrejection',
  (e) => {
    msgBox(
      'Une erreur grave s\'est produite. Impossible de continuer. <br>'
      + 'Prévenez l\'administrateur du site en lui communiquant les infos ci-dessous:'
      + `<br>unhandled ${e.reason} `
      + '<br>cliquer sur ok pour revenir à l\'accueil.',
      'fatal',
      context.homeUrl,
    );
  },
);

// ============================================================================
/*
    Handle navigation with onpopstate
    define page to display if navigation with backward/forward arrow
    or history.back()
*/
window.onpopstate = (event) => context.pageControl(event);

// ============================================================================

// engine();

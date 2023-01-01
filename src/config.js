import { fetchGetJson } from './fetchFunc';
import * as context from './context';

//
//  trigger for features
//
const configUrl = `${window.configUrl}`; // path to config file
let confLoaded = null;
let conf = {
  checkTelMail: 0,
  dateSwitch: '/11/01',
  codeAtLaunch: 0,
  routing: 1,
  messageIntro: 'toto',
  refusalDate: '2021/11/01',
};
function getConfig() {
  return conf;
}
export { getConfig };

function loadConfig() {
  if (!confLoaded) {
    confLoaded = fetchGetJson(
      configUrl,
      (result) => {
        conf = { ...result };
        conf.refusalDate = (parseInt(context.season.current, 10) - 1).toString()
                          + result.dateSwitch; // after this date the user is refused
        return conf;
      },
    );
  }
  return confLoaded;
}
export { loadConfig };

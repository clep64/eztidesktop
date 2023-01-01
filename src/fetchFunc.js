import { fetch, Body } from "@tauri-apps/api/http"; 

//= ===================================================================================
async function fetchGetJson(url, callback) {
  /*
  receives
      an url,
      a callback function to process the answer(optional)
  return a promise
  */
    const reponse = await fetch(url, {
      method: 'GET',
      timeout: 30,
    });
    if (callback) { return callback(reponse.data); }    
    return reponse.data;
  }
  export { fetchGetJson };
//= ===================================================================================

async function fetchPostJson(url, param, callback) {
/*
receives
    an url,
    the related parameters as an object
    and the callback function to process the answer
return a promise
*/
  const bodyParm = Body.json(param);
  const reponse = await fetch(url, {
    method: 'post',
    timeout: 30,
    body: bodyParm
  });
  if (callback) { return callback(reponse.data); }    
  return reponse.data;
}
export { fetchPostJson };
//= ===================================================================================

import { msgBox, clearNodeChildren } from '../commonFunc';

function setHeader(titre, iconArray) {
  /*
      set the header
      receive title and an array of img element for actions (aide, exit, return,...)
  */
  const title = document.querySelector('#usrconn');
  title.textContent = titre;
  title.style.cssText += 'font-size:1.3em;font-weight:bold;';

  // clear buttons
  clearNodeChildren('#topbuttonspan');

  // create buttons
  iconArray.forEach((icon) => setImgButton(icon));
}
export { setHeader };

// =============================================================================

function setImgButton(imgnode) {
  /*
      add a button in the top menu
      receive an element image containing id, title, onclick
      return the image node
  */
  let imgButton;
  if (imgnode instanceof Element) {
    // create the node from the img element
    imgButton = imgnode.cloneNode();
    imgButton.id = imgnode.id;
    imgButton.className = 'topicon';
    imgButton.title = imgnode.title;
    imgButton.onclick = imgnode.onclick;
    document.querySelector('#topbuttonspan').appendChild(imgButton);
  } else {
    msgBox("setImgButton : Le parametre imgnode n'est pas un element img ");
  }
  return imgButton;
}

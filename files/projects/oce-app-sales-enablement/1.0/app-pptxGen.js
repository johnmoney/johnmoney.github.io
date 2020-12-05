/* app-genPptx.js v1.0 */

//promise based content api search published items
//https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-content-delivery/op-published-api-v1.1-items-get.html
let getContent = function (id) {
  return new Promise((resolve, reject) => {
    let uri = `${config.api.content}/items/${id}?q=fields=all&channelToken=${config.channelToken}`;
    console.info('%cquery: ' + uri, 'color: #0099ff;');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          const json = JSON.parse(this.response);
          return resolve(json);
        } else {
          return reject({ status: this.status, text: this.statusText })
        }
      }
    };
    xhr.onerror = reject
  });
};

(function (window) {

  function pptxForm() {
    // 2. Get content
    let slides = ['CORE0BB171B996274E979737B874F0217A47'];

    slides.forEach(function(id) {
      getContent(id).then(function(item) {
        console.debug(item);
     });
    });
  }

  //main entry
  document.getElementById('pptxGen').addEventListener('click', pptxForm);

})(window);
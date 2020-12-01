/* app-documents.js v1.0 */
(function (window) {

  //promise based documents api file search
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-folders-search-items-get.html
  function searchFiles() {
    return new Promise((resolve, reject) => {
      
      const uri = `${config.api.documents}/folders/${config.documents.parentFolderId}/search/items?querytext=fOwner<MATCHES>"14001"&fields=metadata`;
      let xhr = new XMLHttpRequest();

      xhr.open('GET', uri, true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            console.log(this.response);
            return resolve(this.response);
          } else {
            return reject({ status: this.status, text: this.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';

    searchFiles().then(function(response) {
    });

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //main entry
  document.getElementById('documents-menu').addEventListener('click', renderDocuments);

})(window);
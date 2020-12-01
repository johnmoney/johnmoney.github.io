/* app-documents.js v1.0 */
(function (window) {

  //promise based documents api file search
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-folders-search-items-get.html
  function searchFiles() {
    return new Promise((resolve, reject) => {
      let account = JSON.parse(sessionStorage.getItem('account'));
      if (account) {
        const uri = `${config.api.documents}/folders/${config.documents.parentFolderId}/search/items?querytext=fOwnerLoginName<MATCHES>%60${account.email}%60&fields=metadata&orderby=lastModifiedDate:desc`;
        let xhr = new XMLHttpRequest();
  
        xhr.open('GET', uri, true);
        xhr.send();
  
        xhr.onreadystatechange = function() {
          if (this.readyState === 4) {
            if (this.status === 200) {
              const json = JSON.parse(this.response);
              let items = [];
              json.items.forEach(function(item) {
                if (item.type == 'file') {
                  items.push(item);
                }
              }
              return resolve(items);
            } else {
              return reject({ status: this.status, text: this.statusText })
            }
          }
        };
        xhr.onerror = reject
      }
      else {
        return reject({ status: 403, text: 'Account not defined' })
      }
    });
  }

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';

    searchFiles().then(function(items) {
    });

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //main entry
  document.getElementById('documents-menu').addEventListener('click', renderDocuments);

})(window);
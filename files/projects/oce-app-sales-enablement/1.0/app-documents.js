/* app-documents.js v1.0 */
(function (window) {

  //promise based documents api file search
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-files-fileid-metadata-get.html
  function getFileMetadata(fileId) {
    return new Promise((resolve, reject) => {
      const uri = `${config.api.documents}/files/${fileId}/metadata`;
      console.info('%cquery: ' + uri, 'color: #0099ff;');
      let xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            const json = JSON.parse(this.response);
            return resolve(json.metadata);
          } else {
            return reject({ status: this.status, text: this.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //promise based documents api file search
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-folders-search-items-get.html
  function getFiles() {
    return new Promise((resolve, reject) => {
      let account = JSON.parse(sessionStorage.getItem('account'));
      if (account) {
        const uri = `${config.api.documents}/folders/${config.documents.parentFolderId}/search/items?querytext=fOwnerLoginName<MATCHES>%60${account.email}%60&fields=metadata&orderby=lastModifiedDate:desc`;
        console.info('%cquery: ' + uri, 'color: #0099ff;');
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
              });
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

  function renderCard(item) {
    //console.debug(item);
    var asset;
    let assetId = item.metadata[config.documents.collection][config.documents.sourceField];
    let assetVersion = item.metadata[config.documents.collection][config.documents.sourceVersionField];
    if (assetId) {
      asset = JSON.parse(sessionStorage.getItem(assetId));
    }
    console.debug(asset);

    let card = document.createElement('a');
    card.classList.add('card');
    card.classList.add('mr-3');
    card.classList.add('mb-3');
    card.setAttribute('href', `/documents/fileview/${item.id}`);
    card.setAttribute('target', "_blank");

    let cardTop = document.createElement('img');
    cardTop.classList.add('card-img-top');
    cardTop.src = `/documents/web?IdcService=GET_THUMBNAIL&item=fFileGUID:${item.id}&arCaaSVersion=1&timeStamp=1605921816141`;
    card.appendChild(cardTop);

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.classList.add('d-flex');
    cardBody.classList.add('flex-column');
    card.appendChild(cardBody);

    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.classList.add('lines-3');
    cardTitle.textContent = item.name;
    cardBody.appendChild(cardTitle);

    let cardText = document.createElement('div');
    cardText.classList.add('card-text');
    cardText.classList.add('flex-grow-1');
    cardBody.appendChild(cardText);

    let cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');
    cardFooter.classList.add('text-muted');
    cardFooter.innerHTML = `Updated <span class="timeago" datetime="${item.modifiedTime}">${item.modifiedTime}</span>`;
    card.appendChild(cardFooter);

    return card;
  }

  function getFilesMeta(item) {
    return new Promise((resolve, reject) => {
      getFileMetadata(item.id)
      .then((response) => {
        item.metadata = response;
        resolve(item);
      });
    })
  }

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';
    showLoader();

    var promises = [];
    var files = [];

    getFiles().then(function(items) {
      items.forEach(function(item) {
        promises.push(getFilesMeta(item));
      });
    });

    Promise.all(promises).then((results) => { 
      console.log(results);
      if (files.length) {
        //add cards-deck div
        let cards = document.createElement("div");
        cards.classList.add('d-flex');
        cards.classList.add('flex-wrap');
        modalBody.appendChild(cards);

        //add cards
        let nodes = files.map(renderCard);
        cards.append(...nodes);

        //update timeago
        timeago().render(document.querySelectorAll('.timeago'));
      }
      else {
        renderNoResults();
      }

//      showLoader(false);
    });

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //toggle loader and main sections
  function showLoader(showLoader = true) {
    if (showLoader) {
      const modal = document.getElementById('modal');
      const modalBody = modal.getElementsByClassName('modal-body')[0];
      modalBody.innerHTML = '<div id="modal-loader" class="container"><div class="row my-5"><div class="col-8 mx-auto text-center"><div class="pt-4 overflow-hidden"><div class="ball-pulse"><div></div><div></div><div></div></div></div></div></div></div>';
    }
    else {
      document.getElementById('modal-loader').classList.add('d-none');
    }
  }

  //create Bootstrap alert
  function createAlert(html, type = 'success', icon = '') {
    const alerts = document.getElementById('alerts');
    let alert = document.createElement('div');
    alert.classList.add('alert');
    alert.classList.add('alert-' + type);
    alert.classList.add('alert-dismissible');
    alert.classList.add('fade');
    alert.classList.add('show');
    alert.setAttribute('role', 'alert');

    if (!icon) {
      switch (type) {
        case 'warning':
          icon = 'exclamation-triangle'; break;
        case 'danger':
          icon = 'bug'; break;
        case 'info':
          icon = 'info-circle'; break;
          default:
          icon = 'check-circle-o';
      }
    }
    const iconHTML = `<i class="fa fa-${icon} mr-2" aria-hidden="true"></i>`;

    alert.innerHTML = iconHTML + html + '<button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"></button>';
    alerts.appendChild(alert);
  }

  function renderNoResults() {
    const modal = document.getElementById('modal');
    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';
    let container = document.createElement("h3");
    container.classList.add('my-5');
    container.classList.add('text-center');
    container.innerText = 'No documents found';
    modalBody.appendChild(container);
  }

  //main entry
  document.getElementById('documents-menu').addEventListener('click', renderDocuments);

})(window);
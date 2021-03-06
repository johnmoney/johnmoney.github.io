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
              let promises = [];
              json.items.forEach(function(item) {
                if (item.type == 'file') {
                  //getFiles not returning metadata per docs
                  promises.push(getFileMetadata(item.id));
                  items.push(item);
                }
              });
              Promise.all(promises).then((metadata) => {
                json.items.forEach(function(item, idx) {
                  item.metadata = metadata[idx];
                });
                //console.debug(items);
                return resolve(items);
              });
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
    var asset, itemAssetId, itemAssetVersion;
    if (item.metadata !== undefined) {
      if (item.metadata[config.documents.collection] !== undefined) {
        itemAssetId = item.metadata[config.documents.collection][config.documents.sourceField];
        itemAssetVersion = item.metadata[config.documents.collection][config.documents.sourceVersionField];
        if (itemAssetId) {
          asset = JSON.parse(sessionStorage.getItem(itemAssetId));
        }
        //console.debug(asset);
      }
    }

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

    if (asset) {
      if (asset.assetType != undefined) {
        let cardLabel = document.createElement('div');
        cardLabel.classList.add('card-label');
        cardLabel.classList.add('category-' + asset.assetType.id);
        cardLabel.textContent = asset.assetType.name;
        card.appendChild(cardLabel);
      }
    }

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
    cardFooter.classList.add('d-flex');
    cardFooter.classList.add('justify-content-between');
    card.appendChild(cardFooter);

    let icons = document.createElement('div');
    cardFooter.appendChild(icons);

    if (itemAssetVersion) {
      //check version
      let assetVersionIcon = document.createElement('div');
      assetVersionIcon.classList.add('badge');
      assetVersionIcon.classList.add('rounded-pill');
      assetVersionIcon.classList.add('bg-success');
      assetVersionIcon.setAttribute('data-toggle', 'tooltip');
      assetVersionIcon.setAttribute('data-placement', 'right');
      assetVersionIcon.setAttribute('title', 'Document is using the latest asset version');
      assetVersionIcon.textContent = itemAssetVersion;

      if (asset) {
        if (itemAssetVersion != asset.fields.version) {
          assetVersionIcon.classList.remove('bg-success');
          assetVersionIcon.classList.add('bg-danger');
          assetVersionIcon.setAttribute('title', 'Document is using outdated asset version');
        }
      }
      icons.appendChild(assetVersionIcon);
    }

    let updated = document.createElement('div');
    updated.classList.add('text-muted');
    updated.innerHTML = `Updated <span class="timeago" datetime="${item.modifiedTime}">${item.modifiedTime}</span>`;
    cardFooter.appendChild(updated);

    return card;
  }

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';
    showLoader();

    getFiles().then(function(files) {
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

        //update tooltips
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('#modal [data-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        })
      }
      else {
        renderNoResults();
      }

      showLoader(false);
    });

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //toggle loader and main sections
  function showLoader(showLoader = true) {
    if (showLoader) {
      const modal = document.getElementById('modal');
      const modalBody = modal.getElementsByClassName('modal-body')[0];
      modalBody.innerHTML = '<div id="modal-loader" class="container"><div class="row my-5"><div class="col-8 mx-auto text-center"><div class="py-3 overflow-hidden"><div class="ball-pulse"><div></div><div></div><div></div></div></div></div></div></div>';
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
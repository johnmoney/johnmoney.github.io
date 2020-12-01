/* app-documents.js v1.0 */
(function (window) {

  //promise based documents api file search
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-folders-search-items-get.html
  function getFiles() {
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
    let card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('mr-3');
    card.classList.add('mb-3');

    let cardTop = document.createElement('img');
    cardTop.classList.add('card-img-top');
    cardTop.src = `/documents/web?IdcService=GET_THUMBNAIL&item=arCaaSGUID:${item.id}&arCaaSVersion=1&timeStamp=1605921816141`;
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

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';


//    showLoader();
    getFiles().then(function(items) {
      if (items.length) {
        //add cards-deck div
        let cards = document.createElement("div");
        cards.classList.add('d-flex');
        cards.classList.add('flex-wrap');
        modalBody.appendChild(cards);

        //add cards
        let nodes = items.map(renderCard);
        cards.append(...nodes);

        //update timeago
        timeago().render(document.querySelectorAll('.timeago'));
      }
      else {
//        renderNoResults();
      }

      showLoader(false);
    })
    .catch((e) => {
      console.error(e);
//      showLoader(false);
//      createAlert('An error has occurred loading documents.', 'danger');
    });

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //main entry
  document.getElementById('documents-menu').addEventListener('click', renderDocuments);

})(window);
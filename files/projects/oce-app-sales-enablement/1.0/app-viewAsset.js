/* app-viewAsset.js v1.0 */
(function (window) {

  //promise based asset download
  function getFile(item) {
    return new Promise((resolve, reject) => {
      const uri = `${config.api.content}/assets/${item.id}/native?channelToken=${config.channelToken}`;
      let xhr = new XMLHttpRequest();

      xhr.open('GET', uri, true);
      xhr.responseType = 'arraybuffer';
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            var file = new File([this.response], 'Copy of ' + item.name, {type: item.mimeType});
            return resolve(file);
          } else {
            return reject({ status: this.status, text: this.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //promise based documents api file upload
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-files-data-post.html
  function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const uri = `${config.api.documents}/files/data`;
      let xhr = new XMLHttpRequest();
      let fd = new FormData();

      xhr.open('POST', uri, true);
      fd.append('jsonInputParameters', '{"parentID":"' + config.documents.parentFolderId + '"}');
      fd.append('primaryFile', file);
      xhr.send(fd);

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 201) {
              const json = JSON.parse(xhr.response);
              return resolve(json.id);
          } else {
              return reject({ status: this.status, text: xhr.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //promise based documents api file upload
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-files-fileid-metadata-collectionname-post.html
  function addFileCollection(fileId) {
    return new Promise((resolve, reject) => {
      const uri = `${config.api.documents}/files/${fileId}/metadata/${config.documents.collection}`;
      let xhr = new XMLHttpRequest();
      xhr.open('POST', uri, true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
              const json = JSON.parse(xhr.response);
              if (json.errorCode == "0") {
                return resolve(json);
              }
              else {
                return reject({ status: 400, text: json.errorMessage })
              }
          } else {
              return reject({ status: this.status, text: xhr.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //promise based documents api file upload
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-documents/op-documents-api-1.2-files-fileid-metadata-post.html
  function setFileCollection(fileId, item) {
    return new Promise((resolve, reject) => {
      const uri = `${config.api.documents}/files/${fileId}/metadata`;
      let xhr = new XMLHttpRequest();
      let params = new Object;
      params.collection = config.documents.collection;
      params[config.documents.sourceField] = item.id;
      params[config.documents.sourceVersionField] = item.version;

      xhr.open('POST', uri, true);
      xhr.send(JSON.stringify(params));

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            const json = JSON.parse(xhr.response);
            if (json.errorCode == "0") {
              return resolve(json);
            }
            else {
              return reject({ status: 400, text: json.errorMessage })
            }
          } else {
              return reject({ status: this.status, text: xhr.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //copy asset button
  function copyAssetButton() {
    let item = new Object;
    item.id = this.getAttribute('data-oce-id');
    item.name = this.getAttribute('name');
    item.mimeType = this.getAttribute('data-mimetype');
    item.version = this.getAttribute('data-version');
    if (item.id && item.name && item.mimeType && item.version) {
      showLoader();
      bootstrap.Modal.getInstance(document.getElementById('modal')).hide();

      getFile(item).then(function(file) {
        //create folder

        uploadFile(file).then(function(fileId) {
          addFileCollection(fileId).then(function(response) {
            setFileCollection(fileId, item).then(function(response) {
              //show success
              showLoader(false);
              createAlert(`${item.name} copied to your Documents. <a target="_blank" href="/documents/fileview/${fileId}">View document</a>`, 'success', 'files-o')
            })
            .catch((e) => {
              console.error(e);
              showLoader(false);
              createAlert('An error has occurred setting metadata on the asset.', 'danger');
            });
          })
          .catch((e) => {
            console.error(e);
            showLoader(false);
            createAlert('An error has occurred setting metadata on the asset.', 'danger');
          });
        })
        .catch((e) => {
          console.error(e);
          showLoader(false);
          createAlert('An error has occurred copying the asset.', 'danger');
        });
      })
      .catch((e) => {
        console.error(e);
        showLoader(false);
        createAlert('An error has occurred copying the asset.', 'danger');
      });
    }
  }

  //toggle loader and main sections
  function showLoader(showLoader = true) {
    const results = document.getElementById('results');
    const loader = document.getElementById('loader');
    if (showLoader) {
      results.classList.add('d-none');
      loader.classList.remove('d-none');
    }
    else {
      loader.classList.add('d-none');
      results.classList.remove('d-none');
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

  //render asset in modal
  const modal = document.getElementById('modal');
  modal.addEventListener('show.bs.modal', function (event) {
    const card = event.relatedTarget;
    const id = card.getAttribute('data-oce-id');
    if (id) {
      const modal = document.getElementById('modal');
      const modalTitle = modal.getElementsByClassName('modal-title')[0];
      modalTitle.textContent = card.getAttribute('title');
      let item = JSON.parse(sessionStorage.getItem(id));
  
      const modalBody = modal.getElementsByClassName('modal-body')[0];
      modalBody.innerHTML = '';
  
      //add preview
      let preview = document.createElement('div');
      preview.classList.add('preview');
      modalBody.appendChild(preview);
      OracleCEUI.oceUrl = config.api.url;
      OracleCEUI.ssoInit().then(function() {
        var options = {
          "component": "assetViewer",
          "id": "EMBED_UI",
          "name": "Embed UI",
          "scheme": "default",
          "takeFocus": false,
          "assetViewer": {
            "header": {
              "hide": true,
              "create": false,
              "annotate": false,
              "fullScreen": false,
              "close": false,
              "save": false
            },
            "actions": {
              "open": false,
              "edit": false,
              "download": false,
              "uploadNewVersion": false,
              "makeCurrent": false,
              "compare": false,
              "preview": false
            },
            "fields": {
              "display": false,
              "expand": false
            },
            "controls": {
              "fit": "default",
              "zoom": true,
              "fitOriginal": true,
              "fitPage": true,
              "fitWidth": true
            },
            "thumbnails": {
              "hide": false,
              "expand": true
            },
            "sidebar": {
              "expand": false,
              "analytics": false,
              "categories": false,
              "channels": false,
              "conversation": false,
              "inventory": false,
              "properties": false,
              "renditions": false,
              "tagsAndCollections": false,
              "translations": false,
              "workflow": false,
              "options": {}
            },
            "videoControls": {
              "hide": false,
              "autoplay": false,
              "loop": false,
              "mute": false
            },
            "views": {},
            "id": item.id,
            "version": item.fields.version
          },
          "v1": {
            "show_branding": false,
            "show_navmenu": false,
            "show_findbar": false,
            "hide_search": true
          }
        };
        var events = {};
        var frameElement = OracleCEUI.assetViewer.createFrame(options, events);
        preview.appendChild(frameElement);
      });

      let container = document.createElement('div');
      container.classList.add('container');
      container.classList.add('mt-4');
      modalBody.appendChild(container);

      let row = document.createElement('div');
      row.classList.add('row');
      container.appendChild(row);

      let col1 = document.createElement('div');
      col1.classList.add('col-7');
      row.appendChild(col1);

      let dl = document.createElement('dl');
      dl.classList.add('row');
      col1.appendChild(dl);

      //add categories
      for (var x=0; x < item.taxonomies.items.length; x++) {
        let div = document.createElement('div');
        for (var z=0; z < config.assets.filterTaxonomies.length; z++) {
          if (item.taxonomies.items[x].id == config.assets.filterTaxonomies[z]) {
            div.classList.add('order-' + z);
            break;
          }
        }
        dl.appendChild(div);

        let dt = document.createElement('dt');
        dt.classList.add('col-4');
        dt.textContent = item.taxonomies.items[x].name;
        div.appendChild(dt);

        let categories = new Array;
        for (var y=0; y < item.taxonomies.items[x].categories.items.length; y++) {
          categories.push(item.taxonomies.items[x].categories.items[y].name);
        }
        let dd = document.createElement('dd');
        dd.classList.add('col-8');
        dd.textContent = categories.join(', ');
        div.appendChild(dd);
      }

      //add version
      let div = document.createElement('div');
      div.classList.add('order-99');
      dl.appendChild(div);

      let dt = document.createElement('dt');
      dt.classList.add('col-4');
      dt.textContent = 'Version';
      div.appendChild(dt);

      let dd = document.createElement('dd');
      dd.classList.add('col-8');
      dd.textContent = item.fields.version;
      div.appendChild(dd);

      let col2 = document.createElement('div');
      col2.classList.add('col-5');
      row.appendChild(col2);

      const modalFooter = modal.getElementsByClassName('modal-footer')[0];
      modalFooter.innerHTML = '';
  
      //add copy asset button
      let button = document.createElement('div');
      button.classList.add('btn');
      button.classList.add('btn-primary');
      button.innerHTML = '<i class="fa fa-cloud-download mr-2" aria-hidden="true"></i>Copy asset';
      button.setAttribute('name', item.name);
      button.setAttribute('data-oce-id', item.id);
      button.setAttribute('data-mimetype', item.fields.mimeType);
      button.setAttribute('data-version', item.fields.version);
      modalFooter.appendChild(button);
      button.addEventListener("click", copyAssetButton);
    }
  });

})(window);
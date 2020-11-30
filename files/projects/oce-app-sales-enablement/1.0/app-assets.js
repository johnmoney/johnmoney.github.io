/* app-assets.js v1.0 */
(function (window) {
  let searchQuery = '';
  let selectedCategories = new Object;

  //promise based content api search published items
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-content-delivery/op-published-api-v1.1-items-get.html
  function getItems() {
    return new Promise((resolve, reject) => {
      const hash = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      let getRoundedDate = (minutes, d=new Date()) => {
        let ms = 1000 * 60 * minutes;
        let roundedDate = new Date(Math.round(d.getTime() / ms) * ms);
        return roundedDate
      }

      let taxonomyQueryString = '';
      let taxonomyQuery = new Array;
      for (const taxonomy in selectedCategories) {
        if (selectedCategories[taxonomy].length) {
          let categoryQuery = new Array;
          selectedCategories[taxonomy].forEach(function(id) {
            categoryQuery.push(`taxonomies.categories.nodes.id eq "${id}"`);
          });
          taxonomyQuery.push('(' + categoryQuery.join(' OR ') + ')')
        }
      }
      if (taxonomyQuery.length) {
        taxonomyQueryString = ' AND (' + taxonomyQuery.join(' AND ') + ')';
      }
      let searchQueryString = searchQuery ? `&default="${searchQuery}"` : '';

      let uri = `${config.api.content}/items?q=(type eq "DigitalAsset"${taxonomyQueryString})${searchQueryString}&fields=all&channelToken=${config.channelToken}`;
      let queryHash = 'query:' + hash(uri) + ':' + getRoundedDate(config.api.cacheMinutes);
      let items = JSON.parse(sessionStorage.getItem(queryHash));
      if (items) {
        return resolve(items);
      }
      else {
        console.info('%cquery: ' + uri, 'color: #0099ff;');
        let xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    
        xhr.onreadystatechange = function() {
          if (this.readyState === 4) {
            if (this.status === 200) {
              const json = JSON.parse(this.response);
              let items = [];
              json.items.forEach(function(item) {
                if (config.assets.validMimeTypes.includes(item.fields.mimeType)) {
                  sessionStorage.setItem(item.id, JSON.stringify(item));
                  items.push(item);
                }
                else {
                  console.error(`${item.id} invalid mimeType ${item.fields.mimeType}`);
                }
              });
              sessionStorage.setItem(queryHash, JSON.stringify(items));
              return resolve(items);
            } else {
              return reject({ status: this.status, text: this.statusText })
            }
          }
        };
        xhr.onerror = reject
      }
    });
  }

  //handle search form submit
  function searchSubmit(e) {
    let q = document.getElementById('search').getElementsByTagName('input')[0].value;
    //@todo run through stop words
    //@todo extract taxonomies
    console.log('q=' + q);
    searchQuery = q;
    renderCards();

    let searchClear = document.getElementById('search-clear');
    if (q) {
      searchClear.classList.remove('d-none');
    }
    else {
      searchClear.classList.add('d-none');
    }

    e.preventDefault();
  }

  //clear search query
  function searchClear(e) {
    const form = document.getElementById('search');
    form.getElementsByTagName('input')[0].value = '';
    form.dispatchEvent(new Event('submit'));
  }

    //promise based content api search categories
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-content-delivery/op-published-api-v1.1-taxonomies-id-get.html
  function getTaxonomy(id) {
    return new Promise((resolve, reject) => {
      let uri = `${config.api.content}/taxonomies/${id}?channelToken=${config.channelToken}`;
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
  }

  //promise based content api search categories
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-content-delivery/op-published-api-v1.1-taxonomies-id-categories-get.html
  function getCategories(id) {
    return new Promise((resolve, reject) => {
      let uri = `${config.api.content}/taxonomies/${id}/categories?limit=9999&orderBy=position:asc&fields=all&channelToken=${config.channelToken}`;
      let xhr = new XMLHttpRequest();

      xhr.open('GET', uri, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            const json = JSON.parse(this.response);
            let categories = new Array;
            let categoriesIdx = new Array;
            let categoriesChildren = new Array;
            json.items.forEach(function(item) {
              if (!item.parent) {
                let node = new Object;
                node.id = item.id;
                node.text = item.name;
                node.children = new Array;
                categories.push(node);
                categoriesIdx.push(item.id);
              }
              else {
                categoriesChildren.push(item);
              }
            });
            categoriesChildren.forEach(function(item) {
              if (categoriesIdx.indexOf(item.parent.id) != -1) {
                let node = new Object;
                node.id = item.id;
                node.text = item.name;
                categories[categoriesIdx.indexOf(item.parent.id)].children.push(node);
              }
            });
            return resolve(categories);
          } else {
            return reject({ status: this.status, text: this.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  //create Bootstrap card
  function renderCard(item) {
    //console.debug(item);
    //remove extension from file name
    const itemName =  item.name.substr(0, item.name.lastIndexOf('.')).replace(/[-_]/gi, " ");

    let card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('mr-3');
    card.classList.add('mb-3');
    card.setAttribute('title', itemName);
    card.setAttribute('data-oce-id', item.id);
    card.setAttribute('data-toggle', 'modal');
    card.setAttribute('data-target', '#modal');

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
    cardTitle.textContent = itemName;
    cardBody.appendChild(cardTitle);

    let cardText = document.createElement('div');
    cardText.classList.add('card-text');
    cardText.classList.add('flex-grow-1');
    cardBody.appendChild(cardText);

    let cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');
    cardFooter.classList.add('text-muted');
    cardFooter.innerHTML = `Updated <span class="timeago" datetime="${item.updatedDate.value}">${item.updatedDate.value}</span>`;
    card.appendChild(cardFooter);

    return card;
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

  function renderFilters() {
    const filters = document.getElementById('filters');

    config.assets.filterTaxonomies.forEach(function(id, idx) {
      getTaxonomy(id).then(function(taxonomy) {
        let filterGroup = document.createElement('div');
        filterGroup.classList.add('filter-group');
        filterGroup.classList.add('order-' + idx);
        filters.appendChild(filterGroup);

        let header = document.createElement('h5');
        header.classList.add('text-muted');
        header.textContent = taxonomy.name;
        filterGroup.appendChild(header);
      
        let treeContainer = document.createElement('div');
        treeContainer.id = id;
        filterGroup.appendChild(treeContainer);
    
        getCategories(id).then(function(categories) {
          const myTree = new Tree('#' + id, {
            data: categories,
            closeDepth: 1,
            onChange: function() {
              selectedCategories[id] = this.values;
              renderCards();
            },
          });
        })
        .catch((e) => {
          console.error(e);
        });
      })
      .catch((e) => {
        console.error(e);
        createAlert('An error has occurred rendering filters.', 'danger');
      });
    });
  }

  function renderCards() {
    showLoader();
    getItems().then(function(items) {
      if (items.length) {
        //add cards-deck div
        const results = document.getElementById('results');
        results.innerHTML = '';
        let cards = document.createElement("div");
        cards.classList.add('d-flex');
        cards.classList.add('flex-wrap');
        results.appendChild(cards);

        //add cards
        let nodes = items.map(renderCard);
        cards.append(...nodes);

        //update timeago
        timeago().render(document.querySelectorAll('.timeago'));
      }
      else {
        renderNoResults();
      }

      showLoader(false);
    })
    .catch((e) => {
      console.error(e);
      showLoader(false);
      createAlert('An error has occurred loading assets.', 'danger');
    });
  }

  function renderNoResults() {
    const results = document.getElementById('results');
    results.innerHTML = '';
    let container = document.createElement("h3");
    container.classList.add('my-5');
    container.classList.add('text-center');
    container.innerText = 'No results found';
    results.appendChild(container);
  }

  //main entry
  renderFilters();
  renderCards();

  document.getElementById('search').addEventListener('submit', searchSubmit);
  document.getElementById('search-clear').addEventListener('click', searchClear);

})(window);
/* app-genPptx.js v1.0 */
let getContent = function (contentId) {
  console.log(`contentId = ${contentId}`);
/*
  //promise based content api search published items
  //https://docs.oracle.com/en/cloud/paas/content-cloud/rest-api-content-delivery/op-published-api-v1.1-items-get.html
  function getItems() {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const hash = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      let getRoundedDate = (minutes) => {
        let ms = 1000 * 60 * minutes;
        let roundedDate = new Date(Math.ceil(now.getTime() / ms) * ms);
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
      let queryHash = 'app:query:' + hash(uri);
      let cache = JSON.parse(sessionStorage.getItem(queryHash));
      if (cache && new Date(cache.date) < now) {
        return resolve(cache.items);
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
                  //get assetType
                  item.assetType = new Object;
                  for (var x=0; x < item.taxonomies.items.length; x++) {
                    if (item.taxonomies.items[x].id == config.assets.filterTaxonomies[0]) {
                      item.assetType = item.taxonomies.items[x].categories.items[0];
                      break;
                    }
                  }

                  sessionStorage.setItem(item.id, JSON.stringify(item));
                  items.push(item);
                }
                else {
                  console.error(`${item.id} invalid mimeType ${item.fields.mimeType}`);
                }
              });
              sessionStorage.setItem(queryHash, JSON.stringify({'date': getRoundedDate(config.api.cacheMinutes), 'items': items}));
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
  */

};

(function (window) {

  function pptxForm() {
    //get content
    let slides = ['CORE0BB171B996274E979737B874F0217A47'];
    slides.forEach(function(id) {
      getContent(id);
    });

    // 1. Create a new Presentation
    let pres = new PptxGenJS();

    // 2. Add a Slide
    let slide = pres.addSlide();

    // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
    let textboxText = "Hello World from PptxGenJS!";
    let textboxOpts = { x: 1, y: 1, color: '363636', fill: { color:'F1F1F1' }, align: "center" };
    slide.addText(textboxText, textboxOpts);

    // 4. Save the Presentation
    pres.writeFile("Sample Presentation.pptx");
  }

  //main entry
  document.getElementById('pptxGen').addEventListener('click', pptxForm);

})(window);
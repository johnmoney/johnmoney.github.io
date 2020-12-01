/* app-account.js v1.0 */
(function (window) {
  //promise based get people
  function getOsnUser(userName = '@me') {
    return new Promise((resolve, reject) => {
      const uri = `/osn/social/api/v1/people/${userName}`;
      console.info('%cquery: ' + uri, 'color: #0099ff;');
      let xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.setRequestHeader('Authorization', 'session');
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

  //promise based asset download
  function getOsnUserImage(osnUri) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      xhr.open('GET', osnUri, true);
      xhr.setRequestHeader('Authorization', 'session');
      xhr.responseType = 'arraybuffer';
      xhr.send();

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            var uInt8Array = new Uint8Array(this.response);
            var i = uInt8Array.length;
            var binaryString = new Array(i);
            while (i--)
            {
              binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }
            var data = binaryString.join('');
            var base64 = window.btoa(data);
            return resolve(base64);
          } else {
            return reject({ status: this.status, text: this.statusText })
          }
        }
      };
      xhr.onerror = reject
    });
  }

  function getAccount(userName = '@me') {
    return new Promise((resolve, reject) => {
      let account = JSON.parse(sessionStorage.getItem('account'));
      if (account) {
        return resolve(account);
      }
      else {
        getOsnUser(userName).then(function(user) {
          getOsnUserImage(user.scaledPictureURL).then(function(userImage) {
            account = new Object;
            account.id = user.id;
            account.name = user.displayName;
            account.email = user.eMailAddress;
            account.img = "data:image/png;base64," + userImage;
            sessionStorage.setItem('account', JSON.stringify(account));
            return resolve(account);
          })
          .catch((e) => {
            console.error(e);
            return reject({ status: e, text: e })
          });
        })
        .catch((e) => {
          console.error(e);
          createAlert('An error has occurred loading account.', 'danger');
          return reject({ status: e, text: e })
        });
      }
    });
  }

  //main entry
  getAccount().then(function(account) {
    const accountMenu = document.getElementById('accountMenu');
    let imgWrapper = document.createElement("div");
    imgWrapper.classList.add('d-inline-flex');
    accountMenu.appendChild(imgWrapper);

    let imgDiv = document.createElement("div");
    imgDiv.classList.add('user');
    imgDiv.classList.add('rounded-circle');
    imgDiv.classList.add('border');
    imgDiv.setAttribute('title', account.name);
    imgWrapper.appendChild(imgDiv);

    let img = document.createElement("img");
    img.src = account.img;
    img.classList.add('img-fluid');
    imgDiv.appendChild(img);
  })
  .catch((e) => {
    console.error(e);
    createAlert('An error has occurred loading account.', 'danger');
  });

})(window);
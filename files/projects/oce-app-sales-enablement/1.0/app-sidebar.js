/* app-sidebar.js v1.0 */
(function (window) {

  //render asset in sidebar
  function renderAsset() {
    const id = this.getAttribute('data-oce-id');
    const sidebar = document.getElementById('sidebar');
    const modalTitle = sidebar.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = this.getAttribute('title');

    const modalBody = sidebar.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = `<div class="preview"><iframe class="document-frame" src="/documents/assetview/${id}/3/preview/html5/pvw.html"></iframe></div>`;

    let item = JSON.parse(sessionStorage.getItem(id));
    var modal = new bootstrap.Modal(sidebar)
  }

  //main entry
  const sidebar = document.getElementById('sidebar');
  let html = `
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title text-truncate"></h5>
      <button type="button" class="btn btn-sm btn-outline-primary" data-dismiss="modal" aria-label="Close">
        <i class="fa fa-times" aria-hidden="true"></i>
      </button>
    </div>
    <div class="modal-body"></div>
    <div class="modal-footer"></div>
  </div>
</div>`;
  sidebar.innerHTML = html;


  sidebar.addEventListener('shown.bs.modal', function () {
    console.log(shown.bs.modal);
  });

})(window);
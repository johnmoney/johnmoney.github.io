/* app-documents.js v1.0 */
(function (window) {

  function renderDocuments() {
    const modal = document.getElementById('modal');
    const modalTitle = modal.getElementsByClassName('modal-title')[0];
    modalTitle.textContent = 'My Documents';

    const modalBody = modal.getElementsByClassName('modal-body')[0];
    modalBody.innerHTML = '';

    const modalFooter = modal.getElementsByClassName('modal-footer')[0];
    modalFooter.innerHTML = '';
  }

  //main entry
  document.getElementById('documents-menu').addEventListener('click', renderDocuments);

})(window);
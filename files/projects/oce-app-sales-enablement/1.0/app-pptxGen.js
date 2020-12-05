/* app-genPptx.js v1.0 */
(function (window) {

  function pptxForm() {
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
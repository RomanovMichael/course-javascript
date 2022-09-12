export default class UserPhoto {
  constructor(element, onUpload) {
    this.element = element;
    this.onUpload = onUpload;

    this.element.addEventListener('dragover', (e) => {
      if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
        e.preventDefault();
      }
    });

    this.element.addEventListener('drop', (e) => {
      const file = e.dataTransfer.items[0].getAsFile();
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.addEventListener('load', () => this.onUpload(reader.result));
      e.preventDefault();
    });

    this.element.addEventListener('click', () => {
      const photoLoad = document.querySelector('#uploadPhoto');
      const closeBtn = document.querySelector('#closeBtn');
      const previewImage = document.querySelector('.upload__preview');
      const inputFile = document.querySelector('#file');
      const fileReader = new FileReader();
      const loadBtn = document.querySelector('#loadBtn');
      const cleanBtn = document.querySelector('#cleanBtn');

      photoLoad.classList.remove('hidden');

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();

        photoLoad.classList.add('hidden');
      });

      inputFile.addEventListener('change', (e) => {
        const [file] = e.target.files;

        if (file) {
          if (file.size > 500 * 1024) {
            alert('Слишком большой файл');
          } else {
            fileReader.readAsDataURL(file);
          }
        }
      });

      fileReader.addEventListener('load', () => {
        previewImage.style.backgroundImage = 'url(' + fileReader.result + ')';

        cleanBtn.addEventListener('click', () => {
          previewImage.style.backgroundImage = '';
        });
      });

      loadBtn.addEventListener('click', () => {
        this.onUpload(fileReader.result);
      });
    });
  }

  set(photo) {
    this.element.style.backgroundImage = `url(${photo})`;
  }
}

// Tesseract.js ile OCR işlemi
document.getElementById('upload').onchange = function(event) {
    const file = event.target.files[0];
    if (file) {
        // Tesseract kullanarak dosyayı işleyin
        Tesseract.recognize(
            file,
            'eng', // İstenen dil kodu
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            // Çıkan metni konsola yazdır
            console.log(text);
            document.getElementById('output').innerText = text; // Metni HTML sayfasında göster
        });
    }
};

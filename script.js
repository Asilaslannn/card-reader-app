function extractDetails(text) {
    // Şirket adlarını, e-postaları ve telefon numaralarını çıkarmak için regex kullan
    const companyRegex = /([A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)+)/g; // Şirket ve isimler için
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numaralarını tanıyan regex

    // Şirket adları, e-posta adresleri ve telefon numaralarını yakala
    const companies = text.match(companyRegex) || [];
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    // Boş ve geçersiz telefon numaralarını filtrele
    const validPhones = phones.filter(phone => phone.trim().length > 4); // Örneğin, 4 karakterden kısa numaraları filtrele

    return {
        companies: companies,
        emails: emails,
        phones: validPhones
    };
}

document.getElementById('upload').onchange = function(event) {
    const file = event.target.files[0];
    if (file) {
        Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            const extractedData = extractDetails(text);
            console.log("Extracted Data:", extractedData);
            document.getElementById('output').innerText = JSON.stringify(extractedData, null, 2); // Veriyi JSON formatında göster
        });
    }
};

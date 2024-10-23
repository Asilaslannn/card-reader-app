function extractDetails(text) {
    // Şirket adlarını ve kişileri çıkar
    const companyRegex = /[A-Z][a-z]+\s[A-Z][a-z]+/g; // Şirket ve kişi adları için basit regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\+?[0-9\s\-]+/g;

    const companies = text.match(companyRegex);
    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);

    return {
        companies: companies || [],
        emails: emails || [],
        phones: phones || []
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
            document.getElementById('output').innerText = JSON.stringify(extractedData, null, 2); // Veriyi JSON olarak göster
        });
    }
};

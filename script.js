function exportToExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data); // Verileri JSON'dan Excel sayfasına dönüştür
    const workbook = XLSX.utils.book_new(); // Yeni bir çalışma kitabı oluştur
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data"); // Çalışma kitabına sayfa ekle

    // Excel dosyasını kaydet
    XLSX.writeFile(workbook, "OCR_Data.xlsx");
}

function extractDetails(text) {
    const companyRegex = /([A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)+)/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?[0-9\-\s().]+)/g;

    const companies = text.match(companyRegex) || [];
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];

    // Her bir veri tipini Excel için hazırlanan formatta düzenle
    const data = companies.map((company, index) => ({
        "Company": company,
        "Email": emails[index] || "",
        "Phone": phones[index] || ""
    }));

    return data;
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
            
            // Excel'e verileri yazmak için buton ekleyelim
            const exportButton = document.createElement("button");
            exportButton.innerText = "Export to Excel";
            exportButton.onclick = () => exportToExcel(extractedData);
            document.body.appendChild(exportButton);
        });
    }
};

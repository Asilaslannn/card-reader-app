function extractDetails(text) {
    const nameRegex = /([A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)+)/g; // İsim ve soyisimler
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // E-posta
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numarası
    const websiteRegex = /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g; // Web siteleri

    const names = text.match(nameRegex) || [];
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const websites = text.match(websiteRegex) || [];

    // Her bir veri tipini tablo için formatla
    const data = names.map((name, index) => ({
        "Name": name || "",
        "Email": emails[index] || "",
        "Phone": phones[index] || "",
        "Website": websites[index] || ""
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
            document.getElementById('output').innerText = JSON.stringify(extractedData, null, 2);

            // Tabloda verileri göster
            const table = document.createElement('table');
            table.setAttribute('border', '1');
            const headers = ["Name", "Email", "Phone", "Website"];
            const headerRow = table.insertRow(0);
            headers.forEach(header => {
                const cell = headerRow.insertCell();
                cell.textContent = header;
            });

            extractedData.forEach((rowData, rowIndex) => {
                const row = table.insertRow(rowIndex + 1);
                headers.forEach((header, cellIndex) => {
                    const cell = row.insertCell(cellIndex);
                    cell.textContent = rowData[header];
                });
            });

            document.body.appendChild(table);

            // Excel'e yazma butonunu ekle
            const exportButton = document.createElement("button");
            exportButton.innerText = "Export to Excel";
            exportButton.onclick = () => exportToExcel(extractedData);
            document.body.appendChild(exportButton);
        });
    }
};

function exportToExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "OCR_Data.xlsx");
}

function extractDetails(text) {
    const companyRegex = /([A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)+)/g; // Şirket adları
    const nameRegex = /Dr\.?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g; // İsim ve soyisim
    const positionRegex = /(Manager|Director|Engineer|Specialist)/g; // Pozisyon
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numarası
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // E-posta adresi
    const cityCountryRegex = /(Jeddah|Saudi Arabia|UAE|United Arab Emirates)/g; // Şehir ve ülke tanıma

    // Verileri yakala
    const companies = text.match(companyRegex) || [];
    const names = text.match(nameRegex) || ["Responsible"];
    const positions = text.match(positionRegex) || ["Responsible"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const emails = text.match(emailRegex) || [];
    const citiesCountries = text.match(cityCountryRegex) || ["Unknown"];

    // Her bir veri tipini tablo için formatla
    const data = companies.map((company, index) => ({
        "Company": company || "",
        "Name": names[index] || "Responsible",
        "Surname": ".", // Soyadını yakalayamadığımız durumda varsayılan değer
        "Position": positions[index] || "Responsible",
        "Phone": phones[index] || "",
        "Email": emails[index] || "",
        "City": citiesCountries[index] || "Unknown",
        "Country": citiesCountries[index + 1] || "Unknown"
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
            const headers = ["Company", "Name", "Surname", "Position", "Phone", "Email", "City", "Country"];
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

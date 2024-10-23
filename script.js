function extractDetails(text) {
    const companyRegex = /(AL ARFAJ|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Co|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Ltd)/g; // Şirket adları
    const nameRegex = /Dr\.?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g; // İsim ve soyisim
    const positionRegex = /(Manager|Director|Engineer|Specialist|Business Development)/g; // Pozisyon
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numarası
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // E-posta adresi
    const cityRegex = /(Jeddah|Dubai|Riyadh|Abu Dhabi)/g; // Şehir tanıma
    const countryRegex = /(Saudi Arabia|UAE|United Arab Emirates)/g; // Ülke tanıma

    // Verileri yakala
    const companies = text.match(companyRegex) || ["Unknown Company"];
    const names = text.match(nameRegex) || ["Responsible"];
    const positions = text.match(positionRegex) || ["Responsible"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const emails = text.match(emailRegex) || ["No Email"];
    const cities = text.match(cityRegex) || ["Unknown City"];
    const countries = text.match(countryRegex) || ["Unknown Country"];

    // Her bir veri tipini tablo için formatla
    const data = names.map((name, index) => ({
        "Company": companies[index] || "Unknown",
        "Name": name.split(" ")[0] || "Responsible",
        "Surname": name.split(" ")[1] || ".",
        "Position": positions[index] || "Responsible",
        "Work Phone": phones[0] || "",
        "Other Phone": phones[1] || "",
        "Email": emails[index] || "",
        "City": cities[index] || "Unknown",
        "Country": countries[index] || "Unknown"
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
            const headers = ["Company", "Name", "Surname", "Position", "Work Phone", "Other Phone", "Email", "City", "Country"];
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

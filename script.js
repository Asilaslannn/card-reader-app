function extractDetails(text) {
    const companyRegex = /(AL ARFAJ|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Co|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Ltd)/g; // Şirket adları
    const nameRegex = /(Dr\.|Mr\.|Ms\.|Mrs\.)?\s?[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?/g; // İsim ve soyisim
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

    // İsim ve soyisim ayrımı
    const namesList = names.map(name => {
        const nameParts = name.split(" ");
        return {
            "Name": nameParts[0] || "Responsible", // İlk isim unvan veya ad olabilir
            "Surname": nameParts[1] || "." // İkinci isim soyad olabilir
        };
    });

    // Şirket, şehir, ülke bilgilerinde tekrarları kaldırma
    const uniqueCompanies = [...new Set(companies)];
    const uniqueCities = [...new Set(cities)];
    const uniqueCountries = [...new Set(countries)];

    // Her bir veri tipini tablo için formatla
    const data = namesList.map((nameObj, index) => ({
        "Company": uniqueCompanies[0] || "Unknown",
        "Name": nameObj.Name,
        "Surname": nameObj.Surname,
        "Position": positions[index] || "Responsible",
        "Work Phone": phones[index] || "",
        "Other Phone": phones[index + 1] || "",
        "Email": emails[index] || "No Email",
        "City": uniqueCities[0] || "Unknown",
        "Country": uniqueCountries[0] || "Unknown"
    }));

    return data;
}

document.getElementById('start').onclick = function() {
    const files = document.getElementById('upload').files;
    let allExtractedData = [];

    // İlerleme çubuğunu sıfırla
    const progressBar = document.getElementById('progressBar');
    progressBar.value = 0;
    progressBar.max = files.length;

    // Her bir dosya için işlem yap
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => {
                    console.log(m);
                    // Yüzdelik ilerlemeyi güncelle
                    if (m.status === 'recognizing text') {
                        const percent = Math.round(m.progress * 100);
                        progressBar.value = i + percent / 100;
                        document.getElementById('progressText').innerText = `İşlem Yüzdesi: ${percent}%`;
                    }
                },
            }
        ).then(({ data: { text } }) => {
            const extractedData = extractDetails(text);
            allExtractedData = allExtractedData.concat(extractedData); // Verileri birleştir
            console.log("Extracted Data:", extractedData);

            // Tabloda verileri göster
            const table = document.createElement('table');
            table.setAttribute('border', '1');
            const headers = ["Company", "Name", "Surname", "Position", "Work Phone", "Other Phone", "Email", "City", "Country"];
            const headerRow = table.insertRow(0);
            headers.forEach(header => {
                const cell = headerRow.insertCell();
                cell.textContent = header;
            });

            allExtractedData.forEach((rowData, rowIndex) => {
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
            exportButton.onclick = () => exportToExcel(allExtractedData);
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

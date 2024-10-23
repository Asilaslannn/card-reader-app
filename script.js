function extractDetails(text) {
    const companyRegex = /(AL ARFAJ|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Co|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Ltd)/g; // Şirket adları
    const nameRegex = /(Dr\.|Mr\.|Ms\.)?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g; // İsim ve soyisim
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
            "Name": nameParts[1] || nameParts[0] || "Responsible", // Ad ve soyadın ikinci kısmı
            "Surname": nameParts[2] || "." // Soyadı bulamazsa '.'
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

            // **Burada ChatGPT API yanıtı simulasyonu eklenir**
            document.body.appendChild(document.createElement('hr'));
            const simulatedChatGPTTable = document.createElement('table');
            simulatedChatGPTTable.setAttribute('border', '1');
            const chatGPTHeaderRow = simulatedChatGPTTable.insertRow(0);
            headers.forEach(header => {
                const cell = chatGPTHeaderRow.insertCell();
                cell.textContent = header + " (GPT)";
            });

            // Simüle edilen ChatGPT tablosu (örneğin varsayılan bir tablo)
            const chatGPTData = [{
                "Company": "AL ARFAJ",
                "Name": "Ahmed",
                "Surname": "Fathi",
                "Position": "Director",
                "Work Phone": "+966 12 6533777",
                "Other Phone": "+966 50 686 4512",
                "Email": "a-fathi@alarfajcic.com",
                "City": "Jeddah",
                "Country": "Saudi Arabia"
            }];

            chatGPTData.forEach((rowData, rowIndex) => {
                const row = simulatedChatGPTTable.insertRow(rowIndex + 1);
                headers.forEach((header, cellIndex) => {
                    const cell = row.insertCell(cellIndex);
                    cell.textContent = rowData[header] || '';
                });
            });

            document.body.appendChild(simulatedChatGPTTable);

        });
    }
};

function exportToExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "OCR_Data.xlsx");
}

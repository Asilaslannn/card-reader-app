document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-upload');
    const progressBar = document.getElementById('progress-bar');
    const dataTable = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let uploadedFiles = 0;

    // Dosya yükleme işlemi
    fileInput.addEventListener('change', function (event) {
        const files = event.target.files;
        const totalFiles = files.length;

        // İlerleme çubuğunu başlat
        progressBar.style.width = '0%';
        progressBar.innerText = '0%';
        uploadedFiles = 0;

        // Her dosya için işlem başlat
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Burada dosyanın içeriği okunuyor (ChatGPT'ye gönderilebilir)
                processFile(file);
                uploadedFiles++;
                updateProgressBar(uploadedFiles, totalFiles);
            };
            reader.readAsDataURL(file); // Bu dosyayı tarayıcıda okuma işlemi
        });
    });

    // İlerleme çubuğunu güncelle
    function updateProgressBar(uploaded, total) {
        const progress = (uploaded / total) * 100;
        progressBar.style.width = progress + '%';
        progressBar.innerText = Math.floor(progress) + '%';
    }

    // Dosya işleme (Placeholder) – ChatGPT'ye API entegrasyonu yapılabilir
    function processFile(file) {
        // Örnek veri ekleme (gerçek veri yerine)
        const exampleData = [
            {
                company: "ACME Corp",
                firstName: "John",
                lastName: "Doe",
                position: "Manager",
                personPhone: "+123456789",
                companyPhone: "+987654321",
                personEmail: "john.doe@acme.com",
                companyEmail: "info@acme.com",
                city: "New York",
                country: "USA",
                website: "www.acme.com"
            }
        ];

        // Tabloda verileri göster
        exampleData.forEach(data => {
            const row = dataTable.insertRow();
            row.insertCell(0).innerText = data.company;
            row.insertCell(1).innerText = data.firstName || "Responsible";
            row.insertCell(2).innerText = data.lastName || ".";
            row.insertCell(3).innerText = data.position || "Responsible";
            row.insertCell(4).innerText = data.personPhone || "";
            row.insertCell(5).innerText = data.companyPhone || "";
            row.insertCell(6).innerText = data.personEmail || "";
            row.insertCell(7).innerText = data.companyEmail || "";
            row.insertCell(8).innerText = data.city || "";
            row.insertCell(9).innerText = data.country || "";
            row.insertCell(10).innerText = data.website || "";
        });
    }

    // Excel indirme işlemi
    document.getElementById('download-excel').addEventListener('click', function () {
        const table = document.getElementById('data-table');
        const rows = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'data_table.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // PDF indirme işlemi (html2pdf kütüphanesi kullanılarak yapılabilir)
    document.getElementById('download-pdf').addEventListener('click', function () {
        const element = document.getElementById('data-table');
        html2pdf().from(element).save('data_table.pdf');
    });
});

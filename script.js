document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-upload');
    const progressBar = document.getElementById('progress-bar');
    const startProcessButton = document.getElementById('start-process');
    const statusText = document.getElementById('status-text');
    const dataTable = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let uploadedFiles = 0;
    let filesToProcess = [];

    // Dosya yüklendiğinde "Başlat" butonunu aktif et
    fileInput.addEventListener('change', function (event) {
        filesToProcess = event.target.files;
        if (filesToProcess.length > 0) {
            startProcessButton.disabled = false;
            statusText.innerText = `${filesToProcess.length} dosya yüklendi, başlatmak için 'Başlat' butonuna basın.`;
        } else {
            startProcessButton.disabled = true;
            statusText.innerText = 'Henüz bir dosya yüklenmedi.';
        }
    });

    // "Başlat" butonuna basıldığında işlemi başlat
    startProcessButton.addEventListener('click', function () {
        progressBar.style.width = '0%';
        progressBar.innerText = '0%';
        uploadedFiles = 0;
        statusText.innerText = 'İşlem başlatıldı, dosyalar işleniyor...';
        processFiles();
    });

    // Dosya işleme işlemi
    function processFiles() {
        Array.from(filesToProcess).forEach((file, index) => {
            setTimeout(() => {
                statusText.innerText = `${file.name} işleniyor...`;

                // Burada dosya içeriği işleniyor olacak (ChatGPT API entegrasyonu yapılabilir)
                processFile(file);

                uploadedFiles++;
                updateProgressBar(uploadedFiles, filesToProcess.length);

                if (uploadedFiles === filesToProcess.length) {
                    statusText.innerText = 'Tüm dosyalar başarıyla işlendi.';
                    startProcessButton.disabled = true;
                }
            }, 1000 * index); // Her dosya için 1 saniyelik gecikme
        });
    }

    // İlerleme çubuğunu güncelle
    function updateProgressBar(uploaded, total) {
        const progress = (uploaded / total) * 100;
        progressBar.style.width = progress + '%';
        progressBar.innerText = Math.floor(progress) + '%';
    }

    // Dosya işleme (Placeholder) – ChatGPT'ye API entegrasyonu yapılabilir
    function processFile(file) {
        // Örnek veri ekleme (gerçek veri yerine)
        const exampleData = {
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
        };

        // Tabloda verileri göster
        const row = dataTable.insertRow();
        row.insertCell(0).innerText = exampleData.company;
        row.insertCell(1).innerText = exampleData.firstName || "Responsible";
        row.insertCell(2).innerText = exampleData.lastName || ".";
        row.insertCell(3).innerText = exampleData.position || "Responsible";
        row.insertCell(4).innerText = exampleData.personPhone || "";
        row.insertCell(5).innerText = exampleData.companyPhone || "";
        row.insertCell(6).innerText = exampleData.personEmail || "";
        row.insertCell(7).innerText = exampleData.companyEmail || "";
        row.insertCell(8).innerText = exampleData.city || "";
        row.insertCell(9).innerText = exampleData.country || "";
        row.insertCell(10).innerText = exampleData.website || "";
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

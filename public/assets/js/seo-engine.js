document.addEventListener('DOMContentLoaded', () => {
    // Menambahkan 'seo-url' ke dalam daftar pantauan sistem
    const inputs = ['seo-url', 'seo-keyword', 'seo-title', 'seo-desc', 'seo-content'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', runSEOAnalysis);
    });
    runSEOAnalysis();
});

function runSEOAnalysis() {
    const urlEl = document.getElementById('seo-url');
    const keywordEl = document.getElementById('seo-keyword');
    const titleEl = document.getElementById('seo-title');
    const descEl = document.getElementById('seo-desc');
    const contentEl = document.getElementById('seo-content');

    if (!keywordEl || !titleEl || !descEl || !contentEl) return;

    const inputUrl = urlEl ? urlEl.value.trim() : "";
    const keyword = keywordEl.value.toLowerCase().trim();
    const title = titleEl.value;
    const desc = descEl.value;
    const content = contentEl.value;

    // 1. Live Google Snippet Update (Termasuk update URL otomatis)
    const prevUrl = document.getElementById('preview-url');
    const prevTitle = document.getElementById('preview-title');
    const prevDesc = document.getElementById('preview-desc');
    
    // Jika kolom URL diisi, tampilkan URL tersebut. Jika kosong, gunakan default.
    if(prevUrl) prevUrl.innerText = inputUrl.length > 0 ? inputUrl : "https://www.nama-website-anda.com";
    if(prevTitle) prevTitle.innerText = title.length > 0 ? title : "Silakan Masukkan Judul...";
    if(prevDesc) prevDesc.innerText = desc.length > 0 ? desc : "Tulis deskripsi halaman unik Anda untuk memicu impresi klik dari calon klien melalui pencarian mesin pintar Google.";

    // Update Counter & Progress Bar
    document.getElementById('title-counter').innerText = `${title.length}/60`;
    document.getElementById('desc-counter').innerText = `${desc.length}/155`;

    const updateBar = (id, len, min, max) => {
        const bar = document.getElementById(id);
        if (!bar) return;
        let percent = (len / max) * 100;
        if (percent > 100) percent = 100;
        bar.style.width = percent + '%';
        
        if (len >= min && len <= max) bar.style.background = 'var(--accent)'; 
        else if (len > 0 && len <= max) bar.style.background = 'var(--warning)';
        else bar.style.background = 'var(--danger)'; 
    };

    updateBar('title-bar', title.length, 40, 60);
    updateBar('desc-bar', desc.length, 120, 155);

    // 2. DOM Parsing untuk Advanced Analysis
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(content, 'text/html');
    
    // Hitung Kata Teknis (Abaikan tag HTML)
    const textOnly = htmlDoc.body.textContent || "";
    const words = textOnly.match(/\b[-?(\w+)?]+\b/gi);
    const wordCount = words ? words.length : 0;
    document.getElementById('word-count').innerText = wordCount;

    // Hitung Densitas Kata Kunci
    let density = 0;
    let keywordCount = 0;
    if (keyword !== "" && wordCount > 0) {
        const regex = new RegExp(keyword, 'gi'); 
        const matches = textOnly.match(regex);
        keywordCount = matches ? matches.length : 0;
        density = ((keywordCount / wordCount) * 100).toFixed(1);
    }
    document.getElementById('keyword-density').innerText = density + '%';

    // Pindai Komponen Gambar (IMG & Alt Text)
    const images = htmlDoc.querySelectorAll('img');
    document.getElementById('image-count').innerText = images.length;
    let imagesWithoutAlt = 0;
    let keywordInAlt = false;
    images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (!alt || alt.trim() === "") {
            imagesWithoutAlt++;
        } else if (keyword !== "" && alt.toLowerCase().includes(keyword)) {
            keywordInAlt = true;
        }
    });

    // Pindai Komponen Link (Internal vs External)
    const links = htmlDoc.querySelectorAll('a');
    let internalLinks = 0;
    let externalLinks = 0;
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            if (href.startsWith('http://') || href.startsWith('https://')) {
                // Gunakan nama domain dari input URL untuk mengecek internal link
                const domainToCheck = inputUrl.replace(/^https?:\/\//, '').split('/')[0];
                if (domainToCheck && href.includes(domainToCheck)) internalLinks++;
                else externalLinks++;
            } else {
                internalLinks++; 
            }
        }
    });
    document.getElementById('link-count').innerText = `${internalLinks} / ${externalLinks}`;

    // Pindai Subheading (H2 & H3)
    const subheadings = htmlDoc.querySelectorAll('h2, h3');
    let keywordInSubheading = false;
    subheadings.forEach(sub => {
        if (keyword !== "" && sub.textContent.toLowerCase().includes(keyword)) {
            keywordInSubheading = true;
        }
    });

    // 3. Evaluasi Indikator Hasil Audit
    const results = [];
    const addResult = (isGood, isWarning, text) => {
        let color = 'var(--danger)';
        let icon = 'alert-triangle';
        if (isGood) { color = 'var(--accent)'; icon = 'check-circle'; }
        else if (isWarning) { color = 'var(--warning)'; icon = 'alert-circle'; }

        results.push(`
            <li style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; line-height: 1.45;">
                <i data-lucide="${icon}" size="18" style="color: ${color}; flex-shrink: 0; margin-top: 1px;"></i> 
                <span>${text}</span>
            </li>
        `);
    };

    if (keyword === "") {
        results.push(`
            <li style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; color: var(--text-dim);">
                <i data-lucide="info" size="18" style="color: var(--primary); flex-shrink: 0;"></i> 
                <span>Masukkan Focus Keyword Utama untuk memulai penaksiran algoritma SEO.</span>
            </li>
        `);
    } else {
        if (title.length >= 40 && title.length <= 60) addResult(true, false, "Panjang SEO Title sangat ideal.");
        else addResult(false, true, "Panjang SEO Title tidak ideal (Batas aman: 40-60 karakter).");

        if (desc.length >= 120 && desc.length <= 155) addResult(true, false, "Panjang Meta Description sangat bagus.");
        else addResult(false, true, "Panjang Meta Description tidak ideal (Batas aman: 120-155 karakter).");

        if (title.toLowerCase().includes(keyword)) addResult(true, false, "Keyword utama sukses terdistribusi di SEO Title.");
        else addResult(false, false, "Sisipkan Focus Keyword ke dalam susunan SEO Title.");

        if (desc.toLowerCase().includes(keyword)) addResult(true, false, "Keyword utama sukses terdistribusi di Meta Description.");
        else addResult(false, false, "Sisipkan Focus Keyword ke dalam susunan Meta Description.");

        if (wordCount >= 300) addResult(true, false, `Total tulisan memiliki ${wordCount} kata. Memenuhi batas sebaran artikel.`);
        else addResult(false, true, `Teks terlalu ringkas (${wordCount} kata). Buat minimal 300 kata.`);

        if (keywordCount === 0) {
            addResult(false, false, "Focus keyword tidak ditemukan sama sekali di dalam isi artikel.");
        } else if (density >= 0.5 && density <= 2.5) {
            addResult(true, false, `Kepadatan keyword ideal (${density}%). Ditemukan ${keywordCount} kali.`);
        } else if (density > 2.5) {
            addResult(false, false, `Kepadatan keyword terlalu padat (${density}%). Rentan dianggap spam.`);
        } else {
            addResult(false, true, `Kepadatan kata kunci terlalu rendah (${density}%). Naikkan frekuensi penyebaran kata.`);
        }

        if (subheadings.length === 0) addResult(false, true, "Artikel tidak memiliki tag Subheading (H2/H3). Struktur susunan teks kurang rapi.");
        else if (keywordInSubheading) addResult(true, false, "Bagus! Keyword utama telah disisipkan ke salah satu Subheading (H2/H3).");
        else addResult(false, true, "Usahakan pasang kata kunci utama ke dalam salah satu tag H2 atau H3.");

        if (images.length === 0) {
            addResult(false, true, "Belum mendeteksi gambar. Tambahkan elemen visual pendukung.");
        } else {
            if (imagesWithoutAlt > 0) addResult(false, false, `Terdapat ${imagesWithoutAlt} gambar kehilangan atribut 'alt'.`);
            else addResult(true, false, "Semua gambar telah dikonfigurasi menggunakan atribut 'alt'.");
            
            if (keywordInAlt) addResult(true, false, "Keyword utama ditemukan di dalam deskripsi alternatif (alt text) gambar.");
            else addResult(false, true, "Pertimbangkan menyisipkan keyword utama ke atribut 'alt' gambar Anda.");
        }

        if (internalLinks > 0) addResult(true, false, `Ditemukan ${internalLinks} tautan internal. Strategi link-building lokal kokoh.`);
        else addResult(false, true, "Belum ada internal link. Hubungkan ke halaman web Anda yang lain.");
        
        if (externalLinks > 0) addResult(true, false, `Ditemukan ${externalLinks} tautan luar.`);
        else addResult(false, true, "Tambahkan setidaknya satu tautan keluar (outbound link) sebagai referensi.");
    }

    document.getElementById('seo-results').innerHTML = results.join('');
    if(window.lucide) lucide.createIcons();
}
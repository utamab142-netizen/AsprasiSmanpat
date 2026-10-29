// Koneksi ke Supabase
const db = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

// Cari form aspirasi
const form =
    document.querySelector("#aspirasiForm") ||
    document.querySelector("#aspirationForm") ||
    document.querySelector("form");

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nama = document.querySelector("#nama")?.value.trim() || null;
        const kelas = document.querySelector("#kelas")?.value.trim() || null;
        const kategori = document.querySelector("#kategori")?.value.trim();
        const isi =
            document.querySelector("#isi")?.value.trim() ||
            document.querySelector("#aspirasi")?.value.trim() ||
            document.querySelector("#pesan")?.value.trim();

        if (!kategori || !isi) {
            alert("Silakan isi kategori dan aspirasi terlebih dahulu.");
            return;
        }

        const tombol = form.querySelector('[type="submit"]');
        if (tombol) {
            tombol.disabled = true;
            tombol.textContent = "Mengirim...";
        }

        const { error } = await db
            .from("aspirasi")
            .insert([{ nama, kelas, kategori, isi }]);

        if (error) {
            console.error(error);
            alert("Aspirasi gagal dikirim. Periksa koneksi dan pengaturan database.");
        } else {
            alert("Terima kasih! Aspirasi kamu berhasil dikirim.");
            form.reset();
        }

        if (tombol) {
            tombol.disabled = false;
            tombol.textContent = "Kirim Aspirasi";
        }
    });
} else {
    console.error("Form aspirasi tidak ditemukan.");
}
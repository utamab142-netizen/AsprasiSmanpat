const adminDB = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

const loginCard = document.querySelector("#loginCard");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const daftarAspirasi = document.querySelector("#daftarAspirasi");
const jumlahAspirasi = document.querySelector("#jumlahAspirasi");
const pesanAdmin = document.querySelector("#pesanAdmin");

function tampilkanPesan(pesan) {
    pesanAdmin.textContent = pesan;
}

function tampilkanDashboard() {
    loginCard.classList.add("hidden");
    dashboard.classList.remove("hidden");
}

function tampilkanLogin() {
    dashboard.classList.add("hidden");
    loginCard.classList.remove("hidden");
}

async function periksaLogin() {
    const { data, error } = await adminDB.auth.getSession();

    if (error) {
        tampilkanPesan("Gagal memeriksa sesi login.");
        return;
    }

    if (data.session) {
        tampilkanDashboard();
        await muatAspirasi();
    } else {
        tampilkanLogin();
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;
    const loginButton = document.querySelector("#loginButton");

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";
    tampilkanPesan("");

    const { error } = await adminDB.auth.signInWithPassword({
        email,
        password
    });

    loginButton.disabled = false;
    loginButton.textContent = "Masuk";

    if (error) {
        tampilkanPesan(
            "Login gagal. Periksa email, kata sandi, dan status akun."
        );
        return;
    }

    tampilkanDashboard();
    await muatAspirasi();
});

async function muatAspirasi() {
    daftarAspirasi.textContent = "Memuat aspirasi...";
    tampilkanPesan("");

    const { data, error } = await adminDB
        .from("aspirasi")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        daftarAspirasi.textContent = "Aspirasi gagal dimuat.";
        tampilkanPesan(
            "Pastikan akun sudah terdaftar sebagai pengurus dan aturan RLS benar."
        );
        console.error(error);
        return;
    }

    jumlahAspirasi.textContent = `Total aspirasi: ${data.length}`;
    daftarAspirasi.replaceChildren();

    if (data.length === 0) {
        daftarAspirasi.textContent =
            "Belum ada aspirasi, atau belum ada data yang dapat ditampilkan.";
        return;
    }

    data.forEach(function (item) {
        const kartu = document.createElement("article");
        kartu.className = "aspirasi-item";

        const judul = document.createElement("h3");
        judul.textContent = item.kategori;

        const isi = document.createElement("p");
        isi.textContent = item.isi;

        const pengirim = document.createElement("p");
        pengirim.textContent =
            `Nama: ${item.nama || "Anonim"} | Kelas: ${item.kelas || "-"}`;

        const waktu = document.createElement("p");
        waktu.className = "muted";
        waktu.textContent = item.created_at
            ? new Date(item.created_at).toLocaleString("id-ID")
            : "";

        const labelStatus = document.createElement("label");
        labelStatus.textContent = "Status: ";

        const pilihStatus = document.createElement("select");

        ["Menunggu", "Diproses", "Selesai"].forEach(function (status) {
            const opsi = document.createElement("option");
            opsi.value = status;
            opsi.textContent = status;
            pilihStatus.appendChild(opsi);
        });

        pilihStatus.value = item.status;

        const tombolStatus = document.createElement("button");
        tombolStatus.textContent = "Simpan Status";

        tombolStatus.addEventListener("click", async function () {
            tombolStatus.disabled = true;

            const { error } = await adminDB
                .from("aspirasi")
                .update({ status: pilihStatus.value })
                .eq("id", item.id);

            tombolStatus.disabled = false;

            if (error) {
                tampilkanPesan("Gagal mengubah status aspirasi.");
                console.error(error);
            } else {
                tampilkanPesan("Status berhasil diperbarui.");
                await muatAspirasi();
            }
        });

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";

        tombolHapus.addEventListener("click", async function () {
            if (!confirm("Yakin ingin menghapus aspirasi ini?")) {
                return;
            }

            tombolHapus.disabled = true;

            const { error } = await adminDB
                .from("aspirasi")
                .delete()
                .eq("id", item.id);

            tombolHapus.disabled = false;

            if (error) {
                tampilkanPesan("Gagal menghapus aspirasi.");
                console.error(error);
            } else {
                tampilkanPesan("Aspirasi berhasil dihapus.");
                await muatAspirasi();
            }
        });

        labelStatus.appendChild(pilihStatus);

        kartu.append(judul, isi, pengirim, waktu, labelStatus);
        kartu.append(document.createElement("br"));
        kartu.append(tombolStatus, tombolHapus);

        daftarAspirasi.appendChild(kartu);
    });
}

document.querySelector("#refreshButton").addEventListener(
    "click",
    muatAspirasi
);

document.querySelector("#logoutButton").addEventListener(
    "click",
    async function () {
        await adminDB.auth.signOut();
        tampilkanLogin();
        loginForm.reset();
        tampilkanPesan("Kamu sudah keluar.");
    }
);

periksaLogin();
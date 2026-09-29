"use strict";


/* =========================================================
   1. STORAGE
========================================================= */

const STORAGE_KEYS = {
    transactions: "campushub_transactions",
    bookmarks: "campushub_bookmarks",
    highScore: "campushub_high_score",
    activeTab: "campushub_active_tab"
};


/* =========================================================
   2. DATA
========================================================= */

let transactions = [];
let bookmarks = [];
let highScore = 0;

let quizState = {
    currentQuestion: 0,
    score: 0,
    selectedAnswer: null,
    finished: false
};


/* =========================================================
   3. QUIZ QUESTIONS
========================================================= */

const quizQuestions = [

    {
        question:
            "Apa fungsi utama dari JavaScript pada halaman web?",

        options: [
            "Mengatur database server",
            "Membuat halaman menjadi interaktif",
            "Mengatur kabel jaringan",
            "Mengganti sistem operasi"
        ],

        answer: 1
    },


    {
        question:
            "Method DOM yang digunakan untuk mencari elemen berdasarkan ID adalah?",

        options: [
            "getElementById()",
            "getClass()",
            "findId()",
            "selectId()"
        ],

        answer: 0
    },


    {
        question:
            "Manakah yang digunakan untuk menyimpan data pada browser?",

        options: [
            "LocalStorage",
            "Console",
            "HTML",
            "CSS"
        ],

        answer: 0
    },


    {
        question:
            "Keyword yang digunakan untuk membuat variabel yang nilainya dapat diubah adalah?",

        options: [
            "const",
            "let",
            "fixed",
            "static"
        ],

        answer: 1
    },


    {
        question:
            "Event yang digunakan ketika sebuah tombol diklik adalah?",

        options: [
            "hover",
            "submit",
            "click",
            "load"
        ],

        answer: 2
    }

];


/* =========================================================
   4. DOM HELPER
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}


function $$(selector) {
    return document.querySelectorAll(selector);
}


/* =========================================================
   5. UTILITY
========================================================= */

function formatRupiah(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);
}


function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function loadData(key, fallback = []) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed =
            JSON.parse(data);

        return parsed;

    } catch (error) {

        console.error(
            "Gagal membaca LocalStorage:",
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Gagal menyimpan LocalStorage:",
            error
        );
    }
}


function showError(id, message) {

    const element = $(`#${id}`);

    if (element) {
        element.textContent = message;
    }
}


function clearErrors(prefix) {

    $$(
        `[id^="${prefix}"][id$="-error"]`
    ).forEach(element => {

        element.textContent = "";

    });
}


/* =========================================================
   6. TAB MANAGEMENT + HASH ROUTING
========================================================= */

function getTabFromHash() {

    const hash =
        window.location.hash
            .replace("#", "")
            .toLowerCase()
            .trim();


    const routes = {

        pengeluaran: "expense",

        expense: "expense",

        bookmark: "bookmark",

        bookmarks: "bookmark",

        kuis: "quiz",

        quiz: "quiz"

    };


    return routes[hash] || null;
}


function getHashFromTab(tabName) {

    const routes = {

        expense: "pengeluaran",

        bookmark: "bookmark",

        quiz: "kuis"

    };


    return routes[tabName]
        || "pengeluaran";
}


function activateTab(
    tabName,
    save = true,
    updateUrl = true
) {

    const validTabs = [
        "expense",
        "bookmark",
        "quiz"
    ];


    if (!validTabs.includes(tabName)) {
        tabName = "expense";
    }


    $$(".tab-button")
        .forEach(button => {

            const isActive =
                button.dataset.tab === tabName;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-selected",
                String(isActive)
            );

        });


    $$(".tab-panel")
        .forEach(panel => {

            const isActive =
                panel.id ===
                `${tabName}-panel`;

            panel.classList.toggle(
                "active",
                isActive
            );

            panel.setAttribute(
                "aria-hidden",
                String(!isActive)
            );

        });


    if (save) {

        localStorage.setItem(
            STORAGE_KEYS.activeTab,
            tabName
        );

    }


    if (updateUrl) {

        const targetHash =
            `#${getHashFromTab(tabName)}`;


        if (
            window.location.hash !==
            targetHash
        ) {

            window.location.hash =
                targetHash;

        }

    }

}


function initializeTabs() {

    $$(".tab-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    activateTab(
                        button.dataset.tab,
                        true,
                        true
                    );

                }
            );

        });


    const tabFromUrl =
        getTabFromHash();


    const savedTab =
        localStorage.getItem(
            STORAGE_KEYS.activeTab
        )
        || "expense";


    activateTab(
        tabFromUrl || savedTab,
        true,
        true
    );


    window.addEventListener(
        "hashchange",
        () => {

            const nextTab =
                getTabFromHash()
                || "expense";


            activateTab(
                nextTab,
                true,
                false
            );

        }
    );

}


/* =========================================================
   7. EXPENSE VALIDATION
========================================================= */

function validateExpense(
    date,
    category,
    amount,
    description,
    prefix = "expense"
) {

    let valid = true;


    if (!date) {

        showError(
            `${prefix}-date-error`,
            "Tanggal wajib diisi."
        );

        valid = false;

    }


    if (!category) {

        showError(
            `${prefix}-category-error`,
            "Kategori wajib dipilih."
        );

        valid = false;

    }


    if (
        amount === ""
        || Number(amount) <= 0
        || !Number.isFinite(Number(amount))
    ) {

        showError(
            `${prefix}-amount-error`,
            "Jumlah harus lebih dari 0."
        );

        valid = false;

    }


    if (!description.trim()) {

        showError(
            `${prefix}-description-error`,
            "Deskripsi wajib diisi."
        );

        valid = false;

    }


    return valid;
}


/* =========================================================
   8. EXPENSE SUMMARY
========================================================= */

function updateExpenseSummary() {

    const total =
        transactions.reduce(
            (sum, transaction) =>
                sum + Number(transaction.amount),
            0
        );


    const count =
        transactions.length;


    const average =
        count > 0
            ? total / count
            : 0;


    $("#total-expense").textContent =
        formatRupiah(total);


    $("#transaction-count").textContent =
        count;


    $("#average-expense").textContent =
        formatRupiah(average);

}


/* =========================================================
   9. EXPENSE RENDER
========================================================= */

function renderTransactions() {

    const list =
        $("#expense-list");


    if (!list) {
        return;
    }


    const category =
        $("#expense-filter-category")
            .value;


    const search =
        $("#expense-filter-search")
            .value
            .toLowerCase()
            .trim();


    const sort =
        $("#expense-sort")
            .value;


    let filtered =
        [...transactions];


    if (category) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.category ===
                    category
            );

    }


    if (search) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.description
                        .toLowerCase()
                        .includes(search)
            );

    }


    if (sort === "newest") {

        filtered.sort(
            (a, b) =>
                new Date(b.date)
                - new Date(a.date)
        );

    }


    if (sort === "oldest") {

        filtered.sort(
            (a, b) =>
                new Date(a.date)
                - new Date(b.date)
        );

    }


    if (sort === "highest") {

        filtered.sort(
            (a, b) =>
                Number(b.amount)
                - Number(a.amount)
        );

    }


    if (sort === "lowest") {

        filtered.sort(
            (a, b) =>
                Number(a.amount)
                - Number(b.amount)
        );

    }


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                Belum ada data pengeluaran.
            </div>
        `;

        return;
    }


    list.innerHTML =
        filtered
            .map(transaction => {

                const safeId =
                    escapeHTML(transaction.id);

                const safeDate =
                    escapeHTML(transaction.date);

                const safeCategory =
                    escapeHTML(transaction.category);

                const safeDescription =
                    escapeHTML(transaction.description);


                return `
                    <article class="list-item">

                        <div class="list-item-header">

                            <div>

                                <h3>
                                    ${safeDescription}
                                </h3>

                                <p>
                                    Tanggal:
                                    ${safeDate}
                                </p>

                                <p>
                                    Jumlah:
                                    <strong>
                                        ${formatRupiah(transaction.amount)}
                                    </strong>
                                </p>

                                <span class="badge">
                                    ${safeCategory}
                                </span>

                            </div>


                            <div class="item-actions">

                                <button
                                    type="button"
                                    class="btn btn-warning edit-expense"
                                    data-id="${safeId}"
                                    aria-label="Edit pengeluaran ${safeDescription}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-danger delete-expense"
                                    data-id="${safeId}"
                                    aria-label="Hapus pengeluaran ${safeDescription}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");

}


/* =========================================================
   10. ADD EXPENSE
========================================================= */

function handleExpenseSubmit(event) {

    event.preventDefault();


    clearErrors("expense-");


    const date =
        $("#expense-date").value;

    const category =
        $("#expense-category").value;

    const amount =
        $("#expense-amount").value;

    const description =
        $("#expense-description").value.trim();


    const valid =
        validateExpense(
            date,
            category,
            amount,
            description
        );


    if (!valid) {
        return;
    }


    const transaction = {

        id: createId(),

        date,

        category,

        amount: Number(amount),

        description

    };


    transactions.push(
        transaction
    );


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    $("#expense-form").reset();


    renderTransactions();

    updateExpenseSummary();

}


/* =========================================================
   11. DELETE EXPENSE
========================================================= */

function deleteTransaction(id) {

    const confirmed =
        window.confirm(
            "Yakin ingin menghapus pengeluaran ini?"
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    renderTransactions();

    updateExpenseSummary();

}


/* =========================================================
   12. OPEN EXPENSE MODAL
========================================================= */

function openExpenseModal(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {
        return;
    }


    $("#edit-expense-id").value =
        transaction.id;


    $("#edit-expense-date").value =
        transaction.date;


    $("#edit-expense-category").value =
        transaction.category;


    $("#edit-expense-amount").value =
        transaction.amount;


    $("#edit-expense-description").value =
        transaction.description;


    clearErrors("edit-expense-");


    const modal =
        $("#expense-modal");


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   13. UPDATE EXPENSE
========================================================= */

function handleEditExpense(event) {

    event.preventDefault();


    clearErrors("edit-expense-");


    const id =
        $("#edit-expense-id").value;


    const date =
        $("#edit-expense-date").value;


    const category =
        $("#edit-expense-category").value;


    const amount =
        $("#edit-expense-amount").value;


    const description =
        $("#edit-expense-description")
            .value
            .trim();


    const valid =
        validateExpense(
            date,
            category,
            amount,
            description,
            "edit-expense"
        );


    if (!valid) {
        return;
    }


    const index =
        transactions.findIndex(
            transaction =>
                transaction.id === id
        );


    if (index === -1) {
        return;
    }


    transactions[index] = {

        ...transactions[index],

        date,

        category,

        amount: Number(amount),

        description

    };


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    closeModal(
        "expense-modal"
    );


    renderTransactions();

    updateExpenseSummary();

}


/* =========================================================
   14. BOOKMARK VALIDATION
========================================================= */

function validateBookmark(
    title,
    category,
    url,
    prefix = "bookmark"
) {

    let valid = true;


    if (!title.trim()) {

        showError(
            `${prefix}-title-error`,
            "Judul wajib diisi."
        );

        valid = false;

    }


    if (!category) {

        showError(
            `${prefix}-category-error`,
            "Kategori wajib dipilih."
        );

        valid = false;

    }


    if (!url.trim()) {

        showError(
            `${prefix}-url-error`,
            "URL wajib diisi."
        );

        valid = false;

    } else {

        try {

            const parsed =
                new URL(url);

            if (
                parsed.protocol !== "http:"
                && parsed.protocol !== "https:"
            ) {

                throw new Error(
                    "URL tidak valid"
                );

            }

        } catch {

            showError(
                `${prefix}-url-error`,
                "Masukkan URL yang valid, contoh: https://example.com"
            );

            valid = false;

        }

    }


    return valid;
}


/* =========================================================
   15. ADD BOOKMARK
========================================================= */

function handleBookmarkSubmit(event) {

    event.preventDefault();


    clearErrors("bookmark-");


    const title =
        $("#bookmark-title-input")
            .value
            .trim();


    const category =
        $("#bookmark-category")
            .value;


    const url =
        $("#bookmark-url")
            .value
            .trim();


    const valid =
        validateBookmark(
            title,
            category,
            url
        );


    if (!valid) {
        return;
    }


    const bookmark = {

        id: createId(),

        title,

        category,

        url,

        createdAt:
            new Date().toISOString()

    };


    bookmarks.push(
        bookmark
    );


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    $("#bookmark-form").reset();


    renderBookmarks();

}


/* =========================================================
   16. RENDER BOOKMARK
========================================================= */

function renderBookmarks() {

    const list =
        $("#bookmark-list");


    if (!list) {
        return;
    }


    const search =
        $("#bookmark-search")
            .value
            .toLowerCase()
            .trim();


    const category =
        $("#bookmark-filter-category")
            .value;


    const sort =
        $("#bookmark-sort")
            .value;


    let filtered =
        [...bookmarks];


    if (search) {

        filtered =
            filtered.filter(
                bookmark =>
                    bookmark.title
                        .toLowerCase()
                        .includes(search)
            );

    }


    if (category) {

        filtered =
            filtered.filter(
                bookmark =>
                    bookmark.category ===
                    category
            );

    }


    if (sort === "newest") {

        filtered.sort(
            (a, b) =>
                new Date(b.createdAt)
                - new Date(a.createdAt)
        );

    }


    if (sort === "oldest") {

        filtered.sort(
            (a, b) =>
                new Date(a.createdAt)
                - new Date(b.createdAt)
        );

    }


    if (sort === "title-asc") {

        filtered.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title,
                    "id"
                )
        );

    }


    if (sort === "title-desc") {

        filtered.sort(
            (a, b) =>
                b.title.localeCompare(
                    a.title,
                    "id"
                )
        );

    }


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                Belum ada bookmark.
            </div>
        `;

        return;
    }


    list.innerHTML =
        filtered
            .map(bookmark => {

                const safeId =
                    escapeHTML(bookmark.id);

                const safeTitle =
                    escapeHTML(bookmark.title);

                const safeCategory =
                    escapeHTML(bookmark.category);

                const safeUrl =
                    escapeHTML(bookmark.url);


                return `
                    <article class="list-item">

                        <div class="list-item-header">

                            <div>

                                <h3>
                                    ${safeTitle}
                                </h3>

                                <p>
                                    <span class="badge">
                                        ${safeCategory}
                                    </span>
                                </p>

                                <p>
                                    <a
                                        class="bookmark-url"
                                        href="${safeUrl}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Buka bookmark ${safeTitle} di tab baru"
                                    >
                                        ${safeUrl}
                                    </a>
                                </p>

                            </div>


                            <div class="item-actions">

                                <button
                                    type="button"
                                    class="btn btn-warning edit-bookmark"
                                    data-id="${safeId}"
                                    aria-label="Edit bookmark ${safeTitle}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-danger delete-bookmark"
                                    data-id="${safeId}"
                                    aria-label="Hapus bookmark ${safeTitle}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");

}


/* =========================================================
   17. DELETE BOOKMARK
========================================================= */

function deleteBookmark(id) {

    const confirmed =
        window.confirm(
            "Yakin ingin menghapus bookmark ini?"
        );


    if (!confirmed) {
        return;
    }


    bookmarks =
        bookmarks.filter(
            bookmark =>
                bookmark.id !== id
        );


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    renderBookmarks();

}


/* =========================================================
   18. OPEN BOOKMARK MODAL
========================================================= */

function openBookmarkModal(id) {

    const bookmark =
        bookmarks.find(
            item =>
                item.id === id
        );


    if (!bookmark) {
        return;
    }


    $("#edit-bookmark-id").value =
        bookmark.id;


    $("#edit-bookmark-title").value =
        bookmark.title;


    $("#edit-bookmark-category").value =
        bookmark.category;


    $("#edit-bookmark-url").value =
        bookmark.url;


    clearErrors("edit-bookmark-");


    const modal =
        $("#bookmark-modal");


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   19. UPDATE BOOKMARK
========================================================= */

function handleEditBookmark(event) {

    event.preventDefault();


    clearErrors("edit-bookmark-");


    const id =
        $("#edit-bookmark-id")
            .value;


    const title =
        $("#edit-bookmark-title")
            .value
            .trim();


    const category =
        $("#edit-bookmark-category")
            .value;


    const url =
        $("#edit-bookmark-url")
            .value
            .trim();


    const valid =
        validateBookmark(
            title,
            category,
            url,
            "edit-bookmark"
        );


    if (!valid) {
        return;
    }


    const index =
        bookmarks.findIndex(
            bookmark =>
                bookmark.id === id
        );


    if (index === -1) {
        return;
    }


    bookmarks[index] = {

        ...bookmarks[index],

        title,

        category,

        url

    };


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    closeModal(
        "bookmark-modal"
    );


    renderBookmarks();

}


/* =========================================================
   20. MODAL
========================================================= */

function closeModal(modalId) {

    const modal =
        $(`#${modalId}`);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


function initializeModals() {

    $$(".close-modal")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.modal
                    );

                }
            );

        });


    $$(
        '[data-modal]'
    ).forEach(button => {

        if (
            !button.classList
                .contains("close-modal")
        ) {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.modal
                    );

                }
            );

        }

    });


    $$(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(
                            modal.id
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            $$(".modal.show")
                .forEach(modal => {

                    closeModal(
                        modal.id
                    );

                });

        }
    );

}


/* =========================================================
   21. QUIZ
========================================================= */

function startQuiz() {

    quizState = {

        currentQuestion: 0,

        score: 0,

        selectedAnswer: null,

        finished: false

    };


    $("#quiz-start").hidden =
        true;


    $("#quiz-question").hidden =
        false;


    $("#quiz-result").hidden =
        true;


    renderQuizQuestion();

}


function renderQuizQuestion() {

    const question =
        quizQuestions[
            quizState.currentQuestion
        ];


    if (!question) {

        finishQuiz();

        return;
    }


    quizState.selectedAnswer =
        null;


    $("#quiz-progress")
        .textContent =
        `Pertanyaan ${
            quizState.currentQuestion + 1
        } dari ${
            quizQuestions.length
        }`;


    $("#question-text")
        .textContent =
        question.question;


    const options =
        $("#quiz-options");


    options.innerHTML = "";


    question.options
        .forEach(
            (option, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "quiz-option";


                button.textContent =
                    option;


                button.setAttribute(
                    "aria-label",
                    `Pilihan ${
                        index + 1
                    }: ${option}`
                );


                button.dataset.index =
                    index;


                button.addEventListener(
                    "click",
                    () => {

                        selectQuizAnswer(
                            index
                        );

                    }
                );


                options.appendChild(
                    button
                );

            }
        );


    $("#next-question")
        .disabled = true;

}


function selectQuizAnswer(index) {

    quizState.selectedAnswer =
        index;


    $$(".quiz-option")
        .forEach(button => {

            const isSelected =
                Number(
                    button.dataset.index
                ) === index;


            button.classList.toggle(
                "selected",
                isSelected
            );

            button.setAttribute(
                "aria-pressed",
                String(isSelected)
            );

        });


    $("#next-question")
        .disabled = false;

}


function submitQuizAnswer() {

    if (
        quizState.selectedAnswer ===
        null
    ) {
        return;
    }


    const question =
        quizQuestions[
            quizState.currentQuestion
        ];


    if (
        quizState.selectedAnswer ===
        question.answer
    ) {

        quizState.score++;

    }


    quizState.currentQuestion++;


    if (
        quizState.currentQuestion >=
        quizQuestions.length
    ) {

        finishQuiz();

    } else {

        renderQuizQuestion();

    }

}


function finishQuiz() {

    quizState.finished =
        true;


    const total =
        quizQuestions.length;


    const score =
        quizState.score;


    const percentage =
        Math.round(
            (score / total) * 100
        );


    $("#quiz-question").hidden =
        true;


    $("#quiz-result").hidden =
        false;


    $("#quiz-score")
        .textContent =
        `${percentage}%`;


    $("#quiz-result-text")
        .textContent =
        `Kamu menjawab ${
            score
        } dari ${
            total
        } pertanyaan dengan benar.`;


    if (score > highScore) {

        highScore =
            score;


        saveData(
            STORAGE_KEYS.highScore,
            highScore
        );

    }


    updateHighScore();

}


function restartQuiz() {

    startQuiz();

}


function updateHighScore() {

    $("#high-score")
        .textContent =
        highScore;

}


/* =========================================================
   22. EVENT DELEGATION
========================================================= */

function initializeListEvents() {

    $("#expense-list")
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                if (
                    button.classList
                        .contains(
                            "delete-expense"
                        )
                ) {

                    deleteTransaction(id);

                }


                if (
                    button.classList
                        .contains(
                            "edit-expense"
                        )
                ) {

                    openExpenseModal(id);

                }

            }
        );


    $("#bookmark-list")
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                if (
                    button.classList
                        .contains(
                            "delete-bookmark"
                        )
                ) {

                    deleteBookmark(id);

                }


                if (
                    button.classList
                        .contains(
                            "edit-bookmark"
                        )
                ) {

                    openBookmarkModal(id);

                }

            }
        );

}


/* =========================================================
   23. FILTER EVENTS
========================================================= */

function initializeFilters() {

    $("#expense-filter-category")
        .addEventListener(
            "change",
            renderTransactions
        );


    $("#expense-filter-search")
        .addEventListener(
            "input",
            renderTransactions
        );


    $("#expense-sort")
        .addEventListener(
            "change",
            renderTransactions
        );


    $("#reset-expense-filter")
        .addEventListener(
            "click",
            () => {

                $("#expense-filter-category")
                    .value = "";


                $("#expense-filter-search")
                    .value = "";


                $("#expense-sort")
                    .value = "newest";


                renderTransactions();

            }
        );


    $("#bookmark-search")
        .addEventListener(
            "input",
            renderBookmarks
        );


    $("#bookmark-filter-category")
        .addEventListener(
            "change",
            renderBookmarks
        );


    $("#bookmark-sort")
        .addEventListener(
            "change",
            renderBookmarks
        );

}


/* =========================================================
   24. FORM EVENTS
========================================================= */

function initializeForms() {

    $("#expense-form")
        .addEventListener(
            "submit",
            handleExpenseSubmit
        );


    $("#edit-expense-form")
        .addEventListener(
            "submit",
            handleEditExpense
        );


    $("#bookmark-form")
        .addEventListener(
            "submit",
            handleBookmarkSubmit
        );


    $("#edit-bookmark-form")
        .addEventListener(
            "submit",
            handleEditBookmark
        );

}


/* =========================================================
   25. QUIZ EVENTS
========================================================= */

function initializeQuiz() {

    $("#start-quiz")
        .addEventListener(
            "click",
            startQuiz
        );


    $("#next-question")
        .addEventListener(
            "click",
            submitQuizAnswer
        );


    $("#restart-quiz")
        .addEventListener(
            "click",
            restartQuiz
        );

}


/* =========================================================
   26. LOAD DATA
========================================================= */

function initializeData() {

    transactions =
        loadData(
            STORAGE_KEYS.transactions,
            []
        );


    bookmarks =
        loadData(
            STORAGE_KEYS.bookmarks,
            []
        );


    highScore =
        Number(
            localStorage.getItem(
                STORAGE_KEYS.highScore
            )
        ) || 0;

}


/* =========================================================
   27. INITIAL RENDER
========================================================= */

function initializeRender() {

    renderTransactions();

    renderBookmarks();

    updateExpenseSummary();

    updateHighScore();

}


/* =========================================================
   28. INITIALIZE APPLICATION
========================================================= */

function initializeApp() {

    initializeData();

    initializeTabs();

    initializeForms();

    initializeFilters();

    initializeModals();

    initializeListEvents();

    initializeQuiz();

    initializeRender();

}


/* =========================================================
   29. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
"use strict";

/*
=========================================================
CAMPUSHUB JS
PABWE P3
Vanilla JavaScript
=========================================================
*/

/*
=========================================================
1. STORAGE KEYS
=========================================================
*/

const STORAGE_KEYS = {
    transactions: "campushub_transactions",
    bookmarks: "campushub_bookmarks",
    highScore: "campushub_high_score",
    activeTab: "campushub_active_tab"
};


/*
=========================================================
2. APPLICATION STATE
=========================================================
*/

let transactions = loadData(
    STORAGE_KEYS.transactions,
    []
);

let bookmarks = loadData(
    STORAGE_KEYS.bookmarks,
    []
);

let highScore = Number(
    localStorage.getItem(STORAGE_KEYS.highScore) || 0
);

let quizState = {
    currentQuestionIndex: 0,
    score: 0,
    quizFinished: false,
    selectedAnswer: null,
    answered: false
};


/*
=========================================================
3. QUIZ DATA
=========================================================
*/

const quizQuestions = [
    {
        question:
            "Apa yang digunakan untuk memilih satu elemen HTML berdasarkan ID?",

        options: [
            "document.getElementById()",
            "document.getElements()",
            "document.selectId()",
            "document.findId()"
        ],

        answer: 0
    },

    {
        question:
            "Method apa yang digunakan untuk menambahkan event pada elemen?",

        options: [
            "addEventListener()",
            "addEvent()",
            "createEventListener()",
            "eventAdd()"
        ],

        answer: 0
    },

    {
        question:
            "Data yang disimpan pada localStorage memiliki bentuk penyimpanan utama berupa?",

        options: [
            "String",
            "Function",
            "HTML",
            "CSS"
        ],

        answer: 0
    },

    {
        question:
            "Method array apa yang digunakan untuk menghapus atau menambahkan elemen berdasarkan index?",

        options: [
            "splice()",
            "pushOnly()",
            "change()",
            "modifyArray()"
        ],

        answer: 0
    },

    {
        question:
            "CRUD merupakan singkatan dari?",

        options: [
            "Create, Read, Update, Delete",
            "Create, Run, Update, Data",
            "Code, Read, Use, Delete",
            "Create, Remove, Use, Design"
        ],

        answer: 0
    }
];


/*
=========================================================
4. DOM HELPER
=========================================================
*/

function $(selector) {
    return document.querySelector(selector);
}


function $$(selector) {
    return document.querySelectorAll(selector);
}


/*
=========================================================
5. UTILITY FUNCTIONS
=========================================================
*/

function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}


function createId() {

    return Date.now().toString()
        + "-"
        + Math.random()
            .toString(36)
            .substring(2, 9);

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function loadData(key, fallback) {

    try {

        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Gagal membaca localStorage:",
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function showError(selector, message) {

    const element = $(selector);

    if (element) {
        element.textContent = message;
    }
}


function clearErrors(selectors) {

    selectors.forEach(selector => {
        showError(selector, "");
    });

}


/*
=========================================================
6. TAB MANAGEMENT + URL HASH
=========================================================
*/

/*
    URL YANG DIGUNAKAN:

    index.html#pengeluaran
    index.html#bookmark
    index.html#kuis

    Semua fitur tetap berada dalam SATU index.html.

    Tidak perlu membuat:
    - bookmark.html
    - kuis.html

    URL hash digunakan agar masing-masing tab
    memiliki alamat yang berbeda.
*/


/*
---------------------------------------------------------
MENGAMBIL TAB DARI URL
---------------------------------------------------------
*/

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


/*
---------------------------------------------------------
MENGUBAH NAMA TAB MENJADI HASH URL
---------------------------------------------------------
*/

function getHashFromTab(tabName) {

    const routes = {

        expense: "pengeluaran",

        bookmark: "bookmark",

        quiz: "kuis"

    };


    return routes[tabName] || "pengeluaran";

}


/*
---------------------------------------------------------
MENGAKTIFKAN TAB
---------------------------------------------------------
*/

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


    /*
        Jika tab tidak valid,
        gunakan tab Pengeluaran.
    */

    if (!validTabs.includes(tabName)) {

        tabName = "expense";

    }


    /*
    -----------------------------------------------------
    AKTIFKAN BUTTON
    -----------------------------------------------------
    */

    const buttons =
        $$(".tab-button");


    buttons.forEach(button => {

        const isActive =
            button.dataset.tab === tabName;


        button.classList.toggle(
            "active",
            isActive
        );

    });


    /*
    -----------------------------------------------------
    AKTIFKAN PANEL
    -----------------------------------------------------
    */

    const panels =
        $$(".tab-panel");


    panels.forEach(panel => {

        panel.classList.toggle(
            "active",
            panel.id === `${tabName}-panel`
        );

    });


    /*
    -----------------------------------------------------
    SIMPAN TAB KE LOCAL STORAGE
    -----------------------------------------------------
    */

    if (save) {

        localStorage.setItem(
            STORAGE_KEYS.activeTab,
            tabName
        );

    }


    /*
    -----------------------------------------------------
    UPDATE URL
    -----------------------------------------------------
    */

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


/*
---------------------------------------------------------
INISIALISASI TAB
---------------------------------------------------------
*/

function initializeTabs() {

    /*
    -----------------------------------------------------
    EVENT CLICK TAB
    -----------------------------------------------------
    */

    $$(".tab-button").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tabName =
                    button.dataset.tab;


                activateTab(
                    tabName,
                    true,
                    true
                );

            }
        );

    });


    /*
    -----------------------------------------------------
    CEK TAB DARI URL
    -----------------------------------------------------
    */

    const tabFromUrl =
        getTabFromHash();


    /*
    -----------------------------------------------------
    CEK TAB DARI LOCAL STORAGE
    -----------------------------------------------------
    */

    const savedTab =
        localStorage.getItem(
            STORAGE_KEYS.activeTab
        ) || "expense";


    /*
    -----------------------------------------------------
    PRIORITAS:

    1. URL
    2. Local Storage
    3. Pengeluaran
    -----------------------------------------------------
    */

    activateTab(
        tabFromUrl || savedTab,
        true,
        true
    );


    /*
    -----------------------------------------------------
    JIKA HASH URL BERUBAH
    -----------------------------------------------------
    */

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


/*
=========================================================
7. TRANSACTION VALIDATION
=========================================================
*/

function validateTransaction(data) {

    let valid = true;

    clearErrors([
        "#transaction-title-error",
        "#transaction-amount-error",
        "#transaction-date-error",
        "#transaction-category-error"
    ]);


    if (!data.title.trim()) {

        showError(
            "#transaction-title-error",
            "Judul wajib diisi."
        );

        valid = false;
    }


    if (
        !data.amount ||
        Number(data.amount) <= 0
    ) {

        showError(
            "#transaction-amount-error",
            "Jumlah harus lebih dari 0."
        );

        valid = false;
    }


    if (!data.date) {

        showError(
            "#transaction-date-error",
            "Tanggal wajib diisi."
        );

        valid = false;
    }


    if (!data.category.trim()) {

        showError(
            "#transaction-category-error",
            "Kategori wajib diisi."
        );

        valid = false;
    }


    return valid;
}


/*
=========================================================
8. TRANSACTION CREATE
=========================================================
*/

function addTransaction(event) {

    event.preventDefault();


    const data = {

        title:
            $("#transaction-title").value.trim(),

        amount:
            Number($("#transaction-amount").value),

        type:
            $("#transaction-type").value,

        date:
            $("#transaction-date").value,

        category:
            $("#transaction-category").value.trim()

    };


    if (!validateTransaction(data)) {
        return;
    }


    const transaction = {

        id: createId(),

        title: data.title,

        amount: data.amount,

        type: data.type,

        date: data.date,

        category: data.category,

        createdAt: new Date().toISOString()

    };


    transactions.push(transaction);


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    renderTransactions();

    updateTransactionSummary();


    $("#transaction-form").reset();


    $("#transaction-form-message").innerHTML =
        `<p class="success-message">
            Transaksi berhasil ditambahkan.
        </p>`;


    setTimeout(() => {

        $("#transaction-form-message").innerHTML = "";

    }, 2500);

}


/*
=========================================================
9. TRANSACTION READ
=========================================================
*/

function getFilteredTransactions() {

    const search =
        $("#transaction-search")
            .value
            .toLowerCase()
            .trim();


    const filter =
        $("#transaction-filter").value;


    const sort =
        $("#transaction-sort").value;


    let result =
        [...transactions];


    if (search) {

        result = result.filter(transaction => {

            return (

                transaction.title
                    .toLowerCase()
                    .includes(search)

                ||

                transaction.category
                    .toLowerCase()
                    .includes(search)

            );

        });

    }


    if (filter !== "all") {

        result = result.filter(
            transaction =>
                transaction.type === filter
        );

    }


    result.sort((a, b) => {

        switch (sort) {

            case "oldest":

                return new Date(a.date)
                    - new Date(b.date);


            case "highest":

                return b.amount - a.amount;


            case "lowest":

                return a.amount - b.amount;


            case "title":

                return a.title.localeCompare(
                    b.title
                );


            case "newest":

            default:

                return new Date(b.date)
                    - new Date(a.date);

        }

    });


    return result;
}


/*
=========================================================
10. TRANSACTION RENDER
=========================================================
*/

function renderTransactions() {

    const container =
        $("#transaction-list");


    const data =
        getFilteredTransactions();


    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada transaksi yang ditemukan.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data.map(transaction => {

            const isIncome =
                transaction.type === "income";


            return `

                <div
                    class="list-item"
                    data-id="${transaction.id}"
                >

                    <div class="item-info">

                        <span
                            class="type-badge
                            ${isIncome
                                ? "type-income"
                                : "type-expense"}"
                        >
                            ${isIncome
                                ? "PEMASUKAN"
                                : "PENGELUARAN"}
                        </span>

                        <h3>
                            ${escapeHTML(
                                transaction.title
                            )}
                        </h3>

                        <p>
                            Kategori:
                            ${escapeHTML(
                                transaction.category
                            )}
                        </p>

                        <p>
                            Tanggal:
                            ${escapeHTML(
                                transaction.date
                            )}
                        </p>

                    </div>

                    <div>

                        <div
                            class="amount
                            ${isIncome
                                ? "income"
                                : "expense"}"
                        >
                            ${isIncome ? "+" : "-"}
                            ${formatRupiah(
                                transaction.amount
                            )}
                        </div>

                        <div class="item-actions">

                            <button
                                class="btn
                                btn-primary
                                btn-small"
                                data-action="edit-transaction"
                                data-id="${transaction.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="btn
                                btn-danger
                                btn-small"
                                data-action="delete-transaction"
                                data-id="${transaction.id}"
                            >
                                Hapus
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


/*
=========================================================
11. TRANSACTION SUMMARY
=========================================================
*/

function updateTransactionSummary() {

    let income = 0;

    let expense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += Number(
                transaction.amount
            );

        } else {

            expense += Number(
                transaction.amount
            );

        }

    });


    const balance =
        income - expense;


    $("#total-income").textContent =
        formatRupiah(income);


    $("#total-expense").textContent =
        formatRupiah(expense);


    $("#total-balance").textContent =
        formatRupiah(balance);

}


/*
=========================================================
12. TRANSACTION DELETE
=========================================================
*/

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    const confirmation =
        confirm(
            `Hapus transaksi "${transaction.title}"?`
        );


    if (!confirmation) {
        return;
    }


    transactions =
        transactions.filter(
            item => item.id !== id
        );


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    renderTransactions();

    updateTransactionSummary();

}


/*
=========================================================
13. TRANSACTION EDIT
=========================================================
*/

function openTransactionEdit(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    $("#edit-transaction-id").value =
        transaction.id;


    $("#edit-transaction-title").value =
        transaction.title;


    $("#edit-transaction-amount").value =
        transaction.amount;


    $("#edit-transaction-type").value =
        transaction.type;


    $("#edit-transaction-date").value =
        transaction.date;


    $("#edit-transaction-category").value =
        transaction.category;


    $("#transaction-modal")
        .classList
        .add("show");

}


function updateTransaction(event) {

    event.preventDefault();


    const id =
        $("#edit-transaction-id").value;


    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    const title =
        $("#edit-transaction-title")
            .value
            .trim();


    const amount =
        Number(
            $("#edit-transaction-amount")
                .value
        );


    const type =
        $("#edit-transaction-type")
            .value;


    const date =
        $("#edit-transaction-date")
            .value;


    const category =
        $("#edit-transaction-category")
            .value
            .trim();


    if (!title) {

        alert("Judul transaksi wajib diisi.");

        return;
    }


    if (!amount || amount <= 0) {

        alert(
            "Jumlah transaksi harus lebih dari 0."
        );

        return;
    }


    if (!date) {

        alert(
            "Tanggal transaksi wajib diisi."
        );

        return;
    }


    if (!category) {

        alert(
            "Kategori transaksi wajib diisi."
        );

        return;
    }


    transaction.title = title;

    transaction.amount = amount;

    transaction.type = type;

    transaction.date = date;

    transaction.category = category;


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    renderTransactions();

    updateTransactionSummary();

    closeModal("transaction-modal");

}


/*
=========================================================
14. BOOKMARK VALIDATION
=========================================================
*/

function isValidURL(url) {

    try {

        const parsed =
            new URL(url);


        return (
            parsed.protocol === "http:"
            ||
            parsed.protocol === "https:"
        );

    } catch (error) {

        return false;

    }

}


function validateBookmark(data) {

    let valid = true;


    clearErrors([
        "#bookmark-title-error",
        "#bookmark-url-error",
        "#bookmark-category-error"
    ]);


    if (!data.title.trim()) {

        showError(
            "#bookmark-title-error",
            "Nama bookmark wajib diisi."
        );

        valid = false;
    }


    if (!data.url.trim()) {

        showError(
            "#bookmark-url-error",
            "URL wajib diisi."
        );

        valid = false;

    } else if (!isValidURL(data.url)) {

        showError(
            "#bookmark-url-error",
            "URL harus menggunakan http:// atau https://."
        );

        valid = false;
    }


    if (!data.category.trim()) {

        showError(
            "#bookmark-category-error",
            "Kategori wajib diisi."
        );

        valid = false;
    }


    return valid;
}


/*
=========================================================
15. BOOKMARK CREATE
=========================================================
*/

function addBookmark(event) {

    event.preventDefault();


    const data = {

        title:
            $("#bookmark-title")
                .value
                .trim(),

        url:
            $("#bookmark-url")
                .value
                .trim(),

        category:
            $("#bookmark-category")
                .value
                .trim()

    };


    if (!validateBookmark(data)) {
        return;
    }


    const bookmark = {

        id: createId(),

        title: data.title,

        url: data.url,

        category: data.category,

        createdAt: new Date().toISOString()

    };


    bookmarks.push(bookmark);


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    renderBookmarks();


    $("#bookmark-form").reset();


    $("#bookmark-form-message").innerHTML =
        `<p class="success-message">
            Bookmark berhasil ditambahkan.
        </p>`;


    setTimeout(() => {

        $("#bookmark-form-message").innerHTML = "";

    }, 2500);

}


/*
=========================================================
16. BOOKMARK READ / FILTER / SORT
=========================================================
*/

function getFilteredBookmarks() {

    const search =
        $("#bookmark-search")
            .value
            .toLowerCase()
            .trim();


    const sort =
        $("#bookmark-sort").value;


    let result =
        [...bookmarks];


    if (search) {

        result =
            result.filter(bookmark => {

                return (

                    bookmark.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    bookmark.url
                        .toLowerCase()
                        .includes(search)

                    ||

                    bookmark.category
                        .toLowerCase()
                        .includes(search)

                );

            });

    }


    result.sort((a, b) => {

        switch (sort) {

            case "oldest":

                return new Date(a.createdAt)
                    - new Date(b.createdAt);


            case "title":

                return a.title.localeCompare(
                    b.title
                );


            case "category":

                return a.category.localeCompare(
                    b.category
                );


            case "newest":

            default:

                return new Date(b.createdAt)
                    - new Date(a.createdAt);

        }

    });


    return result;

}


/*
=========================================================
17. BOOKMARK RENDER
=========================================================
*/

function renderBookmarks() {

    const container =
        $("#bookmark-list");


    const data =
        getFilteredBookmarks();


    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada bookmark yang ditemukan.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data.map(bookmark => {

            return `

                <div
                    class="list-item"
                    data-id="${bookmark.id}"
                >

                    <div class="item-info">

                        <h3>
                            ${escapeHTML(
                                bookmark.title
                            )}
                        </h3>

                        <p>
                            Kategori:
                            ${escapeHTML(
                                bookmark.category
                            )}
                        </p>

                        <p class="bookmark-url">
                            ${escapeHTML(
                                bookmark.url
                            )}
                        </p>

                    </div>

                    <div class="item-actions">

                        <button
                            class="btn
                            btn-success
                            btn-small"
                            data-action="open-bookmark"
                            data-id="${bookmark.id}"
                        >
                            Buka
                        </button>

                        <button
                            class="btn
                            btn-primary
                            btn-small"
                            data-action="edit-bookmark"
                            data-id="${bookmark.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="btn
                            btn-danger
                            btn-small"
                            data-action="delete-bookmark"
                            data-id="${bookmark.id}"
                        >
                            Hapus
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/*
=========================================================
18. BOOKMARK OPEN
=========================================================
*/

function openBookmark(id) {

    const bookmark =
        bookmarks.find(
            item => item.id === id
        );


    if (!bookmark) {
        return;
    }


    window.open(
        bookmark.url,
        "_blank",
        "noopener,noreferrer"
    );

}


/*
=========================================================
19. BOOKMARK DELETE
=========================================================
*/

function deleteBookmark(id) {

    const bookmark =
        bookmarks.find(
            item => item.id === id
        );


    if (!bookmark) {
        return;
    }


    const confirmation =
        confirm(
            `Hapus bookmark "${bookmark.title}"?`
        );


    if (!confirmation) {
        return;
    }


    bookmarks =
        bookmarks.filter(
            item => item.id !== id
        );


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    renderBookmarks();

}


/*
=========================================================
20. BOOKMARK EDIT
=========================================================
*/

function openBookmarkEdit(id) {

    const bookmark =
        bookmarks.find(
            item => item.id === id
        );


    if (!bookmark) {
        return;
    }


    $("#edit-bookmark-id").value =
        bookmark.id;


    $("#edit-bookmark-title").value =
        bookmark.title;


    $("#edit-bookmark-url").value =
        bookmark.url;


    $("#edit-bookmark-category").value =
        bookmark.category;


    $("#bookmark-modal")
        .classList
        .add("show");

}


function updateBookmark(event) {

    event.preventDefault();


    const id =
        $("#edit-bookmark-id").value;


    const bookmark =
        bookmarks.find(
            item => item.id === id
        );


    if (!bookmark) {
        return;
    }


    const title =
        $("#edit-bookmark-title")
            .value
            .trim();


    const url =
        $("#edit-bookmark-url")
            .value
            .trim();


    const category =
        $("#edit-bookmark-category")
            .value
            .trim();


    if (!title) {

        alert(
            "Nama bookmark wajib diisi."
        );

        return;
    }


    if (!isValidURL(url)) {

        alert(
            "URL tidak valid. Gunakan http:// atau https://."
        );

        return;
    }


    if (!category) {

        alert(
            "Kategori wajib diisi."
        );

        return;
    }


    bookmark.title = title;

    bookmark.url = url;

    bookmark.category = category;


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    renderBookmarks();

    closeModal("bookmark-modal");

}


/*
=========================================================
21. MODAL
=========================================================
*/

function closeModal(modalId) {

    const modal =
        document.getElementById(modalId);


    if (modal) {

        modal.classList.remove("show");

    }

}


function initializeModals() {

    $$("[data-close-modal]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.closeModal
                );

            }
        );

    });


    $$(".modal").forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

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


            $$(".modal.show").forEach(modal => {

                closeModal(
                    modal.id
                );

            });

        }
    );

}


/*
=========================================================
22. QUIZ START
=========================================================
*/

function startQuiz() {

    quizState = {

        currentQuestionIndex: 0,

        score: 0,

        quizFinished: false,

        selectedAnswer: null,

        answered: false

    };


    $("#quiz-start")
        .classList
        .add("hidden");


    $("#quiz-result")
        .classList
        .add("hidden");


    $("#quiz-question")
        .classList
        .remove("hidden");


    renderQuestion();

}


/*
=========================================================
23. QUIZ RENDER QUESTION
=========================================================
*/

function renderQuestion() {

    const question =
        quizQuestions[
            quizState.currentQuestionIndex
        ];


    if (!question) {

        finishQuiz();

        return;
    }


    $("#current-question-number")
        .textContent =
        quizState.currentQuestionIndex + 1;


    $("#total-question-number")
        .textContent =
        quizQuestions.length;


    $("#question-text")
        .textContent =
        question.question;


    const optionsContainer =
        $("#quiz-options");


    optionsContainer.innerHTML =
        question.options.map(
            (option, index) => {

                return `

                    <button
                        type="button"
                        class="quiz-option"
                        data-option-index="${index}"
                    >
                        ${escapeHTML(option)}
                    </button>

                `;

            }
        ).join("");


    quizState.selectedAnswer =
        null;


    quizState.answered =
        false;


    $("#quiz-feedback")
        .className =
        "quiz-feedback";


    $("#quiz-feedback")
        .textContent =
        "";


    $("#submit-answer")
        .classList
        .remove("hidden");


    $("#next-question")
        .classList
        .add("hidden");


    $$(".quiz-option").forEach(option => {

        option.addEventListener(
            "click",
            () => {

                selectQuizAnswer(
                    Number(
                        option.dataset.optionIndex
                    )
                );

            }
        );

    });

}


/*
=========================================================
24. QUIZ SELECT ANSWER
=========================================================
*/

function selectQuizAnswer(index) {

    if (quizState.answered) {
        return;
    }


    quizState.selectedAnswer =
        index;


    $$(".quiz-option").forEach(option => {

        option.classList.toggle(
            "selected",
            Number(
                option.dataset.optionIndex
            ) === index
        );

    });

}


/*
=========================================================
25. QUIZ SUBMIT
=========================================================
*/

function submitAnswer() {

    if (quizState.answered) {
        return;
    }


    if (
        quizState.selectedAnswer === null
    ) {

        const feedback =
            $("#quiz-feedback");


        feedback.textContent =
            "Silakan pilih salah satu jawaban terlebih dahulu.";


        feedback.className =
            "quiz-feedback show incorrect";


        return;
    }


    const question =
        quizQuestions[
            quizState.currentQuestionIndex
        ];


    quizState.answered =
        true;


    const isCorrect =
        quizState.selectedAnswer ===
        question.answer;


    const feedback =
        $("#quiz-feedback");


    if (isCorrect) {

        quizState.score++;


        feedback.textContent =
            "Jawaban benar!";

        feedback.className =
            "quiz-feedback show correct";

    } else {

        feedback.textContent =
            `Jawaban kurang tepat. Jawaban yang benar adalah: ${question.options[question.answer]}.`;

        feedback.className =
            "quiz-feedback show incorrect";

    }


    $$(".quiz-option").forEach(
        option => {

            option.disabled = true;

        }
    );


    $("#submit-answer")
        .classList
        .add("hidden");


    $("#next-question")
        .classList
        .remove("hidden");

}


/*
=========================================================
26. QUIZ NEXT QUESTION
=========================================================
*/

function nextQuestion() {

    if (!quizState.answered) {
        return;
    }


    quizState.currentQuestionIndex++;


    if (
        quizState.currentQuestionIndex
        >= quizQuestions.length
    ) {

        finishQuiz();

        return;
    }


    renderQuestion();

}


/*
=========================================================
27. QUIZ FINISH
=========================================================
*/

function finishQuiz() {

    quizState.quizFinished =
        true;


    $("#quiz-question")
        .classList
        .add("hidden");


    $("#quiz-result")
        .classList
        .remove("hidden");


    const total =
        quizQuestions.length;


    const score =
        quizState.score;


    const percentage =
        Math.round(
            (score / total) * 100
        );


    $("#quiz-score")
        .textContent =
        `${score}/${total}`;


    $("#quiz-percentage")
        .textContent =
        `${percentage}%`;


    if (score > highScore) {

        highScore =
            score;


        localStorage.setItem(
            STORAGE_KEYS.highScore,
            highScore
        );

    }


    $("#high-score-result")
        .textContent =
        highScore;


    $("#high-score-start")
        .textContent =
        highScore;

}


/*
=========================================================
28. QUIZ RESTART
=========================================================
*/

function restartQuiz() {

    startQuiz();

}


/*
=========================================================
29. EVENT DELEGATION - TRANSACTION
=========================================================
*/

function initializeTransactionListEvents() {

    $("#transaction-list")
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const id =
                    button.dataset.id;


                if (
                    action ===
                    "edit-transaction"
                ) {

                    openTransactionEdit(id);

                }


                if (
                    action ===
                    "delete-transaction"
                ) {

                    deleteTransaction(id);

                }

            }
        );

}


/*
=========================================================
30. EVENT DELEGATION - BOOKMARK
=========================================================
*/

function initializeBookmarkListEvents() {

    $("#bookmark-list")
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const id =
                    button.dataset.id;


                if (
                    action ===
                    "open-bookmark"
                ) {

                    openBookmark(id);

                }


                if (
                    action ===
                    "edit-bookmark"
                ) {

                    openBookmarkEdit(id);

                }


                if (
                    action ===
                    "delete-bookmark"
                ) {

                    deleteBookmark(id);

                }

            }
        );

}


/*
=========================================================
31. FORM EVENTS
=========================================================
*/

function initializeForms() {

    $("#transaction-form")
        .addEventListener(
            "submit",
            addTransaction
        );


    $("#bookmark-form")
        .addEventListener(
            "submit",
            addBookmark
        );


    $("#transaction-edit-form")
        .addEventListener(
            "submit",
            updateTransaction
        );


    $("#bookmark-edit-form")
        .addEventListener(
            "submit",
            updateBookmark
        );


    $("#start-quiz")
        .addEventListener(
            "click",
            startQuiz
        );


    $("#submit-answer")
        .addEventListener(
            "click",
            submitAnswer
        );


    $("#next-question")
        .addEventListener(
            "click",
            nextQuestion
        );


    $("#restart-quiz")
        .addEventListener(
            "click",
            restartQuiz
        );

}


/*
=========================================================
32. FILTER EVENTS
=========================================================
*/

function initializeFilterEvents() {

    $("#transaction-search")
        .addEventListener(
            "input",
            renderTransactions
        );


    $("#transaction-filter")
        .addEventListener(
            "change",
            renderTransactions
        );


    $("#transaction-sort")
        .addEventListener(
            "change",
            renderTransactions
        );


    $("#bookmark-search")
        .addEventListener(
            "input",
            renderBookmarks
        );


    $("#bookmark-sort")
        .addEventListener(
            "change",
            renderBookmarks
        );

}


/*
=========================================================
33. RESET FORM EVENTS
=========================================================
*/

function initializeResetEvents() {

    $("#transaction-reset")
        .addEventListener(
            "click",
            () => {

                clearErrors([
                    "#transaction-title-error",
                    "#transaction-amount-error",
                    "#transaction-date-error",
                    "#transaction-category-error"
                ]);


                $("#transaction-form-message")
                    .innerHTML = "";

            }
        );


    $("#bookmark-reset")
        .addEventListener(
            "click",
            () => {

                clearErrors([
                    "#bookmark-title-error",
                    "#bookmark-url-error",
                    "#bookmark-category-error"
                ]);


                $("#bookmark-form-message")
                    .innerHTML = "";

            }
        );

}


/*
=========================================================
34. INITIALIZE APPLICATION
=========================================================
*/

function initializeApplication() {

    initializeTabs();

    initializeModals();

    initializeForms();

    initializeFilterEvents();

    initializeResetEvents();

    initializeTransactionListEvents();

    initializeBookmarkListEvents();


    renderTransactions();

    updateTransactionSummary();

    renderBookmarks();


    $("#high-score-start")
        .textContent =
        highScore;


    $("#high-score-result")
        .textContent =
        highScore;

}


/*
=========================================================
35. DOM CONTENT LOADED
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
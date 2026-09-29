"use strict";

/*
=========================================================
CAMPUSHUB JS
PABWE P3
VANILLA JAVASCRIPT
=========================================================
*/

/* =======================================================
   1. STORAGE
======================================================= */

const STORAGE_KEYS = {
    transactions: "campushub_transactions",
    bookmarks: "campushub_bookmarks",
    highScore: "campushub_high_score",
    activeTab: "campushub_active_tab"
};


/* =======================================================
   2. STATE
======================================================= */

let transactions = loadData(
    STORAGE_KEYS.transactions,
    []
);

let bookmarks = loadData(
    STORAGE_KEYS.bookmarks,
    []
);

let highScore = Number(
    localStorage.getItem(
        STORAGE_KEYS.highScore
    ) || 0
);

let quizState = {
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    answered: false,
    quizFinished: false
};


/* =======================================================
   3. QUIZ DATA
======================================================= */

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


/* =======================================================
   4. DOM HELPER
======================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =======================================================
   5. UTILITY
======================================================= */

function formatRupiah(value) {
    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);
}


function createId() {
    return (
        Date.now().toString(36)
        + "-"
        + Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


function escapeHTML(value) {
    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


function loadData(key, fallback) {
    try {
        const data =
            localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed =
            JSON.parse(data);

        return parsed ?? fallback;

    } catch {
        return fallback;
    }
}


function saveData(key, data) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch {
        return false;
    }
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


function setInvalid(
    inputSelector,
    errorSelector,
    invalid,
    message = ""
) {
    const input =
        $(inputSelector);

    if (!input) {
        return;
    }

    input.setAttribute(
        "aria-invalid",
        invalid ? "true" : "false"
    );

    showError(
        errorSelector,
        invalid ? message : ""
    );
}


/* =======================================================
   6. TAB + HASH ROUTING
======================================================= */

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

    return routes[tabName] || "";
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

    $$(".tab-button").forEach(button => {

        const active =
            button.dataset.tab === tabName;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-selected",
            String(active)
        );
    });


    $$(".tab-panel").forEach(panel => {

        const active =
            panel.id ===
            `${tabName}-panel`;

        panel.classList.toggle(
            "active",
            active
        );

        panel.hidden = !active;
    });


    if (save) {
        localStorage.setItem(
            STORAGE_KEYS.activeTab,
            tabName
        );
    }


    if (updateUrl) {

        const hash =
            getHashFromTab(tabName);

        const target =
            hash
                ? `#${hash}`
                : "";

        if (
            window.location.hash !==
            target
        ) {

            history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}${target}`
            );
        }
    }
}


function initializeTabs() {

    $$(".tab-button").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activateTab(
                    button.dataset.tab
                );

            }
        );

    });


    const urlTab =
        getTabFromHash();

    const savedTab =
        localStorage.getItem(
            STORAGE_KEYS.activeTab
        ) || "expense";


    activateTab(
        urlTab || savedTab,
        true,
        Boolean(urlTab)
    );


    window.addEventListener(
        "hashchange",
        () => {

            activateTab(
                getTabFromHash()
                || "expense",
                true,
                false
            );

        }
    );
}


/* =======================================================
   7. TRANSACTION VALIDATION
======================================================= */

function validateTransaction(data) {

    let valid = true;

    clearErrors([
        "#transaction-title-error",
        "#transaction-amount-error",
        "#transaction-date-error",
        "#transaction-category-error"
    ]);


    const titleInvalid =
        !data.title.trim();

    const amountInvalid =
        !Number.isFinite(data.amount)
        || data.amount <= 0;

    const dateInvalid =
        !data.date;

    const categoryInvalid =
        !data.category.trim();


    setInvalid(
        "#transaction-title",
        "#transaction-title-error",
        titleInvalid,
        "Judul wajib diisi."
    );


    setInvalid(
        "#transaction-amount",
        "#transaction-amount-error",
        amountInvalid,
        "Jumlah harus lebih dari 0."
    );


    setInvalid(
        "#transaction-date",
        "#transaction-date-error",
        dateInvalid,
        "Tanggal wajib diisi."
    );


    setInvalid(
        "#transaction-category",
        "#transaction-category-error",
        categoryInvalid,
        "Kategori wajib diisi."
    );


    if (
        titleInvalid
        || amountInvalid
        || dateInvalid
        || categoryInvalid
    ) {
        valid = false;
    }


    return valid;
}


/* =======================================================
   8. TRANSACTION CREATE
======================================================= */

function addTransaction(event) {

    event.preventDefault();

    const data = {
        title:
            $("#transaction-title")
                .value
                .trim(),

        amount:
            Number(
                $("#transaction-amount")
                    .value
            ),

        type:
            $("#transaction-type")
                .value,

        date:
            $("#transaction-date")
                .value,

        category:
            $("#transaction-category")
                .value
                .trim()
    };


    if (!validateTransaction(data)) {
        return;
    }


    transactions.push({
        id: createId(),
        ...data,
        createdAt:
            new Date().toISOString()
    });


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    event.target.reset();

    clearErrors([
        "#transaction-title-error",
        "#transaction-amount-error",
        "#transaction-date-error",
        "#transaction-category-error"
    ]);


    renderTransactions();

    updateTransactionSummary();


    showFormMessage(
        "#transaction-form-message",
        "Transaksi berhasil ditambahkan."
    );
}


/* =======================================================
   9. TRANSACTION FILTER
======================================================= */

function getFilteredTransactions() {

    const search =
        $("#transaction-search")
            .value
            .toLowerCase()
            .trim();

    const filter =
        $("#transaction-filter")
            .value;

    const sort =
        $("#transaction-sort")
            .value;


    let result =
        transactions.filter(transaction => {

            const matchesSearch =
                !search
                || transaction.title
                    .toLowerCase()
                    .includes(search)
                || transaction.category
                    .toLowerCase()
                    .includes(search);


            const matchesFilter =
                filter === "all"
                || transaction.type === filter;


            return (
                matchesSearch
                && matchesFilter
            );

        });


    result.sort((a, b) => {

        switch (sort) {

            case "oldest":
                return (
                    new Date(a.date)
                    - new Date(b.date)
                );

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
                return (
                    new Date(b.date)
                    - new Date(a.date)
                );
        }
    });


    return result;
}


/* =======================================================
   10. TRANSACTION RENDER
======================================================= */

function renderTransactions() {

    const container =
        $("#transaction-list");

    const data =
        getFilteredTransactions();


    if (!data.length) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada transaksi yang ditemukan.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data.map(transaction => {

            const income =
                transaction.type === "income";

            return `
                <article
                    class="list-item"
                    data-id="${escapeHTML(transaction.id)}"
                >

                    <div class="item-info">

                        <span
                            class="type-badge ${
                                income
                                    ? "type-income"
                                    : "type-expense"
                            }"
                        >
                            ${
                                income
                                    ? "PEMASUKAN"
                                    : "PENGELUARAN"
                            }
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
                            class="amount ${
                                income
                                    ? "income"
                                    : "expense"
                            }"
                        >
                            ${income ? "+" : "-"}
                            ${formatRupiah(
                                transaction.amount
                            )}
                        </div>

                        <div class="item-actions">

                            <button
                                type="button"
                                class="btn btn-primary btn-small"
                                data-action="edit-transaction"
                                data-id="${escapeHTML(transaction.id)}"
                                aria-label="Edit ${escapeHTML(transaction.title)}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger btn-small"
                                data-action="delete-transaction"
                                data-id="${escapeHTML(transaction.id)}"
                                aria-label="Hapus ${escapeHTML(transaction.title)}"
                            >
                                Hapus
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


/* =======================================================
   11. TRANSACTION SUMMARY
======================================================= */

function updateTransactionSummary() {

    let income = 0;
    let expense = 0;


    for (
        const transaction
        of transactions
    ) {

        if (
            transaction.type ===
            "income"
        ) {
            income +=
                Number(transaction.amount);
        } else {
            expense +=
                Number(transaction.amount);
        }
    }


    const balance =
        income - expense;


    $("#total-income").textContent =
        formatRupiah(income);

    $("#total-expense").textContent =
        formatRupiah(expense);

    $("#total-balance").textContent =
        formatRupiah(balance);
}


/* =======================================================
   12. TRANSACTION DELETE
======================================================= */

function deleteTransaction(id) {

    const item =
        transactions.find(
            transaction =>
                transaction.id === id
        );


    if (!item) {
        return;
    }


    if (
        !window.confirm(
            `Hapus transaksi "${item.title}"?`
        )
    ) {
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
    updateTransactionSummary();
}


/* =======================================================
   13. TRANSACTION EDIT
======================================================= */

function openTransactionEdit(id) {

    const item =
        transactions.find(
            transaction =>
                transaction.id === id
        );


    if (!item) {
        return;
    }


    $("#edit-transaction-id").value =
        item.id;

    $("#edit-transaction-title").value =
        item.title;

    $("#edit-transaction-amount").value =
        item.amount;

    $("#edit-transaction-type").value =
        item.type;

    $("#edit-transaction-date").value =
        item.date;

    $("#edit-transaction-category").value =
        item.category;


    openModal(
        "transaction-modal"
    );
}


function updateTransaction(event) {

    event.preventDefault();


    const id =
        $("#edit-transaction-id")
            .value;


    const item =
        transactions.find(
            transaction =>
                transaction.id === id
        );


    if (!item) {
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


    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Jumlah transaksi harus lebih dari 0.");
        return;
    }


    if (!date) {
        alert("Tanggal transaksi wajib diisi.");
        return;
    }


    if (!category) {
        alert("Kategori transaksi wajib diisi.");
        return;
    }


    item.title = title;
    item.amount = amount;
    item.type = type;
    item.date = date;
    item.category = category;


    saveData(
        STORAGE_KEYS.transactions,
        transactions
    );


    closeModal(
        "transaction-modal"
    );

    renderTransactions();
    updateTransactionSummary();
}


/* =======================================================
   14. BOOKMARK VALIDATION
======================================================= */

function isValidURL(url) {

    try {

        const parsed =
            new URL(url);

        return (
            parsed.protocol === "http:"
            || parsed.protocol === "https:"
        );

    } catch {

        return false;
    }
}


function validateBookmark(data) {

    let valid = true;


    const titleInvalid =
        !data.title.trim();

    const urlInvalid =
        !data.url.trim()
        || !isValidURL(data.url);

    const categoryInvalid =
        !data.category.trim();


    setInvalid(
        "#bookmark-title",
        "#bookmark-title-error",
        titleInvalid,
        "Nama bookmark wajib diisi."
    );


    setInvalid(
        "#bookmark-url",
        "#bookmark-url-error",
        urlInvalid,
        data.url.trim()
            ? "URL harus menggunakan http:// atau https://."
            : "URL wajib diisi."
    );


    setInvalid(
        "#bookmark-category",
        "#bookmark-category-error",
        categoryInvalid,
        "Kategori wajib diisi."
    );


    if (
        titleInvalid
        || urlInvalid
        || categoryInvalid
    ) {
        valid = false;
    }


    return valid;
}


/* =======================================================
   15. BOOKMARK CREATE
======================================================= */

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


    bookmarks.push({
        id: createId(),
        ...data,
        createdAt:
            new Date().toISOString()
    });


    saveData(
        STORAGE_KEYS.bookmarks,
        bookmarks
    );


    event.target.reset();

    renderBookmarks();


    showFormMessage(
        "#bookmark-form-message",
        "Bookmark berhasil ditambahkan."
    );
}


/* =======================================================
   16. BOOKMARK FILTER
======================================================= */

function getFilteredBookmarks() {

    const search =
        $("#bookmark-search")
            .value
            .toLowerCase()
            .trim();

    const sort =
        $("#bookmark-sort")
            .value;


    let result =
        bookmarks.filter(bookmark => {

            if (!search) {
                return true;
            }

            return (
                bookmark.title
                    .toLowerCase()
                    .includes(search)
                || bookmark.url
                    .toLowerCase()
                    .includes(search)
                || bookmark.category
                    .toLowerCase()
                    .includes(search)
            );
        });


    result.sort((a, b) => {

        switch (sort) {

            case "oldest":
                return (
                    new Date(a.createdAt)
                    - new Date(b.createdAt)
                );

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
                return (
                    new Date(b.createdAt)
                    - new Date(a.createdAt)
                );
        }
    });


    return result;
}


/* =======================================================
   17. BOOKMARK RENDER
======================================================= */

function renderBookmarks() {

    const container =
        $("#bookmark-list");

    const data =
        getFilteredBookmarks();


    if (!data.length) {

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
                <article
                    class="list-item"
                    data-id="${escapeHTML(bookmark.id)}"
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
                            type="button"
                            class="btn btn-success btn-small"
                            data-action="open-bookmark"
                            data-id="${escapeHTML(bookmark.id)}"
                            aria-label="Buka ${escapeHTML(bookmark.title)}"
                        >
                            Buka
                        </button>

                        <button
                            type="button"
                            class="btn btn-primary btn-small"
                            data-action="edit-bookmark"
                            data-id="${escapeHTML(bookmark.id)}"
                            aria-label="Edit ${escapeHTML(bookmark.title)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-small"
                            data-action="delete-bookmark"
                            data-id="${escapeHTML(bookmark.id)}"
                            aria-label="Hapus ${escapeHTML(bookmark.title)}"
                        >
                            Hapus
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


/* =======================================================
   18. BOOKMARK OPEN
======================================================= */

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


/* =======================================================
   19. BOOKMARK DELETE
======================================================= */

function deleteBookmark(id) {

    const bookmark =
        bookmarks.find(
            item => item.id === id
        );


    if (!bookmark) {
        return;
    }


    if (
        !window.confirm(
            `Hapus bookmark "${bookmark.title}"?`
        )
    ) {
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


/* =======================================================
   20. BOOKMARK EDIT
======================================================= */

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


    openModal(
        "bookmark-modal"
    );
}


function updateBookmark(event) {

    event.preventDefault();


    const id =
        $("#edit-bookmark-id")
            .value;


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


    closeModal(
        "bookmark-modal"
    );

    renderBookmarks();
}


/* =======================================================
   21. FORM MESSAGE
======================================================= */

function showFormMessage(
    selector,
    message
) {

    const element =
        $(selector);

    if (!element) {
        return;
    }


    element.innerHTML = `
        <p class="success-message">
            ${escapeHTML(message)}
        </p>
    `;


    window.setTimeout(() => {

        element.textContent = "";

    }, 2500);
}


/* =======================================================
   22. MODAL
======================================================= */

let activeModal = null;
let previousFocusedElement = null;


function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }


    previousFocusedElement =
        document.activeElement;

    activeModal = modal;


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const firstInput =
        modal.querySelector(
            "input:not([type='hidden']), select, button"
        );


    if (firstInput) {
        firstInput.focus();
    }
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        activeModal === modal
        && previousFocusedElement
    ) {

        previousFocusedElement.focus();
    }


    activeModal = null;
}


function initializeModals() {

    $$("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.closeModal
                    );

                }
            );

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

            if (
                event.key === "Escape"
                && activeModal
            ) {

                closeModal(
                    activeModal.id
                );
            }
        }
    );
}


/* =======================================================
   23. QUIZ
======================================================= */

function startQuiz() {

    quizState = {
        currentQuestionIndex: 0,
        score: 0,
        selectedAnswer: null,
        answered: false,
        quizFinished: false
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


function renderQuestion() {

    const question =
        quizQuestions[
            quizState.currentQuestionIndex
        ];


    if (!question) {
        finishQuiz();
        return;
    }


    quizState.selectedAnswer =
        null;

    quizState.answered =
        false;


    $("#current-question-number")
        .textContent =
        quizState.currentQuestionIndex + 1;


    $("#total-question-number")
        .textContent =
        quizQuestions.length;


    $("#question-text")
        .textContent =
        question.question;


    $("#quiz-options").innerHTML =
        question.options
            .map((option, index) => `
                <button
                    type="button"
                    class="quiz-option"
                    data-option-index="${index}"
                    aria-pressed="false"
                >
                    ${escapeHTML(option)}
                </button>
            `)
            .join("");


    const feedback =
        $("#quiz-feedback");

    feedback.className =
        "quiz-feedback";

    feedback.textContent =
        "";


    $("#submit-answer")
        .classList
        .remove("hidden");

    $("#next-question")
        .classList
        .add("hidden");
}


/* =======================================================
   24. QUIZ SELECT
======================================================= */

function selectQuizAnswer(index) {

    if (quizState.answered) {
        return;
    }


    quizState.selectedAnswer =
        index;


    $$(".quiz-option")
        .forEach(option => {

            const selected =
                Number(
                    option.dataset.optionIndex
                ) === index;


            option.classList.toggle(
                "selected",
                selected
            );


            option.setAttribute(
                "aria-pressed",
                String(selected)
            );

        });
}


/* =======================================================
   25. QUIZ SUBMIT
======================================================= */

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


    const correct =
        quizState.selectedAnswer ===
        question.answer;


    const feedback =
        $("#quiz-feedback");


    if (correct) {

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


    $$(".quiz-option")
        .forEach(option => {

            option.disabled = true;

        });


    $("#submit-answer")
        .classList
        .add("hidden");

    $("#next-question")
        .classList
        .remove("hidden");
}


/* =======================================================
   26. QUIZ NEXT
======================================================= */

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


/* =======================================================
   27. QUIZ FINISH
======================================================= */

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
            String(highScore)
        );
    }


    $("#high-score-result")
        .textContent =
        highScore;

    $("#high-score-start")
        .textContent =
        highScore;
}


function restartQuiz() {
    startQuiz();
}


/* =======================================================
   28. EVENT DELEGATION
======================================================= */

function initializeListEvents() {

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


                const {
                    action,
                    id
                } = button.dataset;


                if (
                    action ===
                    "edit-transaction"
                ) {

                    openTransactionEdit(id);

                } else if (
                    action ===
                    "delete-transaction"
                ) {

                    deleteTransaction(id);
                }

            }
        );


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


                const {
                    action,
                    id
                } = button.dataset;


                if (
                    action ===
                    "open-bookmark"
                ) {

                    openBookmark(id);

                } else if (
                    action ===
                    "edit-bookmark"
                ) {

                    openBookmarkEdit(id);

                } else if (
                    action ===
                    "delete-bookmark"
                ) {

                    deleteBookmark(id);
                }

            }
        );
}


/* =======================================================
   29. QUIZ EVENT DELEGATION
======================================================= */

function initializeQuizEvents() {

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


    $("#quiz-options")
        .addEventListener(
            "click",
            event => {

                const option =
                    event.target.closest(
                        ".quiz-option"
                    );


                if (!option) {
                    return;
                }


                selectQuizAnswer(
                    Number(
                        option.dataset.optionIndex
                    )
                );

            }
        );
}


/* =======================================================
   30. FORM EVENTS
======================================================= */

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
}


/* =======================================================
   31. FILTER EVENTS
======================================================= */

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


/* =======================================================
   32. RESET EVENTS
======================================================= */

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

                [
                    "#transaction-title",
                    "#transaction-amount",
                    "#transaction-date",
                    "#transaction-category"
                ].forEach(selector => {

                    const element =
                        $(selector);

                    if (element) {
                        element.setAttribute(
                            "aria-invalid",
                            "false"
                        );
                    }
                });


                $("#transaction-form-message")
                    .textContent = "";

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

                [
                    "#bookmark-title",
                    "#bookmark-url",
                    "#bookmark-category"
                ].forEach(selector => {

                    const element =
                        $(selector);

                    if (element) {
                        element.setAttribute(
                            "aria-invalid",
                            "false"
                        );
                    }
                });


                $("#bookmark-form-message")
                    .textContent = "";

            }
        );
}


/* =======================================================
   33. INITIALIZATION
======================================================= */

function initializeApplication() {

    initializeTabs();

    initializeModals();

    initializeForms();

    initializeFilterEvents();

    initializeResetEvents();

    initializeListEvents();

    initializeQuizEvents();


    renderTransactions();

    updateTransactionSummary();

    renderBookmarks();


    $("#high-score-start")
        .textContent =
        highScore;

    $("#high-score-result")
        .textContent =
        highScore;


    /*
       Karena panel memakai hidden,
       pastikan kondisi awal sesuai route.
    */

    const activeTab =
        getTabFromHash()
        || localStorage.getItem(
            STORAGE_KEYS.activeTab
        )
        || "expense";

    activateTab(
        activeTab,
        true,
        false
    );
}


/* =======================================================
   34. START APPLICATION
======================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication,
    {
        once: true
    }
);
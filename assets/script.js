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

    const element =
        $(selector);

    if (element) {

        element.textContent =
            message;
    }
}


function clearErrors(selectors) {

    selectors.forEach(selector => {

        showError(
            selector,
            ""
        );

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
        invalid
            ? "true"
            : "false"
    );

    showError(
        errorSelector,
        invalid
            ? message
            : ""
    );
}


/* =======================================================
   6. TAB + HASH ROUTING + ACCESSIBILITY
======================================================= */

function getTabFromHash() {

    const hash =
        window.location.hash
            .replace("#", "")
            .toLowerCase()
            .trim();

    const routes = {

        pengeluaran:
            "expense",

        expense:
            "expense",

        bookmark:
            "bookmark",

        bookmarks:
            "bookmark",

        kuis:
            "quiz",

        quiz:
            "quiz"
    };

    return routes[hash] || null;
}


function getHashFromTab(tabName) {

    const routes = {

        expense:
            "pengeluaran",

        bookmark:
            "bookmark",

        quiz:
            "kuis"
    };

    return routes[tabName] || "pengeluaran";
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

    if (
        !validTabs.includes(tabName)
    ) {

        tabName =
            "expense";
    }


    const buttons =
        $$(".tab-button");

    const panels =
        $$(".tab-panel");


    /*
    -------------------------------------------------------
    UPDATE BUTTON TAB
    -------------------------------------------------------
    */

    buttons.forEach(button => {

        const isActive =
            button.dataset.tab ===
            tabName;


        button.classList.toggle(
            "active",
            isActive
        );


        button.setAttribute(
            "aria-selected",
            String(isActive)
        );


        /*
        Tab yang aktif bisa
        menerima fokus keyboard.
        */

        button.setAttribute(
            "tabindex",
            isActive
                ? "0"
                : "-1"
        );

    });


    /*
    -------------------------------------------------------
    UPDATE PANEL
    -------------------------------------------------------
    */

    panels.forEach(panel => {

        const isActive =
            panel.id ===
            `${tabName}-panel`;


        panel.classList.toggle(
            "active",
            isActive
        );


        /*
        hidden membantu screen reader
        mengetahui panel mana yang aktif.
        */

        panel.hidden =
            !isActive;

    });


    /*
    -------------------------------------------------------
    SAVE ACTIVE TAB
    -------------------------------------------------------
    */

    if (save) {

        localStorage.setItem(
            STORAGE_KEYS.activeTab,
            tabName
        );
    }


    /*
    -------------------------------------------------------
    UPDATE HASH URL
    -------------------------------------------------------
    */

    if (updateUrl) {

        const targetHash =
            `#${getHashFromTab(tabName)}`;


        if (
            window.location.hash !==
            targetHash
        ) {

            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}${targetHash}`
            );
        }
    }
}


function initializeTabs() {

    const buttons =
        $$(".tab-button");


    buttons.forEach(
        (button, index) => {

            /*
            ------------------------------------------------
            CLICK
            ------------------------------------------------
            */

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


            /*
            ------------------------------------------------
            KEYBOARD NAVIGATION
            ------------------------------------------------

            ArrowRight = tab berikutnya
            ArrowLeft  = tab sebelumnya
            Home       = tab pertama
            End        = tab terakhir
            ------------------------------------------------
            */

            button.addEventListener(
                "keydown",
                event => {

                    let newIndex =
                        index;


                    if (
                        event.key ===
                        "ArrowRight"
                    ) {

                        newIndex =
                            (
                                index + 1
                            ) %
                            buttons.length;
                    }


                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {

                        newIndex =
                            (
                                index -
                                1 +
                                buttons.length
                            ) %
                            buttons.length;
                    }


                    if (
                        event.key ===
                        "Home"
                    ) {

                        newIndex =
                            0;
                    }


                    if (
                        event.key ===
                        "End"
                    ) {

                        newIndex =
                            buttons.length -
                            1;
                    }


                    if (
                        newIndex !==
                        index
                    ) {

                        event.preventDefault();


                        const nextButton =
                            buttons[
                                newIndex
                            ];


                        nextButton.focus();


                        activateTab(
                            nextButton
                                .dataset
                                .tab,
                            true,
                            true
                        );
                    }

                }
            );

        }
    );


    /*
    -------------------------------------------------------
    INITIAL ACTIVE TAB
    -------------------------------------------------------
    */

    const urlTab =
        getTabFromHash();


    const savedTab =
        localStorage.getItem(
            STORAGE_KEYS.activeTab
        ) || "expense";


    activateTab(
        urlTab || savedTab,
        true,
        true
    );


    /*
    -------------------------------------------------------
    HASH CHANGE
    -------------------------------------------------------
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
        !Number.isFinite(
            data.amount
        )
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


    if (
        !validateTransaction(data)
    ) {

        return;
    }


    transactions.push({

        id:
            createId(),

        ...data,

        createdAt:
            new Date()
                .toISOString()

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
        transactions.filter(
            transaction => {

                const matchesSearch =
                    !search
                    ||
                    transaction.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    transaction.category
                        .toLowerCase()
                        .includes(search);


                const matchesFilter =
                    filter === "all"
                    ||
                    transaction.type ===
                    filter;


                return (
                    matchesSearch
                    &&
                    matchesFilter
                );
            }
        );


    result.sort(
        (a, b) => {

            switch (sort) {

                case "oldest":

                    return (
                        new Date(a.date)
                        -
                        new Date(b.date)
                    );


                case "highest":

                    return (
                        b.amount -
                        a.amount
                    );


                case "lowest":

                    return (
                        a.amount -
                        b.amount
                    );


                case "title":

                    return a.title.localeCompare(
                        b.title
                    );


                case "newest":

                default:

                    return (
                        new Date(b.date)
                        -
                        new Date(a.date)
                    );
            }

        }
    );


    return result;
}


/* =======================================================
   10. TRANSACTION RENDER
======================================================= */

function renderTransactions() {

    const container =
        $("#transaction-list");


    if (!container) {
        return;
    }


    const data =
        getFilteredTransactions();


    if (!data.length) {

        container.innerHTML = `
            <div
                class="empty-state"
                role="status"
            >
                Tidak ada transaksi yang ditemukan.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data
            .map(
                transaction => {

                    const income =
                        transaction.type ===
                        "income";


                    return `
                        <article
                            class="list-item"
                            data-id="${escapeHTML(
                                transaction.id
                            )}"
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
                                    ${
                                        income
                                            ? "+"
                                            : "-"
                                    }
                                    ${formatRupiah(
                                        transaction.amount
                                    )}
                                </div>


                                <div
                                    class="item-actions"
                                >

                                    <button
                                        type="button"
                                        class="btn btn-primary btn-small"
                                        data-action="edit-transaction"
                                        data-id="${escapeHTML(
                                            transaction.id
                                        )}"
                                        aria-label="Edit ${escapeHTML(
                                            transaction.title
                                        )}"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-danger btn-small"
                                        data-action="delete-transaction"
                                        data-id="${escapeHTML(
                                            transaction.id
                                        )}"
                                        aria-label="Hapus ${escapeHTML(
                                            transaction.title
                                        )}"
                                    >
                                        Hapus
                                    </button>

                                </div>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
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
                Number(
                    transaction.amount
                );

        } else {

            expense +=
                Number(
                    transaction.amount
                );
        }
    }


    const balance =
        income - expense;


    const totalIncome =
        $("#total-income");


    const totalExpense =
        $("#total-expense");


    const totalBalance =
        $("#total-balance");


    if (totalIncome) {

        totalIncome.textContent =
            formatRupiah(income);
    }


    if (totalExpense) {

        totalExpense.textContent =
            formatRupiah(expense);
    }


    if (totalBalance) {

        totalBalance.textContent =
            formatRupiah(balance);
    }
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

        alert(
            "Judul transaksi wajib diisi."
        );

        return;
    }


    if (
        !Number.isFinite(amount)
        || amount <= 0
    ) {

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


    item.title =
        title;

    item.amount =
        amount;

    item.type =
        type;

    item.date =
        date;

    item.category =
        category;


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
            parsed.protocol ===
                "http:"
            ||
            parsed.protocol ===
                "https:"
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
        ||
        !isValidURL(data.url);


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
            ?
            "URL harus menggunakan http:// atau https://."
            :
            "URL wajib diisi."
    );


    setInvalid(
        "#bookmark-category",
        "#bookmark-category-error",
        categoryInvalid,
        "Kategori wajib diisi."
    );


    if (
        titleInvalid
        ||
        urlInvalid
        ||
        categoryInvalid
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


    if (
        !validateBookmark(data)
    ) {

        return;
    }


    bookmarks.push({

        id:
            createId(),

        ...data,

        createdAt:
            new Date()
                .toISOString()
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
        bookmarks.filter(
            bookmark => {

                if (!search) {
                    return true;
                }


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
            }
        );


    result.sort(
        (a, b) => {

            switch (sort) {

                case "oldest":

                    return (
                        new Date(
                            a.createdAt
                        )
                        -
                        new Date(
                            b.createdAt
                        )
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
                        new Date(
                            b.createdAt
                        )
                        -
                        new Date(
                            a.createdAt
                        )
                    );
            }

        }
    );


    return result;
}


/* =======================================================
   17. BOOKMARK RENDER
======================================================= */

function renderBookmarks() {

    const container =
        $("#bookmark-list");


    if (!container) {
        return;
    }


    const data =
        getFilteredBookmarks();


    if (!data.length) {

        container.innerHTML = `
            <div
                class="empty-state"
                role="status"
            >
                Tidak ada bookmark yang ditemukan.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data
            .map(
                bookmark => {

                    return `
                        <article
                            class="list-item"
                            data-id="${escapeHTML(
                                bookmark.id
                            )}"
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


                                <p
                                    class="bookmark-url"
                                >
                                    ${escapeHTML(
                                        bookmark.url
                                    )}
                                </p>

                            </div>


                            <div
                                class="item-actions"
                            >

                                <button
                                    type="button"
                                    class="btn btn-success btn-small"
                                    data-action="open-bookmark"
                                    data-id="${escapeHTML(
                                        bookmark.id
                                    )}"
                                    aria-label="Buka ${escapeHTML(
                                        bookmark.title
                                    )}"
                                >
                                    Buka
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-primary btn-small"
                                    data-action="edit-bookmark"
                                    data-id="${escapeHTML(
                                        bookmark.id
                                    )}"
                                    aria-label="Edit ${escapeHTML(
                                        bookmark.title
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="btn btn-danger btn-small"
                                    data-action="delete-bookmark"
                                    data-id="${escapeHTML(
                                        bookmark.id
                                    )}"
                                    aria-label="Hapus ${escapeHTML(
                                        bookmark.title
                                    )}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


/* =======================================================
   18. BOOKMARK OPEN
======================================================= */

function openBookmark(id) {

    const bookmark =
        bookmarks.find(
            item =>
                item.id === id
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
            item =>
                item.id === id
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
            item =>
                item.id !== id
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
            item =>
                item.id === id
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


    bookmark.title =
        title;

    bookmark.url =
        url;

    bookmark.category =
        category;


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
        <p
            class="success-message"
            role="status"
            aria-live="polite"
        >
            ${escapeHTML(message)}
        </p>
    `;


    window.setTimeout(
        () => {

            element.textContent =
                "";

        },
        2500
    );
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


    activeModal =
        modal;


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
    Fokus ke input pertama
    */

    const firstInput =
        modal.querySelector(
            "input:not([type='hidden']), select, textarea, button"
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


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        activeModal === modal
        &&
        previousFocusedElement
        &&
        typeof
            previousFocusedElement.focus
            ===
            "function"
    ) {

        previousFocusedElement.focus();
    }


    activeModal =
        null;

    previousFocusedElement =
        null;
}


function initializeModals() {

    /*
    Tombol close
    */

    $$("[data-close-modal]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            button
                                .dataset
                                .closeModal
                        );

                    }
                );

            }
        );


    /*
    Klik background modal
    */

    $$(".modal")
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeModal(
                                modal.id
                            );
                        }

                    }
                );

            }
        );


    /*
    Tombol Escape
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                    "Escape"
                &&
                activeModal
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

        currentQuestionIndex:
            0,

        score:
            0,

        selectedAnswer:
            null,

        answered:
            false,

        quizFinished:
            false
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


/* =======================================================
   24. QUIZ RENDER
======================================================= */

function renderQuestion() {

    const question =
        quizQuestions[
            quizState
                .currentQuestionIndex
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
        quizState
            .currentQuestionIndex
        + 1;


    $("#total-question-number")
        .textContent =
        quizQuestions.length;


    $("#question-text")
        .textContent =
        question.question;


    $("#quiz-options").innerHTML =
        question.options
            .map(
                (option, index) => `

                    <button
                        type="button"
                        class="quiz-option"
                        data-option-index="${index}"
                        aria-pressed="false"
                    >
                        ${escapeHTML(
                            option
                        )}
                    </button>

                `
            )
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
   25. QUIZ SELECT
======================================================= */

function selectQuizAnswer(index) {

    if (
        quizState.answered
    ) {

        return;
    }


    quizState.selectedAnswer =
        index;


    $$(".quiz-option")
        .forEach(
            option => {

                const selected =
                    Number(
                        option
                            .dataset
                            .optionIndex
                    ) === index;


                option.classList.toggle(
                    "selected",
                    selected
                );


                option.setAttribute(
                    "aria-pressed",
                    String(selected)
                );

            }
        );
}


/* =======================================================
   26. QUIZ SUBMIT
======================================================= */

function submitAnswer() {

    if (
        quizState.answered
    ) {

        return;
    }


    if (
        quizState.selectedAnswer ===
        null
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
            quizState
                .currentQuestionIndex
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
        .forEach(
            option => {

                option.disabled =
                    true;

            }
        );


    $("#submit-answer")
        .classList
        .add("hidden");


    $("#next-question")
        .classList
        .remove("hidden");
}


/* =======================================================
   27. QUIZ NEXT
======================================================= */

function nextQuestion() {

    if (
        !quizState.answered
    ) {

        return;
    }


    quizState.currentQuestionIndex++;


    if (
        quizState
            .currentQuestionIndex
        >=
        quizQuestions.length
    ) {

        finishQuiz();

        return;
    }


    renderQuestion();
}


/* =======================================================
   28. QUIZ FINISH
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
            (
                score /
                total
            ) * 100
        );


    $("#quiz-score")
        .textContent =
        `${score}/${total}`;


    $("#quiz-percentage")
        .textContent =
        `${percentage}%`;


    if (
        score > highScore
    ) {

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
   29. EVENT DELEGATION
======================================================= */

function initializeListEvents() {

    const transactionList =
        $("#transaction-list");


    const bookmarkList =
        $("#bookmark-list");


    if (transactionList) {

        transactionList.addEventListener(
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
                } =
                    button.dataset;


                if (
                    action ===
                    "edit-transaction"
                ) {

                    openTransactionEdit(
                        id
                    );

                } else if (
                    action ===
                    "delete-transaction"
                ) {

                    deleteTransaction(
                        id
                    );
                }

            }
        );
    }


    if (bookmarkList) {

        bookmarkList.addEventListener(
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
                } =
                    button.dataset;


                if (
                    action ===
                    "open-bookmark"
                ) {

                    openBookmark(
                        id
                    );

                } else if (
                    action ===
                    "edit-bookmark"
                ) {

                    openBookmarkEdit(
                        id
                    );

                } else if (
                    action ===
                    "delete-bookmark"
                ) {

                    deleteBookmark(
                        id
                    );
                }

            }
        );
    }
}


/* =======================================================
   30. QUIZ EVENT DELEGATION
======================================================= */

function initializeQuizEvents() {

    const startQuizButton =
        $("#start-quiz");


    const submitAnswerButton =
        $("#submit-answer");


    const nextQuestionButton =
        $("#next-question");


    const restartQuizButton =
        $("#restart-quiz");


    const quizOptions =
        $("#quiz-options");


    if (startQuizButton) {

        startQuizButton.addEventListener(
            "click",
            startQuiz
        );
    }


    if (submitAnswerButton) {

        submitAnswerButton.addEventListener(
            "click",
            submitAnswer
        );
    }


    if (nextQuestionButton) {

        nextQuestionButton.addEventListener(
            "click",
            nextQuestion
        );
    }


    if (restartQuizButton) {

        restartQuizButton.addEventListener(
            "click",
            restartQuiz
        );
    }


    if (quizOptions) {

        quizOptions.addEventListener(
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
                        option
                            .dataset
                            .optionIndex
                    )
                );

            }
        );
    }
}


/* =======================================================
   31. FORM EVENTS
======================================================= */

function initializeForms() {

    const transactionForm =
        $("#transaction-form");


    const bookmarkForm =
        $("#bookmark-form");


    const transactionEditForm =
        $("#transaction-edit-form");


    const bookmarkEditForm =
        $("#bookmark-edit-form");


    if (transactionForm) {

        transactionForm.addEventListener(
            "submit",
            addTransaction
        );
    }


    if (bookmarkForm) {

        bookmarkForm.addEventListener(
            "submit",
            addBookmark
        );
    }


    if (transactionEditForm) {

        transactionEditForm.addEventListener(
            "submit",
            updateTransaction
        );
    }


    if (bookmarkEditForm) {

        bookmarkEditForm.addEventListener(
            "submit",
            updateBookmark
        );
    }
}


/* =======================================================
   32. FILTER EVENTS
======================================================= */

function initializeFilterEvents() {

    const transactionSearch =
        $("#transaction-search");


    const transactionFilter =
        $("#transaction-filter");


    const transactionSort =
        $("#transaction-sort");


    const bookmarkSearch =
        $("#bookmark-search");


    const bookmarkSort =
        $("#bookmark-sort");


    if (transactionSearch) {

        transactionSearch.addEventListener(
            "input",
            renderTransactions
        );
    }


    if (transactionFilter) {

        transactionFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    if (transactionSort) {

        transactionSort.addEventListener(
            "change",
            renderTransactions
        );
    }


    if (bookmarkSearch) {

        bookmarkSearch.addEventListener(
            "input",
            renderBookmarks
        );
    }


    if (bookmarkSort) {

        bookmarkSort.addEventListener(
            "change",
            renderBookmarks
        );
    }
}


/* =======================================================
   33. RESET EVENTS
======================================================= */

function initializeResetEvents() {

    const transactionReset =
        $("#transaction-reset");


    const bookmarkReset =
        $("#bookmark-reset");


    if (transactionReset) {

        transactionReset.addEventListener(
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
                ].forEach(
                    selector => {

                        const element =
                            $(selector);


                        if (element) {

                            element.setAttribute(
                                "aria-invalid",
                                "false"
                            );
                        }

                    }
                );


                const message =
                    $("#transaction-form-message");


                if (message) {

                    message.textContent =
                        "";
                }

            }
        );
    }


    if (bookmarkReset) {

        bookmarkReset.addEventListener(
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
                ].forEach(
                    selector => {

                        const element =
                            $(selector);


                        if (element) {

                            element.setAttribute(
                                "aria-invalid",
                                "false"
                            );
                        }

                    }
                );


                const message =
                    $("#bookmark-form-message");


                if (message) {

                    message.textContent =
                        "";
                }

            }
        );
    }
}


/* =======================================================
   34. INITIALIZATION
======================================================= */

function initializeApplication() {

    /*
    -------------------------------------------------------
    INITIALIZE COMPONENTS
    -------------------------------------------------------
    */

    initializeTabs();

    initializeModals();

    initializeForms();

    initializeFilterEvents();

    initializeResetEvents();

    initializeListEvents();

    initializeQuizEvents();


    /*
    -------------------------------------------------------
    INITIAL RENDER
    -------------------------------------------------------
    */

    renderTransactions();

    updateTransactionSummary();

    renderBookmarks();


    /*
    -------------------------------------------------------
    HIGH SCORE
    -------------------------------------------------------
    */

    const highScoreStart =
        $("#high-score-start");


    const highScoreResult =
        $("#high-score-result");


    if (highScoreStart) {

        highScoreStart.textContent =
            highScore;
    }


    if (highScoreResult) {

        highScoreResult.textContent =
            highScore;
    }


    /*
    -------------------------------------------------------
    FINAL ACTIVE TAB
    -------------------------------------------------------
    */

    const activeTab =
        getTabFromHash()
        ||
        localStorage.getItem(
            STORAGE_KEYS.activeTab
        )
        ||
        "expense";


    activateTab(
        activeTab,
        true,
        false
    );
}


/* =======================================================
   35. START APPLICATION
======================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication,
    {
        once: true
    }
);
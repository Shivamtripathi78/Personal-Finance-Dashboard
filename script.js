"use strict";

// ========================================
// FinanceFlow — Personal Finance Dashboard
// ========================================

const STORAGE_KEY = "financeflow_transactions_v1";

const CATEGORIES = {
    income: [
        "Salary",
        "Freelance",
        "Business",
        "Investment",
        "Gift",
        "Other Income"
    ],

    expense: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Housing",
        "Healthcare",
        "Education",
        "Entertainment",
        "Travel",
        "Other Expense"
    ]
};

const CATEGORY_COLORS = [
    "#426c50",
    "#7a9e74",
    "#a8bf8d",
    "#d1b16b",
    "#d98968",
    "#bc747f",
    "#8d86ba",
    "#639ca0",
    "#8495a8",
    "#a2a69b"
];

const $ = (selector) => document.querySelector(selector);

const elements = {
    currentYear: $("#currentYear"),

    addButton: $("#addTransactionButton"),
    exportButton: $("#exportButton"),
    monthFilter: $("#monthFilter"),

    totalBalance: $("#totalBalance"),
    totalIncome: $("#totalIncome"),
    totalExpenses: $("#totalExpenses"),
    savingsRate: $("#savingsRate"),

    categoryChart: $("#categoryChart"),
    cashflowChart: $("#cashflowChart"),
    categoryLegend: $("#categoryLegend"),

    searchInput: $("#searchInput"),
    typeFilter: $("#typeFilter"),
    categoryFilter: $("#categoryFilter"),

    transactionsBody: $("#transactionsBody"),
    transactionCount: $("#transactionCount"),
    emptyState: $("#emptyState"),

    transactionDialog: $("#transactionDialog"),
    transactionForm: $("#transactionForm"),
    dialogTitle: $("#dialogTitle"),

    titleInput: $("#transactionTitle"),
    typeInput: $("#transactionType"),
    amountInput: $("#transactionAmount"),
    categoryInput: $("#transactionCategory"),
    dateInput: $("#transactionDate"),
    notesInput: $("#transactionNotes"),

    closeDialogButton: $("#closeDialogButton"),
    cancelDialogButton: $("#cancelDialogButton"),

    deleteDialog: $("#deleteDialog"),
    cancelDeleteButton: $("#cancelDeleteButton"),
    confirmDeleteButton: $("#confirmDeleteButton"),

    toast: $("#toast")
};

let transactions = loadTransactions();

let editingTransactionId = null;
let deletingTransactionId = null;

let categoryChartInstance = null;
let cashflowChartInstance = null;

let toastTimeout = null;


// ========================================
// Date and Formatting Utilities
// ========================================

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
    return getLocalDateString().slice(0, 7);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function createId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}


// ========================================
// Local Storage
// ========================================

function loadTransactions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((transaction) => {
            return (
                transaction &&
                typeof transaction.id === "string" &&
                typeof transaction.title === "string" &&
                typeof transaction.amount === "number" &&
                Number.isFinite(transaction.amount) &&
                transaction.amount > 0 &&
                ["income", "expense"].includes(transaction.type) &&
                typeof transaction.category === "string" &&
                typeof transaction.date === "string"
            );
        });
    } catch (error) {
        console.error("Unable to load transactions:", error);
        return [];
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        console.error("Unable to save transactions:", error);

        showToast(
            "Unable to save data. Check your browser storage."
        );

        return false;
    }
}


// ========================================
// Notifications
// ========================================

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 2800);
}


// ========================================
// Category Management
// ========================================

function populateCategoryOptions() {
    const currentType = elements.typeInput.value || "income";
    const currentCategory = elements.categoryInput.value;

    const categories = CATEGORIES[currentType];

    elements.categoryInput.replaceChildren();

    categories.forEach((category) => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        elements.categoryInput.append(option);
    });

    if (categories.includes(currentCategory)) {
        elements.categoryInput.value = currentCategory;
    }
}

function populateCategoryFilter() {
    const previousValue = elements.categoryFilter.value;

    const categories = [
        ...new Set(transactions.map((transaction) => transaction.category))
    ].sort();

    elements.categoryFilter.replaceChildren();

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Categories";

    elements.categoryFilter.append(allOption);

    categories.forEach((category) => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        elements.categoryFilter.append(option);
    });

    if (categories.includes(previousValue)) {
        elements.categoryFilter.value = previousValue;
    } else {
        elements.categoryFilter.value = "all";
    }
}


// ========================================
// Filtering
// ========================================

function getSelectedMonthTransactions() {
    const month = elements.monthFilter.value;

    return transactions.filter((transaction) => {
        return transaction.date.startsWith(month);
    });
}

function getFilteredTransactions() {
    const query = elements.searchInput.value.trim().toLowerCase();
    const type = elements.typeFilter.value;
    const category = elements.categoryFilter.value;

    return getSelectedMonthTransactions()
        .filter((transaction) => {
            const matchesSearch =
                transaction.title.toLowerCase().includes(query) ||
                transaction.category.toLowerCase().includes(query) ||
                (transaction.notes || "").toLowerCase().includes(query);

            const matchesType =
                type === "all" || transaction.type === type;

            const matchesCategory =
                category === "all" ||
                transaction.category === category;

            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );
        })
        .sort((first, second) => {
            const dateDifference =
                second.date.localeCompare(first.date);

            if (dateDifference !== 0) {
                return dateDifference;
            }

            return (second.createdAt || "").localeCompare(
                first.createdAt || ""
            );
        });
}


// ========================================
// Financial Summary
// ========================================

function updateSummary() {
    const monthTransactions = getSelectedMonthTransactions();

    const income = monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = monthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = income - expenses;

    const savingsRate = income > 0
        ? ((income - expenses) / income) * 100
        : 0;

    elements.totalBalance.textContent = formatCurrency(balance);
    elements.totalIncome.textContent = formatCurrency(income);
    elements.totalExpenses.textContent = formatCurrency(expenses);

    elements.savingsRate.textContent = `${savingsRate.toFixed(1)}%`;

    elements.totalBalance.title =
        "Net balance for the selected month";

    elements.totalIncome.title =
        "Income recorded during the selected month";

    elements.totalExpenses.title =
        "Expenses recorded during the selected month";

    elements.savingsRate.title =
        "Calculated as (income - expenses) / income";

    elements.totalBalance.style.color =
        balance < 0 ? "#ffe0de" : "";

    elements.savingsRate.style.color =
        savingsRate < 0 ? "#ffe0de" : "";
}


// ========================================
// Transaction Table
// ========================================

function createCell(className = "") {
    const cell = document.createElement("td");

    if (className) {
        cell.className = className;
    }

    return cell;
}

function createTransactionRow(transaction) {
    const row = document.createElement("tr");

    // Description
    const descriptionCell = createCell();

    const description = document.createElement("div");
    description.className = "transaction-description";

    const icon = document.createElement("span");
    icon.className = "transaction-icon";

    icon.textContent =
        transaction.type === "income" ? "↗" : "↘";

    const textContainer = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = transaction.title;

    const notes = document.createElement("small");
    notes.textContent = transaction.notes || transaction.type;

    textContainer.append(title, notes);
    description.append(icon, textContainer);
    descriptionCell.append(description);

    // Category
    const categoryCell = createCell();

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "category-badge";
    categoryBadge.textContent = transaction.category;

    categoryCell.append(categoryBadge);

    // Date
    const dateCell = createCell();
    dateCell.textContent = formatDate(transaction.date);

    // Type
    const typeCell = createCell();

    const typeBadge = document.createElement("span");

    typeBadge.className = `type-badge ${transaction.type}`;
    typeBadge.textContent =
        transaction.type === "income" ? "Income" : "Expense";

    typeCell.append(typeBadge);

    // Amount
    const amountCell = createCell(
        transaction.type === "income"
            ? "amount-income"
            : "amount-expense"
    );

    const sign = transaction.type === "income" ? "+" : "−";

    amountCell.textContent =
        `${sign}${formatCurrency(transaction.amount)}`;

    // Actions
    const actionsCell = createCell();

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "row-action";
    editButton.textContent = "✎";
    editButton.title = "Edit transaction";
    editButton.setAttribute("aria-label", "Edit transaction");

    editButton.addEventListener("click", () => {
        openTransactionDialog(transaction.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "row-action delete";
    deleteButton.textContent = "⌫";
    deleteButton.title = "Delete transaction";
    deleteButton.setAttribute("aria-label", "Delete transaction");

    deleteButton.addEventListener("click", () => {
        openDeleteDialog(transaction.id);
    });

    actions.append(editButton, deleteButton);
    actionsCell.append(actions);

    row.append(
        descriptionCell,
        categoryCell,
        dateCell,
        typeCell,
        amountCell,
        actionsCell
    );

    return row;
}

function renderTransactions() {
    const filtered = getFilteredTransactions();

    elements.transactionsBody.replaceChildren();

    const fragment = document.createDocumentFragment();

    filtered.forEach((transaction) => {
        fragment.append(createTransactionRow(transaction));
    });

    elements.transactionsBody.append(fragment);

    elements.transactionCount.textContent =
        `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;

    elements.emptyState.hidden = filtered.length > 0;

    elements.transactionsBody.parentElement.hidden =
        filtered.length === 0;

    if (transactions.length === 0) {
        elements.emptyState.querySelector("h3").textContent =
            "No transactions yet";

        elements.emptyState.querySelector("p").textContent =
            "Add your first income or expense to get started.";
    } else {
        elements.emptyState.querySelector("h3").textContent =
            "No transactions found";

        elements.emptyState.querySelector("p").textContent =
            "Try changing your search or filters.";
    }
}


// ========================================
// Charts
// ========================================

function destroyCharts() {
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
    }

    if (cashflowChartInstance) {
        cashflowChartInstance.destroy();
        cashflowChartInstance = null;
    }
}

function renderCategoryChart() {
    if (typeof Chart === "undefined") {
        return;
    }

    const expenses = getSelectedMonthTransactions().filter(
        (transaction) => transaction.type === "expense"
    );

    const totals = {};

    expenses.forEach((transaction) => {
        totals[transaction.category] =
            (totals[transaction.category] || 0) + transaction.amount;
    });

    const categories = Object.keys(totals).sort(
        (first, second) => totals[second] - totals[first]
    );

    const values = categories.map((category) => totals[category]);

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(elements.categoryChart, {
        type: "doughnut",

        data: {
            labels: categories,

            datasets: [{
                data: values,

                backgroundColor: categories.map((_, index) => {
                    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                }),

                borderColor: "#ffffff",
                borderWidth: 3,
                hoverOffset: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            return (
                                ` ${context.label}: ` +
                                formatCurrency(context.raw)
                            );
                        }
                    }
                }
            }
        }
    });

    elements.categoryLegend.replaceChildren();

    if (categories.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-chart-message";
        message.textContent = "No expenses recorded for this month.";

        elements.categoryLegend.append(message);

        return;
    }

    categories.forEach((category, index) => {
        const item = document.createElement("div");
        item.className = "category-legend-item";

        const dot = document.createElement("span");
        dot.className = "legend-dot";

        dot.style.backgroundColor =
            CATEGORY_COLORS[index % CATEGORY_COLORS.length];

        const label = document.createElement("span");
        label.textContent = category;

        const amount = document.createElement("strong");
        amount.textContent = formatCurrency(totals[category]);

        item.append(dot, label, amount);

        elements.categoryLegend.append(item);
    });
}

function renderCashflowChart() {
    if (typeof Chart === "undefined") {
        return;
    }

    const monthTransactions = getSelectedMonthTransactions();

    const income = monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = monthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    if (cashflowChartInstance) {
        cashflowChartInstance.destroy();
    }

    cashflowChartInstance = new Chart(elements.cashflowChart, {
        type: "bar",

        data: {
            labels: ["Selected Month"],

            datasets: [
                {
                    label: "Income",
                    data: [income],

                    backgroundColor: "#4b8c60",
                    borderRadius: 7,
                    maxBarThickness: 65
                },

                {
                    label: "Expenses",
                    data: [expenses],

                    backgroundColor: "#d36e68",
                    borderRadius: 7,
                    maxBarThickness: 65
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            return (
                                `${context.dataset.label}: ` +
                                formatCurrency(context.raw)
                            );
                        }
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {
                        color: "#777e74"
                    }
                },

                y: {
                    beginAtZero: true,

                    border: {
                        display: false
                    },

                    grid: {
                        color: "#edf0e9"
                    },

                    ticks: {
                        color: "#777e74",

                        callback(value) {
                            return `₹${Number(value).toLocaleString("en-IN")}`;
                        }
                    }
                }
            }
        }
    });
}

function renderCharts() {
    renderCategoryChart();
    renderCashflowChart();
}


// ========================================
// Add and Edit Transactions
// ========================================

function openTransactionDialog(transactionId = null) {
    editingTransactionId = transactionId;

    elements.transactionForm.reset();

    elements.typeInput.value = "income";
    populateCategoryOptions();

    if (transactionId) {
        const transaction = transactions.find(
            (item) => item.id === transactionId
        );

        if (!transaction) {
            showToast("Transaction not found.");
            return;
        }

        elements.dialogTitle.textContent = "Edit Transaction";

        elements.titleInput.value = transaction.title;
        elements.typeInput.value = transaction.type;

        populateCategoryOptions();

        elements.amountInput.value = transaction.amount;
        elements.categoryInput.value = transaction.category;
        elements.dateInput.value = transaction.date;
        elements.notesInput.value = transaction.notes || "";
    } else {
        elements.dialogTitle.textContent = "Add Transaction";

        elements.dateInput.value = getLocalDateString();
    }

    if (!elements.transactionDialog.open) {
        elements.transactionDialog.showModal();
    }

    elements.titleInput.focus();
}

function closeTransactionDialog() {
    if (elements.transactionDialog.open) {
        elements.transactionDialog.close();
    }

    editingTransactionId = null;
    elements.transactionForm.reset();
}

function handleTransactionSubmit(event) {
    event.preventDefault();

    const title = elements.titleInput.value.trim();
    const type = elements.typeInput.value;
    const amount = Number(elements.amountInput.value);
    const category = elements.categoryInput.value;
    const date = elements.dateInput.value;
    const notes = elements.notesInput.value.trim();

    if (!title || title.length > 100) {
        showToast("Enter a valid transaction description.");
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 1000000000
    ) {
        showToast("Enter a valid positive amount.");
        return;
    }

    if (!["income", "expense"].includes(type)) {
        showToast("Select a valid transaction type.");
        return;
    }

    if (!CATEGORIES[type].includes(category)) {
        showToast("Select a valid category for this transaction.");
        return;
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(new Date(`${date}T12:00:00`).getTime())
    ) {
        showToast("Select a valid transaction date.");
        return;
    }

    const previousTransactions = transactions.map(
        (transaction) => ({ ...transaction })
    );

    if (editingTransactionId) {
        const index = transactions.findIndex(
            (transaction) => transaction.id === editingTransactionId
        );

        if (index === -1) {
            showToast("Transaction not found.");
            return;
        }

        transactions[index] = {
            ...transactions[index],
            title,
            type,
            amount: Math.round(amount * 100) / 100,
            category,
            date,
            notes,
            updatedAt: new Date().toISOString()
        };
    } else {
        transactions.push({
            id: createId(),
            title,
            type,
            amount: Math.round(amount * 100) / 100,
            category,
            date,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    if (!saveTransactions()) {
        transactions = previousTransactions;
        return;
    }

    closeTransactionDialog();

    refreshDashboard();

    showToast(
        editingTransactionId
            ? "Transaction updated successfully."
            : "Transaction added successfully."
    );
}


// ========================================
// Delete Transactions
// ========================================

function openDeleteDialog(transactionId) {
    deletingTransactionId = transactionId;

    if (!elements.deleteDialog.open) {
        elements.deleteDialog.showModal();
    }
}

function closeDeleteDialog() {
    if (elements.deleteDialog.open) {
        elements.deleteDialog.close();
    }

    deletingTransactionId = null;
}

function deleteTransaction() {
    if (!deletingTransactionId) {
        return;
    }

    const previousTransactions = transactions.map(
        (transaction) => ({ ...transaction })
    );

    transactions = transactions.filter(
        (transaction) => transaction.id !== deletingTransactionId
    );

    if (!saveTransactions()) {
        transactions = previousTransactions;
        return;
    }

    closeDeleteDialog();

    refreshDashboard();

    showToast("Transaction deleted.");
}


// ========================================
// CSV Export
// ========================================

function escapeCSV(value) {
    const text = String(value ?? "");

    return `"${text.replace(/"/g, '""')}"`;
}

function exportTransactions() {
    const data = getFilteredTransactions();

    if (data.length === 0) {
        showToast("No transactions available to export.");
        return;
    }

    const headers = [
        "Description",
        "Type",
        "Category",
        "Amount",
        "Date",
        "Notes"
    ];

    const rows = data.map((transaction) => [
        transaction.title,
        transaction.type,
        transaction.category,
        transaction.amount.toFixed(2),
        transaction.date,
        transaction.notes || ""
    ]);

    const csv = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF", csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `FinanceFlow-${elements.monthFilter.value}.csv`;

    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully.");
}


// ========================================
// Dashboard Refresh
// ========================================

function refreshDashboard() {
    populateCategoryFilter();
    updateSummary();
    renderTransactions();
    renderCharts();
}


// ========================================
// Event Listeners
// ========================================

elements.addButton.addEventListener("click", () => {
    openTransactionDialog();
});

elements.closeDialogButton.addEventListener(
    "click",
    closeTransactionDialog
);

elements.cancelDialogButton.addEventListener(
    "click",
    closeTransactionDialog
);

elements.transactionForm.addEventListener(
    "submit",
    handleTransactionSubmit
);

elements.typeInput.addEventListener("change", () => {
    populateCategoryOptions();
});

elements.cancelDeleteButton.addEventListener(
    "click",
    closeDeleteDialog
);

elements.confirmDeleteButton.addEventListener(
    "click",
    deleteTransaction
);

elements.exportButton.addEventListener(
    "click",
    exportTransactions
);

elements.monthFilter.addEventListener("change", () => {
    refreshDashboard();
});

elements.searchInput.addEventListener("input", renderTransactions);

elements.typeFilter.addEventListener("change", renderTransactions);

elements.categoryFilter.addEventListener("change", renderTransactions);

elements.transactionDialog.addEventListener("click", (event) => {
    if (event.target === elements.transactionDialog) {
        closeTransactionDialog();
    }
});

elements.deleteDialog.addEventListener("click", (event) => {
    if (event.target === elements.deleteDialog) {
        closeDeleteDialog();
    }
});


// ========================================
// Initialization
// ========================================

function initializeDashboard() {
    elements.currentYear.textContent = String(
        new Date().getFullYear()
    );

    elements.monthFilter.value = getCurrentMonth();

    populateCategoryOptions();
    populateCategoryFilter();

    updateSummary();
    renderTransactions();

    if (typeof Chart !== "undefined") {
        renderCharts();
    } else {
        console.error(
            "Chart.js could not be loaded. Check your internet connection."
        );
    }
}

initializeDashboard();
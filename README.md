# Personal Finance Dashboard

A modern, responsive personal finance dashboard that helps users track income and expenses, monitor monthly financial activity, visualize spending patterns, and manage transactions through a clean, interactive interface.

**FinanceFlow** is built using HTML, CSS, and JavaScript, with Chart.js for data visualization and Local Storage for persistent data storage.

## Overview

Managing personal finances becomes easier when income, expenses, and spending habits are organized in one place. The Personal Finance Dashboard provides a simple way to record transactions, review monthly financial summaries, and understand where money is being spent.

The application runs directly in a web browser and stores transaction data locally, without requiring a backend server or database.

## Features

* **Financial Summary:** View income, expenses, and monthly balance at a glance.
* **Transaction Management:** Add, edit, and delete income and expense records.
* **Category Management:** Organize transactions using categories such as Food, Transport, Shopping, Salary, and Freelance.
* **Interactive Charts:** Visualize spending distribution and cash flow using Chart.js.
* **Monthly Filtering:** Review financial activity for a selected month.
* **Search Transactions:** Find transactions using the available search and filtering controls.
* **CSV Export:** Export the currently filtered transactions for use in spreadsheet applications.
* **Local Data Persistence:** Save transactions in the browser using Local Storage.
* **Responsive Interface:** Access the dashboard on desktop, tablet, and mobile screens.
* **User-Friendly Forms:** Use transaction forms to enter or update financial records.
* **Instant Updates:** Refresh summaries, transaction lists, and charts as records change.

## Tech Stack

| Technology            | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| HTML5                 | Structures the dashboard and its components          |
| CSS3                  | Provides styling, layouts, and responsive design     |
| JavaScript            | Handles application logic and transaction management |
| Chart.js              | Creates interactive financial charts                 |
| Browser Local Storage | Stores transaction data locally                      |
| Python HTTP Server    | Provides a simple local development server           |

## Project Structure

```text
Personal-Finance-Dashboard/
│
├── index.html     # Dashboard structure
├── style.css      # Styling and responsive layouts
├── script.js      # Application logic and data management
└── README.md      # Project documentation
```

## Getting Started

### Prerequisites

You need:

* A modern web browser such as Google Chrome, Microsoft Edge, or Firefox.
* Python installed if you want to use the local HTTP server.
* Git installed if you want to clone or contribute to the repository.
* An internet connection for loading Chart.js from its CDN.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Shivamtripathi78/Personal-Finance-Dashboard.git
```

**2. Navigate to the project directory**

```bash
cd Personal-Finance-Dashboard
```

**3. Start the local development server**

```bash
python -m http.server 8000
```

If your system uses the Python launcher on Windows, you can alternatively run:

```powershell
py -m http.server 8000
```

**4. Open the application**

Visit the following address in your browser:

```text
http://localhost:8000
```

The dashboard should now be available locally.

> You can also open `index.html` directly in a browser, although running a local server is the recommended approach for development.

## How to Use

### 1. View Your Financial Summary

Open the dashboard to review the financial summary for the selected month.

### 2. Add a Transaction

Use the transaction form to enter the transaction details, including its type, amount, category, date, and description where available.

### 3. Edit or Delete Transactions

Update existing records when information changes, or remove transactions that are no longer needed.

### 4. Analyze Spending

Use the charts to explore spending categories and monthly cash flow.

### 5. Filter and Search

Select a month and use the available search and filter controls to find specific transactions.

### 6. Export Transactions

Use the CSV export feature to download the currently filtered transaction records for further analysis in spreadsheet software.

### 7. Keep Your Data

Transactions are stored in browser Local Storage, allowing them to persist across page reloads in the same browser profile.

**Important:** Local Storage is browser-specific. Clearing browser data, switching browsers, or using another device may make saved transactions unavailable. The application does not currently provide cloud synchronization or automatic backups.

## Data Storage

The application uses the browser's Local Storage API to persist transaction records.

**Benefits:**

* No database installation required.
* No backend server required for data processing.
* Data remains available after refreshing the page.
* Simple setup and lightweight operation.

**Limitations:**

* Data is stored locally in the browser.
* Transactions do not automatically synchronize between devices.
* Clearing the browser's stored site data can erase saved transactions.
* Local Storage is not an encrypted financial database.

Avoid storing sensitive banking credentials, account passwords, or other confidential financial information in the application.

## Application Architecture

The project follows a simple frontend architecture:

1. **Presentation Layer:** HTML defines the dashboard, transaction table, forms, and chart containers.
2. **Styling Layer:** CSS controls the visual design, layout, and responsiveness.
3. **Application Layer:** JavaScript manages transaction operations, filtering, summaries, and exports.
4. **Visualization Layer:** Chart.js renders financial charts.
5. **Storage Layer:** Local Storage persists transaction data in the browser.

This structure keeps the application lightweight and easy to understand, maintain, and extend.

## Future Enhancements

Potential improvements include:

* User authentication and individual financial profiles.
* Backend integration with a database.
* Cloud synchronization and secure data backup.
* Monthly and yearly financial reports.
* Custom spending limits and budget tracking.
* Budget-versus-actual comparisons.
* Recurring income and expense management.
* Savings goals and progress tracking.
* Advanced charts and financial insights.
* Importing transactions from CSV files.
* Dark mode and additional customization options.
* Automated expense categorization.

These are potential future improvements and are not necessarily implemented in the current version.

## Learning Outcomes

Developing this project provides practical experience with:

* Building responsive interfaces using HTML and CSS.
* Manipulating the DOM with JavaScript.
* Handling form submissions and user input.
* Implementing create, read, update, and delete (CRUD) operations.
* Persisting data using browser Local Storage.
* Creating charts with an external JavaScript library.
* Filtering, searching, and exporting structured data.
* Organizing a frontend project into separate files.
* Using Git and GitHub for version control and project documentation.

## Contributing

Contributions and suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the application in a browser.
5. Commit your changes.
6. Open a pull request describing your improvements.

## Disclaimer

This project is intended for educational and personal expense-tracking purposes. It is not a banking application, financial advisory service, or replacement for professional financial software.

## Author

**Shivam Tripathi**

GitHub: [@Shivamtripathi78](https://github.com/Shivamtripathi78)

## License

This project is open for learning and personal use. If you intend to distribute or reuse it publicly, consider adding a formal license, such as the MIT License.

document.addEventListener('DOMContentLoaded', function() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const addQuoteButton = document.getElementById('addQuoteBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const importFileInput = document.getElementById('importFile');
    const exportButton = document.getElementById('exportBtn');

    let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function showRandomQuote() {
        const filteredQuotes = quotes.filter(quote => {
            const selectedCategory = categoryFilter.value;
            return selectedCategory === 'all' || quote.category === selectedCategory;
        });

        if (filteredQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const randomQuote = filteredQuotes[randomIndex];
            quoteDisplay.textContent = randomQuote.text;
        } else {
            quoteDisplay.textContent = 'No quotes available for this category.';
        }
    }

    function addQuote() {
        const quoteText = document.getElementById('newQuoteText').value.trim();
        const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (quoteText && quoteCategory) {
            const newQuote = { text: quoteText, category: quoteCategory };
            quotes.push(newQuote);
            saveQuotes();
            populateCategoryFilter();
            showRandomQuote();
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';
        } else {
            alert('Please enter both a quote and a category.');
        }
    }

    function populateCategoryFilter() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function filterQuotes() {
        showRandomQuote();
    }

    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategoryFilter();
            alert('Quotes imported successfully!');
        };
        fileReader.readAsText(event.target.files[0]);
    }

    function exportToJsonFile() {
        const blob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    newQuoteButton.addEventListener('click', showRandomQuote);
    addQuoteButton.addEventListener('click', addQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);

    populateCategoryFilter();
    showRandomQuote();
});

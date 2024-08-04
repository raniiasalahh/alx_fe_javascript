document.addEventListener('DOMContentLoaded', () => {
  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: 'The best way to predict the future is to invent it.', category: 'Inspiration' },
    { text: 'Life is 10% what happens to us and 90% how we react to it.', category: 'Motivation' },
    { text: 'The only way to do great work is to love what you do.', category: 'Work' },
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const addQuoteButton = document.getElementById('addQuote');
  const categoryFilter = document.getElementById('categoryFilter');
  const exportQuotesButton = document.getElementById('exportQuotes');
  const importFileInput = document.getElementById('importFile');

  function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = 'No quotes available for the selected category.';
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `${randomQuote.text} - ${randomQuote.category}`;
  }

  function createAddQuoteForm() {
    addQuoteButton.addEventListener('click', addQuote);
  }

  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      alert('Quote added successfully!');
      syncQuotesWithServer();
    } else {
      alert('Please enter both quote text and category.');
    }
  }

  function populateCategories() {
    const categories = Array.from(new Set(quotes.map(quote => quote.category)));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
    // Restore the last selected filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
  }

  function getFilteredQuotes() {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === 'all') {
      return quotes;
    }
    return quotes.filter(quote => quote.category === selectedCategory);
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', selectedCategory);
    showRandomQuote();
  }

  function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "quotes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  }

  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  }

  async function fetchQuotesFromServer() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const serverQuotes = await response.json();

      // Assuming serverQuotes is an array of objects with a 'text' property and using 'Server' as a category
      const serverData = serverQuotes.map(post => ({ text: post.title, category: 'Server' }));

      return serverData;
    } catch (error) {
      console.error('Error fetching quotes from server:', error);
      return [];
    }
  }

  async function syncQuotesWithServer() {
    try {
      // Fetching server quotes
      const serverQuotes = await fetchQuotesFromServer();

      // Conflict resolution: server data takes precedence
      const mergedQuotes = [...serverQuotes, ...quotes];
      quotes = Array.from(new Set(mergedQuotes.map(q => JSON.stringify(q)))).map(q => JSON.parse(q));

      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      alert('Quotes synced with server successfully!');
    } catch (error) {
      console.error('Error syncing with server:', error);
    }
  }

  // Initial setup
  newQuoteButton.addEventListener('click', showRandomQuote);
  createAddQuoteForm();
  exportQuotesButton.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', filterQuotes);
  populateCategories();
  filterQuotes();  // To display an initial quote based on the default category

  // Sync with server periodically
  setInterval(syncQuotesWithServer, 60000);  // Sync every minute
});

document.addEventListener('DOMContentLoaded', () => {
  let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const addQuoteButton = document.getElementById('addQuote');
  const categoryFilter = document.getElementById('categoryFilter');
  const exportQuotesButton = document.getElementById('exportQuotes');
  const importFileInput = document.getElementById('importFile');

  async function fetchQuotesFromServer() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const serverQuotes = await response.json();
      
      // Transform server data to match our format
      return serverQuotes.map(post => ({ text: post.title, category: 'Server' }));
    } catch (error) {
      console.error('Error fetching quotes from server:', error);
      return [];
    }
  }

  async function postQuotesToServer() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotes),
      });

      if (response.ok) {
        const serverResponse = await response.json();
        console.log('Data posted successfully:', serverResponse);
        showNotification('Quotes posted to server successfully!');
      } else {
        console.error('Error posting quotes to server:', response.statusText);
        showNotification('Failed to post quotes to server.');
      }
    } catch (error) {
      console.error('Error posting quotes to server:', error);
      showNotification('Failed to post quotes to server.');
    }
  }

  async function syncQuotesWithServer() {
    try {
      const serverQuotes = await fetchQuotesFromServer();
      const combinedQuotes = [...serverQuotes, ...quotes];
      quotes = Array.from(new Set(combinedQuotes.map(q => JSON.stringify(q)))).map(q => JSON.parse(q));
      
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      showNotification('Quotes synced with server successfully!');
    } catch (error) {
      console.error('Error syncing with server:', error);
    }
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = 'lightgreen';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

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
      showNotification('Quote added successfully!');
      postQuotesToServer(); // Post the updated quotes to the server
    } else {
      showNotification('Please enter both quote text and category.');
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
      showNotification('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // Event listeners
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

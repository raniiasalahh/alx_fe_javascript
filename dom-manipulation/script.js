document.addEventListener('DOMContentLoaded', () => {
  // Array of quote objects
  const quotes = [
    { text: 'The best way to predict the future is to invent it.', category: 'Inspiration' },
    { text: 'Life is 10% what happens to us and 90% how we react to it.', category: 'Motivation' },
    { text: 'The only way to do great work is to love what you do.', category: 'Work' },
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const addQuoteButton = document.getElementById('addQuote');

  // Function to show a random quote
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.textContent = `${randomQuote.text} - ${randomQuote.category}`;
  }

  // Function to add a new quote
  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      alert('Quote added successfully!');
    } else {
      alert('Please enter both quote text and category.');
    }
  }

  // Event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  addQuoteButton.addEventListener('click', addQuote);

  // Initial quote display
  showRandomQuote();
});

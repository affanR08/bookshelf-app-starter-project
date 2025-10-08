// Do your work here...
console.log('Hello, world!');
/**
 * [
 *    {
 *      id: <int>
 *      task: <string>
 *      timestamp: <string>
 *      isComplete: <boolean>
 *    }
 * ]
 */
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEYS = 'BOOK_APPS';

function generateId() {
  return +new Date();
}


function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
} 


/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEYS, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT)); 
  }
}


function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEYS);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeBook(bookObject) {
  const {id, title, author, year, isComplete} = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;
  textTitle.setAttribute('data-testid',`bookItemTitle`)
  textTitle.setAttribute('id', 'bookItemTitle')

  const textAuthor = document.createElement('p');
  textAuthor.innerText = author;
  textAuthor.setAttribute('data-testid',`bookItemAuthor`)

  const years = document.createElement('p');
  years.innerText = year;
  years.setAttribute('data-testid',`bookItemYear`)

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, years);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow')
  container.append(textContainer);
  container.setAttribute('data-bookid', `book-${id}`);
  container.setAttribute('data-testid', `bookItem`);

  if (isComplete) {

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(id);
    });
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.setAttribute('data-testid', 'bookItemUndoButton');
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    checkButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.addEventListener('click', function () {
    editBook(id);
    });
    container.append(editButton, checkButton);
  }

  return container;
}

function addBook() {

  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = Number(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function editBook(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return alert("Buku tidak ditemukan");

  const newTitle = prompt("Edit Judul Buku", bookTarget.title);
  const newAuthor = prompt("Edit Nama Author", bookTarget.author);
  const newYear = prompt("Edit Tahun Terbit", bookTarget.year);

  if (newTitle !== null && newAuthor !== null && newYear !== null) {
    bookTarget.title = newTitle;
    bookTarget.author = newAuthor;
    bookTarget.year = newYear;
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  } else {
    alert("Edit dibatalkan, data tidak tersimpan");
  }
}

function addBookToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId /* HTMLELement */) {

  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm /* HTMLFormElement */ = document.getElementById('bookForm');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookList');
  const listCompleted = document.getElementById('completeBookList');

  // clearing list item
  uncompletedBookList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEYS));
  
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
});
function search(event) {
  event.preventDefault();
  const searchInput = document.querySelector('#searchBookTitle');
  const query = searchInput.value.toLowerCase();
  const uncompletedBookList = document.getElementById('incompleteBookList');
  const listCompleted = document.getElementById('completeBookList');
  uncompletedBookList.innerHTML = '';
  listCompleted.innerHTML = '';

  const filteredBooks = query 
    ? books.filter(book => book.title && book.title.toLowerCase().includes(query))
    : books;

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
}

    ( () => {
       
 window.addEventListener("load", (function() {
        e = JSON.parse(localStorage.getItem("BOOK_APPS")) || [],
        makeBook(e);
        const d = document.querySelector("#searchBook");
        d.addEventListener("submit", search)
 }
    ))
    }
  )();
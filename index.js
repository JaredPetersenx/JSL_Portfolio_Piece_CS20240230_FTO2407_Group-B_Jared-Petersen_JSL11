import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from "../utils/taskFunction.js";
import { initialData } from "../initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
    headerBoardName: document.getElementById("header-board-name"),
    columnDivs: document.querySelectorAll(".column-div"),
    editTaskModal: document.querySelector(".edit-task-modal-window"),
    filterDiv: document.getElementById("filterDiv"),
    hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
    showSideBarBtn: document.getElementById("show-side-bar-btn"),
    themeSwitch: document.getElementById("switch"),
    createNewTaskBtn: document.getElementById("add-new-task-btn"),
    modalWindow: document.getElementById("new-task-modal-window"),
  };

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0];  // changed semi-colon to colon
    elements.headerBoardName.textContent = activeBoard; // added a semi-colon
    styleActiveBoard(activeBoard); // added a semi-colon
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", ()  =>{ 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // added a semi-colon
      styleActiveBoard(activeBoard); // added a semi-colon
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task)=> task.board === boardName); // should be a strict equality operater instead of an equal to 

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter((task) => task.status === status).forEach((task) => {  // should be a strict equality operater instead of an equal to 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => {  // added a method in the form of an eventListener
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').foreach((btn) => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') // added classlist
    }
    else {
      btn.classList.remove('active');  // added classlist 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // changed => to a colon
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: document.getElementById("title-input").value,
      description: document.getElementById("desc-input").value,
      status: document.getElementById("select-status").value,
      board: activeBoard, // Use the currently active board
      };
    const newTask = createNewTask(task);

    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div");
  const showButton = document.getElementById("show-side-bar-btn");
  const hideButton = document.getElementById("hide-side-bar-btn");

  if (show) {
    sidebar.style.display = "block"; // Show the sidebar
    showButton.style.display = "none"; // Hide the show button
    hideButton.style.display = "block"; // Show the hide button
  } else {
    sidebar.style.display = "none"; // Hide the sidebar
    showButton.style.display = "block"; // Show the show button
    hideButton.style.display = "none"; // Hide the hide button
  }
}

function toggleTheme() {
  const body = document.body; // fetches the body element
  const logo = document.getElementById("logo"); // fetches the logo element
  const isDarkTheme = elements.themeSwitch.checked; // Review the state of the theme switch

  if (!isDarkTheme) {
    body.classList.add("dark-theme"); // Add dark theme class
    body.classList.remove("light-theme"); // Remove light theme class
    logo.src = "./assets/logo-dark.svg"; // Set logo for dark theme
    localStorage.setItem("theme", "dark"); // Save theme preference to local storage
  } else {
    body.classList.add("light-theme"); // Add light theme class
    body.classList.remove("dark-theme"); // Remove dark theme class
    logo.src = "./assets/logo-light.svg"; // Set logo for light theme
    localStorage.setItem("theme", "light"); // Save theme preference to local storage
  }
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;
  

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");


  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = () => saveTaskChanges(task.id);

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI(); // Refresh tasks after deletion
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: document.getElementById("edit-task-title-input").value,
    description: document.getElementById("edit-task-desc-input").value,
    status: document.getElementById("edit-select-status").value,
    board: activeBoard, // Ensure it stays in the same board
  };
  

  // Create an object with the updated task details
  
  // Update task using a hlper functoin
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  if (showSidebar === true) {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-up.svg";
  } else {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-down.svg";
  }
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = isLightTheme
      ? "./assets/logo-light.svg"
      : "./assets/logo-dark.svg";
  }
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

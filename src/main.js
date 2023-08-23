// Importo la funcion del servidor
import { getTasksApi } from "../api/api.js";
import { saveTaskApi } from "../api/api.js";
import { deleteTaskApi } from "../api/api.js";
import { updateTaskApi } from "../api/api.js";
import { getTaskApi } from "../api/api.js";

// Defino los elementos del HTML (DOM)
const addButton = document.querySelector("#add-button");
const titleInput = document.querySelector("#title-input");
const descriptionInput = document.querySelector("#description-input");
const todoListElement = document.querySelector("#todo-list");

// Defino las varibles globales
const lineThrough = "line-through";
const check = "fa-check-circle";
const uncheck = "fa-circle";

// Llamar a la funcion de cargar JSON
loadTasksFromJson(await getTasksApi());

// Defino los listeners
addButton.addEventListener("click", () => {
  // Manejo el click del boton agregar
  let title = titleInput.value;
  let description = descriptionInput.value;

  addTodoTask(title, description);
});

//agregar con enter
document.addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    let title = titleInput.value;
    let description = descriptionInput.value;

    addTodoTask(title, description);
  }
});

// Crear tarea: Los usuarios PODRÁN agregar nuevas tareas a la lista, proporcionando un título y una descripción
function addTodoTask(title, description) {
  if (title === "") {
    alert("Please, complete the title");
    return;
  }
  // Crear el objeto tarea
  let task = createObject(getRandomInt(), title, description, 0);

  //guardo la tarea en APi
  saveTaskApi(task);
  // Mostrar el elemento en pantalla
  showTask(task, todoListElement);
  // limpiar los inputs
  cleanInputs();
}

function showTask(task, listElement) {
    const doneClass = task.status === 0 ? uncheck : check
    const lineClass = task.status === 0 ? '' : lineThrough
  //let itemElement = `<li data="realizado" id="${id}">${task.title} - ${task.description}</li>`
  let itemElement = `
        <li id="item">
            <i class="far ${doneClass}" data="done" id="${task.id}"></i>
            <p class="text ${lineClass}">${task.title} - ${task.description}</p>
            <div class="icons">
                <i class="fa fa-pen" data="edit" id="${task.id}"></i> 
                <i class="fas fa-trash de" data="delete" id="${task.id}"></i> 
            </div>
        </li>
    `;

  listElement.insertAdjacentHTML("beforeend", itemElement);
}

// Status 0 = TODO, 1 = DONE
function createObject(id, title, description, status) {
  let taskObject = {
    id: id,
    title: title,
    description: description,
    status: status,
  };
  // Devuelvo el objeto
  return taskObject;
}

// random para el ID
function getRandomInt() {
  return Math.floor(Math.random() * 1000);
}

function cleanInputs() {
  titleInput.value = "";
  descriptionInput.value = "";
}

// Manejo del click en los elementos de la lista
todoListElement.addEventListener("click", function (event) {
  const element = event.target;
  const elementData = element.attributes.data.value;
  if (elementData === "done") {
    completeTask(element, element.id);
  } else if (elementData === "delete") {
    deleteTask(element, element.id);
  } else if (elementData === "edit") {
    editTask(element, element.id);
  } else if (elementData === "save") {
    saveEditTask(element, element.id);
  }
});

async function saveEditTask(element, taskId) {
  let newTitle = document.querySelector("#edit-title-input").value;
  if (newTitle === "") {
    alert("Please  complete with a new title");
    return;
  }
  let newDescription = document.querySelector("#edit-description-input").value;
  //modifico los valores en la tarea
  let task = await getTaskApi(taskId);
  task.title = newTitle;
  task.description = newDescription;

  //guardo tarea modificada en APi
  updateTaskApi(task);
  // reemplaza la tarea editada
  replaceTask(element, newTitle, newDescription);
  // elimina el formulario de editar
  removeForm(element);
}

function removeForm(element) {
  element.parentNode.parentNode.removeChild(element.parentNode);
}
//funcion para cambiar el titulo
function replaceTask(element, newTitle, newDescription) {
  let textElement =
    element.parentNode.parentNode.parentNode.querySelector(".text");
  textElement.innerText = `${newTitle} - ${newDescription}`;
}

// tarea  completada
async function completeTask(element, taskId) {
  let task = await getTaskApi(element.id);

  element.parentNode.querySelector(".text").classList.toggle(lineThrough);
  element.classList.toggle(check);
  element.classList.toggle(uncheck);
  if (task.status === 0) {
    task.status = 1;
  } else {
    task.status = 0;
  }
  updateTaskApi(task);
}

//eliminar tarea
function deleteTask(element, taskId) {
  deleteTaskApi(taskId);
  element.parentNode.parentNode.parentNode.removeChild(
    element.parentNode.parentNode
  );
}

// editar tarea
async function editTask(element, taskId) {
  let task = await getTaskApi(element.id);
  let editTaskElement = `<div class= "edit-task">
                <input type="text" id="edit-title-input" placeholder="Title" value="${task.title}"></input>
                <input type="text" id="edit-description-input" placeholder="Description" value="${task.description}"></input>
                <i id="${taskId}" data= "save" class="fas fa-thumbs-up"></i>
            </div> 
    `;

  element.parentNode.insertAdjacentHTML("beforeend", editTaskElement);
}

// Funcion para cargar las tareas desde el JSON
function loadTasksFromJson(tasksJSON) {
  for (let taskJSON of tasksJSON) {
    let task = createObject(
      taskJSON.id,
      taskJSON.title,
      taskJSON.description,
      taskJSON.status
    );
    showTask(task, todoListElement);
  }
}

// Importo la funcion del servidor
import { getTasks } from "../api/api.js";

// Defino los elementos del HTML (DOM)
const addButton = document.querySelector("#add-button");
const titleInput = document.querySelector("#title-input");
const descriptionInput = document.querySelector("#description-input");
const todoListElement = document.querySelector("#todo-list");

// Defino las varibles globales
let id = 0;
let tasks = [];
const lineThrough = "line-through";
const check = "fa-check-circle";
const uncheck = "fa-circle";

// Llamar a la funcion de cargar JSON
loadTasksFromJson(await getTasks())

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
  let task = createObject(title, description, 0);
  // Guardo el objeto en la lista
  tasks.push(task);
  // Mostrar el elemento en pantalla
  showTask(task, todoListElement);
  // limpiar los inputs
  cleanInputs();
}

function showTask(task, listElement) {
  //let itemElement = `<li data="realizado" id="${id}">${task.title} - ${task.description}</li>`
  let itemElement = `
        <li id="item">
            <i class="far fa-circle" data="done" id="${task.id}"></i>
            <p class="text ">${task.title} - ${task.description}</p>
            <div class="icons">
                <i class="fa fa-pen" data="edit" id="${task.id}"></i> 
                <i class="fas fa-trash de" data="delete" id="${task.id}"></i> 
            </div>
        </li>
    `;
  listElement.insertAdjacentHTML("beforeend", itemElement);
}

// Status 0 = TODO, 1 = DONE
function createObject(title, description, status) {
  let taskObject = {
    id: id,
    title: title,
    description: description,
    status: status,
  };
  // Incremento el ID
  id++;
  // Devuelvo el objeto
  return taskObject;
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
    let task = tasks[element.id];
    editTask(element, element.id, task.title, task.description);
  } else if (elementData === "save") {
    let newTitle = document.querySelector("#edit-title-input").value;
    if (newTitle === "") {
        alert("Please  complete with a new title");
        return;
      }
    let newDescription = document.querySelector(
      "#edit-description-input"
    ).value;
    //modifico los valores en la tarea
    let task = tasks[element.id];
    task.title =newTitle
    task.description = newDescription

   
    // reemplaza la tarea editada
    replaceTask (element,newTitle,newDescription)
   // elimina el formulario de editar
   removeForm (element)
  }
});

function removeForm (element){
    element.parentNode.parentNode.removeChild(
        element.parentNode
      );

}
//funcion para cambiar el titulo
function replaceTask(element,newTitle,newDescription){
    let textElement = element.parentNode.parentNode.parentNode.querySelector (".text")
    textElement.innerText= `${newTitle} - ${newDescription}`
    
}


// tarea  completada
function completeTask(element, taskId) {
  element.parentNode.querySelector(".text").classList.toggle(lineThrough);
  element.classList.toggle(check);
  element.classList.toggle(uncheck);
  if (tasks[taskId].status === 0) {
    tasks[taskId].status = 1;
  } else {
    tasks[taskId].status = 0;
  }

  console.log(tasks);
}

//eliminar tarea
function deleteTask(element, taskId) {
  element.parentNode.parentNode.parentNode.removeChild(
    element.parentNode.parentNode
  );
  tasks.splice(taskId, 1);
}

// editar tarea
function editTask(element, taskId, title, description) {
  let editTaskElement = `<div class= "edit-task">
                <input type="text" id="edit-title-input" placeholder="Title" value="${title}"></input>
                <input type="text" id="edit-description-input" placeholder="Description" value="${description}"></input>
                <i id="${taskId}" data= "save" class="fas fa-thumbs-up"></i>
            </div> 
    `;
    
        
  element.parentNode.insertAdjacentHTML("beforeend", editTaskElement);
}


// Funcion para cargar las tareas desde el JSON
function loadTasksFromJson(tasksJSON){
    for (let task of tasksJSON){
        addTodoTask(task.title, task.description)
    }
}
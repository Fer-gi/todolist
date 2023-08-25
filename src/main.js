// Importo la funcion del servidor
import { getTasksApi } from "../api/api.js";
import { saveTaskApi } from "../api/api.js";
import { deleteTaskApi } from "../api/api.js";
import { updateTaskApi } from "../api/api.js";
import { getTaskApi } from "../api/api.js";

//------------------------------------------------------ Defino los elementos del HTML (DOM)--------------------------------------------------------
const addButton = document.querySelector("#add-button");
const titleInput = document.querySelector("#title-input");
const descriptionInput = document.querySelector("#description-input");
const todoListElement = document.querySelector("#todo-list");
const filterButton = document.querySelector("#filter-button");

// -----------------------------------------------------Defino las varibles globales----------------------------------------------------------------
const lineThrough = "line-through";
const check = "fa-check-circle";
const uncheck = "fa-circle";

//----------------------------------------------------define fecha--------------------------
const date = document.querySelector("#date");
const today = new Date();
date.innerHTML = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

// -----------------------------------------------------Llamar a la funcion de cargar JSON (GET de todas las tareas)-----------------------------------------------------------
loadTasksFromJson(await getTasksApi());
// -----------------------------------------------------Defino los listeners--------------------------------------------------------------------------
addButton.addEventListener("click", () => {
  // Manejo el click del boton agregar
  let title = titleInput.value;
  let description = descriptionInput.value;

  addTodoTask(title, description);
});

filterButton.addEventListener("click", async () => {
  //Limpio la lista actual
  var first = todoListElement.firstElementChild;
  while (first) {
    first.remove();
    first = todoListElement.firstElementChild;
  }
  // Llamo al API y ordeno la lista
  orderTasksByStatus(await getTasksApi());
});

//agregar una tarea presionando enter
document.addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    let title = titleInput.value;
    let description = descriptionInput.value;

    addTodoTask(title, description);
  }
});
//-------------------------------------------------------TAREAS------------------------------------------------------------------------------------

//------ Crear tarea: Los usuarios PODRÁN agregar nuevas tareas a la lista, proporcionando un título y una descripción
function addTodoTask(title, description) {
  if (title === "") {
    alert("Please, complete the title");
    return;
  }

  // -----llamar el objeto tarea y la guardo en task
  let task = createObject(getRandomInt(), title, description, 0);

  //------guardo la tarea en APi
  saveTaskApi(task);

  //-----Mostrar la tarea en pantalla
  showTask(task, todoListElement);

  //----- llamada para limpiar los inputs para poder cargar otra task (borra el contenido)
  cleanInputs();
}

//----- funcion que crea el elemento html de la tarea (li)
function showTask(task, listElement) {
  const doneClass = task.status === 0 ? uncheck : check;
  const lineClass = task.status === 0 ? "" : lineThrough;
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

//------------ Crea el objeto tarea y define su Status 0 = TODO, 1 = DONE
function createObject(id, title, description, status) {
  let taskObject = {
    id: id,
    title: title,
    description: description,
    status: status,
  };
  //------------- Devuelvo el objeto
  return taskObject;
}

// random para el ID
function getRandomInt() {
  return Math.floor(Math.random() * 1000);
}
//--------------------funcion pata limpiar los imputs
function cleanInputs() {
  titleInput.value = "";
  descriptionInput.value = "";
}

// Manejo del click en los elementos de la lista (para saber que elemento (icono/boton) es llamado)
todoListElement.addEventListener("click", function (event) {
  const element = event.target; //para saber que icono clickeo
  const elementData = element.attributes.data.value; // es el valor data del icono
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

//------------------guarda una tarea editada en el Json------------------
async function saveEditTask(element, taskId) {
  let newTitle = document.querySelector("#edit-title-input").value;
  if (newTitle === "") {
    alert("Please  complete with a new title");
    return;
  }
  let newDescription = document.querySelector("#edit-description-input").value; //camnia el texto de la tarea original por la nueva

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
//--------------------------------funcion para cambiar el titulo
function replaceTask(element, newTitle, newDescription) {
  let textElement =
    element.parentNode.parentNode.parentNode.querySelector(".text");
  textElement.innerText = `${newTitle} - ${newDescription}`;
}

// -------------------------tarea  completada (al dar check)
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

//-------------------------------eliminar tarea (hace el delete en api y html)
function deleteTask(element, taskId) {
  deleteTaskApi(taskId); //api
  element.parentNode.parentNode.parentNode.removeChild(
    //HTML
    element.parentNode.parentNode
  );
}

// -------------------------------editar tarea (Abre el formulario para editar tarea)
async function editTask(element, taskId) {
  let task = await getTaskApi(element.id);
  let editTaskElement = `<div class= "edit-task">
                <input type="text" id="edit-title-input" placeholder="Title" value="${task.title}"></input>
                <input type="text" id="edit-description-input" placeholder="Description" value="${task.description}"></input>
                <i id="${taskId}" data= "save" class="fas fa-thumbs-up"></i>
            </div> 
    `;

  element.parentNode.insertAdjacentHTML("beforeend", editTaskElement); // transforma en html y lo inserta en el elemento indicado
}

// ------------------------Funcion para cargar las tareas desde el JSON
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

// Coloco las tareas del JSON de manera ordenada, 1ro por TODO y 2do por DONE
function orderTasksByStatus(tasksJSON) {
  //Separo las tareas en dos arrays correpondientes
  //Para TODO
  let todoTasks = [];
  //Para DONE
  let doneTasks = [];

  for (let taskJSON of tasksJSON) {  //recorro el json de tarea y creo objetos
    let task = createObject(
      taskJSON.id,
      taskJSON.title,
      taskJSON.description,
      taskJSON.status
    );
    // Separo en los arrays segun su status
    if (task.status === 0) {
      todoTasks.push(task);
    } else {
      doneTasks.push(task);
    }
  }
  // Recorro cada array y muestro las tareas en pantalla
  //1ro las TODO
  for (let todoTask of todoTasks) {
    showTask(todoTask, todoListElement);
  }
  // 2do las DONE
  for (let doneTask of doneTasks) {
    showTask(doneTask, todoListElement);
  }
}

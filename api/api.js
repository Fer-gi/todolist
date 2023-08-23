export async function getTasksApi(){
    let result= await fetch ("http://localhost:3000/tasks");
    let data = await result.json ();
    return data
}

export async function getTaskApi(taskId){
    let result= await fetch ("http://localhost:3000/tasks/"+ taskId);
    let data = await result.json ();
    return data
}

export async function  saveTaskApi (task){
    await fetch("http://localhost:3000/tasks", {
        method: 'POST', 
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(task), //stringify es para convertir el objeto en texto
      })
}

export async function deleteTaskApi (taskId){
    await fetch("http://localhost:3000/tasks/" + taskId, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json' }
      })
}
export async function updateTaskApi (task){
    await fetch("http://localhost:3000/tasks/" + task.id, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(task), //stringify es para convertir el objeto en texto
      })
}
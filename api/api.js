export async function getTasks(){
    let result= await fetch ("http://localhost:3000/tasks");
    let data = await result.json ();
    return data
}
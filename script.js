const doc = document;
const byId = id => doc.getElementById(id);

doc.addEventListener('DOMContentLoaded', function() {
  const form = byId('form');

  getTasksFromLS();

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    createTask();
    refreshTaskBoard();
  });
});

/* functions */
function createTask() {
  const taskName = form.elements[0].value;
  const taskDate = form.elements[1].value;
  const taskDescr = form.elements[2].value;
  const task = new Task(taskName, taskDate, taskDescr);

  LS.save(task.id, task);
}

function getTasksFromLS() {
  Object.values(LS.getAll()).forEach(taskData => {
    const task = document.createElement('li');
    task.innerHTML = taskTemplate(JSON.parse(taskData));
    byId('list').appendChild(task);
  });
}

function refreshTaskBoard() {
  byId('list').innerHTML = '';
  getTasksFromLS();
}

function liveTaskDelete(id) {
  LS.remove(id);
  refreshTaskBoard();
}

function liveStatusChange(id, statusCode) {
  let task = LS.get(id);
  if (task.statusCode === statusCode) return;
  task.statusCode = statusCode;
  LS.save(id, task);
  refreshTaskBoard();
}

function liveEditTask(id) {
  showEditForm();
  let task = LS.get(id);
}

function showEditForm() {
  doc.body.classList.add('editing-mode');
  // TODO: add event listener to edit form background (for close and cancel changes)
}

function taskTemplate({ statusCode = 0, id, name, date, descr, wasEdited }) {
  const status = (() => {
    switch (statusCode) {
      case 0:
        return 'pending';
      case 1:
        return 'in-progress';
      case 2:
        return 'done';
    }
  })();

  const editBtnTemplate = `<button onclick="liveEditTask(${id})" id="btn-edit-task" class="btn btn_primary task__btn task__btn-edit"></button>`;
  const editedMark = `<span class="task__was-edited">edited</span>`;

  return `
  <li class="task task_${status}">
    <header class="task__header">
      <div class="task__info">
        <span class="task__name">${name}</span>
        <span class="task__date">${date}</span>
        <div class="task__status">
          <span class="status__current">${status}</span>
          <ul class="status__dropdown">
            <li onclick="liveStatusChange(${id},${0})" class="status__option">pending</li>
            <li onclick="liveStatusChange(${id},${1})" class="status__option">in progress</li>
            <li onclick="liveStatusChange(${id},${2})" class="status__option">done</li>
          </ul>
        </div>
      </div>
      ${wasEdited ? editedMark : ''}
      <div class="task__controls">
        ${statusCode < 2 ? editBtnTemplate : ''}
        <button id="btn-delete-task" onclick="liveTaskDelete(${id})" class="btn btn_danger task__btn task__btn-delete"></button>
      </div>
    </header>
    <div class="task__content">
      ${descr}
    </div>
  </li>
  `;
}

/* constructors */
class Task {
  constructor(name, date, descr) {
    // this.created = new Date(date);
    this.created = Date.now();
    this.date = date;
    this.name = name;
    this.descr = descr;
    this.statusCode = 0;
    this.editable = true;
    this.wasEdited = false;
    this.id = Date.now();
  }
}

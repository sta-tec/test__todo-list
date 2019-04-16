const doc = document;
const byId = id => doc.getElementById(id);

const TDL = new class {
  constructor() {
    this.LIST = Object.values(LS.getAll());
  }

  saveList() {
    LS.clear();
    this.LIST.map(item => LS.set(item.id, item));
  }
  getTaskMap() {
    return this.LIST.map(item => item.id);
  }
  getTask(id) {
    const index = this.getTaskMap().indexOf(id);
    return this.LIST[index];
  }
  addTask(item) {
    this.LIST.push(item);
    this.saveList();
  }
  getList() {
    return this.LIST;
  }
  update(elm) {
    const index = this.getTaskMap().indexOf(elm.id);
    this.LIST.splice(index, 1, elm);
    this.saveList();
  }
  remove(id) {
    const index = this.getTaskMap().indexOf(id);
    this.LIST.splice(index, 1);
    this.saveList();
  }
  sortBy(param) {
    switch (param) {
      case 'name':
        this.LIST.sort(compareByName);
        break;
      case 'date':
        this.LIST.sort(compareByDate);
        break;
    }
    this.saveList();

    function compareByName(x, y) {
      x = x.name.toLowerCase()[0];
      y = y.name.toLowerCase()[0];
      return x > y ? 1 : -1;
    }
    function compareByDate(x, y) {
      return x.id - y.id;
    }
  }
  statusChange(id, statusCode) {
    const task = this.getTask(id);
    if (task.statusCode === statusCode) return;
    task.statusCode = statusCode;
    this.saveList();
  }
}();

doc.addEventListener('DOMContentLoaded', onLoad);

/* functions */
function onLoad() {
  renderList();
  byId('form-submit').addEventListener('click', formSubmit());
  byId('sort-by-name').addEventListener('click', () => liveSortBy('name'));
  byId('sort-by-date').addEventListener('click', () => liveSortBy('date'));
}

function formSubmit() {
  return function(event) {
    event.preventDefault();
    TDL.addTask(createTask());
    renderList();
    formReset('form');
  };
}

function renderList() {
  byId('list').innerHTML = '';

  TDL.getList().forEach(taskData => {
    const task = document.createElement('li');
    task.innerHTML = taskTemplate(taskData);
    byId('list').appendChild(task);
  });
}

function formReset(id) {
  byId(id).reset();
}

function liveSortBy(param) {
  TDL.sortBy(param);
  renderList();
}

function liveTaskDelete(id) {
  TDL.remove(id);
  renderList();
}

function liveStatusChange(id, statusCode) {
  TDL.statusChange(id, statusCode);
  renderList();
}

function createTask() {
  const taskName = form.elements[0].value;
  const dueDate = form.elements[1].value;
  const taskDescr = form.elements[2].value;
  return new Task(taskName, dueDate, taskDescr);
}

function showEditForm(id) {
  doc.body.classList.add('editing-mode');
  const task = TDL.getTask(id);
  // const popupBg = byId('popup-bg');
  const editForm = byId('editing-form');
  const taskNameInp = editForm.elements[0];
  const taskDueInp = editForm.elements[1];
  const taskDescrInp = editForm.elements[2];
  const cancelBtn = byId('edit-cancel');

  taskNameInp.value = task.name;
  taskDueInp.value = task.dueDate;
  taskDescrInp.value = task.descr;

  cancelBtn.addEventListener(
    'click',
    () => {
      console.log('>>>');
      doc.body.classList.remove('editing-mode');
    },
    { once: true },
  );

  editForm.addEventListener('submit', ev => {
    ev.preventDefault();
    const editedTask = {
      ...task,
      name: taskNameInp.value,
      dueDate: taskDueInp.value,
      descr: taskDescrInp.value,
    };
    TDL.update(editedTask);
    doc.body.classList.remove('editing-mode');
    renderList();
  });
}

// TODO: dueDate
function taskTemplate({
  statusCode = 0,
  id,
  name,
  dueDate,
  created,
  descr,
  wasEdited,
}) {
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

  const editBtnTemplate = `<button onclick="showEditForm(${id})" id="btn-edit-task" class="btn btn_primary task__btn task__btn-edit"></button>`;
  const editedMark = `<span class="task__was-edited">edited</span>`;

  return `
  <div class="task task_${status}">
    <header class="task__header">
      <div class="task__info">
        <span class="task__name">${name}</span>
        <span class="task__created">Created: ${created}</span>
      </div>
      ${wasEdited ? editedMark : ''}
      <div class="task__controls">
        <div class="task__status">
          <span class="status__current">${status}</span>
          <ul class="status__dropdown">
            <li onclick="liveStatusChange(${id},${0})" class="status__option">pending</li>
            <li onclick="liveStatusChange(${id},${1})" class="status__option">in progress</li>
            <li onclick="liveStatusChange(${id},${2})" class="status__option">done</li>
          </ul>
        </div>
        <div class="task__actions">
          ${statusCode < 2 ? editBtnTemplate : ''}
          <button id="btn-delete-task" onclick="liveTaskDelete(${id})" class="btn btn_danger task__btn task__btn-delete"></button>
        </div>
      </div>
    </header>
    <div class="task__content">
      ${descr}
    </div>
  </div>
  `;
}

/* constructors */
class Task {
  constructor(name, dueDate, descr) {
    this.dueDate = dueDate;
    this.created = (() => {
      const date = new Date();
      return date.toDateString();
    })();
    this.name = name;
    this.descr = descr;
    this.statusCode = 0;
    this.editable = true;
    this.wasEdited = false;
    this.id = Date.now();
  }
}

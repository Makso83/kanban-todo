const shortid = require('shortid');
const moment = require('moment');

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

class Task implements Draggable {
  title: string;
  id: string;
  status: string;
  element: HTMLLIElement;
  timestamp: string;
  timestring: string = 'just now';

  constructor(title: string) {
    this.title = title;
    this.id = shortid.generate();
    this.status = 'todo';
    this.timestamp = moment();
    this.element = document.createElement('li');
    this.configure();
  }

  private configure() {
    this.element.innerHTML =
    this.title + ' - <span class=kanban-list__timestamp>' + moment(this.timestamp).fromNow() + '</span>';

    this.element.classList.add('kanban-list__item');
    this.element.draggable = true;
    this.element.addEventListener(
      'dragstart',
      this.dragStartHandler.bind(this),
    );
    this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
  }

  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.id);
  }

  dragEndHandler(_: DragEvent) {}
}

class TaskState {
  taskList: Task[] = [];
  listeners: Function[] = [];
  private static instanse: TaskState;

  private constructor() {
    setInterval(() => {
      this.updateTimeString();
      this.updateListeners();
    }, 10000)
  }

  static getInstanse() {
    if (this.instanse) {
      return this.instanse;
    }
    return new TaskState();
  }

  private updateListeners() {
    this.listeners.map((fn) => {
      fn();
    });
  }

  addTask(newTask: Task) {
    this.taskList.push(newTask);
    this.updateListeners();
  }

  moveTask(taskId: string, newStatus: string) {
    const selectedTask = this.taskList.find((task) => task.id === taskId);
    if (selectedTask) {
      selectedTask.status = newStatus;

      this.updateListeners();
    }
  }

  updateTimeString() {
    this.taskList.forEach((task) => {
      task.element.innerHTML =
      task.title + ' - <span class=kanban-list__timestamp>' + moment(task.timestamp).fromNow() + '</span>';
    })
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }
}

const taskState = TaskState.getInstanse();

class TaskInput {
  element: HTMLFontElement;
  input: HTMLInputElement;

  constructor() {
    this.element = document.getElementById('add-form')! as HTMLFontElement;
    this.input = document.querySelector('input')! as HTMLInputElement;
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  submitHandler(evt: Event) {
    evt.preventDefault();
    let content = this.input.value;
    if (content.trim() !== '') {
      taskState.addTask(new Task(content));
      this.input.value = '';
    }
  }
}

class Desk implements DragTarget {
  element: HTMLElement;
  adjustedProjects: Task[] = [];

  constructor(elementId: string) {
    this.element = document.getElementById(elementId)! as HTMLElement;
    taskState.addListener(this.renderContent.bind(this));
    this.renderContent();
    this.configure();
  }

  dragOverHandler(event: DragEvent) {
    event.preventDefault();
    if (!this.element.classList.contains('kanban-desk--dropable')) {
      this.element.classList.add('kanban-desk--dropable');
    }
  }

  dropHandler(event: DragEvent) {
    taskState.moveTask(
      event.dataTransfer!.getData('text/plain'),
      this.element.id,
    );
    this.element.classList.remove('kanban-desk--dropable');
  }

  dragLeaveHandler() {
    this.element.classList.remove('kanban-desk--dropable');
  }

  private configure() {
    this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.element.addEventListener(
      'dragleave',
      this.dragLeaveHandler.bind(this),
    );
    this.element.addEventListener('drop', this.dropHandler.bind(this));
  }

  renderContent() {
    this.adjustedProjects = taskState.taskList.filter(
      (task) => task.status === this.element.id,
    );
    const list = this.element.querySelector('ul')! as HTMLUListElement;
    list.innerHTML = '';
    this.adjustedProjects.map((prj) => {
      list.insertAdjacentElement('beforeend', prj.element);
    });
  }
}
new TaskInput();
new Desk('todo');
new Desk('doing');
new Desk('done');

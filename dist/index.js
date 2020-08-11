"use strict";
var shortid = require('shortid');
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["DOING"] = "doing";
    TaskStatus["DONE"] = "done";
})(TaskStatus || (TaskStatus = {}));
var Task = (function () {
    function Task(title) {
        this.title = title;
        this.id = shortid.generate();
        this.status = TaskStatus.TODO;
        this.element = document.createElement('li');
        this.element.innerText = this.title;
        this.element.classList.add('kanban-list__item');
        this.element.draggable = true;
    }
    Task.prototype.dragStartHandler = function (_) {
        console.log('drag_start' + this.id);
    };
    Task.prototype.dragEndHandler = function (_) {
        console.log('drag_stop');
    };
    return Task;
}());
var TaskState = (function () {
    function TaskState() {
        this.taskList = [];
        this.listeners = [];
    }
    TaskState.getInstanse = function () {
        if (this.instanse) {
            return this.instanse;
        }
        return new TaskState();
    };
    TaskState.prototype.addTask = function (newTask) {
        this.taskList.push(newTask);
        this.listeners.map(function (fn) {
            fn();
        });
    };
    TaskState.prototype.addListener = function (listenerFn) {
        this.listeners.push(listenerFn);
    };
    return TaskState;
}());
var taskState = TaskState.getInstanse();
taskState.addTask(new Task('Помыть руки'));
var TaskInput = (function () {
    function TaskInput() {
        this.element = document.getElementById('add-form');
        this.input = document.querySelector('input');
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }
    TaskInput.prototype.submitHandler = function (evt) {
        evt.preventDefault();
        var content = this.input.value;
        if (content.trim() !== '') {
            taskState.addTask(new Task(content));
            this.input.value = '';
        }
    };
    return TaskInput;
}());
var Desk = (function () {
    function Desk(elementId) {
        this.adjustedProjects = [];
        this.element = document.getElementById(elementId);
        taskState.addListener(this.renderContent.bind(this));
        this.renderContent();
    }
    Desk.prototype.renderContent = function () {
        var _this = this;
        this.adjustedProjects = taskState.taskList.filter(function (task) { return task.status === _this.element.id; });
        var list = this.element.querySelector('ul');
        list.innerHTML = '';
        this.adjustedProjects.map(function (prj) {
            list.insertAdjacentElement('beforeend', prj.element);
        });
    };
    return Desk;
}());
new TaskInput();
new Desk('todo');
new Desk('doing');
new Desk('done');

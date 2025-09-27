/*
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Data storage
 * - planningData: JSON array describing planning events (date, duration, metadata).
 */
// This component is used to create a new planning
const planningData = {
    year: 2024, // Selected year
    holidays: ['2024-01-01', '2024-07-04', '2024-12-25'], // List of holidays
    companyHolidays: ['2024-01-01', '2024-12-25'], // Company-specific holidays
    workdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Working days
    workHours: { start: '09:00', end: '17:00' }, // Working hours

    tasks: [
        {
            id: 0,
            assignedTo: 'John Doe',
            title: 'Task 1',
            start: '2024-01-01',
            end: '2024-01-05',
            duration: 5,
            progress: 0.5,
            dependencies: [1],
            critcalPath: false,
            color: '#0d0',
        },
        {
            id: 1,
            assignedTo: 'Jennifer Smith',
            title: 'Task 2',
            start: '2024-02-15',
            end: '2024-02-23',
            duration: 9,
            progress: 0.2,
            dependencies: [],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 2,
            assignedTo: 'John Doe',
            title: 'Task 3',
            start: '2024-03-15',
            end: '2024-03-25',
            duration: 11,
            progress: 0.5,
            dependencies: [1],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 3,
            assignedTo: 'Jennifer Smith',
            title: 'Task 4',
            start: '2024-04-01',
            end: '2024-04-05',
            duration: 5,
            progress: 0.2,
            dependencies: [2],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 4,
            assignedTo: 'John Doe',
            title: 'Task 5',
            start: '2024-05-01',
            end: '2024-05-05',
            duration: 5,
            progress: 0.5,
            dependencies: [3],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 5,
            assignedTo: 'Jennifer Smith',
            title: 'Task 6',
            start: '2024-06-01',
            end: '2024-06-05',
            duration: 5,
            progress: 0.2,
            dependencies: [4],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 6,
            assignedTo: 'John Doe',
            title: 'Task 7',
            start: '2024-07-01',
            end: '2024-07-05',
            duration: 5,
            progress: 0.5,
            dependencies: [5],
            critcalPath: false,
            color: '#0d0',

        },
        {
            id: 7,
            assignedTo: 'Jennifer Smith',
            title: 'Task 8',
            start: '2024-08-01',
            end: '2024-08-05',
            duration: 5,
            progress: 0.2,
            dependencies: [6],
            critcalPath: false,
            color: '#0d0',
        }
    ]

};

function createPlanning(type) {
    console.log("createElement:" + type);
    var main = document.createElement('div');
    main.classList.add('form-container');
    main.classList.add('planning');
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;
    main.style.overflow = "auto";
    // set the with of the main div to maximum of the window and overflow to auto
    main.style.width = "1000px";
    main.style.overflow = "scroll";
    main.style.display = "block";
    main.setAttribute("planningData", JSON.stringify(planningData));
    // Render the Gantt chart first so additional elements are not removed
    gantrender(main, planningData);

    // Dialog used for editing activities
    var activityDialog = document.createElement('div');
    activityDialog.id = "activityDialog";
    activityDialog.style.display = "none";
    activityDialog.style.position = "fixed";
    main.appendChild(activityDialog);

    // Context menu container
    var contextMenu = document.createElement('div');
    contextMenu.id = 'taskContextMenu';
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'absolute';
    contextMenu.style.background = 'white';
    contextMenu.style.border = '1px solid gray';
    contextMenu.innerHTML = '<div onclick="contextEditTask()">Edit</div>' +
        '<div onclick="contextDeleteTask()">Delete</div>';
    main.appendChild(contextMenu);

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function () {
        contextMenu.style.display = 'none';
    });

    return main;
}

function editPlanning(type, element, content) {
    content.appendChild(createInputItem("planningData", "planningData", "onplanningDataclick", element.getAttribute('planningData'), "text", true));
}




function gantrender(main) {
    // keep existing overlay elements before re-rendering
    const activityDialog = main.querySelector('#activityDialog');
    const contextMenu = main.querySelector('#taskContextMenu');
    // get the planning data from the main div
    const planningData = JSON.parse(main.getAttribute("planningData"));
    rows = planningData.tasks.length + 5;
    cols = 370;
    cellWidth = 40;
    cellHeight = 40;
    colSpacing = 0;
    descLen = 5;
    var svg = `<svg id='svgmain' width="${cols * cellWidth + 5 * cellWidth * descLen}px" height="${rows * cellHeight}px" style="position: relative; font: ${main.style.font};">`;


    // create day of years data
    const days = [];
    const year = planningData.year;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    // create array of the days of the year with suturday and sunday and holidays
    for (let date = startDate; date < endDate; date.setDate(date.getDate() + 1)) {
        //console.log(date);
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        const isHoliday = planningData.holidays.includes(date.toISOString().slice(0, 10));
        const isCompanyHoliday = planningData.companyHolidays.includes(date.toISOString().slice(0, 10));
        days.push({
            date: date.toISOString().slice(0, 10),
            isWeekend,
            isHoliday,
            isCompanyHoliday,
        });
    }

    const months = [];
    for (let month = 0; month < 12; month++) {
        const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        months.push({ monthName, daysInMonth });
    }

    lastX = 0;
    lastY = 0;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, 5 * cellWidth * descLen, "", 'silver');
    lastX += 5 * cellWidth * descLen;
    for (let j = 0; j < months.length; j++) {
        const month = months[j];

        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, month.daysInMonth, month.monthName, 'silver');
        lastX += month.daysInMonth * cellWidth;
    }

    lastX = 0;
    lastY = cellHeight;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, 5 * cellWidth * descLen, "", "silver");
    lastX += 5 * cellWidth * descLen;
    weekNumber = 0;
    for (let i = 0; i < days.length; i += 7) {
        const day = days[i];
        // get the month number
        const month = new Date(day.date).getMonth();
        // get the number of days in the month
        const daysInMonth = months[month].daysInMonth;
        // get the day number in the month
        weekNumber++;

        var colspan = (i <= days.length - 7) ? 7 : days.length - i;


        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, colspan, "week " + weekNumber, "silver");
        lastX += colspan * cellWidth;
    }
    lastX = 0;
    lastY += cellHeight;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, "Task", "silver");
    lastX += cellWidth * descLen;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, "Assigned To", "silver");
    lastX += cellWidth * descLen;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, "Progress", "silver");
    lastX += cellWidth * descLen;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, "Start", "silver");
    lastX += cellWidth * descLen;
    svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, "End", "silver");
    lastX += cellWidth * descLen;
    for (let i = 0; i < days.length; i++) {
        let day = days[i];
        color = 'white';
        if (day.isWeekend) {
            color = 'red';
        } else if (day.isHoliday) {
            color = 'orange';
        } else if (day.isCompanyHoliday) {
            color = 'yellow';
        }
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, 1, day.date.slice(8, 10), color);
        lastX += cellWidth;
    }
    // draw the cells for each activity

    lastY += cellHeight;
    oldLastY = lastY;
    planningData.tasks.forEach((task) => {
        lastX = 5 * cellWidth * descLen;

        // create the cell for each activity for each resource

        for (let i = 0; i < days.length; i++) {
            let day = days[i];
            color = 'white';
            if (day.isWeekend) {
                color = 'red';
            } else if (day.isHoliday) {
                color = 'orange';
            } else if (day.isCompanyHoliday) {
                color = 'yellow';
            }
            svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, 1, "", color);

            lastX += cellWidth;

        }
        lastY += cellHeight;

    });

    lastY = oldLastY;
    planningData.tasks.forEach((task) => {
        lastX = 0;
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, task.title);
        lastX += cellWidth * descLen;
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, task.assignedTo);
        lastX += cellWidth * descLen;
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, task.progress * 100 + "%");
        lastX += cellWidth * descLen;
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, task.start);
        lastX += cellWidth * descLen;
        svg += drawCell(main, lastX, lastY, cellWidth, cellHeight, descLen, task.end);
        lastX += cellWidth * descLen;

        // create the cell for each activity for each resource

        for (let i = 0; i < days.length; i++) {
            let day = days[i];

            if (task.start === day.date) {


                svg += createRoundedBar(main, task, lastX, lastY + 5, task.duration * cellWidth, cellHeight - 10);

            }
            lastX += cellWidth;

        }
        lastY += cellHeight;


    });


    main.innerHTML = svg + "</svg>";
    // reattach overlay elements
    if (activityDialog) main.appendChild(activityDialog);
    if (contextMenu) main.appendChild(contextMenu);
}


function createRoundedBar(main, task, x, y, width, height) {
    var svg = "";
    // convert task to a JSON string safe for attributes
    var taskString = encodeURIComponent(JSON.stringify(task));
    const groupStart = `<g class="task-bar" data-task="${taskString}" data-x="${x}" data-y="${y}" transform="translate(${x},${y})" onmousedown="startTaskDrag(evt)" onmousemove="dragTask(evt)" onmouseup="endTaskDrag(evt)" onmouseleave="endTaskDrag(evt)" oncontextmenu="showTaskContextMenu(evt)" onclick="editActivity(this)">`;
    svg += groupStart;
    const rectHtml = `<rect x="0" y="0" width="${width * task.progress}" height="${height}" stroke="gray" stroke-width="1" fill="lightgreen"></rect>`;
    svg += rectHtml;
    const rect1Html = `<rect x="${width * task.progress}" y="0" width="${width - width * task.progress}" height="${height}" stroke="gray" stroke-width="1" fill="yellow"></rect>`;
    svg += rect1Html;
    const textHtml = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" >${task.progress * 100}% ${task.title}</text>`;
    svg += textHtml;
    svg += '</g>';
    return svg;
}

// draw svg cell
function drawCell(main, lastX, lastY, cellWidth, cellHeight, colspan, textContent, bgColor) {
    // check if bgcolor is not defined and set it to white
    var backgroundColor = bgColor ? bgColor : "white";
    var svg = "";
    const rectHtml = `<rect x="${lastX}px" y="${lastY}px" width="${cellWidth * colspan}px" height="${cellHeight}px" stroke="gray" stroke-width="1" fill="${backgroundColor}"></rect>`;
    svg += rectHtml;
    const textHtml = `<text x="${lastX + (colspan * cellWidth / 2)}px" y="${lastY + cellHeight / 2}px" text-anchor="middle" dominant-baseline="middle" style="font-family: ${main.style.fontFamily}; font-size: ${main.style.fontSize}; color: ${main.style.color}">${textContent}</text>`;
    svg += textHtml;
    return svg;
}

function editActivity(element) {
    // get the task data from the element
    const taskAttr = element.getAttribute("data-task") || element.getAttribute("task");
    const task = JSON.parse(decodeURIComponent(taskAttr));
    // show the activity dialog
    showActivityDialog(task);

}

function showActivityDialog(taskData) {
    // generate the activity dialog position window center with 50% width and 50% height
    const dialog = document.getElementById('activityDialog');
    dialog.style.display = 'block';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.width = '50%';
    dialog.style.height = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.innerHTML = "";
    // generate the activity dialog content
    const content = document.createElement('div');
    content.innerHTML = "";
    dialog.appendChild(content);
    // generate the activity dialog title
    const title = document.createElement('h2');
    title.innerHTML = "Activity";
    content.appendChild(title);
    // generate the activity dialog form
    const form = document.createElement('form');
    form.id = "activityDialogForm";
    form.setAttribute('onsubmit', 'return false;');
    content.appendChild(form);
    // generate all the activity dialog form fields using the task array
    taskFields.forEach(field => {
        // generate the field label
        const label = document.createElement('label');
        label.innerHTML = field.label;
        form.appendChild(label);
        // generate the field input
        const input = document.createElement('input');
        input.id = field.name;
        input.value = taskData[field.name];
        form.appendChild(input);
    });
    // generate the activity dialog buttons
    const buttons = document.createElement('div');
    buttons.className = "buttons";
    content.appendChild(buttons);
    // generate the activity dialog save button
    const saveButton = document.createElement('button');
    saveButton.innerHTML = "Save";
    saveButton.setAttribute('onclick', 'saveActivity()');
    buttons.appendChild(saveButton);
    // generate the activity dialog cancel button
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = "Cancel";
    cancelButton.setAttribute('onclick', 'cancelActivity(dialog)');
    buttons.appendChild(cancelButton);


}

// Drag support for task bars
let dragElement = null;
let dragStartX = 0;
let originalX = 0;
let originalY = 0;

function startTaskDrag(evt) {
    if (evt.button !== 0) return; // only left button
    dragElement = evt.currentTarget;
    dragStartX = evt.clientX;
    originalX = parseFloat(dragElement.getAttribute('data-x'));
    originalY = parseFloat(dragElement.getAttribute('data-y'));
    evt.preventDefault();
}

function dragTask(evt) {
    if (!dragElement) return;
    const dx = evt.clientX - dragStartX;
    dragElement.setAttribute('transform', `translate(${originalX + dx},${originalY})`);
}

function endTaskDrag(evt) {
    if (!dragElement) return;
    const dx = evt.clientX - dragStartX;
    const daysMoved = Math.round(dx / cellWidth);
    if (daysMoved !== 0) {
        const task = JSON.parse(decodeURIComponent(dragElement.getAttribute('data-task')));
        const planning = dragElement.closest('.planning');
        const planningData = JSON.parse(planning.getAttribute('planningData'));
        const index = planningData.tasks.findIndex(t => t.id === task.id);
        if (index > -1) {
            const start = new Date(planningData.tasks[index].start);
            start.setDate(start.getDate() + daysMoved);
            const end = new Date(planningData.tasks[index].end);
            end.setDate(end.getDate() + daysMoved);
            planningData.tasks[index].start = start.toISOString().slice(0, 10);
            planningData.tasks[index].end = end.toISOString().slice(0, 10);
            planning.setAttribute('planningData', JSON.stringify(planningData));
            gantrender(planning);
        }
    }
    dragElement = null;
}

// Context menu handling
let currentContextTask = null;
let currentPlanning = null;

function showTaskContextMenu(evt) {
    evt.preventDefault();
    const menu = document.getElementById('taskContextMenu');
    currentContextTask = JSON.parse(decodeURIComponent(evt.currentTarget.getAttribute('data-task')));
    currentPlanning = evt.currentTarget.closest('.planning');
    menu.style.left = evt.clientX + 'px';
    menu.style.top = evt.clientY + 'px';
    menu.style.display = 'block';
}

function contextEditTask() {
    if (currentContextTask) {
        showActivityDialog(currentContextTask);
    }
    hideContextMenu();
}

function contextDeleteTask() {
    if (currentContextTask && currentPlanning) {
        const planningData = JSON.parse(currentPlanning.getAttribute('planningData'));
        const index = planningData.tasks.findIndex(t => t.id === currentContextTask.id);
        if (index > -1) {
            planningData.tasks.splice(index, 1);
            currentPlanning.setAttribute('planningData', JSON.stringify(planningData));
            gantrender(currentPlanning);
        }
    }
    hideContextMenu();
}

function hideContextMenu() {
    const menu = document.getElementById('taskContextMenu');
    if (menu) menu.style.display = 'none';
}




// This component is used to create a new planning
const planningData = {
    year: 2024, // Selected year
    holidays: ['2024-01-01', '2024-07-04', '2024-12-25'], // List of holidays
    companyHolidays: ['2024-01-01', '2024-12-25'], // Company-specific holidays
    workdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Working days
    workHours: { start: '09:00', end: '17:00' }, // Working hours
  
    resources: [
        {resourceId: 'resource1', 
        resourceName: 'Resource 1', 
        resourceColor: '#ff0000', 
        resourceType: 'person', 
        resourceEmail: 'resource1@company', 
        resourcePhone: '123456789',
        activities: [
                   {
                        id: 1,
                        title: 'Task A',
                        owner: 'John Doe',
                        scheduled: '2024-03-15',
                        duration: 5, // In days
                        onTime: true,
                        delay: false,
                        resource : 'resource1',
                        // Other properties related to the activity
                    },
                    {
                        id: 2,
                        title: 'Task B',
                        owner: 'John Doe',
                        scheduled: '2024-02-22',
                        duration: 3, // In days
                        onTime: true,
                        delay: false,
                        resource : 'resource1',
                        // Other properties related to the activity
                    },
                    {
                        id: 3,
                        title: 'Task C',
                        owner: 'John Doe',
                        scheduled: '2024-03-01',
                        duration: 2, // In days
                        onTime: true,
                        delay: false,
                        resource : 'resource1',
                        // Other properties related to the activity
                    }
                ],
        }      
      // Other activities...
    ]
  };

  function createPlanning(type)
  {
    console.log("createElement:"+type);
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.style.overflow="auto";
    // set the with of the main div to maximum of the window and overflow to auto
    main.style.width="1000px";
    main.style.overflow="scroll";
    main.style.display="block";
    main.setAttribute("planningData",JSON.stringify(planningData));
    
    
        // Render the Gantt chart
    gantrender(main,planningData);
   
    return main;
  }

  function editPlanning(type,element,content)
  {
    content.appendChild(createInputItem("planningData", "planningData", "onplanningDataclick",element.getAttribute('planningData'),"text",true));
  }

  // this function render the gantt chart
  function gantrender(main)
  {
    // get the planning data from the main div
    const planningData = JSON.parse(main.getAttribute("planningData"));
  // create day of years data
    const days = [];
    const year = planningData.year;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    // create array of the days of the year with suturday and sunday and holidays
    for (let date = startDate; date < endDate; date.setDate(date.getDate() + 1)) {
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
    // create the table of the gantt chart
    const table = document.createElement('table');
    table.className = 'gantt-table';
    // create a table strucutre with months, days, and days of the week
   // create the table header with the months 1 to 12 and write the month name in the header with colspan equal to the number of days in the month
    const thead = document.createElement('thead');
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      months.push({ monthName, daysInMonth });
    }
    // create the header
    let tr = document.createElement('tr');
    tr.className = 'gantt-header';   
    th = document.createElement('th');
    th.className = 'gantt-cell';
    th.setAttribute('colspan', 1);
    tr.appendChild(th);
    months.forEach((month) => {
      th = document.createElement('th');
      th.className = 'gantt-cell';
      th.setAttribute('colspan', month.daysInMonth);
      th.innerText = month.monthName;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    // create the weeks number header for each month and write the week number in the header with colspan equal to the number of days in the week
    tr = document.createElement('tr');
    tr.className = 'gantt-header';  
    th = document.createElement('th');
    th.className = 'gantt-cell';
    th.setAttribute('colspan', 1);
    tr.appendChild(th) 
    let weekNumber = 0; 
    
    for (let i=0;i<days.length;i+=7) {
        const day = days[i];
        // get the month number
        const month = new Date(day.date).getMonth();
        // get the number of days in the month
        const daysInMonth = months[month].daysInMonth;
        // get the day number in the month
        weekNumber++;
        th = document.createElement('th');
        th.className = 'gantt-week-of-year-cell';
        if (i<=days.length-7)
        {
            th.setAttribute('colspan', 7);
        }
        else
        {
            th.setAttribute('colspan', days.length-i);
        }

        th.innerText = "Week "+ weekNumber;
                
        tr.appendChild(th);
              
        

    }
    thead.appendChild(tr);
    // create the header of day number for each month and for each day of the week and write the day number in the header
    tr = document.createElement('tr');
    tr.className = 'gantt-header'; 
    th = document.createElement('th');
    th.className = 'gantt-cell';
    th.setAttribute('colspan', 1);
    th.innerText = "Resource";
    tr.appendChild(th)
    for (let i=0;i<days.length;i++) {
        let day = days[i];
        th = document.createElement('th');
        if (day.isWeekend)
        {
            th.className = 'gantt-weekend';
        }else if (day.isHoliday)
        {
            th.className = 'gantt-holiday';
        }else if (day.isCompanyHoliday)
        {
            th.className = 'gantt-company-holiday';
        }   
        else
        {
            th.className = 'gantt-cell';
        }   
        
        th.innerText = day.date.slice(8, 10);
        tr.appendChild(th);
      }
   
    thead.appendChild(tr);
    // adding the header to the table
    table.appendChild(thead);   
    // generate the body of the table
    const tbody = document.createElement('tbody');
    // create the row for each activity
    planningData.resources.forEach((resource) => {        
            const tr = document.createElement('tr');
            tr.className = 'gantt-row';
            th= document.createElement('th');
            th.className = 'gantt-cell';
                th.innerText = resource.resourceName;
                tr.appendChild(th);
                activityDays = [];
                resource.activities.forEach((activity) => {
                    
                    console.log(activity);
                    // push the days of the activity in the array

                    activityDays.push(activity);

                });
                    // create the cell for each activity for each resource
                                           
                                for (let i=0;i<days.length;i++) {
                                    let day = days[i];
                                    const td = document.createElement('td');
                                    if (day.isWeekend)
                                    {
                                        td.className = 'gantt-weekend';
                                    }else if (day.isHoliday)
                                    {
                                        td.className = 'gantt-holiday';
                                    }else if (day.isCompanyHoliday)
                                    {
                                        td.className = 'gantt-company-holiday';
                                    }   
                                    else
                                    {
                                        td.className = 'gantt-cell';
                                    }   
                                    // if the activity is scheduled on the day, add the activity to the cell
                                    activity = activityDays.find(activity => activity.scheduled === day.date);
                                   
                                    if (activity) {
                                        td.className= 'gantt-scheduled';
                                        td.innerText = activity.title;
                                        td.setAttribute('colspan', activity.duration);
                                        td.setAttribute('activity', activity);
                                        // convert the activity object to json string
                                        td.setAttribute('activity',JSON.stringify(activity));
                                        td.setAttribute('onclick', 'editActivity(this)');
                                        td.setAttribute('onmouseover', 'showActivity(this)');
                                        i+=activity.duration-1;
                                    }
                                    tr.appendChild(td);
                                }
                                tbody.appendChild(tr);
                                
            });
    // adding the body to the table
    table.appendChild(tbody);

    main.appendChild(table);
    
   

    
  }
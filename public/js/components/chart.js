class ChartManager {
    constructor() {
        this.chartList = [];
        this.currentChart = null;
        this.chartColors = [
            'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'
        ];
        this.chartBorderColors = [
            'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'
        ];
        // generate 100 colors for treemap
        for (let i = 5; i < 100; i++) {
            this.chartColors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`);
            this.chartBorderColors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`);
        }

        this.dataset = [];
        this.defaultTopValue = 10;
    }

    createElementChart(type) {
        const main = document.createElement('div');
        main.className = 'form-container';
        main.id = `${type}${Date.now()}`; // Unique ID for each new element
        main.draggable = true;
        main.setAttribute("tagName", type);
        const canvasId = `${type}${Date.now()}`;
        main.innerHTML = `<canvas id="${canvasId}" style="width:400px;height:400px"></canvas>`;

        const ctx = main.querySelector(`#${canvasId}`).getContext('2d');
        let typeChart = this.getChartType(type);

        this.chartList.push(new Chart(ctx, {
            type: typeChart,
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: typeChart !== 'treemap' ? {
                    y: {
                        beginAtZero: true
                    }
                } : {},
                plugins: typeChart === 'treemap' ? {
                    legend: {
                        display: false
                    }
                } : {}
            }
        }));

        main.setAttribute("chartNumber", this.chartList.length - 1);
        main.setAttribute("dataConfig", JSON.stringify([]));
        main.setAttribute("pivotConfig", JSON.stringify([]));
        main.setAttribute("filter", JSON.stringify({ view: "standard", filters: [] }));

        return main;
    }

    getChartType(type) {
        switch (type) {
            case 'lineChart': return 'line';
            case 'barChart': return 'bar';
            case 'pieChart': return 'pie';
            case 'scatterChart': return 'scatter';
            case 'radarChart': return 'radar';
            case 'doughnutChart': return 'doughnut';
            case 'polarAreaChart': return 'polarArea';
            case 'bubbleChart': return 'bubble';
            case 'treemapChart': return 'treemap';
            default: return 'bar';
        }
    }

    editElementChart(type, element, content) {
        console.log("editElementChart");
        const button = document.createElement('button');
        button.textContent = 'Update';
        button.onclick = () => this.updateJsonData();
        content.appendChild(button);
        console.log("element", element);
        const data = createMultiSelectItem("Data", "data", "data", element.getAttribute('data'), "text", true);
        const pivot = createMultiSelectItem("Pivot", "pivot", "pivot", element.getAttribute('pivot'), "text");
        const legend = createSelectItem("Legend", "legend", "legend", element.getAttribute('legend'), "text", true);
        const filter = createFilterBox(content);
        content.appendChild(data);
        content.appendChild(pivot);
        content.appendChild(legend);
        content.appendChild(filter);

        const dataConfig = JSON.parse(element.getAttribute("dataConfig"));
        const pivotConfig = JSON.parse(element.getAttribute("pivotConfig"));
        if (dataConfig) {
            dataConfig.forEach(config => addFunctionsFieldToPropertiesBar(data, config, true));
        }
        if (pivotConfig) {
            pivotConfig.forEach(config => addFunctionsFieldToPropertiesBar(pivot, config, true));
        }
        const legendInput = legend.querySelector('input');
        const legendJson = JSON.parse(element.getAttribute("labels-json"));
        legendInput.setAttribute("data-field", JSON.stringify(legendJson));
        legendInput.value = legendJson.fieldName;
        const legendSelect = legend.querySelector('select');
        const dataType = legendJson.dataType;
        setOptionsByTypeChart(legendSelect, dataType);
        legendSelect.value = element.getAttribute("labels-data-function");

        switchView(event, content, 'standard');
        regenerateFilters(content, JSON.parse(element.getAttribute("filter")));
    }

    clearCharts() {
        this.chartList = [];
        this.currentChart = null;
    }

    getChart() {
        const propertiesBar = document.getElementById('propertiesBar');
        const chartID = propertiesBar.getAttribute("data-element-id");
        const element = document.getElementById(chartID);
        const chartNumber = element.getAttribute('chartNumber');
        return this.chartList[chartNumber];
    }

    renderData(element) {
        console.log("renderData");
        console.log("element", element);
        const chartNumber = parseInt(element.getAttribute('chartNumber'));
        let chart = this.chartList[chartNumber];
        console.log("chart", chart);

        if (chart) {
            chart.data.datasets = [];
        } else // generate the chart
        {
            const canvas = element.querySelector('canvas');
            console.log("canvas", canvas);
            let ctx = canvas.getContext('2d');
            console.log("ctx", ctx);
            let typeChart = this.getChartType(element.getAttribute("tagName"));
            this.chartList.push(new Chart(ctx, {
                type: typeChart,
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    scales: typeChart !== 'treemap' ? {
                        y: {
                            beginAtZero: true
                        }
                    } : {},
                    plugins: typeChart === 'treemap' ? {
                        legend: {
                            display: false
                        }
                    } : {}
                }
            }));
            chart = this.chartList[this.chartList.length - 1];
        } // end else




        const dataConfig = JSON.parse(element.getAttribute("dataConfig"));
        const legendJson = JSON.parse(element.getAttribute("labels-json"));
        const pivotConfig = JSON.parse(element.getAttribute("pivotConfig"));
        const fieldsElaborated = [];

        var functionName = legendJson.functionName;
        var labelName = legendJson.fieldLabel;

        // generate colors for each dataset
        var colorCount = -1;
        const fieldsChart = [];
        const data = this.dataset;
        if (pivotConfig.length > 0 && data.length > 1) {
            // get filed names from data[0]

            const keys = Object.keys(data[0]);
            keys.forEach(key => {
                // if the key is not ind dataConfig.fieldLabel, add it to fieldsChart
                if (!dataConfig.find(x => x.fieldLabel === key)) {
                    fieldsChart.push(key);
                }
            });

        } else {
            dataConfig.forEach((config, index) => {
                fieldsChart.push(config.fieldLabel);
            });
        }
        console.log("fieldsChart", fieldsChart);

        fieldsChart.forEach((fieldName, index) => {
            console.log("fieldName", fieldName);
            console.log("index", index);
            //const fieldName = config.fieldName;
            if (fieldName === labelName) return;
            if (chart.config.type === 'treemap') {
                chart.data.datasets[index] = {
                    tree: [],
                    key: 'value',
                    groups: ['x'],
                    spacing: 0.5,
                    borderWidth: 1,

                    backgroundColor: this.chartColors[index],
                    borderColor: this.chartBorderColors[index],
                    labels: {   // show the value in the treemap
                        display: true,
                        color: 'white',
                        align: 'center',
                        formatter: ctx => ctx.raw.label
                    }
                };
            } else {
                chart.data.datasets[index] = {
                    label: fieldName,
                    backgroundColor: this.chartColors[index],
                    borderColor: this.chartBorderColors[index],
                    borderWidth: 1,
                    data: []
                };
            }

            if (fieldsElaborated.includes(fieldName)) {
                chart.data.datasets[index].type = chart.config.type === 'bar' ? 'line' : 'bar';
            } else {
                fieldsElaborated.push(fieldName);
            }
        });

        // generate the query to get the data

        // Get the dataset data from the server, using the filter
        var url = this.getFilterUrl(element);;

        const request = new XMLHttpRequest();
        request.open("POST", url, false); // `false` makes the request synchronous
        const filter = JSON.parse(element.getAttribute("filter"));
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        const sort = JSON.parse(element.getAttribute("sort"));
        const limit = JSON.parse(element.getAttribute("limit"));
        console.log("filter:" + filter);
        // add the tagname cookieStorage in the filter
        const cookieStorage = document.querySelector('[tagname="cookieStorage"]');
        if (cookieStorage) {
            const cookieStorageJson = JSON.parse(cookieStorage.getAttribute("data-cookies"));
            if (cookieStorageJson) {
                // get the variables name from the cookieStorage
                cookieStorageJson.forEach(item => {
                    const fieldName = item.name;
                    const selectValue = cookieStorage.querySelector(`select[var_name="${fieldName}"]`);
                    // get the value of the select
                    const value = selectValue.options[selectValue.selectedIndex].value;
                    // check if the filter has the field name
                    if (filter && filter.filters) {
                        const index = filter.filters.findIndex(x => x.fieldName === fieldName);
                        if (index !== -1) {
                            // update the value
                            filter.filters[index].value = value;
                        } else {
                            // add the field to the filter
                            filter.filters.push({ fieldName: fieldName, value: value });
                        }
                    } else {
                        // add the field to the filter
                        filter.filters = [{ fieldName: fieldName, value: value }];
                    }
                });
            }
        }
        // check if the filter is not null or undefined   

        if (filter !== null && filter !== undefined && filter !== "undefined") {
            const body = {
                columns: dataConfig,
                pivot: pivotConfig,
                view: "standard",
                filters: filter,
                sort: sort,
                limit: limit,
                groups: legendJson,
                // links: metadata.links
            };
            request.send(JSON.stringify(body));
        } else {
            console.log("No filter");
            const body = {
                columns: dataConfig,
                pivot: pivotConfig,
                view: "standard",
                filters: [],
                sort: sort,
                limit: limit,
                groups: legendJson,
                // links: metadata.links
            };
            request.send(JSON.stringify(body));
        }

        if (request.status === 200) {
            const data = JSON.parse(request.responseText);
            this.dataset = data; // Store the dataset for sorting and limiting
            // set limit to data.length
            var limitValue = element.querySelector('#limitInput');
            if (limitValue) {
                limitValue.value = data.length;
            }



            for (let index = 0; index < fieldsChart.length; index++) {
                if (fieldsChart[index] !== labelName) {
                    if (chart.config.type === 'treemap') {
                        chart.data.datasets[index].tree = data.map(item => ({
                            x: item[labelName],
                            value: item[fieldsChart[index]],
                            label: item[labelName]
                        }));
                    } else {
                        chart.data.datasets[index].data = data.map(item => item[fieldsChart[index]]);
                        chart.data.labels = data.map(item => item[labelName]);

                    }
                }
            }  // end for
            console.log("chart", chart);
        }

        chart.update();

        // Create the control panel after updating the chart
        this.createControlPanel(element);
    }

    getFilterUrl(element) {
        return `/getDatasetDataByFilter?`;
    }

    updateJsonData() {
        const propertiesBar = document.getElementById('propertiesBar');
        const chartID = propertiesBar.getAttribute("data-element-id");
        console.log("chartID", chartID);
        const currentChart = document.getElementById(chartID);

        const dataInput = propertiesBar.querySelector('#Data');
        const legend = propertiesBar.querySelector('#Legend');
        const legendInput = legend.querySelector('input');
        const legendField = legendInput.value;
        const selectFunction = legendInput.closest('div').querySelector('select');
        var legendJson = JSON.parse(legendInput.getAttribute("data-field"));
        console.log("selectFunction", selectFunction);

        //get the json form data-field
        // const jsonDataset = JSON.parse(selectFunction.getAttribute('data-field'));

        var legendfunction = "value";
        if (selectFunction) {
            legendfunction = selectFunction.value;
            legendJson.functionName = legendfunction;

        }
        currentChart.setAttribute("labels-json", JSON.stringify(legendJson));


        var pivotInput = propertiesBar.querySelector('#Pivot');
        const dataSelect = dataInput.querySelectorAll('[name="dataContainer"]');
        const dataConfig = [];
        dataSelect.forEach(item => {
            //get the json form data-field
            const jsonDataset = JSON.parse(item.getAttribute('data-field'));
            // get the function name close select
            const selectFunction = item.parentElement.querySelector('[tagname="function"]');
            console.log("selectFunction", selectFunction);
            jsonDataset.functionName = selectFunction.value;

            dataConfig.push(jsonDataset);

        });
        currentChart.setAttribute("dataConfig", JSON.stringify(dataConfig));

        // Generate array of pivot
        var pivotSelect = pivotInput.querySelectorAll('div');
        var pivotConfig = [];
        pivotSelect.forEach(item => {
            var selectFunction = item.querySelector('name[chartSelect]');
            var functionName = selectFunction[selectFunction.selectedIndex].value;
            var fieldName = item.querySelector('span').getAttribute('data-field-name');
            var dataType = item.querySelector('span').getAttribute('data-type');
            var tableName = item.querySelector('span').getAttribute('tableName');
            currentChart.setAttribute("tableName", tableName);
            pivotConfig.push({ DBName: DBName, fieldName: fieldName, functionName: functionName, dataType: dataType, tableName: tableName });
        });
        currentChart.setAttribute("pivotConfig", JSON.stringify(pivotConfig));

        this.renderData(currentChart);
    }

    sortData(field, direction, currentChart) {

        // check if in dataConfig there sort element, if exists replace it with the new one otherwise add it

        currentChart.setAttribute("sort", JSON.stringify({ field: field, direction: direction }));
        this.renderData(currentChart);

    }

    limitResults(limitValue, currentChart) {

        currentChart.setAttribute("limit", JSON.stringify({ value: limitValue }));
        this.renderData(currentChart);
    }

    createControlPanel(element) {

        const id = "CTRLPANEL" + element.id;
        // check if the control panel already exists
        var controlPanel = element.querySelector(`#${id}`);
        var sortfield = "";
        var funct = "";
        var limitValue = 100;
        if (controlPanel) {
            // get sort field and direction
            sortfield = element.querySelector('#sortSelect').textContent;
            funct = element.querySelector('#functSelect').value;
            console.log("funct: " + funct);
            limitValue = element.querySelector('#limitInput').value;

            element.removeChild(controlPanel);
        }
        controlPanel = document.createElement('div');


        controlPanel.id = id;
        controlPanel.style.display = 'flex';
        controlPanel.style.alignItems = 'center';
        controlPanel.style.backgroundColor = '#f0f0f0';
        controlPanel.style.padding = '10px';
        controlPanel.style.marginBottom = '10px';

        const sortLabel = document.createElement('label');
        sortLabel.textContent = 'Field';
        sortLabel.style.marginRight = '10px';
        controlPanel.appendChild(sortLabel);

        const sortSelect = document.createElement('select');
        sortSelect.id = 'sortSelect';
        JSON.parse(element.getAttribute("dataConfig")).forEach(config => {
            const option = document.createElement('option');
            option.value = config.fieldName;
            option.textContent = config.fieldName;
            if (config.fieldName === sortfield) {
                option.selected = true;
            }
            sortSelect.appendChild(option);
        });
        sortSelect.style.marginRight = '10px';
        controlPanel.appendChild(sortSelect);

        const sortAscButton = document.createElement('button');
        sortAscButton.textContent = '↑';
        sortAscButton.onclick = () => this.sortData(sortSelect.value, 'asc', element);
        sortAscButton.style.marginRight = '5px';
        controlPanel.appendChild(sortAscButton);


        const sortDescButton = document.createElement('button');
        sortDescButton.textContent = '↓';
        sortDescButton.onclick = () => this.sortData(sortSelect.value, 'desc', element);
        sortDescButton.style.marginRight = '10px';
        controlPanel.appendChild(sortDescButton);

        const functLabel = document.createElement('label');

        functLabel.textContent = 'Function:';
        functLabel.style.marginRight = '10px';
        controlPanel.appendChild(functLabel);

        // function to apply the sort
        const functSelect = document.createElement('select');
        functSelect.id = 'functSelect';
        functSelect.style.marginRight = '10px';
        controlPanel.appendChild(functSelect);
        const functions = [
            { value: 'sum', text: 'Sum' },
            { value: 'avg', text: 'Average' },
            { value: 'count', text: 'Count' },
            { value: 'min', text: 'Min' },
            { value: 'max', text: 'Max' },

        ];
        functions.forEach(func => {
            const option = document.createElement('option');
            option.value = func.value;
            option.textContent = func.text;
            functSelect.appendChild(option);
        });

        for (var i = 0; i < functSelect.options.length; i++) {
            if (functSelect.options[i].value === funct) {
                functSelect.options[i].selected = true;
                break;
            }
        }
        functSelect.onchange = function () {
            const dataconfig = JSON.parse(element.getAttribute("dataConfig"));
            // get the value of sortSelect
            const fieldName = sortSelect.value;
            // get the index of the field
            const index = dataconfig.findIndex(x => x.fieldName === fieldName);
            // update the function name
            dataconfig[index].functionName = functSelect.value;
            element.setAttribute("dataConfig", JSON.stringify(dataconfig));
            chartManager.renderData(element);
        }

        const limitLabel = document.createElement('label');
        limitLabel.textContent = 'Limit results:';
        limitLabel.style.marginRight = '10px';
        controlPanel.appendChild(limitLabel);
        const limitInput = document.createElement('input');
        limitInput.id = 'limitInput';
        limitInput.type = 'number';
        limitInput.value = limitValue;
        limitInput.style.marginRight = '10px';
        controlPanel.appendChild(limitInput);

        const updateButton = document.createElement('button');
        updateButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        updateButton.onclick = () => this.limitResults(parseInt(limitInput.value), element);
        controlPanel.appendChild(updateButton);

        element.insertBefore(controlPanel, element.firstChild);
    }
}

// Usage
const chartManager = new ChartManager();

function createElementChart(type) {
    return chartManager.createElementChart(type);
}

function editElementChart(type, element, content) {
    chartManager.editElementChart(type, element, content);
}

function renderDataChart(element) {
    chartManager.renderData(element);
}

/**
 * Data storage
 * - This navigation helper does not persist configuration on attributes;
 *   it manipulates DOM state only.
 */

function createDataSetComponentWebNavigate(type) {
  var main = document.createElement("div");
  main.className = "dataSetComponentWebNavigate";
  main.id = type + Date.now();
  main.draggable = true;
  main.tagName = type;
  renderNavigationBarWeb(
    main,
    "",
    "",
    ""
  )
  return main;
}


function renderNavigationBarWeb(
  main,

) {
  console.log("createNavigationBarWeb");
  const ides = getIdObject();

  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + Date.now();
  navigationBar.type = "navigation-bar";
  navigationBar.style.display = "block";
  var buttons = [

    {
      name: "PreviousDSBtn",
      title: "Previous",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "movePrevWeb()",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveNextWeb()",
    },

    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "EditRecordWeb()",
    },
    {
      name: "InsertDSBtn",
      title: "Create Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event: "InsertRecordWeb()",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "SaveRecordWeb()",
    },
    {
      name: "RefreshDSBtn",
      title: "Refresh Data",
      text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>',
      event: "RefreshRecordWeb()",
    },
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button name='${buttonInfo.name}'  title="${buttonInfo.title
      }" onclick="${buttonInfo.event.trim()}" style="width:30px;">${buttonInfo.text
      }</button>`;
  });
  navigationBar.innerHTML += "<div >" + htm + "</div>";
  // Append the navigation bar to the body or another element in your document
  main.appendChild(navigationBar);
}

async function moveNextWeb(apiUrl) {
  // Handle panel navigation
  let allPanels = document.querySelectorAll(".panel");
  console.log("allPanels", allPanels);
  let selectedPanel = document.querySelector(".selected-panel");
  console.log("selectedPanel", selectedPanel);

  if (!selectedPanel && allPanels.length > 0) {
    // If no panel is selected, consider the first panel as selected
    selectedPanel = allPanels[0];
    selectedPanel.classList.add("selected-panel");
  }

  if (selectedPanel) {
    selectedPanel.classList.remove("selected-panel");

    let panels = Array.from(allPanels);
    let currentIndex = panels.indexOf(selectedPanel);

    // Select the next panel if it exists
    if (currentIndex + 1 < panels.length) {
      panels[currentIndex + 1].classList.add("selected-panel");
      panels[currentIndex + 1].click();
      return; // Exit after handling panels
    } else {
      console.log("No next panel to select.");
    }
  }

  // Handle grid navigation
  let dataGrid = document.querySelectorAll("[tagname='dataGridWeb']");
  console.log("dataGrid", dataGrid);

  for (let i = 0; i < dataGrid.length; i++) {
    let grid = dataGrid[i];
    let rows = Array.from(grid.querySelectorAll(".grid-row"));
    let selectedRowIndex = rows.findIndex(row => row.classList.contains("grid-row-selected"));
    console.log(`Grid ${i}: selectedRowIndex`, selectedRowIndex);

    // If a row is selected, move to the next row
    if (selectedRowIndex >= 0 && selectedRowIndex + 1 < rows.length) {
      rows[selectedRowIndex].classList.remove("grid-row-selected");
      rows[selectedRowIndex + 1].classList.add("grid-row-selected");
      rows[selectedRowIndex + 1].querySelector("div").click();
    }
    // If no row is selected, simulate click on the first row
    else if (selectedRowIndex === -1 && rows.length > 0) {
      rows[0].classList.add("grid-row-selected");
      rows[0].querySelector("div").click();
    } else {
      console.log("No rows to navigate in this grid.");
    }
  }
}


async function movePrevWeb(apiUrl) {
  // Handle panel navigation
  let allPanels = document.querySelectorAll(".panel");
  console.log("allPanels", allPanels);
  let selectedPanel = document.querySelector(".selected-panel");
  console.log("selectedPanel", selectedPanel);

  if (!selectedPanel && allPanels.length > 0) {
    // If no panel is selected, consider the first panel as selected
    selectedPanel = allPanels[0];
    selectedPanel.classList.add("selected-panel");
  }

  if (selectedPanel) {
    selectedPanel.classList.remove("selected-panel");

    let panels = Array.from(allPanels);
    let currentIndex = panels.indexOf(selectedPanel);

    // Select the previous panel if it exists
    if (currentIndex - 1 >= 0) {
      panels[currentIndex - 1].classList.add("selected-panel");
      panels[currentIndex - 1].click();
      return; // Exit after handling panels
    } else {
      console.log("No previous panel to select.");
    }
  }

  // Handle grid navigation
  let dataGrid = document.querySelectorAll("[tagname='dataGridWeb']");
  console.log("dataGrid", dataGrid);

  for (let i = 0; i < dataGrid.length; i++) {
    let grid = dataGrid[i];
    let rows = Array.from(grid.querySelectorAll(".grid-row"));
    let selectedRowIndex = rows.findIndex(row => row.classList.contains("grid-row-selected"));
    console.log(`Grid ${i}: selectedRowIndex`, selectedRowIndex);

    // If a row is selected, move to the previous row
    if (selectedRowIndex > 0) {
      rows[selectedRowIndex].classList.remove("grid-row-selected");
      rows[selectedRowIndex - 1].classList.add("grid-row-selected");
      rows[selectedRowIndex - 1].querySelector("div").click();
    }
    // If no row is selected, simulate click on the last row
    else if (selectedRowIndex === -1 && rows.length > 0) {
      rows[rows.length - 1].classList.add("grid-row-selected");
      rows[rows.length - 1].querySelector("div").click();
    } else {
      console.log("No rows to navigate in this grid.");
    }
  }
}




function EditRecordWeb(apiId1, handle = false) {
  console.log("Edit Input");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiId = main.getAttribute("data-api-id");
  const dataSetId = "#DataSetWeb_" + apiId;
  const escapedDateSetId = dataSetId.replace(/\//g, "\\/");
  const datasets = document.querySelectorAll(escapedDateSetId);
  datasets.forEach((dataset) => {
    const inputs = dataset.querySelectorAll("input");
    inputs.forEach((input) => {
      input.readOnly = handle;
    });
  });
}

async function InsertRecordWeb() {
  console.log("Create new Record Web");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const apiUrl = main.getAttribute("data-api-url");
  const apiId = main.getAttribute("data-api-id");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const createApi = JSON.parse(main.getAttribute("create-api"));
  const apiMethod = createApi.apiMethod;

  let fieldData = {};
  let payload = {};

  jsonData.map((field, index) => {
    if (index === 0) return;
    const fieldIdTemp = "#" + field.fieldId;
    let escapedFieldId = fieldIdTemp.replace(/\//g, "\\/");
    escapedFieldId = escapedFieldId.replace(/\ /g, "\\ ");
    const inputs = document.querySelectorAll(escapedFieldId);
    let input = inputs[0];
    if (inputs.length > 1) input = inputs[1];
    const name = field.fieldName;
    const fieldValue = input.value;
    fieldData[name] = fieldValue;
  });
  const filteredBody = createApi.apiDataInputs.filter(
    (item) => item.Location === "Body"
  );
  filteredBody.map((item) => {
    const val = findValue(fieldData, item.Name);
    if (val) payload[item.Name] = val;
  });

  const responseCreateApi = await callApi(apiUrl, apiMethod, payload);
  if (!responseCreateApi || responseCreateApi.status !== 200) return;

  const getAllApiUrl = main.getAttribute("data-api-url");
  const getAllApiMethod = main.getAttribute("data-api-method");
  moveLastWeb(getAllApiUrl, getAllApiMethod, apiId, true);
}

async function SaveRecordWeb(apiId1) {
  console.log("DataSetWeb Update");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  // const apiUrl = main.getAttribute("data-api-url");
  const apiId = main.getAttribute("data-api-id");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  const input = document.getElementById(jsonData[0].fieldId);
  const rowId = input.value;
  if (!rowId) return;
  // const navBar = document.getElementById("navigationBar_" + apiId);
  const getById = JSON.parse(main.getAttribute("get-by-id"));
  const apiMethod = getById.apiMethod;
  var apiUrl = getById.controllerServerUrl + getById?.apiPath?.slice(1);
  const replaceString = "{" + getById.apiDataInputs[0].Name + "}";
  apiUrl = apiUrl.replace(replaceString, rowId);
  if (!apiUrl) return;
  const responseGetById = await callApi(apiUrl, apiMethod);
  if (!responseGetById || responseGetById.status !== 200) return;
  let dataGetById = await responseGetById.json();
  jsonData.map((field, index) => {
    if (index === 0) return;
    const input = document.getElementById(field.fieldId);
    const val = input.value;
    if (!val) return;
    dataGetById[field.fieldArrayName][field.fieldName] = val;
  });

  const updateById = JSON.parse(main.getAttribute("update-by-id"));
  const apiMethodUpdate = updateById.apiMethod;

  var apiUrlUpdate =
    updateById.controllerServerUrl + updateById.apiPath.slice(1);
  const replaceStringUpdate = "{" + updateById.apiDataInputs[0].Name + "}";
  apiUrlUpdate = apiUrlUpdate.replace(replaceStringUpdate, rowId);

  const filteredBody = updateById.apiDataInputs.filter(
    (item) => item.Location === "Body"
  );

  let payload = {};

  filteredBody.map((item) => {
    const val = findValue(dataGetById, item.Name);
    if (val) payload[item.Name] = val;
  });

  if (!apiUrlUpdate) return;
  const responseUpdateById = await callApi(
    apiUrlUpdate,
    apiMethodUpdate,
    payload
  );
  if (!responseUpdateById || responseUpdateById.status !== 200) return;
  let dataUpdateById = await responseUpdateById.json();

  EditRecordWeb(apiId, true);

  let idObject = getIdObject();
  if (idObject?.dataGridWeb) {
    let filedName = "";
    let operator = "";
    let searchValue = "";
    if (idObject?.dataSearchWeb) {
      const grid = document.getElementById(idObject?.dataSearchWeb);
      const filter = grid.getAttribute("filter")?.split("|");
      if (filter) {
        filedName = filter[0];
        operator = filter[1];
        searchValue = filter[2];
      }
    }
    searchGridWeb(filedName, operator, searchValue, idObject.dataGridWeb);
  }
}

async function RefreshRecordWeb(apiId1) {
  console.log("DataSetWeb Refresh ");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiId = main.getAttribute("data-api-id");
  const apiUrl = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const row = getRowNumWeb(ides.dataNavigationWeb);
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  const navBar = document.getElementById("navigationBar_" + apiId);
  // const apiUrl = navBar.getAttribute("data-api-url");
  // const apiMethod = navBar.getAttribute("data-api-method");
  const response = await callApi(apiUrl, apiMethod);
  if (!response || response.status !== 200) return;
  const data = await response.json();
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row);
}

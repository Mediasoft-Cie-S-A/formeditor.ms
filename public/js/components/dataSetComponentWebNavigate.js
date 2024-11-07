function createDataSetComponentWebNavigate(type) {
  var main = document.createElement("div");
  main.className = "dataSetComponentWebNavigate";
  main.id = type + Date.now();
  main.draggable = true;
  main.tagName = type;
  return main;
}

function renderDataSetNavigateWeb(
  apiUrl,
  apiMethod,
  jsonData,
  apiId,
  getById,
  updateById,
  createApi
) {
  const ides = getIdObject();
  const navigate = document.getElementById(ides.dataNavigationWeb);
  if (navigate) {
    while (navigate.firstChild) {
      navigate.removeChild(navigate.firstChild);
    }
    navigate.appendChild(
      createNavigationBarWeb(
        apiUrl,
        apiMethod,
        jsonData,
        apiId,
        getById,
        updateById,
        createApi
      )
    );
  } else {
    console.error(
      "❌ 'navigate' element not found. Check 'ides.dataNavigationWeb' value."
    );
  }

  moveFirstWeb(apiUrl, apiMethod, apiId);
}

function createNavigationBarWeb(
  apiUrl1,
  apiMethod1,
  jsonData,
  apiId1,
  getById,
  updateById,
  createApi
) {
  console.log("createNavigationBarWeb");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiUrl = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const apiId = main.getAttribute("data-api-id");
  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + apiId;
  navigationBar.type = "navigation-bar";
  // navigationBar.className = "navigation-bar";
  navigationBar.style.display = "block";

  navigationBar.setAttribute("data-current-row", "0");
  navigationBar.setAttribute("data-current-length", "0");
  navigationBar.setAttribute("data-api-url", apiUrl);
  navigationBar.setAttribute("data-api-method", apiMethod);
  navigationBar.setAttribute("data-api-id", apiId);
  navigationBar.setAttribute("get-by-id", JSON.stringify(getById));
  navigationBar.setAttribute("update-by-id", JSON.stringify(updateById));
  navigationBar.setAttribute("create-api", JSON.stringify(createApi));

  navigationBar.innerHTML = '<div class="navigation-bar-title">record: </div>';
  // Create buttons and append them to the navigation bar
  var buttons = [
    {
      name: "firstDSBtn",
      title: "First",
      text: '<i class="bi bi-arrow-up-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveFirstWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "PreviusDSBtn",
      title: "Previus",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "movePrevWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveNextWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "LastDSBtn",
      title: "Last",
      text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveLastWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "EditRecordWeb('" + apiId + "')",
    },
    {
      name: "InsertDSBtn",
      title: "Create Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event: "InsertRecordWeb('" + apiId + "')",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "SaveRecordWeb('" + apiId + "')",
    },
    {
      name: "RefreshDSBtn",
      title: "Refresh Data",
      text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>',
      event: "RefreshRecordWeb('" + apiId + "')",
    },
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button name='${buttonInfo.name}'  title="${
      buttonInfo.title
    }" onclick="${buttonInfo.event.trim()}" style="width:30px;">${
      buttonInfo.text
    }</button>`;
  });
  navigationBar.innerHTML += "<div >" + htm + "</div>";
  // Append the navigation bar to the body or another element in your document
  return navigationBar;
}

async function moveNextWeb(apiUrl) {
  const ides = getIdObject();
  console.log("DataSetWeb Move Next");
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const apiUrl1 = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const apiId = main.getAttribute("data-api-id");
  const row = getRowNumWeb(ides.dataNavigationWeb);
  const length = getDataLength(ides.dataNavigationWeb);
  if (row === length - 1) return;
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl1, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row + 1);
  setRowNumWeb(ides.dataNavigationWeb, row + 1);
  setDataLength(
    ides.dataNavigationWeb,
    data[jsonData[1].fieldArrayName].length
  );
}

async function moveFirstWeb(apiUrl, apiMethod, apiId) {
  console.log("DataSetWeb Move First");
  const ides = getIdObject();
  const dataSetId = "DataSetWeb_" + apiId;
  // const dataSet = document.getElementById(dataSetId);
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, 0);
  setDataLength(
    ides.dataNavigationWeb,
    data[jsonData[1].fieldArrayName].length
  );
  setRowNumWeb(ides.dataNavigationWeb, 0);
}

async function movePrevWeb() {
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const apiUrl = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const apiId = main.getAttribute("data-api-id");
  const row = getRowNumWeb(ides.dataNavigationWeb);
  if (row === 0) return;
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row - 1);
  setRowNumWeb(ides.dataNavigationWeb, row - 1);
  setDataLength(
    ides.dataNavigationWeb,
    data[jsonData[1].fieldArrayName].length
  );
}

async function moveLastWeb() {
  console.log("DataSetWeb Move Last");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const apiUrl = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const apiId = main.getAttribute("data-api-id");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  let length;
  const searchFilter = apiFilter?.split("|");
  if (searchFilter?.length < 3 || apiFilter == false) {
    length = getDataLength(apiId);
  } else {
    length = data?.data?.length;
  }
  // if(fromInsertRecord) length = data[jsonData[1].fieldArrayName].length;
  updateInputsWeb(data, jsonData, apiId, length - 1);
  setRowNumWeb(ides.dataNavigationWeb, length - 1);
  setDataLength(
    ides.dataNavigationWeb,
    data[jsonData[1].fieldArrayName].length
  );
}

async function moveFirstWeb() {
  console.log("DataSetWeb Move First");
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetWeb);
  const apiFilter = main.getAttribute("apiFilter");
  const apiUrl = main.getAttribute("data-api-url");
  const apiMethod = main.getAttribute("data-api-method");
  const apiId = main.getAttribute("data-api-id");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));

  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, 0);
  setDataLength(
    ides.dataNavigationWeb,
    data[jsonData[1].fieldArrayName].length
  );
  setRowNumWeb(ides.dataNavigationWeb, 0);
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

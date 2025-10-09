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
 * - datasearch: JSON array describing searchable dataset fields.
 * - data-value-* attributes: plain strings attached to suggestion items to carry metadata (DB/table/field/type).
 */
function createGridFilterOr(type) {
  var main = document.createElement("div");
  main.className = "dataSetContainer";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  const list = document.getElementById("ContentTableList");
  const detailsDiv = document.getElementById("tableDetails");

  return main;
}

function editGridFilterOr(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateGridFilterOrData(main, content);
  };
  content.appendChild(button);
  content.appendChild(createMultiSelectItem("Data", "data", "data"));

  // load the data
  // check if jsonData is not empty
  if (element.getAttribute("datasearch") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("datasearch"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }
  // load the data
  // check if jsonData is not empty
}

function updateGridFilterOrData(main, content) {
  // get all the span elements from data
  var data = content.querySelectorAll('#Data span[name="dataContainer"]');
  // generate the json of all the data
  var jsonData = [];
  data.forEach((span) => {
    console.log(span.getAttribute("data-field"));
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    jsonData.push(json);
  });
  main.setAttribute("datasearch", JSON.stringify(jsonData));
  RenderGridFilterOr(main);
}


function RenderGridFilterOr(main) {
  main.innerHTML = "";

  const searchMainDiv = document.createElement("div");
  searchMainDiv.className = "search-container";
  searchMainDiv.id = "searchDiv";
  searchMainDiv.style.display = "inline-block"; // correction: "infline" -> "inline"
  main.appendChild(searchMainDiv);

  const jsonData = JSON.parse(main.getAttribute("datasearch") || "[]");

  const uniqueId = Date.now();

  const searchMain = document.createElement("div");
  searchMain.className = "searchMain";
  searchMain.id = `search_${uniqueId}`;

  const searchDiv = document.createElement("div");
  searchDiv.className = "search";
  searchDiv.id = `search_${uniqueId}_searchDiv`;

  // input
  const input = document.createElement("input");
  input.type = "text";
  input.id = `search_${uniqueId}_input`;
  input.placeholder =
    jsonData.map((field) => field.fieldLabel).filter(Boolean).join(", ") ||
    "Search";
  input.autocomplete = "off";
  input.autocorrect = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.setAttribute("data-fields", JSON.stringify(jsonData));

  // search button
  const btnSearch = document.createElement("button");
  btnSearch.type = "button";
  btnSearch.onclick = (event) => gridSearchOR(event);
  const iconSearch = document.createElement("i");
  iconSearch.className = "fas fa-search";
  btnSearch.appendChild(iconSearch);

  // clear button
  const btnClear = document.createElement("button");
  btnClear.type = "button";
  btnClear.onclick = (event) => {
    console.log("clear");
    event.preventDefault();
    input.value = "";
    gridSearchOR(event);
  };
  const iconClear = document.createElement("i");
  iconClear.className = "fas fa-times";
  btnClear.appendChild(iconClear);

  // assemble
  searchDiv.appendChild(input);
  searchDiv.appendChild(btnSearch);
  searchDiv.appendChild(btnClear);

  searchMain.appendChild(searchDiv);
  searchMainDiv.appendChild(searchMain);

  return searchMainDiv;
}


function gridSearchOR(event) {
  console.log("gridSearch");
  event.preventDefault();
  const maindiv = event.target.closest(".search");
  if (!maindiv) {
    return;
  }
  const element = maindiv.querySelector("input");
  if (!element) {
    return;
  }

  const searchValue = element.value;
  const normalizedValue = (searchValue || "").toString();

  let fieldsData = [];
  try {
    fieldsData = JSON.parse(element.getAttribute("data-fields") || "[]");
  } catch (error) {
    console.error("Unable to parse data-fields attribute", error);
    fieldsData = [];
  }

  let componentRoot = element.closest("[tagname]");
  if (!componentRoot || !componentRoot.hasAttribute("datasearch")) {
    componentRoot = element.closest(".dataSetContainer");
  }

  let dataSearchConfig = [];
  if (componentRoot) {
    try {
      dataSearchConfig = JSON.parse(
        componentRoot.getAttribute("datasearch") || "[]"
      );
    } catch (error) {
      console.error("Unable to parse datasearch configuration", error);
      dataSearchConfig = [];
    }
  }

  const getOperatorByType = (fieldType) => {
    switch (fieldType) {
      case "character":
        return "like";
      case "integer":
      case "date":
      case "logical":
        return "=";
      default:
        return "like";
    }
  };

  const trimmedValue = normalizedValue.trim();
  const orFilterGroup =
    fieldsData.length && trimmedValue !== ""
      ? {
        condition: "or",
        filters: fieldsData.map((field) => ({
          DBName: field.DBName,
          tableName: field.tableName,
          field: field.fieldName,
          fieldName: field.fieldName,
          operator: getOperatorByType(field.fieldType),
          value: normalizedValue,
          type: field.fieldType,
        })),
      }
      : null;

  if (componentRoot && dataSearchConfig.length) {
    const updatedConfig = dataSearchConfig.map((field) => {
      if (!field) {
        return field;
      }
      if (!orFilterGroup) {
        if (field.filterJson) {
          const clone = { ...field };
          delete clone.filterJson;
          return clone;
        }
        return field;
      }
      return {
        ...field,
        filterJson: {
          ...orFilterGroup,
        },
      };
    });
    componentRoot.setAttribute("datasearch", JSON.stringify(updatedConfig));
    element.setAttribute(
      "data-fields",
      componentRoot.getAttribute("datasearch") || "[]"
    );
  } else {
    element.setAttribute("data-fields", JSON.stringify(fieldsData));
  }

  const visibleGrids = document.querySelectorAll("div[tagname='dataGrid']");
  visibleGrids.forEach((grid) => {
    if (grid.style.display === "none") {
      return;
    }

    if (orFilterGroup) {
      const filterAttr = grid.getAttribute("filter");
      let filterJSON;
      try {
        filterJSON = filterAttr ? JSON.parse(filterAttr) : {};
      } catch (error) {
        console.error("Unable to parse grid filter JSON", error);
        filterJSON = {};
      }
      if (!Array.isArray(filterJSON.filters)) {
        filterJSON.filters = [];
      }

      const groupKey =
        orFilterGroup.groupId ||
        orFilterGroup.id ||
        orFilterGroup.filters
          .map((filter) =>
            [
              filter.DBName || filter.dbName || "",
              filter.tableName || "",
              filter.field || filter.fieldName || "",
            ]
              .filter(Boolean)
              .join(".")
          )
          .sort()
          .join("|");

      filterJSON.filters = filterJSON.filters.filter((filter) => {
        if (!filter) {
          return false;
        }
        const currentKey = filter.groupId || filter.id || filter._groupKey;
        return currentKey !== groupKey;
      });

      filterJSON.filters.push({
        ...orFilterGroup,
        groupId: groupKey,
        _groupKey: groupKey,
      });

      grid.setAttribute("filter", JSON.stringify(filterJSON));
    } else {
      const filterAttr = grid.getAttribute("filter");
      if (filterAttr) {
        try {
          const filterJSON = JSON.parse(filterAttr);
          if (Array.isArray(filterJSON.filters)) {
            filterJSON.filters = filterJSON.filters.filter((filter) => {
              if (!filter) {
                return false;
              }
              if (!filter.condition || filter.condition.toLowerCase() !== "or") {
                return true;
              }
              return false;
            });
            grid.setAttribute("filter", JSON.stringify(filterJSON));
          }
        } catch (error) {
          console.error("Unable to clear grid OR filter", error);
        }
      }
    }

    if (fieldsData.length) {
      const primaryField = fieldsData[0];
      const operator = getOperatorByType(primaryField.fieldType);
      searchGrid(
        primaryField.DBName,
        primaryField.fieldName,
        operator,
        searchValue,
        grid.id
      );
    }
  });
}

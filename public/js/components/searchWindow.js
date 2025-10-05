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
 * - currentPage / pageSize: numeric values managing pagination state.
 * - allData / filteredData: in-memory arrays holding query results and filtered subsets.
 * - selectedRowValue: object reference to the currently highlighted row.
 * - modal / parentid: DOM references retained to reopen or close the modal context.
 */

var currentPage = 1;
const pageSize = 5; // Rows per page
var allData = []; // To hold all fetched data
var filteredData = []; // To hold filtered data
var selectedRowValue = null;
var modal = null;
var parentid = null;
function createQueryResultModal() {
  const modalId = "queryResultModal";

  // Check if modal already exists to avoid duplicates
  let existingModal = document.getElementById(modalId);
  if (existingModal) {
    return existingModal;
  }

  // Create Modal Container
  const modal = document.createElement("div");
  modal.id = modalId;
  modal.className = "modal";
  modal.style.display = "none"; // Hidden by default
  modal.style.zIndex = 2147483647; // Set a high z-index
  document.body.appendChild(modal);

  // Modal Content
  const modalContent = document.createElement("div");
  modalContent.className = "";
  modal.appendChild(modalContent);

  // Modal Header
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
      <p>Select a Value</p>
      <button id="closeQueryModalBtn" class="close-modal-btn" style=" cursor: pointer;color:red">&times;</button>
    `;
  modalContent.appendChild(modalHeader);

  // Modal Body for Filters and Grid
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";

  // Filter Section
  const filterSection = document.createElement("div");
  filterSection.className = "filter-section";
  filterSection.innerHTML = `
      <div id="queryFilters" class="filters"></div>
      <button id="applyQueryFilterBtn" class="apply-filter-btn">Apply Filter</button>
    `;
  modalBody.appendChild(filterSection);

  // Grid Section
  const gridSection = document.createElement("div");
  gridSection.className = "grid-section";
  gridSection.innerHTML = `
      <div id="queryResultGrid" class="table-container"></div>
      <div id="paginationControls" class="pagination-controls">
        <button id="prevPageBtn" class="pagination-btn">Previous</button>
        <span id="currentPage" class="pagination-page-info">Page: 1</span>
        <button id="nextPageBtn" class="pagination-btn">Next</button>
      </div>
    `;
  modalBody.appendChild(gridSection);

  modalContent.appendChild(modalBody);

  // Modal Footer for OK and Close Buttons
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";

  const modalOkBtn = document.createElement("button");
  modalOkBtn.id = "modalOkBtn";
  modalOkBtn.className = "modal-ok-btn";
  modalOkBtn.textContent = "OK";
  modalFooter.appendChild(modalOkBtn);
  modalOkBtn.onclick = (e) => {
    e.preventDefault();
    console.log("Selected Row Value:", selectedRowValue);
    console.log("Parent ID:", parentid);
    if (!selectedRowValue) {
      showToast("Please select a row", 3000);
      return;
    }
    // in relation at the modal the dom create multiple input with the same id, so we need to use querySelectorAll
    var inputElements = document.querySelectorAll('input[id^="' + parentid + '"]');
    // if the input is not found, return
    if (!inputElements) {
      return;
    }
    // for each input element, check if the dataset field name matches the parentid
    inputElements.forEach((inputElement) => {


      // Allow updates for search window fields even if they are normally readonly/disabled
      const isSearchWindowField =
        inputElement.getAttribute("dataset-field-type") === "search_win";
      if (!isSearchWindowField && (inputElement.disabled || inputElement.readOnly)) {
        showToast("Input is disabled or readonly");
        return;
      }

      // set the value of the input element
      inputElement.value = selectedRowValue;
      // dispatch input event to trigger any listeners
      if (inputElement.onchange) {
        inputElement.onchange({ target: inputElement });
      }
      // loadValuesSearchWin({ target: inputElement });
      // get input element
    }); // forEach inputElements
    modal.style.display = "none"; // Close the modal

  }; // modalOkBtn.onclick


  const modalCloseBtn = document.createElement("button");
  modalCloseBtn.id = "modalCloseBtn";
  modalCloseBtn.className = "modal-close-btn";
  modalCloseBtn.textContent = "Close";
  modalFooter.appendChild(modalCloseBtn);

  modalContent.appendChild(modalFooter);

  // Close Button Logic (Header Close)
  const closeModalBtn = modalHeader.querySelector("#closeQueryModalBtn");
  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "none";
  });

  // Close Button Logic (Footer Close)

  modalCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "none";
  });

  return modal;
}  // createQueryResultModal

// Fetch Data Once and Paginate on the Client
async function fetchAndRenderData(DBName, datasetJson, query) {
  // Fetch all data from the backend (no filtering yet)
  allData = await fetchQueryData(DBName, query);

  // Initially, all data is unfiltered
  filteredData = [...allData];

  // Render the first page of data
  renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
  updatePaginationControls(datasetJson);
}

// Apply Filter Logic
function applyFilter() {
  const queryFiltersContainer = document.getElementById("queryFilters");
  if (!queryFiltersContainer) return;
  // Get filter values from inputs
  const filters = Array.from(queryFiltersContainer.querySelectorAll("input"))
    .filter((input) => input.value.trim() !== "")
    .map((input) => ({
      field: input.name,
      value: input.value.trim().toLowerCase(),
    }));

  // Filter data
  filteredData = allData.filter((row) => {
    return filters.every((filter) => {
      const cellValue = row[filter.field]?.toString().toLowerCase() || "";
      return cellValue.includes(filter.value);
    });
  });

  // Reset to page 1 and render filtered data
  currentPage = 1;
  renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
  updatePaginationControls(datasetJson);
}

function showQueryResultModal(DBName, datasetJson, query, pid) {
  // Pagination State
  parentid = pid;
  console.log("DBName:", DBName, "datasetJson:", datasetJson, "query:", query, "parentid:", parentid);

  // Reset selection state for a fresh modal session
  selectedRowValue = null;

  // Ensure modal is created
  modal = createQueryResultModal();

  console.log("Modal created:", modal);
  modal.style.zIndex = 2147483647; // Set a high z-index
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.width = "80%";
  modal.style.height = "80%";
  modal.style.backgroundColor = "#fff";
  modal.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  modal.style.borderRadius = "8px";
  modal.style.padding = "10px";
  modal.style.overflow = "hidden"; // Prevent overflow

  // Parse datasetJson and build filters dynamically
  const queryFiltersContainer = document.getElementById("queryFilters");
  queryFiltersContainer.innerHTML = ""; // Clear any previous filters
  datasetJson.forEach((field) => {
    const filterDiv = document.createElement("div");
    filterDiv.className = "filter";
    filterDiv.innerHTML = `
        <label for="${field.fieldName}">${field.fieldName}</label>
        <input type="text" id="${field.fieldName}" name="${field.fieldName}" placeholder="Filter by ${field.fieldName}" />
      `;
    queryFiltersContainer.appendChild(filterDiv);
  });
  fetchAndRenderData(DBName, datasetJson, query);
} // showQueryResultModal



// Render the paginated grid
function renderPaginatedGrid(data, fields) {
  const grid = document.getElementById("queryResultGrid");
  grid.innerHTML = ""; // Clear previous grid content

  // Calculate start and end indices for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  // Apply styling for grid size and scroll behavior
  grid.style.maxHeight = "80vh";
  grid.style.overflowY = "auto";

  // Create Header Row
  const headerRow = document.createElement("div");
  headerRow.className = "grid-header";
  fields.forEach((field) => {
    const cell = document.createElement("div");
    cell.className = "grid-cell-header";
    cell.textContent = field;
    headerRow.appendChild(cell);
  });
  grid.appendChild(headerRow);

  // Create Data Rows for Current Page
  for (let i = startIndex; i < endIndex; i++) {
    const row = data[i];
    const dataRow = document.createElement("div");
    dataRow.className = `grid-row ${i % 2 === 0 ? "even-row" : "odd-row"}`; // Alternate row color
    dataRow.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Row clicked:", row);
      console.log("Fields:", fields);
      console.log("First field value:", row[fields[0].toUpperCase()]);
      selectedRowValue = row[fields[0].toUpperCase()]; // Set the first column value as selected
      // Highlight selected row
      Array.from(grid.querySelectorAll(".grid-row")).forEach((r) => {
        r.classList.remove("selected-row");
      });
      dataRow.classList.add("selected-row");
    });
    // get row value
    values = Object.values(row);
    fields.forEach((field, index) => {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.textContent = values[index] || ""; // Display data or empty string if null
      dataRow.appendChild(cell);
    });
    grid.appendChild(dataRow);
  } // for rows
}  // renderPaginatedGrid

// Update Pagination Controls
function updatePaginationControls(datasetJson) {
  const currentPageSpan = document.getElementById("currentPage");
  currentPageSpan.textContent = `Page: ${currentPage}`;


  // Add Pagination Button Event Listeners
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  prevPageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
      updatePaginationControls(datasetJson);
    }
  });

  nextPageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < Math.ceil(filteredData.length / pageSize)) {
      currentPage++;
      renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
      updatePaginationControls(datasetJson);
    }
  });

  // Add Apply Filter Button Listener
  const applyFilterBtn = document.getElementById("applyQueryFilterBtn");
  applyFilterBtn.onclick = applyFilter;



}  // updatePaginationControls

async function fetchQueryData(DBName, query) {
  try {
    const url = `/query-data/${DBName}/${encodeURIComponent(query)}`;
    const response = await apiFetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch query data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching query data:", error);
    return [];
  }
}

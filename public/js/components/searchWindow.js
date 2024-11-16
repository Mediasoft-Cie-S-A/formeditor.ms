/*
 * Modal Component to Display Query Results in a Grid with Client-Side Pagination, Multi-Field Filtering, and Selection
 */

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
    document.body.appendChild(modal);
  
    // Modal Content
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modal.appendChild(modalContent);
  
    // Modal Header
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.innerHTML = `
      <h2>Query Result</h2>
      <button id="closeQueryModalBtn" class="close-modal-btn">&times;</button>
    `;
    modalContent.appendChild(modalHeader);
  
    // Modal Body for Filters and Grid
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
  
    // Filter Section
    const filterSection = document.createElement("div");
    filterSection.className = "filter-section";
    filterSection.innerHTML = `
      <h4>Filters</h4>
      <div id="queryFilters" class="filters"></div>
      <button id="applyQueryFilterBtn" class="apply-filter-btn">Apply Filter</button>
    `;
    modalBody.appendChild(filterSection);
  
    // Grid Section
    const gridSection = document.createElement("div");
    gridSection.className = "grid-section";
    gridSection.innerHTML = `
      <h4>Query Result Grid</h4>
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
    modalFooter.innerHTML = `
      <button id="modalOkBtn" class="modal-ok-btn">OK</button>
      <button id="modalCloseBtn" class="modal-close-btn">Close</button>
    `;
    modalContent.appendChild(modalFooter);
  
    // Close Button Logic (Header Close)
    const closeModalBtn = modalHeader.querySelector("#closeQueryModalBtn");
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    // Close Button Logic (Footer Close)
    const modalCloseBtn = modalFooter.querySelector("#modalCloseBtn");
    modalCloseBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    return modal;
  }
  
  function showQueryResultModal(DBName, datasetJson, query,parentid) {
    // Pagination State
    let currentPage = 1;
    const pageSize = 5; // Rows per page
    let allData = []; // To hold all fetched data
    let filteredData = []; // To hold filtered data
    let selectedRowValue = null;
  
    // Ensure modal is created
    const modal = createQueryResultModal();
    modal.style.display = "block";
  
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
  
    // Fetch Data Once and Paginate on the Client
    async function fetchAndRenderData() {
      // Fetch all data from the backend (no filtering yet)
      allData = await fetchQueryData(DBName, query);
  
      // Initially, all data is unfiltered
      filteredData = [...allData];
  
      // Render the first page of data
      renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
      updatePaginationControls();
    }
  
    // Apply Filter Logic
    function applyFilter() {
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
      updatePaginationControls();
    }
  
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
      headerRow.className = "grid-row header-row";
      fields.forEach((field) => {
        const cell = document.createElement("div");
        cell.className = "grid-cell header-cell";
        cell.textContent = field;
        headerRow.appendChild(cell);
      });
      grid.appendChild(headerRow);
  
      // Create Data Rows for Current Page
      for (let i = startIndex; i < endIndex; i++) {
        const row = data[i];
        const dataRow = document.createElement("div");
        dataRow.className = `grid-row ${i % 2 === 0 ? "even-row" : "odd-row"}`; // Alternate row color
        dataRow.addEventListener("click", () => {
          selectedRowValue = row[fields[0]]; // Set the first column value as selected
          // Highlight selected row
          Array.from(grid.querySelectorAll(".grid-row")).forEach((r) => {
            r.classList.remove("selected-row");
          });
          dataRow.classList.add("selected-row");
        });
  
        fields.forEach((field) => {
          const cell = document.createElement("div");
          cell.className = "grid-cell";
          cell.textContent = row[field] || ""; // Display data or empty string if null
          dataRow.appendChild(cell);
        });
  
        grid.appendChild(dataRow);
      }
    }
  
    // Update Pagination Controls
    function updatePaginationControls() {
      const currentPageSpan = document.getElementById("currentPage");
      currentPageSpan.textContent = `Page: ${currentPage}`;
    }
  
    // Add Pagination Button Event Listeners
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
  
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
        updatePaginationControls();
      }
    });
  
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < Math.ceil(filteredData.length / pageSize)) {
        currentPage++;
        renderPaginatedGrid(filteredData, datasetJson.map((d) => d.fieldName));
        updatePaginationControls();
      }
    });
  
    // Add Apply Filter Button Listener
    const applyFilterBtn = document.getElementById("applyQueryFilterBtn");
    applyFilterBtn.onclick = applyFilter;
  
    // OK Button Logic
    const modalOkBtn = document.getElementById("modalOkBtn");
    modalOkBtn.onclick = () => {
      console.log("Selected Row Value:", selectedRowValue);
      modal.style.display = "none"; // Close the modal
      // get input element
        var inputElement = document.getElementById(parentid);
        // if the input is not found, return
        if (!inputElement) {
            return;
        }
        // if the input is disabled, ou readonly, show toast maeessage and return
        if (inputElement.disabled || inputElement.readOnly) {
            showToast("Input is disabled or readonly");
            return;
        }else{
            // set the value of the input element
            inputElement.value = selectedRowValue;
        };
       
    };
  
    // Initial Data Fetch
    fetchAndRenderData();
  }
  
  async function fetchQueryData(DBName, query) {
    try {
      const url = `/query-data/${DBName}/${encodeURIComponent(query)}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch query data");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching query data:", error);
      return [];
    }
  }
  
// divs-test JavaScript file

// Import the Overlapping Event Manager
import ColumnObserver, {COLORS} from './event-manager.js';

const allEventsByClass = document.querySelectorAll('.event');
const rawColumns = document.querySelectorAll('.box');
const columns = Array.from(rawColumns).filter(column =>
  column.id.startsWith('column'),
);

const columnObserver = new ColumnObserver();

// register columns in columnObserver
columnObserver.initializeColumns(columns);

// register listeners
document.addEventListener('DOMContentLoaded', handleColumnListeners);
window.addEventListener('resize', handleWindowResize);
allEventsByClass.forEach(el => attachDraggingHandlers(el));

// Initialize overlapping groups
columnObserver.refreshLayout();

// handlers of events
function handleColumnListeners() {
  rawColumns.forEach(column => {
    column.addEventListener('mouseenter', function () {
      this.style.backgroundColor = COLORS.HOVER_BLUE;
      this.style.color = COLORS.DEFAULT;
    });

    // Mouse leave - restore original background color
    column.addEventListener('mouseleave', function () {
      this.style.backgroundColor = COLORS.DEFAULT; // Reset to original
      this.style.color = COLORS.DEFAULT;
    });
  });
}

function handleWindowResize() {
  allEventsByClass.forEach(el => {
    // Find which column the element is currently in
    const currentColumn = detectHoveredColumn(el);
    if (currentColumn) {
      // Reposition and resize the element to fit the column
      columnObserver.centerDraggedElementInColumn(currentColumn, el);
      columnObserver.fitElementToColumn(el, currentColumn);
    } else {
      // If not in any column, default to first column
      columnObserver.centerDraggedElementInColumn(rawColumns[0], el);
      columnObserver.fitElementToColumn(el, rawColumns[0]);
    }

    // Update the drag function's initial positions for this element
    // We need to access the drag function's updateInitialPositions
    if (el._dragUpdateInitialPositions) el._dragUpdateInitialPositions();
  });

  // Refresh layout for all columns after resize
  columnObserver.refreshLayout();
}

// attach some handlers to the element
function attachDraggingHandlers(box) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;
  let hasMoved = false; // Track if mouse has actually moved
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag

  // Function to update initial positions
  function updateInitialPositions() {
    initialLeft = box.offsetLeft; // from parrent div, padding included
    initialTop = box.offsetTop;
  }

  // Initialize initialLeft with current position
  updateInitialPositions();

  // Expose the update function so it can be called after resize
  box._dragUpdateInitialPositions = updateInitialPositions;

  box.onmousedown = dragMouseDown;

  const currentHoveredCol = detectHoveredColumn(box);
  if (currentHoveredCol) columnObserver.addEventToColumn(box, currentHoveredCol.id);

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;

    // register handlers end of movement and movement
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  let currentColumn = null;
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Check if mouse has moved enough to be considered a drag
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (totalMovement > DRAG_THRESHOLD) hasMoved = true;

    // Only update position if we've actually moved
    if (hasMoved) {
      // we add padding + movement calculation
      box.style.left = initialLeft + deltaX + 'px';
      box.style.top = initialTop + deltaY + 'px';
    }

    // Detect which column the element is hovering over
    currentColumn = detectHoveredColumn(box);
    const allColumnsExceptCurrent = columns.filter(
      column => column.id !== currentColumn.id,
    );
    if (currentColumn) {
      currentColumn.style.backgroundColor = COLORS.HOVER_BLUE;
      // set width of dragged element to the width of the current column
      allColumnsExceptCurrent.forEach(
        column => (column.style.backgroundColor = COLORS.DEFAULT),
      );
    }
  }

  function closeDragElement() {
    isDragging = false;

    if (currentColumn && hasMoved) {
      // add event to column
      const columnCameFrom = columnObserver.getColIdEvIsLoc(box.id);
      columnObserver.addEventToColumn(box, currentColumn.id);
      const toUpdate = [currentColumn.id];
      if (currentColumn.id !== columnCameFrom) toUpdate.push(columnCameFrom);
      columnObserver.refreshLayout(toUpdate);

      currentColumn.style.backgroundColor = COLORS.DEFAULT;
      // Update initialLeft to the new centered position
      initialLeft = box.offsetLeft;
      initialTop = box.offsetTop;
    } else {
      box.style.left = initialLeft + 'px';
      box.style.top = initialTop + 'px';
    }

    // clean up
    document.onmouseup = null;
    document.onmousemove = null;
    currentColumn = null;
  }
}

// Function to detect which column the dragged element is hovering over
function detectHoveredColumn(elmnt) {
  const draggedRect = elmnt.getBoundingClientRect();
  const draggedCenterX = draggedRect.left + draggedRect.width / 2;

  // Get all boxes except the dragged element itself
  const columnBoxes = Array.from(rawColumns).filter(
    column => column.id !== elmnt.id,
  );

  for (let i = 0; i < columnBoxes.length; i++) {
    const boxRect = columnBoxes[i].getBoundingClientRect();

    // Check if the center of the dragged element is within this column
    if (draggedCenterX >= boxRect.left && draggedCenterX <= boxRect.right) {
      // verify top bottom of dragged element is within the column
      const draggedTop = draggedRect.top;
      const draggedBottom = draggedRect.bottom;
      const columnTop = boxRect.top;
      const columnBottom = boxRect.bottom;
      if (draggedTop >= columnTop && draggedBottom <= columnBottom) {
        return columnBoxes[i];
      }
    }
  }
  return null;
}

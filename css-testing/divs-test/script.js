// divs-test JavaScript file

// Color constants
const COLORS = {
  HOVER_BLUE: '#3498db',
  DEFAULT: '', // Reset to original
};

/**
 * Stores event data for each column, including their positions and references.
 *
 * @typedef {Object} OverlappingEvent
 * @property {number} top - The top position of the event (in pixels).
 * @property {number} bottom - The bottom position of the event (in pixels).
 * @property {string} id - The unique identifier for the event.
 * @property {Event} event - The event DOM element.
 */

/**
 * @type {Object.<string, OverlappingEvent[]>}
 * @description
 * An object where each key is a column ID and the value is an array of OverlappingEvent objects.
 * Example:
 * {
 *   columnId: [
 *     { top: 10, bottom: 50, id: 'event1', event: HTMLElement },
 *     { top: 60, bottom: 100, id: 'event2', event: HTMLElement }
 *   ]
 * }
 */
const columnObserver = {
  /**
   * @type {Object.<string, Object<string, string[]>>}
   * @private
   * @description
   * Internal storage for overlapped event groups by column.
   * Each key is a column ID, and the value is an object where each property is an array of event IDs that overlap.
   * Example:
   * {
   *   columnId: {
   *     ids: ['event1', 'event2'],
   *     ano: ['event3', 'event4', 'event5']
   *   }
   * }
   */
  _overlappedEvents: {},
};

const oem = {};
oem.addEventToColumn = function (event, column) {
  const rect = event.getBoundingClientRect();
  oem.removeEventFromColumns(event);
  columnObserver[column.id].push({
    top: rect.top,
    bottom: rect.bottom,
    id: event.id,
    event: event,
  });

  // Check for overlaps and get wrapper dimensions if needed
  const overlappingIds = oem.getOverlappingEventsFromColumn(
    event.id,
    column.id,
  );
  if (overlappingIds) {
    // Add the current event to the overlapping group
    const allOverlappingIds = [...overlappingIds, event.id];
    oem.addToOverlapped(column.id, allOverlappingIds);
  }

  console.log('When added: ', JSON.stringify(columnObserver, null, 2));
};

oem.removeEventFromColumns = function (event) {
  Object.keys(columnObserver)
    .filter(key => key.startsWith('column'))
    .forEach(key => {
      const columnEvents = columnObserver[key];
      if (columnEvents) {
        const eventIndex = columnEvents.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          // Remove from overlap management before removing from column
          oem.removeFromOverlapped(event.id);
          // Remove from column events
          columnObserver[key] = columnEvents.filter(e => e.id !== event.id);
        }
      }
    });
};

oem.getAllOverlappedGroups = function () {
  return Object.values(columnObserver._overlappedEvents)
    .map(group => Object.values(group))
    .flat();
};

oem.get3CharId = function () {
  // get all ids present inside _overlappedEvents
  const existingIds = new Set();
  Object.values(columnObserver._overlappedEvents).forEach(columnGroups => {
    Object.keys(columnGroups).forEach(groupId => {
      existingIds.add(groupId);
    });
  });

  // create unique id
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newId;
  do {
    newId = '';
    for (let i = 0; i < 3; i++) {
      newId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingIds.has(newId));

  // return id
  return newId;
};

oem.addToOverlapped = function (cId, eIds) {
  // get overlappedEvents
  if (!columnObserver._overlappedEvents[cId]) {
    columnObserver._overlappedEvents[cId] = {};
  }

  // check if any of those eIds are present there
  const existingGroups = Object.entries(columnObserver._overlappedEvents[cId]);
  const groupsToRemove = [];

  existingGroups.forEach(([groupId, groupEventIds]) => {
    const hasOverlap = eIds.some(eId => groupEventIds.includes(eId));
    if (hasOverlap) {
      groupsToRemove.push(groupId);
    }
  });

  // if there are present remove this whole property that stores them
  groupsToRemove.forEach(groupId => {
    delete columnObserver._overlappedEvents[cId][groupId];
  });

  // append new id with new eIds
  const newGroupId = oem.get3CharId();
  columnObserver._overlappedEvents[cId][newGroupId] = eIds;
};

oem.removeFromOverlapped = function (eId) {
  // else search for path where it is located
  Object.keys(columnObserver._overlappedEvents).forEach(cId => {
    const columnGroups = columnObserver._overlappedEvents[cId];
    Object.keys(columnGroups).forEach(groupId => {
      // basic check remove all empty groups
      const eventIds = columnGroups[groupId].filter(id => id !== eId);
      if (eventIds.length <= 1)
        delete columnObserver._overlappedEvents[cId][groupId];
      else columnObserver._overlappedEvents[cId][groupId] = eventIds;
    });

    // if column has no groups remove it
    if (!Object.keys(columnGroups).length)
      delete columnObserver._overlappedEvents[cId];
  });
};

oem.getOverlappingEventsFromColumn = function (eId, columnId) {
  // get column id events
  const columnEvents = columnObserver[columnId] || [];
  const targetEvent = columnEvents.find(e => e.id === eId);

  if (!targetEvent) return undefined;

  // iterate over them and if cross return all event Id it crosses with
  const overlappingIds = [];
  columnEvents.forEach(event => {
    if (event.id !== eId) {
      // Check if events overlap vertically
      const overlaps = !(
        targetEvent.bottom <= event.top || targetEvent.top >= event.bottom
      );
      if (overlaps) {
        overlappingIds.push(event.id);
      }
    }
  });

  // return output is undefined when ok or array of strings
  return overlappingIds.length > 0 ? overlappingIds : undefined;
};

oem.getEventById = function (eventId) {
  return Object.values(columnObserver)
    .flat()
    .find(e => e.id === eventId);
};

oem.getColIdEvIsLoc = function (eId) {
  const columns = Object.keys(columnObserver);
  const column = columns.find(c =>
    Object.values(columnObserver[c])
      .flat()
      .some(ev => ev.id === eId),
  );
  return column;
};

const allEventsByClass = document.querySelectorAll('.event');

const rawColumns = document.querySelectorAll('.box');
const columns = Array.from(rawColumns).filter(column =>
  column.id.startsWith('column'),
);

// register columns in columnObserver
columns.forEach(column => (columnObserver[column.id] = []));
console.log(JSON.stringify(columnObserver, null, 2));

// register listeners
document.addEventListener('DOMContentLoaded', handleColumnListeners);
window.addEventListener('resize', handleWindowResize);
allEventsByClass.forEach(el => attachDraggingHandlers(el));

// Initialize overlapping groups
const groups = oem.getAllOverlappedGroups();
groups.forEach(el => updateWidthOfElements(el, columns[0]));

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
      centerDraggedElementInColumn(currentColumn, el);
      fitElementToColumn(el, currentColumn);
    } else {
      // If not in any column, default to first column
      centerDraggedElementInColumn(rawColumns[0], el);
      fitElementToColumn(el, rawColumns[0]);
    }

    // Update the drag function's initial positions for this element
    // We need to access the drag function's updateInitialPositions
    if (el._dragUpdateInitialPositions) el._dragUpdateInitialPositions();
  });
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
  if (currentHoveredCol) oem.addEventToColumn(box, currentHoveredCol);

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
      const columnCameFrom = oem.getColIdEvIsLoc(box.id);
      oem.addEventToColumn(box, currentColumn);
      const toUpdate = [currentColumn.id];
      if (currentColumn.id !== columnCameFrom) toUpdate.push(columnCameFrom);
      getOverlapsAndUpdateWidth(toUpdate);

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

// helper functions
function centerDraggedElementInColumn(column, element) {
  const left = column.offsetLeft + 'px';
  element.style.left = left;
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

// fit elements to column
function fitElementToColumn(element, column) {
  const columnWidth = column.getBoundingClientRect().width;
  element.style.width = columnWidth + 'px';
}

function getOverlapsAndUpdateWidth(arrayOfCols) {
  arrayOfCols.forEach(columnId => {
    const eventsInColumn = columnObserver[columnId];
    // get left offset of column
    // get overlapped events
    const checkEvents = [];
    eventsInColumn.forEach(event => {
      if (checkEvents.flat().includes(event.id)) return;

      const overlaps = oem.getOverlappingEventsFromColumn(event.id, columnId);
      if (overlaps) {
        const overlapss = overlaps.concat(event.id);
        // sort by left offset
        const sorted = overlapss.sort(
          (a, b) =>
            oem.getEventById(a).event.getBoundingClientRect().left -
            oem.getEventById(b).event.getBoundingClientRect().left,
        );
        checkEvents.push(sorted);
      } else checkEvents.push([event.id]);
    });

    checkEvents.forEach(gr =>
      updateWidthOfElements(
        gr,
        columns.find(col => col.id === columnId),
      ),
    );
  });
}

function updateWidthOfElements(elements, column) {
  const numberOfElements = elements.length;
  const columnWidth = column.getBoundingClientRect().width;
  const columnOffset = column.offsetLeft; // Use offsetLeft instead of getBoundingClientRect().left

  // calculate left offset of elements
  elements.forEach((id, idx) => {
    const elementDom = oem.getEventById(id).event;
    const offset = idx * (columnWidth / numberOfElements) + columnOffset;
    elementDom.style.width = columnWidth / numberOfElements + 'px';
    elementDom.style.left = offset + 'px';

    elementDom._dragUpdateInitialPositions();
  });
}

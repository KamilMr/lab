/**
 * Overlapping Event Manager (OEM)
 * Handles event positioning, overlap detection, and layout management
 */

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
 */
const columnObserver = {
  /**
   * @type {Object.<string, Object<string, string[]>>}
   * @private
   * @description
   * Internal storage for overlapped event groups by column.
   */
  _overlappedEvents: {},
};

// Create the OEM object
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

oem._updateWidthOfElements = function (elements, column) {
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

// Unified layout refresh function
oem.refreshLayout = function (
  columnIds = Object.keys(columnObserver).filter(c => !c.startsWith('_')),
) {
  columnIds.forEach(columnId => {
    const eventsInColumn = columnObserver[columnId];
    if (!eventsInColumn) return;

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

    checkEvents.forEach(gr => {
      // Find the column element by ID
      const columnElement = document.querySelector(`#${columnId}`);
      if (columnElement) {
        oem._updateWidthOfElements(gr, columnElement);
      }
    });
  });
};

// helper functions
oem._centerDraggedElementInColumn = function (column, element) {
  const left = column.offsetLeft + 'px';
  element.style.left = left;
};

// fit elements to column
oem._fitElementToColumn = function (element, column) {
  const columnWidth = column.getBoundingClientRect().width;
  element.style.width = columnWidth + 'px';
};

// Initialize columns in columnObserver
oem.initializeColumns = function (columns) {
  columns.forEach(column => (columnObserver[column.id] = []));
  console.log(JSON.stringify(columnObserver, null, 2));
};

// Export the OEM module
export {oem, COLORS};

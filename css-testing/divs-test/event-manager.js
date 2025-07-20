/**
 * Overlapping Event Manager (OEM)
 * Handles event positioning, overlap detection, and layout management
 */

// Color constants
const COLORS = {
  HOVER_BLUE: '#3498db',
  DEFAULT: '', // Reset to original
};

export default class ColumnObserver {
  constructor() {
    this.columns = {};
    this.overlappedEvents = {};
  }

  addColumn(column) {
    this.columns[column.id] = [];
  }

  removeColumn(columnId) {
    delete this.columns[columnId];
  }

  addEventToColumn(event, columnId) {
    const rect = event.getBoundingClientRect();
    this.removeEventFromColumns(event);
    this.columns[columnId].push({
      top: rect.top,
      bottom: rect.bottom,
      id: event.id,
      event: event,
    });

    // check for overlaps and get wrapper dimensions if needed
    const overlappingIds = this._getOverlappingEventsFromColumn(
      event.id,
      columnId,
    );
    if (overlappingIds) {
      // Add the current event to the overlapping group
      const allOverlappingIds = [...overlappingIds, event.id];
      this._addToOverlapped(columnId, allOverlappingIds);
    }

    console.log('When added: ', JSON.stringify(this.columns, null, 2));
  }

  removeEventFromColumn(eventId, columnId) {//NOTE col not exist in another impl
    this.columns[columnId] = this.columns[columnId].filter(
      event => event.id !== eventId,
    );

    // remove from overlapped events
    this._removeFromOverlapped(eventId);
  }

  // Public method to remove event from all columns (like original oem)
  removeEventFromColumns(event) {
    Object.keys(this.columns)
      .filter(key => key.startsWith('column'))
      .forEach(key => {
        const columnEvents = this.columns[key];
        if (columnEvents) {
          const eventIndex = columnEvents.findIndex(e => e.id === event.id);
          if (eventIndex !== -1) {
            // Remove from overlap management before removing from column
            this.removeFromOverlapped(event.id);
            // Remove from column events
            this.columns[key] = columnEvents.filter(e => e.id !== event.id);
          }
        }
      });
  }

  // Public method for external access (like original oem)
  getOverlappingEventsFromColumn(eId, columnId) {
    return this._getOverlappingEventsFromColumn(eId, columnId);
  }

  // Public method for external access (like original oem)
  addToOverlapped(cId, eIds) {
    return this._addToOverlapped(cId, eIds);
  }

  // Public method for external access (like original oem)
  removeFromOverlapped(eId) {
    return this._removeFromOverlapped(eId);
  }

  // Public method for external access (like original oem)
  get3CharId() {
    return this._get3CharId();
  }

  _removeFromOverlapped(eId) {
    Object.keys(this.overlappedEvents).forEach(cId => {
      const columnGroups = this.overlappedEvents[cId];
      Object.keys(columnGroups).forEach(groupId => {
        const eventIds = columnGroups[groupId].filter(id => id !== eId);

        if (eventIds.length <= 1)
          delete this.overlappedEvents[cId][groupId];
        else this.overlappedEvents[cId][groupId] = eventIds;
      });

      // if column has no groups remove it
      if (!Object.keys(columnGroups).length) delete this.overlappedEvents[cId];
    });
  }

  getColumnEvents(columnId) {
    return this.columns[columnId];
  }

  _getOverlappingEventsFromColumn(eId, columnId) {
    const columnEvents = this.columns[columnId] || [];
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
  }

  _addToOverlapped(cId, eIds) {
    if (!this.overlappedEvents[cId]) {
      this.overlappedEvents[cId] = {};
    }

    // check if any of those eIds are present there
    const existingGroups = Object.entries(this.overlappedEvents[cId]);
    const groupsToRemove = [];

    existingGroups.forEach(([groupId, groupEventIds]) => {
      const hasOverlap = eIds.some(eId => groupEventIds.includes(eId));
      if (hasOverlap) {
        groupsToRemove.push(groupId);
      }
    });

    // if there are present remove this whole property that stores them
    groupsToRemove.forEach(groupId => {
      delete this.overlappedEvents[cId][groupId];
    });

    // append new id with new eIds
    const newGroupId = this._get3CharId();
    this.overlappedEvents[cId][newGroupId] = eIds;
  }

  _get3CharId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const existingIds = new Set();
    Object.values(this.overlappedEvents).forEach(columnGroups => {
      Object.keys(columnGroups).forEach(groupId => {
        existingIds.add(groupId);
      });
    });

    let newId;
    do {
      newId = '';
      for (let i = 0; i < 3; i++) {
        newId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (existingIds.has(newId));

    return newId;
  }

  getAllOverlappedGroups() {
    return Object.values(this.overlappedEvents)
      .map(group => Object.values(group))
      .flat();
  }

  getEventById(eventId) {
    return Object.values(this.columns)
      .flat()
      .find(e => e.id === eventId);
  }

  getColIdEvIsLoc(eId) {
    const columns = Object.keys(this.columns);
    const column = columns.find(c =>
      Object.values(this.columns[c] || [])
        .flat()
        .some(ev => ev.id === eId),
    );
    return column;
  }

  _updateWidthOfElements(elements, column) {
    const numberOfElements = elements.length;
    const columnWidth = column.getBoundingClientRect().width;
    const columnOffset = column.offsetLeft;

    // calculate left offset of elements
    elements.forEach((id, idx) => {
      const elementDom = this.getEventById(id).event;
      const offset = idx * (columnWidth / numberOfElements) + columnOffset;
      elementDom.style.width = columnWidth / numberOfElements + 'px';
      elementDom.style.left = offset + 'px';

      elementDom._dragUpdateInitialPositions();
    });
  }

  refreshLayout(columnIds = Object.keys(this.columns).filter(c => !c.startsWith('_'))) {
    columnIds.forEach(columnId => {
      const eventsInColumn = this.columns[columnId];
      if (!eventsInColumn) return;

      // get overlapped events
      const checkEvents = [];
      eventsInColumn.forEach(event => {
        if (checkEvents.flat().includes(event.id)) return;

        const overlaps = this._getOverlappingEventsFromColumn(event.id, columnId);
        if (overlaps) {
          const overlapss = overlaps.concat(event.id);
          // sort by left offset
          const sorted = overlapss.sort(
            (a, b) =>
              this.getEventById(a).event.getBoundingClientRect().left -
              this.getEventById(b).event.getBoundingClientRect().left,
          );
          checkEvents.push(sorted);
        } else checkEvents.push([event.id]);
      });

      checkEvents.forEach(gr => {
        // Find the column element by ID
        const columnElement = document.querySelector(`#${columnId}`);
        if (columnElement) {
          this._updateWidthOfElements(gr, columnElement);
        }
      });
    });
  }

  _centerDraggedElementInColumn(column, element) {
    const left = column.offsetLeft + 'px';
    element.style.left = left;
  }

  _fitElementToColumn(element, column) {
    const columnWidth = column.getBoundingClientRect().width;
    element.style.width = columnWidth + 'px';
  }

  initializeColumns(columns) {
    columns.forEach(column => (this.columns[column.id] = []));
    console.log(JSON.stringify(this.columns, null, 2));
  }

  // Public method for external access (like original oem)
  centerDraggedElementInColumn(column, element) {
    return this._centerDraggedElementInColumn(column, element);
  }

  // Public method for external access (like original oem)
  fitElementToColumn(element, column) {
    return this._fitElementToColumn(element, column);
  }

  // Public method for external access (like original oem)
  updateWidthOfElements(elements, column) {
    return this._updateWidthOfElements(elements, column);
  }
}
export {COLORS};

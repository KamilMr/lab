// divs-test JavaScript file

// Color constants
const COLORS = {
    HOVER_BLUE: '#3498db',
    WHITE: 'white',
    DEFAULT: '' // Reset to original
};

const overlappingEvents = {};

const allEventsByClass = document.querySelectorAll('.event');

const rawColumns = document.querySelectorAll('.box');
const columns = Array.from(rawColumns).filter(column => column.id.startsWith('column'));
const rawContainer = document.querySelector('.container');
const container = Array.from(rawContainer)[0];

columns.forEach(column => overlappingEvents[column.id] = []);
console.log(JSON.stringify(overlappingEvents, null, 2))

document.addEventListener('DOMContentLoaded', handleColumnListeners);
window.addEventListener('resize', handleWindowResize);
allEventsByClass.forEach(el => fitElementToColumn(el, rawColumns[0]));
allEventsByClass.forEach(el => dragElement(el));


// Change background color when mouse is over box
function handleColumnListeners() {
    rawColumns.forEach(column => {
        column.addEventListener('mouseenter', function() {
            this.style.backgroundColor = COLORS.HOVER_BLUE;
            this.style.color = COLORS.WHITE;
            // console.log('whatColumnIsOn', this.id);
        });

        // Mouse leave - restore original background color
        column.addEventListener('mouseleave', function() {
            this.style.backgroundColor = COLORS.DEFAULT; // Reset to original
            this.style.color = COLORS.DEFAULT;
        });
    });
}

function dragElement(elmnt) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let hasMoved = false; // Track if mouse has actually moved
    const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag

    // Function to update initial positions
    function updateInitialPositions() {
        initialLeft = elmnt.offsetLeft;
        initialTop = elmnt.offsetTop;
    }

    // Initialize initialLeft with current position
    updateInitialPositions();

    // Expose the update function so it can be called after resize
    elmnt._dragUpdateInitialPositions = updateInitialPositions;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        // Don't reset initialLeft here - keep the persistent value
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
        if (totalMovement > DRAG_THRESHOLD) {
            hasMoved = true;
        }

        // Only update position if we've actually moved
        if (hasMoved) {
            elmnt.style.left = (initialLeft + deltaX) + "px";
            elmnt.style.top = (initialTop + deltaY) + "px";
        }

        // Detect which column the element is hovering over
        currentColumn = detectHoveringColumn(elmnt);
        const allColumnsExceptCurrent = Array.from(rawColumns).filter(column => column.id !== currentColumn.id);
        if (currentColumn) {
            currentColumn.style.backgroundColor = COLORS.HOVER_BLUE;
            // set width of dragged element to the width of the current column
            allColumnsExceptCurrent.forEach(column => column.style.backgroundColor = COLORS.DEFAULT);
        }
    }

    function closeDragElement() {
        isDragging = false;

        if (currentColumn && hasMoved) {
            centerDraggedElementInColumn(currentColumn, elmnt);
            currentColumn.style.backgroundColor = COLORS.DEFAULT;
            // Update initialLeft to the new centered position
            initialLeft = elmnt.offsetLeft;
            initialTop = elmnt.offsetTop;
        } else {
            elmnt.style.left = initialLeft + "px";
            elmnt.style.top = initialTop + "px";
        }

        // clean up
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function centerDraggedElementInColumn(column, element) {
    const left = column.offsetLeft + "px";
    element.style.left = left;
}

// Function to detect which column the dragged element is hovering over
function detectHoveringColumn(elmnt) {
    const draggedRect = elmnt.getBoundingClientRect();
    const draggedCenterX = draggedRect.left + draggedRect.width / 2;

    // Get all boxes except the dragged element itself
    const columnBoxes = Array.from(rawColumns).filter(column => column.id !== elmnt.id);

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
    return 0;
}

function handleWindowResize () {
    allEventsByClass.forEach(el => {
        // Find which column the element is currently in
        const currentColumn = detectHoveringColumn(el);
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

// fit elements to column
function fitElementToColumn(element, column) {
    const columnWidth = column.getBoundingClientRect().width;
    element.style.width = columnWidth + "px";
}

function addEventToColumn(event, column) {
    overlappingEvents[column.id].push(event);
}

function removeEventFromColumn(event, column) {
    overlappingEvents[column.id] = overlappingEvents[column.id].filter(e => e !== event);
}

function checkForOverlappingEvents(event, column) {
    const eventRect = event.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return eventRect.left < columnRect.right && eventRect.right > columnRect.left && eventRect.top < columnRect.bottom && eventRect.bottom > columnRect.top;
}


var rootUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/691867/';
    var assetUrl = rootUrl;
    var graphicUrl = rootUrl + 'elevator.archer.graphic.svg';
    var configUrl = rootUrl + 'elevator.archer.config.json';
    var container = document.getElementById('container');
    var graphic = archer.create(container);
    graphic.document.setAssetRoot(assetUrl);
    graphic.loadUrl(graphicUrl, configUrl);

    graphic.on('ready', function () {

        graphic.view.zoomToFit(false);

        graphic.view.enableMouse(true, true);

        initGraphic();

    });

    var CABIN_SPEED = 3.5; // m/s
    var FLOOR_HEIGHT = 4; // m
    var FLOOR_COUNT = 6;
    var DOOR_OPEN_TIME = 2; // s
    var DOOR_DELAY_TIME = 0.5; //s

    var floors = [FLOOR_COUNT];
    for (var i = 0; i < FLOOR_COUNT; i++) {

        floors[i] = {};
        floors[i].selected = false;
    }

    var moving = false;
    var moveUp = false;
    var lastHeight = 0;
    var lastFloorIndex = 0;
    var cabinStopTime;


    var doorsAnimationRunning = false;
    var doorsAnimationDone = true;
    var doorsOpeningTime;
    var doorsClosingTime;
    var cabinStartTime;

    var people = [4];
    people[0] = {weight: 92, visible: true};
    people[1] = {weight: 61, visible: true};
    people[2] = {weight: 78, visible: true};
    people[3] = {weight: 52, visible: true};


    var lastMillis = Date.now();
    loop();

    function initGraphic() {
        togglePerson(2);
        updateWeight();
        graphic.setValue('current_speed', '0 m/s');
        graphic.setValue('current_height', '0 m');
    }

    function executeDoorsAnimation() {
var rootUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/691867/';


    var assetUrl = rootUrl;
    var graphicUrl = rootUrl + 'elevator.archer.graphic.svg';
    var configUrl = rootUrl + 'elevator.archer.config.json';
    var container = document.getElementById('container');
    var graphic = archer.create(container);
    graphic.document.setAssetRoot(assetUrl);
    graphic.loadUrl(graphicUrl, configUrl);

    graphic.on('ready', function () {

        graphic.view.zoomToFit(false);

        graphic.view.enableMouse(true, true);

        initGraphic();

    });

    var CABIN_SPEED = 3.5; // m/s
    var FLOOR_HEIGHT = 4; // m
    var FLOOR_COUNT = 6;
    var DOOR_OPEN_TIME = 2; // s
    var DOOR_DELAY_TIME = 0.5; //s

    var floors = [FLOOR_COUNT];
    for (var i = 0; i < FLOOR_COUNT; i++) {

        floors[i] = {};
        floors[i].selected = false;
    }

    var moving = false;
    var moveUp = false;
    var lastHeight = 0;
    var lastFloorIndex = 0;
    var cabinStopTime;


    var doorsAnimationRunning = false;
    var doorsAnimationDone = true;
    var doorsOpeningTime;
    var doorsClosingTime;
    var cabinStartTime;

    var people = [4];
    people[0] = {weight: 92, visible: true};
    people[1] = {weight: 61, visible: true};
    people[2] = {weight: 78, visible: true};
    people[3] = {weight: 52, visible: true};


    var lastMillis = Date.now();
    loop();

    function initGraphic() {
        togglePerson(2);
        updateWeight();
        graphic.setValue('current_speed', '0 m/s');
        graphic.setValue('current_height', '0 m');
    }

    function executeDoorsAnimation() {
} else {

                var currentFloor = Math.round(currentHeight / FLOOR_HEIGHT);
                if (lastFloorIndex != currentFloor) {
                    graphic.setValue('current_floor', currentFloor);
                    lastFloorIndex = currentFloor;
                }

                var cabposFact = (currentHeight / ((FLOOR_COUNT - 1) * FLOOR_HEIGHT));
                var cabpos = 6 * cabposFact;

                graphic.setValue('current_height', Math.round(currentHeight) + ' m');
                graphic.setValue('cabin_pos', cabpos);
            }

            lastHeight = currentHeight;

        } else {


            if (!doorsAnimationDone) {
                executeDoorsAnimation();
            } else {
                var nextFloorIndex = calcNextSelectedFloor();
                setMoving(nextFloorIndex >= 0);
            }
        }

        lastMillis = currentMillis;
        requestAnimationFrame(loop);
    }

    function selectFloor(floorIndex) {

        floors[floorIndex].selected = true;
        document.getElementById("btn-floor-" + floorIndex).setAttribute("class", "selected");
    }

    function deselectFloor(floorIndex) {
        floors[floorIndex].selected = false;
        document.getElementById("btn-floor-" + floorIndex).setAttribute("class", "");
    }


    function hasNextSelectedFloorReached(currentHeight) {

        var nextFloorHeight = calcNextSelectedFloor() * FLOOR_HEIGHT;

        if (moveUp && currentHeight >= nextFloorHeight) {

            return true;

        } else if (!moveUp && currentHeight <= nextFloorHeight) {

            return true;
        }
        return false;
    }

    function setMoving(value) {

        if (value == moving) return;
        moving = value;

        graphic.setValue('current_speed', (moving ? CABIN_SPEED : '0') + ' m/s');
    }

function setMoveUp(value) {

        if (value == moveUp) return;

        moveUp = value;
        graphic.setValue('move_up', moveUp);
    }

    function calcNextSelectedFloor() {

        var nextSelectedFloor = -1;

        if (moveUp) {

            nextSelectedFloor = nextSelectedUpperFloor();
            if (nextSelectedFloor < 0) {

                nextSelectedFloor = nextSelectedLowerFloor();
                if (nextSelectedFloor >= 0) {
                    setMoveUp(false);
                }
            }

        } else {

            nextSelectedFloor = nextSelectedLowerFloor();
            if (nextSelectedFloor < 0) {

                nextSelectedFloor = nextSelectedUpperFloor();
                if (nextSelectedFloor >= 0) {
                    setMoveUp(true);
                }
            }
        }
        return nextSelectedFloor;
    }

    function nextSelectedUpperFloor() {

        for (var floorIndex = lastFloorIndex; floorIndex < FLOOR_COUNT; floorIndex++) {

            if (floors[floorIndex].selected) {
                return floorIndex;
            }
        }
        return -1;
    }

    function nextSelectedLowerFloor() {

        for (var floorIndex = lastFloorIndex; floorIndex >= 0; floorIndex--) {

            if (floors[floorIndex].selected) {
                return floorIndex;
            }
        }
        return -1;
    }

    function togglePerson(personIndex) {

        people[personIndex].visible = !people[personIndex].visible;

        graphic.setValue('person_' + (personIndex+1) + '_visible', people[personIndex].visible);

        updateWeight();
    }
    function updateWeight() {

        var totalWeight = 0;
        for( var i=0; i < people.length; i++) {

            totalWeight += people[i].visible ? people[i].weight : 0;
        }
        graphic.setValue('current_weight', totalWeight + ' kg');
    }

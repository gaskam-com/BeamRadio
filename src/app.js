angular
    .module("beamng.apps")

    .constant("AI_Options", {
        // engineDebugMode: [
        //   { txt: 'Disabled',   val: 'off'    },
        //   { txt: 'NaviGraph',  val: 'graph'  },
        //   { txt: 'Visual Log', val: 'vislog' }
        // ],

        aiMode: [
            { txt: "Disabled", val: "disabled" },
            { txt: "Traffic", val: "traffic" },
            { txt: "Random", val: "random" },
            { txt: "Span", val: "span" },
            { txt: "Manual", val: "manual" },
            { txt: "Chase", val: "chase" },
            { txt: "Follow", val: "follow" },
            { txt: "Flee", val: "flee" },
            { txt: "Stopping", val: "stop" },
        ],

        vehicleDebugMode: [
            { txt: "Disabled", val: "off" },
            { txt: "Target", val: "target" },
            { txt: "Speeds", val: "speeds" },
            { txt: "Trajectory", val: "trajectory" },
            { txt: "Route", val: "route" },
        ],

        speedMode: [
            { txt: "Off", val: "off" },
            { txt: "Set", val: "set" },
            { txt: "Legal", val: "legal" },
            { txt: "Limit", val: "limit" },
        ],

        driveInLaneFlag: [
            { txt: "Off", val: "off" },
            { txt: "On", val: "on" },
        ],

        extAvoidCars: [
            { txt: "Auto", val: "auto" },
            { txt: "Off", val: "off" },
            { txt: "On", val: "on" },
        ],
    })

    .directive("beamradio", [
        "AI_Options",
        function (AI_Options) {
            return {
                templateUrl: "/ui/modules/apps/BeamRadio/app.html",
                replace: false,
                restrict: "AEC",
                scope: false,
                link: function (scope, element, attrs) {
                    // var audio = new Audio(
                    //     "http://direct.francemusique.fr/live/francemusiqueconcertsradiofrance-hifi.mp3"
                    // );
                    // audio.play();

                    var ctrl = scope.ai;
                    ctrl.populate();

                    scope.$on("AIStateChange", function (_, data) {
                        // console.log('AISTATECHANGE EVENT:', data)
                        // Same thing as in ai.getState() callback in ctrl._updateAiState() function
                        scope.$evalAsync(function () {
                            bngApi.engineLua(
                                'extensions.hook("trackAISingleVeh", ("' +
                                    data.mode +
                                    '"))'
                            );
                            ctrl.mode.value = data.mode;
                            if (data.mode.value != "manual")
                                ctrl.mapNodes.value = null;

                            ctrl.aggression.value = data.extAggression;
                            ctrl.driveInLaneFlag.value = data.driveInLaneFlag;
                            ctrl.extAvoidCars.value = data.extAvoidCars;
                            ctrl.vehicleDebugMode.value = data.debugMode;
                            ctrl.targetObjects.value = data.targetObjectID;
                            ctrl.mapNodes.value = data.manualTargetName;
                            ctrl.routeSpeed.value = Math.round(
                                data.routeSpeed * ctrl.distanceUnits.mult
                            );
                            ctrl.speedMode.value = data.speedMode;
                            ctrl.drivability.value = data.cutOffDrivability;
                        });
                    });

                    bngApi.engineLua("settings.notifyUI()");

                    scope.$on("VehicleReset", function (_, data) {
                        // console.log('VEHICLERESET EVENT:', data)
                        ctrl._updateMapState();
                    });

                    scope.$on("VehicleFocusChanged", function (_, data) {
                        // console.log('VEHICLEFOCUSCHANGED EVENT:', data)
                        ctrl._updateMapState();
                    });
                },

                controller: function ($scope, $element, $attrs) {
                    var vm = this;

                    var units = {
                        metric: { label: "km/h", mult: 3.6 },
                        imperial: { label: "mph", mult: 2.23694 },
                    };

                    vm.distanceUnits = {};

                    $scope.$on("SettingsChanged", function (event, data) {
                        $scope.$evalAsync(function () {
                            vm.distanceUnits = units[data.values.uiUnitLength];
                        });
                    });

                    vm.mode = { value: null, options: AI_Options.aiMode };
                    vm.aggression = { value: 1 };
                    vm.driveInLaneFlag = {
                        value: null,
                        options: AI_Options.driveInLaneFlag,
                    };
                    vm.extAvoidCars = {
                        value: null,
                        options: AI_Options.extAvoidCars,
                    };
                    vm.routeSpeed = { value: null };
                    vm.speedMode = {
                        value: null,
                        options: AI_Options.speedMode,
                    };
                    //vm.engineDebugMode  = {value: null, options: AI_Options.engineDebugMode}
                    vm.vehicleDebugMode = {
                        value: null,
                        options: AI_Options.vehicleDebugMode,
                    };
                    vm.mapNodes = { value: null, options: [] };
                    vm.targetObjects = { value: null, options: [] };
                    vm.drivability = { value: 0 };

                    vm.changeMode = function () {
                        var cmd = `ai.setState( ${bngApi.serializeToLua({
                            mode: vm.mode.value,
                        })} )`;
                        bngApi.activeObjectLua(cmd);
                        // console.log('changing AI mode:', cmd)
                    };

                    vm.changeAggression = function () {
                        var cmd = `ai.setAggression(${vm.aggression.value})`;
                        bngApi.activeObjectLua(cmd);
                    };

                    vm.changeCutOffDrivability = function () {
                        var cmd = `ai.setCutOffDrivability(${vm.drivability.value})`;
                        bngApi.activeObjectLua(cmd);
                        //console.log('Changed cut off drivability')
                    };

                    vm.changeLaneDriving = function () {
                        var cmd = `ai.driveInLane("${vm.driveInLaneFlag.value}")`;
                        bngApi.activeObjectLua(cmd);
                    };

                    vm.changeTrafficAwareness = function () {
                        var cmd = `ai.setAvoidCars("${vm.extAvoidCars.value}")`;
                        bngApi.activeObjectLua(cmd);
                    };

                    vm.changeSpeed = function () {
                        var siSpeed =
                            vm.routeSpeed.value / vm.distanceUnits.mult;
                        var cmd = `ai.setSpeed(${siSpeed})`;
                        bngApi.activeObjectLua(cmd);
                    };

                    vm.changeSpeedMode = function () {
                        var cmd = `ai.setSpeedMode("${vm.speedMode.value}")`;
                        bngApi.activeObjectLua(cmd);
                    };

                    // vm.changeEngineDebugMode = function () {
                    //   var cmd = `map.setDebugMode("${vm.engineDebugMode.value}")`
                    //   bngApi.engineLua(cmd)
                    // }

                    vm.changeVehicleDebugMode = function () {
                        var cmd = `ai.setVehicleDebugMode( ${bngApi.serializeToLua(
                            { debugMode: vm.vehicleDebugMode.value }
                        )} )`;
                        bngApi.activeObjectLua(cmd);
                        // console.log('change vehicle debug mode:', cmd)
                    };

                    vm.changeMapNode = function () {
                        // Although this is can only be called when in "manual" mode, we still have to re-apply
                        // the state to the Lua side (is this a bug?)
                        //vm.mode.value = 'manual'
                        //var aiModeCmd = `ai.setState( ${bngApi.serializeToLua({mode: 'manual'})} )`
                        //bngApi.activeObjectLua(aiModeCmd)

                        var cmd = `ai.setTarget("${vm.mapNodes.value}")`;
                        bngApi.activeObjectLua(cmd);
                        // console.log('change map node:', cmd)
                    };

                    vm.changeTargetObject = function () {
                        var cmd = `ai.setTargetObjectID(${vm.targetObjects.value})`;
                        bngApi.activeObjectLua(cmd);
                        // console.log('change Target:', cmd)
                    };

                    vm._updateAiState = function () {
                        bngApi.activeObjectLua("ai.getState()", (response) => {
                            // console.log('ai.getState(): ', response)
                            $scope.$evalAsync(function () {
                                vm.mode.value = response.mode;

                                if (vm.mode.value != "manual")
                                    vm.mapNodes.value = null;

                                vm.aggression.value = response.extAggression;
                                vm.driveInLaneFlag.value =
                                    response.driveInLaneFlag;
                                vm.extAvoidCars.value = response.extAvoidCars;
                                vm.vehicleDebugMode.value = response.debugMode;
                                vm.targetObjects.value =
                                    response.targetObjectID;
                                vm.mapNodes.value = response.manualTargetName;
                                vm.routeSpeed.value =
                                    response.routeSpeed * vm.distanceUnits.mult;
                                vm.speedMode.value = response.speedMode;
                                vm.drivability.value =
                                    response.cutOffDrivability;
                            });
                        });
                    };

                    vm._updateMapState = function () {
                        bngApi.engineLua("map.getState()", (response) => {
                            // console.log('map.getState(): ', response)

                            $scope.$evalAsync(function () {
                                vm.targetObjects.options = Object.keys(
                                    response.objects
                                )
                                    .filter((x) => !response.objects[x].active)
                                    .map((x) => ({
                                        id: response.objects[x].id,
                                        txt: `${response.objects[x].name}  (${response.objects[x].licensePlate}, ${x})`,
                                    }));
                                //vm.engineDebugMode.value = response.debugMode
                            });
                        });
                    };

                    vm._updateNodes = function () {
                        bngApi.engineLua("map.getMap()", (response) => {
                            // console.log('map.getMap(): ', response)
                            $scope.$evalAsync(function () {
                                vm.mapNodes.options = Object.keys(
                                    response.nodes
                                ).sort();
                            });
                        });
                    };

                    vm.populate = function () {
                        // console.log('POPULATE')
                        vm._updateAiState();
                        vm._updateMapState();
                        vm._updateNodes();
                    };
                },
                controllerAs: "ai",
            };
        },
    ]);

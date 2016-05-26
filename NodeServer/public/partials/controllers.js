(function() {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.views.controllers', [])

    //Controller page d'index : template partials/index.html
    .controller('index', ['$scope',
        function($scope) {
            console.log("INDEX");
            $scope.pageClass = 'page-index';
        }
    ])

    //Controller liste des coaches
    .controller('coaches', ['$scope', '$rootScope', '$routeParams', '$location', '$RDVBB_WS',
        function($scope, $rootScope, $routeParams, $location, $RDVB_WS) {
            $scope.pageClass = 'page-coach';
            $scope.orderByField = 'name';
            $scope.reverseSort = false;

            $RDVB_WS.coach.list($rootScope.currentEdition.edition()).then(function(data) {
                $scope.coachesList = data;
                $scope.numberOfCoachs = Object.keys(data).length;
            });
        }
    ])

    .controller('coach', ['$scope', '$rootScope', '$routeParams', '$RDVBB_WS',
        function($scope, $rootScope, $routeParams, $RDVB_WS) {
            var coachId = $routeParams.id;

            $scope.pageClass = 'page-coach';

            $RDVB_WS.coach.get(coachId).then(function(data) {
                $scope.coatch = data;
            });
        }
    ])

    .controller('teams', ['$scope', '$rootScope', '$RDVBB_WS',
        function($scope, $rootScope, $RDVB_WS, $PARAM) {

            $scope.pageClass = 'page-team';
            $scope.orderByField = 'name';
            $scope.reverseSort = false;

            $RDVB_WS.team.list($rootScope.currentEdition.edition()).then(function(data) {
                $scope.teamsList = data;
                $scope.numberOfTeams = Object.keys(data).length;
            });
        }
    ])

    .controller('team', ['$scope', '$routeParams', '$RDVBB_WS',
        function($scope, $routeParams, $RDVB_WS) {
            var teamId = $routeParams.id;

            $scope.pageClass = 'page-team';

            $scope.orderByField = 'coach';
            $scope.reverseSort = false;

            $RDVB_WS.team.get(teamId).then(function(data) {
                $scope.team = data;
            })
        }
    ])

    .controller('matchs', ['$scope', '$rootScope', '$routeParams', '$RDVBB_WS', '$PARAM',
        function($scope, $rootScope, $routeParams, $RDVB_WS, $PARAM) {
            var currentEdition = $rootScope.currentEdition;

            $scope.pageClass = 'page-match';

            $scope.orderByField = 'table';
            $scope.reverseSort = false;
            $scope.filter = $routeParams.filter;

            if ($routeParams.round != undefined) {
                $scope.round = $routeParams.round;
                $PARAM.currentRound.set($scope.round);
            } else {
                $scope.round = $PARAM.currentRound.get();
            }

            $scope.setRound = function(round) {
                $rootScope.showMatchs($scope.filter, round);
            };

            switch ($scope.filter) {
                case '2':
                    $RDVB_WS.matchs.played(currentEdition.edition(), $scope.round).then(function(data) {
                        $scope.matchsList = data;
                    });
                    break;
                case '3':
                    $RDVB_WS.matchs.toPlay(currentEdition.edition(), $scope.round).then(function(data) {
                        $scope.matchsList = data;
                    });
                    break;
                default:
                    $RDVB_WS.matchs.get(currentEdition.edition(), $scope.round).then(function(data) {
                        $scope.matchsList = data;
                    });
                    break;
            };

        }
    ])

    .controller('matchsByCoach', ['$scope', '$rootScope', '$routeParams', '$interval', '$RDVBB_WS', '$PARAM',
        function($scope, $rootScope, $routeParams, $interval, $RDVB_WS, $PARAM) {

            $scope.pageClass = 'page-match';

            function load() {
                $RDVB_WS.matchs.byCoach(currentCoachId).then(function(data) {
                    $scope.matchsList = data;
                    console.log(JSON.stringify(data));
                });
            }

            var currentEdition = $rootScope.currentEdition;
            var currentCoachId = $routeParams.id;

            $scope.orderByField = 'round';
            $scope.reverseSort = true;

            $RDVB_WS.coach.get(currentCoachId).then(function(data) {
                $scope.coatch = data;
            });

            load();

            var stop = $interval(load, 120000);
            $scope.stopFight = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };
            $scope.$on('$destroy', function() {
                // Make sure that the interval is destroyed too
                $scope.stopFight();
            });
        }
    ])

    .controller('matchsByTeam', ['$scope', '$rootScope', '$routeParams', '$interval', '$RDVBB_WS', '$PARAM',
        function($scope, $rootScope, $routeParams, $interval, $RDVB_WS, $PARAM) {

            $scope.pageClass = 'page-match';

            function load() {
                $RDVB_WS.matchs.byTeam(currentTeamId).then(function(data) {
                    $scope.matchsList = data;
                });
            }

            //var currentEdition = $rootScope.currentEdition;
            var currentTeamId = $routeParams.id;

            $scope.orderByField = 'round';
            $scope.reverseSort = true;

            $RDVB_WS.getTeam(currentTeamId).then(function(data) {
                $scope.team = data;
            });
            load();

            var stop = $interval(load, 120000);
            $scope.stopFight = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };

            $scope.$on('$destroy', function() {
                // Make sure that the interval is destroyed too
                $scope.stopFight();
            });
        }
    ])

    .controller('matchsDetailByCoach', ['$scope', '$rootScope', '$routeParams', '$interval', '$RDVBB_WS', '$PARAM',
        function($scope, $rootScope, $routeParams, $interval, $RDVB_WS, $PARAM) {

            $scope.pageClass = 'page-match';

            function load() {
                $RDVB_WS.matchs.byCoach(currentCoachId).then(function(data) {
                    $scope.matchsList = data;
                });
            }

            var currentEdition = $rootScope.currentEdition;
            var currentCoachId = $routeParams.id;

            $scope.orderByField = 'round';
            $scope.reverseSort = true;

            $scope.isFinished = function(match) {
                return match.status == 'resume';
            }

            $RDVB_WS.getCoach(currentCoachId).then(function(data) {
                $scope.coatch = data;
            });

            load();

            var stop = $interval(load, 120000);
            $scope.stopFight = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };

            $scope.$on('$destroy', function() {
                // Make sure that the interval is destroyed too
                $scope.stopFight();
            });
        }
    ]);
})();

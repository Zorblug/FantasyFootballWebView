/// <reference path="../lib/angularjs/angular.js" />
/// <reference path="./services.ws.js" />
/// <reference path="./services.parameters.js" />
/// <reference path="./controllers.js" />
/// <reference path="../partials/controllers.js" />
/// <reference path="../partials/controllers.js" />


(function() {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.App', 
        ['ngRoute',
        'ngAnimate',
        'anguFixedHeaderTable',
        'TisseursDeChimeres.RDVBB.services.ws',
        'TisseursDeChimeres.RDVBB.services.parameters',
        'TisseursDeChimeres.RDVBB.controllers',
        'TisseursDeChimeres.RDVBB.views.controllers',
        'TisseursDeChimeres.RDVBB.views.coaches.rankings.controller',
        'TisseursDeChimeres.RDVBB.views.teams.rankings.controller',
        'TisseursDeChimeres.RDVBB.directives.translation'
    ])

    .config(['$routeProvider',
        function($routeProvider) {

            function init($TRANSLATE) {
                return $TRANSLATE.wait();
            }

            init.$inject = ['$TRANSLATE'];

            $routeProvider
                .when('/', {
                    templateUrl: 'partials/index.html',
                    controller: 'index',
                    resolve: {
                        func: init
                    }
                })

            .when('/coaches', {
                templateUrl: 'partials/coaches.html',
                controller: 'coaches',
                resolve: {
                    func: init
                }
            })

            .when('/coaches/:id', {
                templateUrl: 'partials/coach.html',
                controller: 'coach',
                resolve: {
                    func: init
                }
            })

            .when('/teams', {
                templateUrl: 'partials/teams.html',
                controller: 'teams',
                resolve: {
                    func: init
                }
            })

            .when('/teams/:id', {
                templateUrl: 'partials/team.html',
                controller: 'team',
                resolve: {
                    func: init
                }
            })

            .when('/matchs/all/:filter/:round?', {
                templateUrl: 'partials/matchs.html',
                controller: 'matchs',
                resolve: {
                    func: init
                }
            })

            .when('/matchs/coatch/:id', {
                templateUrl: 'partials/matchsByCoach.html',
                controller: 'matchsByCoach',
                resolve: {
                    func: init
                }
            })

            .when('/matchs/team/:id', {
                templateUrl: 'partials/matchsByTeam.html',
                controller: 'matchsByTeam',
                resolve: {
                    func: init
                }
            })

            .when('/rankings/coaches/:type', {
                templateUrl: 'partials/coachesRankings.html',
                controller: 'coachesRankings',
                resolve: {
                    func: init
                }
            })

            .when('/rankings/teams/:type', {
                templateUrl: 'partials/teamsRankings.html',
                controller: 'teamsRankings',
                resolve: {
                    func: init
                }
            })

            .when('/macths/detail/coatch/:id', {
                templateUrl: 'partials/matchsDetailByCoach.html',
                controller: 'matchsDetailByCoach',
                resolve: {
                    func: init
                }
            })

            .otherwise({
                redirectTo: '/'
            });
        }
    ])

    /* Optionnel si application cordova */
    .factory('$cordova', ['$q', "$window", "$timeout", '$interval', '$location',
        function ($q, $window, $timeout, $interval, $location) {
            
            var deferred = $q.defer();
            var resolved = false;
            
            function onPause() {
                // TODO: This application has been suspended. Save application state here.
            }
            
            function onResume() {
                // TODO: This application has been reactivated. Restore application state here.
            }
            
            if (window.isCordovaApp) {
                document.addEventListener('deviceready', function () {
                    console.log("Version " + cordova.version);
                    
                    document.addEventListener('pause', onPause.bind(this), false);
                    document.addEventListener('resume', onResume.bind(this), false);
                    
                    resolved = true;
                    deferred.resolve(true);
                }, false);
                
                
                
                $timeout(function () {
                    if (!resolved && $window.cordova) {
                        console.log("NOT READY Version " + cordova.version);
                        deferred.resolve($window.cordova);
                    }
                });
            } else {
                console.log("READY no cordova ! ");
                deferred.resolve(false);
            }
            
            return {
                ready: deferred.promise,
                isCordova: window.isCordovaApp
            }
        }
    ])

    .filter('orderObjectBy', [function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });

            function index(obj, i) {
                return obj[i];
            }
            filtered.sort(function(a, b) {
                var comparator;
                var reducedA = field.split('.').reduce(index, a).toUpperCase();
                var reducedB = field.split('.').reduce(index, b).toUpperCase();
                if (reducedA === reducedB) {
                    comparator = 0;
                } else {
                    comparator = (reducedA > reducedB ? 1 : -1);
                }
                return comparator;
            });
            if (reverse) {
                filtered.reverse();
            }
            return filtered;
        };
    }])

    .run(['$rootScope', '$location', '$q', '$cordova', '$TRANSLATE',
        function($rootScope, $location, $q, $cordova, $TRANSLATE) {
            console.log("APPLICATION START");

            // charge les ressources de traduction
            $TRANSLATE.initialize().then(function() {
                console.log("RESSOURCES LOADED.");

                //Fournie une méthode dans le rootscope pour accéder au ressources
                $rootScope.translate = function (value) {
                    var q = $q.defer();
                    $TRANSLATE.wait().then(function () {
                        q.resolve($TRANSLATE.translate);
                    }, function () {
                        q.reject();
                    });
                    
                    return q.promise;
                };               
            });
            
            // Gestion de cordova
            $cordova.ready.then(function (obj) {
                console.log("DEVICE READY");
            });

            //Test si une page est active
            $rootScope.isActive = function isActive(viewLocation) {
                return viewLocation === $location.path();
            };

            // Test si un match est joué
            $rootScope.isFinished = function isFinished(match) {
                return match.status == 'resume';
            }

            /* Visualisation d'un coach (id du coach)*/
            $rootScope.showCoach = function showCoach(id) {
                $location.path('/coaches/' + id);
            };

            /* Visualisation d'une equipe( triplette) (id de l'equipe)*/
            $rootScope.showTeam = function showTeam(id) {
                $location.path('/teams/' + id);
            };

            /* Visualise les matchs
                filter:
                    1: Tous
                    2: Joué
                    3: A jouer
                round:
                    0 : Tous
                    1..5: round 1 à 5
            */
            $rootScope.showMatchs = function showMatchs(filter, round) {
                var path = (round != undefined) ? '/matchs/all/' + filter + '/' + round : '/matchs/all/' + filter;
                $location.path(path);
            };

            /* Visualise les matchs par coach (id du coach)*/
            $rootScope.showMatchsByCoach = function showMatchsByCoach(id) {
                $location.path('/matchs/coatch/' + id);
            };

            /* Visualise les matchs par équipes de coaches (id de l'équipe de coaches)*/
            $rootScope.showMatchsByTeam = function showMatchsByTeam(id) {
                $location.path('/matchs/team/' + id);
            };
            
            //Details des matchs par coach (id du coach)
            $rootScope.viewMatchsDetailByCoach = function viewMatchsDetailByCoach(id) {
                $location.path('/macths/detail/coatch/' + id);
            };
            
            $rootScope.showCoachesRankings = function showCoachesRankings(filter) {
                $location.path('/rankings/coaches/' + filter);
            };
            
            $rootScope.showTeamsRankings = function showCoachesRankings(filter) {
                $location.path('/rankings/teams/' + filter);
            };
        }
    ]);
})();

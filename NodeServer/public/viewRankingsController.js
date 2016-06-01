(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVB.View.Match',
        ['ngRoute',
        'ngAnimate',
        'anguFixedHeaderTable',
        'TisseursDeChimeres.RDVBB.services.ws',
        'TisseursDeChimeres.RDVBB.services.parameters'])
    .config(['$routeProvider',
        function ($routeProvider) {

            function init($TRANSLATE) {
                return $TRANSLATE.wait();
            }

            init.$inject = ['$TRANSLATE'];

            $routeProvider
                .when('/rankingByCoach/:filter', {
                    templateUrl: 'partials/rankingByCoachPage.html',
                    controller: 'rankingByCoach',
                    resolve: { func: init }
                })

                .when('/rankingByTeam', {
                    templateUrl: 'partials/rankingByTeamPage.html',
                    controller: 'rankingByTeam',
                    resolve: { func: init }
                })

                .otherwise({
                    redirectTo: '/rankingByTeam'
                });
        }])
    .run(['$rootScope', '$location', '$q', '$interval', '$TRANSLATE',
        function ($rootScope, $location, $q, $interval, $TRANSLATE) {
            console.log("APPLICATION VIEW START");

            // charge les ressources de traduction
            $TRANSLATE.initialize().then(function () {
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

            /* Visualise les résultats
                 *  filter :
                 *      1: CLASSEMENT PAR COACHS
                 *      2: MEILLEUR REMONTE
                 *      3: CLASSEMENT PAR TD
                 *      4: CLASSEMENT PAR SORTIES
                 */
                $rootScope.viewRankingByCoach = function (filter) {
                $location.path('/rankingByCoach/' + filter);
            };

            //Resultats par equipes (triplettes)
            $rootScope.viewRankingByTeam = function () {
                $location.path('/rankingByTeam');
            };

            var count = 0;
            $interval(function () {
                switch (count) {
                    case 1:
                        $rootScope.viewRankingByCoach(1);
                        break;
                    case 2:
                        $rootScope.viewRankingByCoach(2);
                        break;
                    case 3:
                        $rootScope.viewRankingByCoach(3);
                        break;
                    case 4:
                        $rootScope.viewRankingByCoach(4);
                        break;
                    default:
                        count = 0;
                        $rootScope.viewRankingByTeam();
                        break;
                }
                count += 1;
            }, 15000);
        }])

        .controller('rankingByCoach', ['$scope', '$rootScope', '$filter', '$routeParams', '$interval', '$RDVBB_WS', 'ngTableParams',
            function ($scope, $rootScope, $filter, $routeParams, $interval, $RDVBB_WS, ngTableParams) {

            //function completData(data) {
            //    for (var i in data)
            //    {
            //        data[i].index = parseInt(i) + 1;
            //    }
            //    return $filter('orderBy')(data, 'index', false);
            //}

                function load() {
                    console.log("LOAD ...");
                    var edition = 12;

                    $scope.pageClass = 'page-match';

                    //$scope.config = {
                    //    itemsPerPage: 20,
                    //    fillLastPage: "yes",
                    //    currentPage: 0
                    //};

                    switch ($scope.filter) {
                        case '1':
                            $scope.title = 'rankingByCoach.title.1';
                            $RDVBB_WS.ranking.byCoach(edition).then(function (data) {
                                //$scope.rankings = completData(data);
                                $scope.rankings = data;
                            });
                            break;
                        case '2':
                            $scope.title = 'rankingByCoach.title.2';
                            $RDVBB_WS.ranking.bestComeback(edition).then(function (data) {
                                //$scope.rankings = completData(data);
                                $scope.rankings = data;
                            });
                            break;
                        case '3':
                            $scope.title = 'rankingByCoach.title.3';
                            $RDVBB_WS.ranking.topTD(edition).then(function (data) {
                                //$scope.rankings = completData(data);
                                $scope.rankings = data;
                            });
                            break;
                        default:
                            $scope.title = 'rankingByCoach.title.4';
                            $RDVBB_WS.ranking.topCasualties(edition).then(function (data) {
                                //$scope.rankings = completData(data);
                                $scope.rankings = data;
                            });
                            break;
                    };
                };

            load();

            $scope.config = new NgTableParams({
                page: 1,            // show first page
                count: 20           // count per page
            }, {
                total: $scope.rankings.length, // length of data
                getData: function ($defer, params) {
                    $defer.resolve($scope.rankings.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

            var stop = $interval(function () {
                    //var page = $scope.config.currentPage;
                    //page = page + 1;
                    //if (page > 1) {
                    //    page = 0;
                    //}
                    //$scope.config.currentPage = page;

                    //count += 1;
                    //if (count > 20) {
                    //    count = 0;
                    //    $window.location.reload();
                    //}


            }, 5000);
            $scope.stopFight = function () {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };
            $scope.$on('$destroy', function () {
                // Make sure that the interval is destroyed too
                $scope.stopFight();
            });
        }])

        .controller('rankingByTeam', ['$scope', '$rootScope', '$routeParams', '$interval', '$RDVBB_WS', '$TRANSLATE',
            function ($scope, $rootScope, $routeParams, $interval, $RDVBB_WS, $TRANSLATE) {

                $scope.pageClass = 'page-match';

                function load() {
                    console.log("LOAD ...");
                    $RDVBB_WS.ranking.byTeams(12).then(function (data) {
                        $scope.rankings = data;
                    });
                }

                load();
            }]);
})();
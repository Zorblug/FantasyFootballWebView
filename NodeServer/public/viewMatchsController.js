(function () {
    'use strict';

    angular.module('TisseursDeChimeres.RDVB.View.Match',
        ['angular-table',
         'ngAnimate',
         'TisseursDeChimeres.RDVBB.services.ws',
         'TisseursDeChimeres.RDVBB.services.parameters'])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(false);
    })
    .run(['$rootScope', function () {
        console.log("APPLICATION VIEW START");
    }])
    .controller('view-macth', ['$scope','$rootScope', '$location', '$window', '$filter', '$interval', '$RDVBB_WS','$PARAM',
        function ($scope, $rootScope, $location, $window, $filter, $interval, $RDVBB_WS, $PARAM) {
            $scope.matchsList = [];
            $scope.round = 5;

            var params = $location.search();
            if (params.round != null) {
                $scope.round = parseInt(params.round);
            }

            $scope.config = {
                itemsPerPage: 19,
                fillLastPage: "yes",
                currentPage: 0
            };

            function loadList() {

                $RDVBB_WS.matchs.toPlay($scope.currentEdition.edition(), $scope.round).then(function (data) {
                    var sublist = [];

                    for (var i in data) {
                        sublist.push({ "table": data[i].table, "coach": data[i].coach1, "vs": data[i].coach2 });
                        sublist.push({ "table": data[i].table, "coach": data[i].coach2, "vs": data[i].coach1 });
                    }

                    sublist = $filter('orderBy')(sublist, 'coach', false);

                    $scope.matchsList = sublist;
                });
            }

            var count = 0;
            function load() {
                var page = $scope.config.currentPage;
                page = page + 1;
                if (page > 3) {
                    page = 0;
                }
                $scope.config.currentPage = page;

                count += 1;
                if (count > 20) {
                    count = 0;
                    $window.location.reload();
                }
            }


            $PARAM.editions.getCurrent().then(function (data) {
                $scope.currentEdition = data;
                loadList();
            });
            

            var stop = $interval(load, 8000);
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
        }
     ]);
})();
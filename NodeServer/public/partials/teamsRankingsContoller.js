/// <reference path="lib/angularjs/angular.js" />

(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.views.teams.rankings.controller', ['TisseursDeChimeres.RDVBB.services.ws'])
    .controller('teamsRankings', ['$scope', '$rootScope', '$routeParams', '$interval', '$RDVBB_WS',
        function ($scope, $rootScope, $routeParams, $interval, $RDVB_WS) {

            /** Chargement du tableau des résulats en fonction du type
             *
            */
            function loadValues(filter, editionNo) {
                console.log("LOAD ...");

                var promiseDatas;

                switch (filter) {
                    case 'main':
                        promiseDatas = $RDVB_WS.ranking.team.main(editionNo);
                        break;
                    case 'td':
                        promiseDatas = $RDVB_WS.ranking.team.touchdown(editionNo);
                        break;
                    case 'casualties':
                        promiseDatas = $RDVB_WS.ranking.team.casualties(editionNo);
                        break;
                    case 'completions':
                        promiseDatas = $RDVB_WS.ranking.team.completions(editionNo);
                        break;
                    case 'fouls':
                        promiseDatas = $RDVB_WS.ranking.team.fouls(editionNo);
                        break;
                    case 'comeback':
                        promiseDatas = $RDVB_WS.ranking.team.comeback(editionNo);
                        break;
                    case 'defense':
                        promiseDatas = $RDVB_WS.ranking.team.defense(editionNo);
                        break;
                    default:
                        promiseDatas = $RDVB_WS.ranking.team.main(editionNo);
                        break;
                }
                promiseDatas.then(function (data) {
                    $scope.rankingsDatas = data;
                });
            }

            function loadHeaders(values) {
                var datas = [];
                for (var i in values) {
                    datas.push(values[i]);
                }
                console.log("Headers length : " + datas.length);
                return datas;
            }

            var currentEdition = $rootScope.currentEdition;

            $scope.pageClass = 'page-match';
            $scope.type = $routeParams.type;
            $scope.title = 'rankings.teams.title.' + $scope.type;
            $scope.headers = loadHeaders(currentEdition.teamRanking($scope.type));

            $scope.valueOf = function valueOf(item, value) {
                return item[value];
            }

            loadValues($scope.type, currentEdition.edition());

            var stop = $interval(loadValues, 120000, 0, true, $scope.type, currentEdition.edition());// rafraichissement automatique

            $scope.stopFight = function stopFight() {
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
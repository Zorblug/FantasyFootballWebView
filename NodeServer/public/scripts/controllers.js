/// <reference path="../lib/angularjs/angular.js" />
/// <reference path="./services.ws.js" />
/// <reference path="./services.parameters.js" />

(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.controllers',
        [   'TisseursDeChimeres.RDVBB.services.ws',
            'TisseursDeChimeres.RDVBB.services.parameters'
        ])

    //Controller de la page : index.html
    .controller('menu', ['$scope', '$rootScope', '$location', '$window', '$PARAM', '$TRANSLATE',
        function($scope, $rootScope, $location, $window, $PARAM, $TRANSLATE) {

            //Chargement des traduction
            $TRANSLATE.wait().then(function() {
                $scope.codeLanguage = $TRANSLATE.getLanguage();
                return $PARAM.editions.getCurrent(); // Chargement de l'edition courrante
            }).then(function (data) {
                $rootScope.currentEdition = data;
                console.log('TEAM :' + $rootScope.currentEdition.hasTeam());
                return $PARAM.editions.list();// Chargement de la liste des �ditions
            }).then(function(data) {
                $scope.editions = data;
            }).catch(function(error){
              console.log(error); // #TODO Gestion des erreurs a faire
            });

            //! Chagement de l'edition courrantes
            $scope.changeCurrentEdition = function(edition) {
                $rootScope.currentEdition = $scope.editions.getByEdition(edition);
                $PARAM.editions.setCurrent($rootScope.currentEdition);
                console.log(JSON.stringify($rootScope.currentEdition));
                $location.path('/');
            };

            //! Retour à la page d'accueil
            $scope.showHome = function() {
                $location.path('/');
            };

            //! Affiche la liste des coachs
            $scope.showCoaches = function() {
                $location.path('/coaches');
            };

            //! Affiche la liste des equipe de coachs
            $scope.showTeams = function() {
                $location.path('/teams');
            };

            //! Change la langue d'affichage
            $scope.changeLanguage = function(code) {
                $TRANSLATE.setLanguage(code).then(function() {
                    $scope.codeLanguage = $TRANSLATE.getLanguage();
                    $window.location.reload();
                });
            };
        }
    ]);
})();

/// <reference path="lib/angularjs/angular.js" />

(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.services.ws', [])

    /* Accès au service RDVBB de TRAMBI */
    .factory('$RDVBB_WS', ['$http', '$q',
        function ($http, $q) {
            console.log("SERVICE RDVBB WS");
            //var wsRootUrl = 'http://192.168.2.14:8080/app.php';
            //var wsRootUrl = 'http://82.243.41.235/app.php';
            //var wsRootUrl = 'http://rdvbb.ddns.net/app.php';
            //'http://tramli.freeboxos.fr/app.php/index'
            var wsRootUrl = 'http://192.168.2.2:8080/app.php';
            // var wsRootUrl = 'http://tramli.freeboxos.fr/app.php';

            //$http.defaults.useXDomain = true;
            //$http.defaults.withCredentials = true;
            delete $http.defaults.headers.common['X-Requested-With'];
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['Content-Type'] = 'application/json';

            /** Requete qui retourne un tableau [...,...,] sous la forme d'une promesse
             * Promesse qui contient le tableau si elle est resolue ou un message d'erreur si elle echoue
             */
            function getList(url) {
                var d = $q.defer();

                var httpPromise = $http.get(wsRootUrl + url);
                console.log("GET LIST :" + wsRootUrl + url);
                httpPromise.then(
                    function (response) {
                        if ((/^\[/.test(response.data))) { //Tableau JSON commence par [
                            //console.log('COACHS:' + JSON.stringify(response.data));
                            d.resolve(response.data);
                        } else {
                            console.log('VALUE :' + response.data);
                            d.reject("ERROR NOT JSON ARRAY");
                        }
                    },
                    function (httpError) {
                        console.log('HTTP GET ERROR :' + httpError.status);
                        d.reject(httpError);
                    });

                return d.promise;
            }
            /** requete qui retourne un element {...} sous la forme d'une promesse
             * Promesse qui contient l'element si elle est resolue ou un message d'erreur si elle echoue
             */
            function getElement(url) {
                var d = $q.defer();

                var httpPromise = $http.get(wsRootUrl + url);
                console.log("GET :" + wsRootUrl + url);
                httpPromise.then(
                    function (response) {
                        //console.log('VALUE :' + JSON.stringify(response.data));
                        d.resolve(response.data);
                    },
                    function (httpError) {
                        console.log('HTTP GET ERROR :' + httpError.status);
                        d.reject(httpError);
                    });

                return d.promise;
            }

            return {
                editions: {
                    /// liste les editions du tournois
                    list: function list() {
                        return getList('/Editions');
                    },
                    /// retourne l'edition courrante
                    current: function current() {
                        return getElement('/Edition/current');
                    }
                },
                coach: {
                    /// liste les coach de l'edition du tournois
                    list: function list(edition) {
                        return getList('/Coachs/' + edition);
                    },
                    /// retourne un coach
                    get: function get(id) {
                        return getElement('/Coach/' + id);
                    }
                },
                matchs: {
                    /// Liste des matchs (edition, round) avec edition obligatoire de 1 à n et round 1 à n (optionnel)
                    get: function get(edition, round) {
                        var url = ((round != undefined) && (round > 0)) ? '/MatchList/' + edition + '/' + round : '/MatchList/' + edition

                        return getList(url);
                    },

                    /// Liste des macths joués (edition, round) avec edition obligatoire de 1 à n et round 1 à n (optionnel)
                    played: function played(edition, round) {
                        var url = ((round != undefined) && (round > 0)) ? '/PlayedMatchList/' + edition + '/' + round : '/PlayedMatchList/' + edition

                        return getList(url);
                    },

                    /// Liste des macths à jouer (edition, round) avec edition obligatoire de 1 à n et round 1 à n (optionnel)
                    toPlay: function toPlay(edition, round) {
                        var url = ((round != undefined) && (round > 0)) ? '/ToPlayMatchList/' + edition + '/' + round : '/ToPlayMatchList/' + edition

                        return getList(url);
                    },

                    /// Liste des macths pour un joueur (edition, round) avec edition obligatoire de 1 à n et round 1 à n (optionnel)
                    byCoach: function byCoach(id) {
                        return getElement('/MatchListByCoach/' + id);
                    },

                    /// Liste des macths pour une equipe (edition, round) avec edition obligatoire de 1 à n et round 1 à n (optionnel)
                    byTeam: function byTeam(id) {
                        return getElement('/MatchListByCoachTeam/' + id);
                    }
                },
                team: {
                    list: function list(edition) {
                        return getList('/CoachTeamList/' + edition);
                    },
                    get: function get(id) {
                        return getElement('/CoachTeam/' + id);
                    }
                },
                ranking: {
                    team: {
                        main: function main(edition) {
                            return getList('/ranking/coachTeam/main/' + edition);
                        },
                        touchdown: function touchdown(edition) {
                            return getList('/ranking/coachTeam/td/' + edition);
                        },
                        casualties: function casualties(edition) {
                            return getList('/ranking/coachTeam/casualties/' + edition);
                        },
                        completions: function completions(edition) {
                            return getList('/ranking/coachTeam/completions/' + edition);
                        },
                        fouls: function fouls(edition) {
                            return getList('/ranking/coachTeam/fouls/' + edition);
                        },
                        comeback: function comeback(edition) {
                            return getList('/ranking/coachTeam/comeback/' + edition);
                        },
                        defense: function defense(edition) {
                            return getList('/ranking/coachTeam/defense/' + edition);
                        }
                    },
                    coach: {
                        main: function main(edition) {
                            return getList('/ranking/coach/main/' + edition);
                        },
                        touchdown: function touchdown(edition) {
                            return getList('/ranking/coach/td/' + edition);
                        },
                        casualties: function casualties(edition) {
                            return getList('/ranking/coach/casualties/' + edition);
                        },
                        completions: function completions(edition) {
                            return getList('/ranking/coach/completions/' + edition);
                        },
                        fouls: function fouls(edition) {
                            return getList('/ranking/coach/fouls/' + edition);
                        },
                        comeback: function comeback(edition) {
                            return getList('/ranking/coach/comeback/' + edition);
                        },
                        defense: function defense(edition) {
                            return getList('/ranking/coach/defense/' + edition);
                        }
                    }
                }
            };
        }
    ]);
})();

/// <reference path="lib/angularjs/angular.js" />

(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.services.parameters', ['TisseursDeChimeres.RDVBB.services.ws'])
    // Gestion des parametres et du cache local
    .factory('$PARAM', ['$window', '$q', '$RDVBB_WS',
        function ($window, $q, $RDVB_WS) {
            
            /** Objet editions contient les editions et les methodes d'extraction des elements pour contruire l'interface
             * version javacript 5 pour la compatibilite
             */
            function Edition(elmt) {
                this._element = elmt;
            };
            
            /** Retourne l'année de l'edition
             *
             */
            if (!Edition.prototype.year) {
                Edition.prototype.year = function year() {
                    return this._element.day1.substr(0, 4);
                };
            }
            
            /** Retourne le numero d'edition sous forme de chaine
             *
             */
            if (!Edition.prototype.edition) {
                Edition.prototype.edition = function edition() {
                    return this._element.id; // string
                };
            }
            
            /** Retourne l a valeur en JSON
             *
             */
            if (!Edition.prototype.toJSON) {
                Edition.prototype.toJSON = function toJSON() {
                    return JSON.stringify(this._element); // string
                };
            }
            
            if (!Edition.prototype.hasTeam) {
                Edition.prototype.hasTeam = function hasTeam() {
                    return 'coachTeam' in this._element.rankings;
                };
            }
            
            if (!Edition.prototype.teamRankings) {
                Edition.prototype.teamRankings = function teamRankings() {
                    if ('coachTeam' in this._element.rankings) {
                        return Object.keys(this._element.rankings.coachTeam);
                    }
                    else {
                        return [];
                    }
                };
            }
            
            if (!Edition.prototype.teamRanking) {
                Edition.prototype.teamRanking = function teamRanking(key) {
                    return this._element.rankings.coachTeam[key];
                };
            }
            
            //!Liste des classement possibles
            if (!Edition.prototype.coachRankings) {
                Edition.prototype.coachRankings = function coachRankings() {
                    return Object.keys(this._element.rankings.coach);
                };
            }
            
            if (!Edition.prototype.coachRanking) {
                Edition.prototype.coachRanking = function coachRanking(key) {
                    return this._element.rankings.coach[key];
                };
            }
            
            /*! Objet editions (list)

             */
            function Editions(array) {
                this._array = array;
                for (var i = 0; i < this._array.length; i++) {
                    this._array[i].year = this._array[i].day1.substr(0, 4)
                }
            }
            
            
            if (!Editions.prototype.item) {
                Editions.prototype.item = function item(n) {
                    var itm = this._array[n];
                    return new Edition(itm);
                };
            }
            
            if (!Editions.prototype.getByEdition) {
                Editions.prototype.getByEdition = function getByEdition(ed) {
                    var itm = this._array[ed - 1];
                    return new Edition(itm);
                };
            }
            
            if (!Editions.prototype.length) {
                Editions.prototype.length = function length() {
                    return this._array.length;
                };
            }
            
            if (!Editions.prototype.toArray) {
                Editions.prototype.toArray = function toArray() {
                    return this._array;
                };
            }
            
            function _ResetCurrent() {
                var d = $q.defer();
                
                $RDVB_WS.editions.current().then(function (data) {
                    window.localStorage.setItem('currentEdition', JSON.stringify(data));
                    d.resolve(new Edition(data));
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            };
            
            function _Load() {
                var d = $q.defer();
                
                $RDVB_WS.editions.list().then(function (data) {
                    window.localStorage.setItem('editions', JSON.stringify(data));
                    d.resolve(new Editions(data));
                }, function (error) {
                    d.reject(error);
                });
                
                return d.promise;
            };
            
            return {
                editions: {
                    load: function load() {
                        return _Load();
                    },
                    list: function list() {
                        var d = $q.defer();
                        
                        var theEditionsArray = window.localStorage.getItem('editions');
                        if (!theEditionsArray) {
                            _Load().then(function (data) {
                                d.resolve(data);
                            }, function (error) {
                                d.reject(error);
                            });
                        } else {
                            d.resolve(new Editions(JSON.parse(theEditionsArray)));
                        }
                        
                        return d.promise;
                    },
                    resetCurrent: function resetCurrent() {
                        return _ResetCurrent();
                    },
                    getCurrent: function getCurrent() {
                        var d = $q.defer();
                        
                        var theEdition = window.localStorage.getItem('currentEdition');
                        if (!theEdition) {
                            _ResetCurrent().then(function (data) {
                                d.resolve(data);
                            }, function (error) {
                                d.reject(error);
                            });
                        } else {
                            d.resolve(new Edition(JSON.parse(theEdition)));
                        }
                        
                        return d.promise;
                    },
                    setCurrent: function setCurrent(edition) {
                        window.localStorage.setItem('currentEdition', edition.toJSON());
                    }
                },
                currentRound: {
                    get: function () {
                        var data = window.localStorage.getItem('currentRound');
                        var value;
                        if (data !== null) {
                            value = parseInt(data);
                        } else {
                            value = 1;
                        }
                        return value;
                    },
                    set: function (value) {
                        window.localStorage.setItem('currentRound', value);
                    }
                }
            };
        }
    ]);
})();
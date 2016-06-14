/// <reference path="../lib/angularjs/angular.js" />

(function () {
    "use strict";

    angular.module('TisseursDeChimeres.RDVBB.directives.translation', [])

        /* USAGE : <any pe-translate="namespace.libele">libélé</any>   */
        .directive('peTranslate', ['$TRANSLATE', function ($TRANSLATE) {
            return {
                priority: 0,
                restrict: 'A',
                scope: false,
                compile: function (tElement, tAttrs, transclude) {
                    if (tAttrs.peTranslate) {
                        $TRANSLATE.wait().then(function () {
                            tElement.text($TRANSLATE.translate(tAttrs.peTranslate));
                        });
                    }
                    return {
                        pre: function preLink(scope, iElement, iAttrs, controller) { },
                        post: function postLink(scope, iElement, iAttrs, controller) { }
                    };
                }
            };
        }])

        /* USAGE : <img src="images/back.png" pe-translate-title="namespace.libele"/> */
        .directive('peTranslateTitle', ['$TRANSLATE', function ($TRANSLATE) {
            return {
                priority: 0,
                restrict: 'A',
                scope: false,
                compile: function compile(tElement, tAttrs, transclude) {
                    if (tAttrs.peTranslateTitle) {
                        tAttrs.$set('title', $TRANSLATE.translate(tAttrs.peTranslateTitle));
                    }
                    return {
                        pre: function preLink(scope, iElement, iAttrs, controller) {},
                        post: function postLink(scope, iElement, iAttrs, controller) {}
                    };
                }
            };
        }])

        /* USAGE : {{ TOKEN | peTranslate }} */
        .filter('peTranslate', ['$TRANSLATE',
             function ($TRANSLATE) {
                 return function (input) {
                     return $TRANSLATE.translate(input);
                 };
        }])

        ///Initialisation et chargement
        .factory('$TRANSLATE', ['$http', '$locale', '$q',
            function ($http, $locale, $q) {

                /*
                 * Fichier de ressources texte fichier JSON
                 * avec un ensemble de clés valeurs
                 * exemeple:
                 *     {
                 *         "clé1":"valeur 1",
                 *         "clé2":"valeur 2",
                 *         ...
                 *     }
                 * le nom du fichier est le code de la langue
                 */
                function Ressources() {
                    this.dictionary = {};
                    this.code = undefined;
                    this.url = undefined;
                    this.fileLoaded = false;
                    this.qLoaded = $q.defer();
                }

                if (!Ressources.prototype.buildUrl) {
                    Ressources.prototype.buildUrl = function (codeLanguage) {
                        this.code = codeLanguage;
                        this.url = 'strings/' + codeLanguage + '.json';
                    };
                };

                if (!Ressources.prototype.success) {
                    Ressources.prototype.success = function (data) {
                        this.dictionary = data;
                        this.fileLoaded = true;
                        this.qLoaded.resolve(this);
                    }
                }

                if (!Ressources.prototype.reject) {
                    Ressources.prototype.reject = function (status) {
                        this.dictionary = {};
                        this.fileLoaded = false;
                        this.qLoaded.reject('http get error : ' + status);
                        console.log('http get error : ' + status);
                    }
                }

                function successCallback(data, status, headers, config) {
                    console.log('Load :' + localRess.url);
                    localRess.success(data);
                }

                function load(codeLanguage) {
                    localRess.buildUrl(codeLanguage);
                    $http({
                        method: 'GET',
                        url: localRess.url,
                        cache: false
                    })
                        .success(successCallback)
                        .error(function (data, status, headers, config) {
                        // the request failed set the url to the default resource file
                        localRess.buildUrl('fr-fr');
                        console.log('http get error : ' + status + ' load default language');
                        // request the default resource file
                        $http({
                            method: 'GET',
                            url: localRess.url,
                            cache: false
                        })
                                .success(successCallback)
                                .error(function (data, status, headers, config) {
                            console.log('http get error : ' + status);
                            localRess.reject(status);
                        });
                    });
                    return localRess.qLoaded.promise;
                }


                var localRess = new Ressources();

                return {
                    initialize: function () {
                        var ress = window.localStorage.getItem('ressourcesLanguage');
                        if (ress === null) {
                            ress = $locale.id;
                        }
                        console.log('CODE : ' + ress);
                        return load(ress);
                    },
                    wait: function () {
                        return localRess.qLoaded.promise;
                    },
                    /* code : en-us, ou fr-fr*/
                    setLanguage: function (codeLanguage) {
                        var q = $q.defer();
                        localRess = new Ressources();
                        load(codeLanguage).then(
                            function (result) {
                                window.localStorage.setItem('ressourcesLanguage', codeLanguage);
                                console.log("RESSOURCES CHANGE TO :" + result.url);
                                q.resolve();
                            },
                            function (error) {
                                console.log("RESSOURCE CHANGE ERROR:" + error);
                                q.reject();
                            });
                        return q.promise;
                    },
                    translate: function (value) {
                        if (localRess.fileLoaded) {
                            if (localRess.dictionary.hasOwnProperty(value)) {
                                return localRess.dictionary[value];
                            } else {
                                return 'translate unknow :' + value;
                            }
                        }
                    },
                    getLanguage: function () {
                        return localRess.code;
                    }
                };
            }
        ]);
})();

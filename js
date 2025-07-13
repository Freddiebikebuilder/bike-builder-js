"use strict";
var ApplicationConfiguration = function() {
    var applicationModuleName = "bikologi"
      , applicationModuleVendorDependencies = ["ngResource", "ngAnimate", "ui.router", "ui.utils", "ngFileUpload", "ngSanitize", "ezfb", "ngDfp", "ngMap", "vcRecaptcha"]
      , registerModule = function(moduleName, dependencies) {
        angular.module(moduleName, dependencies || []),
        angular.module(applicationModuleName).requires.push(moduleName)
    };
    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    }
}();
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies),
angular.module(ApplicationConfiguration.applicationModuleName).config(["$locationProvider", "$qProvider", function($locationProvider, $qProvider) {
    $locationProvider.html5Mode({
        enabled: !0,
        requireBase: !1
    }),
    $qProvider.errorOnUnhandledRejections(!1)
}
]),
angular.element(document).ready(function() {
    "#_=_" === window.location.hash && (window.location.hash = "#!"),
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName])
}),
ApplicationConfiguration.registerModule("articles"),
ApplicationConfiguration.registerModule("builder"),
ApplicationConfiguration.registerModule("core"),
ApplicationConfiguration.registerModule("gallery"),
ApplicationConfiguration.registerModule("involved"),
ApplicationConfiguration.registerModule("pricing"),
ApplicationConfiguration.registerModule("users"),
angular.module("articles").config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("hub", {
        url: "/hub",
        templateUrl: "/modules/articles/views/hub.client.view.html"
    }).state("article", {
        url: "/hub/:slug",
        templateUrl: "/modules/articles/views/article.client.view.html"
    })
}
]),
angular.module("articles").controller("ArticleController", ["$rootScope", "$interval", "$window", "$scope", "$sce", "$http", "$location", "MetaFactory", "Authentication", "ArticlesService", "ezfb", function($rootScope, $interval, $window, $scope, $sce, $http, $location, MetaFactory, Authentication, ArticlesService, ezfb) {
    function trustIframeURL() {
        $scope.article.acf && $scope.article.acf.video_url && $scope.article.acf.video_url.length && ($scope.videoURL = $sce.trustAsResourceUrl($scope.article.acf.video_url))
    }
    function renderMeta() {
        MetaFactory.setMeta({
            title: $scope.article.acf.meta_title && $scope.article.acf.meta_title.length ? $rootScope.encodeHTML($scope.article.acf.meta_title) : $rootScope.encodeHTML($scope.article.title.rendered),
            description: $scope.article.acf.meta_description && $scope.article.acf.meta_description.length ? $rootScope.encodeHTML($scope.article.acf.meta_description) : $rootScope.encodeHTML($scope.article.excerpt.rendered),
            url: $location.absUrl(),
            img: $scope.article._embedded["wp:featuredmedia"][0].media_details.sizes.medium.source_url,
            type: "article",
            caption: "Bikologi's Hub - Industry News, Video Edits, Event Coverage, and Original Content."
        })
    }
    var slug = $location.path().split("/")[2];
    if ($rootScope.toggleNav(!1),
    $rootScope.loading = !0,
    $scope.article = {},
    $scope.url = $location.absUrl(),
    $scope.fbShare = function() {
        $window.FB.ui({
            method: "share",
            href: $scope.url,
            title: $scope.article.acf.meta_title && $scope.article.acf.meta_title.length ? $rootScope.encodeHTML($scope.article.acf.meta_title) : $rootScope.encodeHTML($scope.article.title.rendered),
            picture: $scope.article._embedded["wp:featuredmedia"][0].media_details.sizes.medium.source_url,
            caption: $scope.article.acf.meta_description && $scope.article.acf.meta_description.length ? $rootScope.encodeHTML($scope.article.acf.meta_description) : $rootScope.encodeHTML($scope.article.excerpt.rendered),
            description: $scope.article.acf.meta_description
        }, function(response) {})
    }
    ,
    $rootScope.$watch("banners", function(banners) {
        void 0 !== banners && ($scope.bannerMarkup = $sce.trustAsHtml(banners["article header"][0].markup))
    }),
    ezfb.api("/", {
        access_token: "1573252259661758|K-9R3zUr71XBvF7zZjA0msPJIZc",
        id: $scope.url
    }, function(response) {
        response && !response.error && response.share ? $scope.shares = response.share.share_count : $scope.shares = 0
    }),
    $rootScope.articles.featured && $rootScope.articles.featured.slug === slug)
        $scope.article = $rootScope.articles.featured,
        trustIframeURL(),
        renderMeta(),
        $rootScope.loading = !1,
        window.prerenderReady = !0;
    else if ($rootScope.articles.recent && $rootScope.articles.recent.length)
        for (var i = 0; i < $rootScope.articles.recent.length; i++) {
            var article = $rootScope.articles.recent[i];
            if (slug === article.slug) {
                $scope.article = article,
                trustIframeURL(),
                renderMeta(),
                $rootScope.loading = !1;
                break
            }
        }
    else
        ArticlesService.getArticle({
            slug: slug
        }).then(function(data) {
            data.article.length ? ($scope.article = data.article[0],
            trustIframeURL(),
            renderMeta(),
            $rootScope.loading = !1,
            window.prerenderReady = !0) : $location.path("/not-found")
        });
    $rootScope.articles.tags || ArticlesService.getTags().then(function(data) {
        $rootScope.articles.tags = data.tags
    }),
    $rootScope.articles.categories || ArticlesService.getCategories().then(function(data) {
        $rootScope.articles.categories = data.categories
    })
}
]),
angular.module("articles").controller("ArticlesController", ["$rootScope", "$window", "$scope", "$http", "$location", "Authentication", "ArticlesService", function($rootScope, $window, $scope, $http, $location, Authentication, ArticlesService) {
    function getCategoryArticles() {
        for (var i = 0; i < $rootScope.articles.categories.length; i++)
            $rootScope.articles.categories[i].count > 0 && ArticlesService.getArticlesByCategory({
                id: $rootScope.articles.categories[i].id
            }).then(function(data) {
                $rootScope.articles["category-" + data.articles[0].categories[0]] = data.articles
            })
    }
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $scope.dataLoaded = {
        featured: !1,
        tags: !1,
        categories: !1
    };
    var isLoaded = setInterval(function() {
        $scope.dataLoaded.featured === !0 && $scope.dataLoaded.tags === !0 && $scope.dataLoaded.categories === !0 && (getCategoryArticles(),
        $rootScope.loading = !1,
        window.prerenderReady = !0,
        $rootScope.$apply(),
        clearInterval(isLoaded))
    }, 100);
    $rootScope.articles.featured ? $scope.dataLoaded.featured = !0 : ArticlesService.getFeaturedArticles().then(function(data) {
        $rootScope.articles.featured = data.articles,
        $scope.dataLoaded.featured = !0
    }),
    $rootScope.articles.tags ? $scope.dataLoaded.tags = !0 : ArticlesService.getTags().then(function(data) {
        $rootScope.articles.tags = data.tags,
        $scope.dataLoaded.tags = !0
    }),
    $rootScope.articles.categories ? $scope.dataLoaded.categories = !0 : ArticlesService.getCategories().then(function(data) {
        $rootScope.articles.categories = data.categories,
        $scope.dataLoaded.categories = !0
    })
}
]),
angular.module("articles").factory("ArticlesService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var ArticlesResource = $resource("/api/articles", {}, {
        get: {
            method: "GET"
        }
    })
      , ArticleResource = $resource("/api/article/:slug", {
        slug: "@slug"
    }, {
        get: {
            method: "GET"
        }
    })
      , ArticlesByCategoryResource = $resource("/api/articles/category/:id", {
        id: "@id"
    }, {
        get: {
            method: "GET"
        }
    })
      , FeaturedResource = $resource("/api/featuredArticles", {}, {
        get: {
            method: "GET"
        }
    })
      , TagResource = $resource("/api/tags", {}, {
        get: {
            method: "GET"
        }
    })
      , CategoryResource = $resource("/api/categories", {}, {
        get: {
            method: "GET"
        }
    })
      , factory = {
        getArticles: function(data) {
            var deferred = $q.defer();
            return ArticlesResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getFeaturedArticles: function(data) {
            var deferred = $q.defer();
            return FeaturedResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getTags: function(data) {
            var deferred = $q.defer();
            return TagResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getCategories: function(data) {
            var deferred = $q.defer();
            return CategoryResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getArticle: function(data) {
            var deferred = $q.defer();
            return ArticleResource.get({
                slug: data.slug
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getArticlesByCategory: function(data) {
            var deferred = $q.defer();
            return ArticlesByCategoryResource.get({
                id: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("builder").config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("builder", {
        url: "/builder/:model",
        templateUrl: "/modules/builder/views/builder.client.view.html",
        controller: "BuilderController"
    }).state("builderConfig", {
        url: "/builder",
        templateUrl: "/modules/builder/views/selector.client.view.html"
    })
}
]),
angular.module("builder").controller("BuilderController", ["$scope", "$location", "$q", "$sce", "$state", "$rootScope", "$window", "$stateParams", "BikeService", "BuilderService", "BuildLogicService", function($scope, $location, $q, $sce, $state, $rootScope, $window, $stateParams, BikeService, BuilderService, BuildLogicService) {
    function updatePricing(origComp, newComp) {
        newComp.lowestPrice && (origComp.lowestPrice = newComp.lowestPrice,
        origComp.pricing = newComp.pricing,
        origComp.affPrice = newComp.affPrice,
        origComp.affLink = newComp.affLink,
        origComp.sortedPricing = newComp.sortedPricing)
    }
    function generateScreenshot() {
        var component = {}
          , selectedColor = ""
          , imgs = []
          , index = 0;
        if ($scope.bikeSpec = {
            id: window.util.formatUrl($scope.bike.manufacturer + "-" + $scope.bike.model + "-" + $scope.bike.year),
            category: $scope.bike.category,
            canvasMap: $scope.bike.canvasMap
        },
        0 !== Object.keys($rootScope.initBuild).length && JSON.stringify($rootScope.initBuild) !== JSON.stringify({})) {
            for (var key in $rootScope.initBuild.build) {
                var comp = $rootScope.initBuild.build[key];
                if (comp._id)
                    for (var group in $scope.components)
                        for (var jj = 0; jj < $scope.components[group].length; jj++) {
                            var imgComponent = $scope.components[group][jj];
                            if (comp._id === imgComponent._id) {
                                updatePricing(comp, imgComponent),
                                comp.images.builder = imgComponent.images.builder;
                                break
                            }
                        }
            }
            $scope.build = $rootScope.initBuild.build,
            $scope.price = $rootScope.initBuild.price,
            $rootScope.initBuild.speed && ($scope.speed = $rootScope.initBuild.speed),
            $rootScope.initBuild = {},
            $rootScope.triggerLogic.value++
        }
        if (null === $scope.build) {
            $scope.build = {},
            $rootScope.triggerLogic.value++;
            for (var i = 0; i < $scope.bike.images.builder.length; i++)
                "detail" !== $scope.bike.images.builder[i].position && "dh-cables" !== $scope.bike.images.builder[i].position && "brake-mount" !== $scope.bike.images.builder[i].position && "decal" !== $scope.bike.images.builder[i].position && "stays" !== $scope.bike.images.builder[i].position && ($scope.build.color = $scope.bike.images.builder[i],
                $scope.build.color.selected = i,
                index = i);
            findSelected($scope.bike.images.builder[index], $scope.bike.images.builder, index)
        }
        for (var key in $scope.build)
            if ("color" === key) {
                $scope.bikeSpec.color = [{
                    url: $scope.build.color.url
                }];
                for (var k = 0; k < $scope.bike.images.builder.length; k++)
                    "brake-mount" === $scope.bike.images.builder[k].position && $scope.bike.images.builder[k].color === $scope.build.color.color && ($scope.bikeSpec.brakeMount = [{
                        url: $scope.bike.images.builder[k].url
                    }]),
                    "stays" === $scope.bike.images.builder[k].position && $scope.bike.images.builder[k].color === $scope.build.color.color && ($scope.bikeSpec.stays = [{
                        url: $scope.bike.images.builder[k].url
                    }])
            } else if ("cockpit" === key)
                $scope.bikeSpec.cockpit = [{
                    url: $scope.build.cockpit.url
                }];
            else if ("size" !== key && "brakeMount" !== key && "stays" !== key && (component = $scope.build[key],
            component.images)) {
                selectedColor = component.images.vanity[component.selected].color,
                imgs = [];
                for (var j = 0; j < component.images.builder.length; j++) {
                    var img = component.images.builder[j];
                    "derailleur" === component.component && "der-color" === img.position ? imgs.push(img) : img.color === selectedColor && imgs.push(img),
                    "fork" === key && "steerer" === img.position && imgs.push(img)
                }
                imgs.length && ($scope.bikeSpec[key] = imgs)
            }
    }
    function getSavedBuild() {
        var defer = $q.defer()
          , id = "";
        window.util.formatUrl("lastbike-" + $scope.bike.year + "-" + $scope.bike.manufacturer + "-" + $scope.bike.model);
        return id = $location.search().id ? $location.search().id : null,
        id ? (BuilderService.getBuild({
            id: id
        }).then(function(resp) {
            null === resp.build || resp.build.name && "CastError" === resp.build.name || ($rootScope.initBuild = resp.build,
            $rootScope.authentication.user && $rootScope.authentication.user.builds.indexOf(id) >= 0 && ($rootScope.bId = id)),
            defer.resolve()
        }),
        defer.promise) : (defer.resolve(),
        defer.promise)
    }
    function getCompArray(params) {
        var defer = $q.defer();
        return BuilderService.getComponents(params).then(function(data) {
            for (var i = 0; i < data.components.length; i++)
                parseFloat(data.components[i].lowestPrice);
            if ("wheel set" === params.component) {
                for (i = 0; i < data.components.length; i++)
                    for (var ii = 0; ii < data.components[i].images.vanity.length; ii++)
                        if ("white" === data.components[i].images.vanity[ii].color) {
                            var color = data.components[i].images.vanity[ii];
                            data.components[i].images.vanity.splice(ii, 1),
                            data.components[i].images.vanity.splice(0, 0, color);
                            break
                        }
                $scope.components[params.component] = data.components
            } else if ("shock" === params.component) {
                var shocks = [];
                if ($scope.bike.shockList.length && $scope.bike.shockSpec === !1) {
                    for (var i = 0; i < $scope.bike.shockList.length; i++)
                        for (var ii = 0; ii < data.components.length; ii++)
                            $scope.bike.shockList[i] === data.components[ii]._id && shocks.indexOf(data.components[ii]) === -1 && shocks.push(data.components[ii]);
                    data.components = shocks
                }
                for (var i = 0; i < data.components.length; i++)
                    for (var ii = 0; ii < $scope.bike.defaultShocks.length; ii++)
                        data.components[i]._id === $scope.bike.defaultShocks[ii]._id && ($scope.bike.defaultShocks[ii].priceDiff >= 0 ? data.components[i].lowestPrice = $scope.bike.defaultShocks[ii].priceDiff : data.components[i].lowestPrice = 0);
                $scope.components.shock = data.components
            } else
                "tires" === params.component ? ($scope.components["front tire"] = JSON.parse(JSON.stringify(data.components)),
                $scope.components["rear tire"] = JSON.parse(JSON.stringify(data.components))) : $scope.components[params.component] = data.components;
            defer.resolve()
        }),
        defer.promise
    }
    function getComponents(bike) {
        var promises = []
          , params = {};
        $scope.bike.minForkTravel && $scope.bike.maxForkTravel && (params.minForkTravel = $scope.bike.minForkTravel,
        params.maxForkTravel = $scope.bike.maxForkTravel,
        params.wheelSize = $scope.bike.wheelSize,
        params.rearAxleSize = $scope.bike.rearAxleSize,
        params.component = "fork",
        promises.push(getCompArray(params))),
        $scope.bike.shockSize && (params = {},
        params.shockSize = $scope.bike.shockSize,
        params.component = "shock",
        promises.push(getCompArray(params))),
        $scope.bike.rearAxleSize && (params = {},
        params.rearAxleSize = $scope.bike.rearAxleSize,
        params.wheelSize = $scope.bike.wheelSize,
        params.component = "wheel set",
        promises.push(getCompArray(params))),
        $scope.bike.category && (params = {},
        params.category = $scope.bike.category,
        params.wheelSize = $scope.bike.wheelSize,
        params.maxTireSize = $scope.bike.maxTireSize ? $scope.bike.maxTireSize : 999,
        params.component = "tires",
        promises.push(getCompArray(params))),
        $scope.bike.speeds && (params = {
            speeds: {}
        },
        params.speeds = $scope.bike.speeds,
        params.component = "drivetrain",
        promises.push(getCompArray(params))),
        $scope.bike.iscg && (params = {},
        params.iscg = $scope.bike.iscg,
        params.component = "chain guide",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "pedals",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "chain ring",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "crankset",
        params.bottomBracket = $scope.bike.bottomBracket,
        params.category = $scope.bike.category,
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "bottom bracket",
        params.bottomBracket = $scope.bike.bottomBracket,
        promises.push(getCompArray(params))),
        $scope.bike.seatpost && (params = {},
        params.component = "seatpost",
        params.seatpost = $scope.bike.seatpost,
        "Downhill" === $scope.bike.category && (params.category = $scope.bike.category),
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "saddle",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "handlebar",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "grips",
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "stem",
        params.stemDirectMount = "Downhill" === $scope.bike.category,
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "headset",
        params.shisLowerSize = $scope.bike.shisLowerSize,
        params.shisLowerType = $scope.bike.shisLowerType,
        params.shisUpperSize = $scope.bike.shisUpperSize,
        params.shisUpperType = $scope.bike.shisUpperType,
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "brake",
        params.category = $scope.bike.category,
        promises.push(getCompArray(params))),
        $scope.bike && (params = {},
        params.component = "rotor",
        promises.push(getCompArray(params))),
        $location.search().id && promises.push(getSavedBuild()),
        $q.all(promises).then(function() {})["finally"](function() {
            generateScreenshot()
        })
    }
    function findBike() {
        for (var bikes = $rootScope.bikes, i = 0; i < bikes.length; i++) {
            var bike = bikes[i];
            if (bike.url === model) {
                $scope.bike = bike,
                $scope.noResults = !1;
                break
            }
            $scope.noResults = !0
        }
        $scope.noResults === !0 ? ($location.path("/not-found"),
        $scope.noResults = !0) : ($scope.currentSize = $scope.bike.sizes[0],
        getComponents())
    }
    function findSelected(value, parent, colorway) {
        for (var k = 0; k < parent.length; k++)
            if ("drivetrain" === value.category && value.component === parent[k].component) {
                var reset = parent[k];
                delete reset.selection,
                delete reset.index
            } else {
                var reset = parent[k];
                delete reset.selection,
                delete reset.index
            }
        value.selection = !0,
        value.index = colorway
    }
    $scope.bike = {},
    $scope.noResults = !1,
    $scope.price = 0,
    $scope.active = "frame",
    $scope.speed = "",
    $scope.components = {},
    $scope.infoSection = "build",
    $scope.build = null,
    $scope.currentSize = {},
    $scope.bikeSpec = {},
    $scope.mobileSubNav = !1,
    $scope.weight = {
        grams: 0,
        lb: 0,
        oz: 0
    },
    $rootScope.builderToggle = !0,
    $rootScope.triggerLogic = {
        value: 0
    },
    $rootScope.initBuild = {},
    $rootScope.builderModal = null;
    var model = $stateParams.model;
    $rootScope.toggleBuilder = function(bool) {
        $scope.mobileSubNav ? $scope.mobileSubNav = !1 : "undefined" != typeof bool ? $rootScope.builderToggle = bool : $rootScope.builderToggle = !$rootScope.builderToggle
    }
    ,
    $rootScope.launchBuilderModal = function(component, $event) {
        if ($event.stopPropagation(),
        $rootScope.builderLoading = !0,
        component.adModal && component.adModal.markup && component.adModal.markup.length) {
            $rootScope.builderModal = component.adModal,
            $rootScope.builderModal.title = component.manufacturer + " " + component.model,
            $rootScope.builderModal.images = {},
            $rootScope.builderModal.weight = component.weight,
            $rootScope.builderModal.lowestPrice = component.lowestPrice,
            $rootScope.builderAds.push(component._id);
            for (var i = 0; i < component.images.ad.length; i++)
                "mobile" === component.images.ad[i].render ? $rootScope.builderModal.images.mobile = component.images.ad[i] : "desktop" === component.images.ad[i].render && ($rootScope.builderModal.images.desktop = component.images.ad[i])
        }
    }
    ,
    $rootScope.closeBuilderModal = function() {
        $rootScope.builderLoading = !1,
        $rootScope.builderModal = null
    }
    ,
    $scope.setProperty = function(property, value, colorway, parent) {
        function sendGaInfo(data) {
            window.ga("send", "event", "click", "setProperty", {
                dimension1: data
            })
        }
        var gaInfo = "";
        if ($rootScope.loading = !0,
        gaInfo = property,
        $rootScope.conflict.status === !0 && ($rootScope.conflict.status = !1),
        "size" === property) {
            gaInfo = gaInfo + " : " + value + " : " + $scope.bike.year + " " + $scope.bike.manufacturer + " " + $scope.bike.model,
            sendGaInfo(gaInfo);
            for (var i = 0; i < $scope.bike.sizes.length; i++)
                if (i === colorway) {
                    findSelected($scope.bike.sizes[i], parent, colorway),
                    $scope.currentSize = $scope.bike.sizes[i],
                    $scope.build.size = $scope.currentSize;
                    break
                }
            $rootScope.loading = !1
        } else if ("color" === property)
            gaInfo = gaInfo + " : " + value[colorway].color + " : " + $scope.bike.year + " " + $scope.bike.manufacturer + " " + $scope.bike.model,
            sendGaInfo(gaInfo),
            $scope.build.color.color !== value[colorway].color && (findSelected(value[colorway], value, colorway),
            $scope.build.color = value[colorway],
            $scope.setInfo("build"),
            $rootScope.triggerLogic.value++,
            generateScreenshot());
        else if ("cockpit" === property) {
            for (var j = 0; j < $scope.bike.images.builder.length; j++)
                if ($scope.bike.images.builder[j].position && "detail" === $scope.bike.images.builder[j].position) {
                    $scope.build.cockpit = $scope.bike.images.builder[j];
                    break
                }
            $scope.setInfo("build"),
            generateScreenshot()
        } else {
            if ($scope.build && $scope.build[property] === value && $scope.build[property].selected === colorway)
                return void $scope.setInfo("build");
            if ("brakeMount" !== property && "stays" !== property && (gaInfo = gaInfo + " : " + value.manufacturer + " " + value.model + " : " + value.images.vanity[colorway].color,
            sendGaInfo(gaInfo)),
            $rootScope.builderAds.indexOf(value._id) < 0 && value.adModal && value.adModal.markup && value.adModal.markup.length) {
                $rootScope.builderModal = value.adModal,
                $rootScope.builderModal.title = value.manufacturer + " " + value.model,
                $rootScope.builderModal.images = {},
                $rootScope.builderModal.weight = value.weight,
                $rootScope.builderModal.lowestPrice = value.lowestPrice,
                $rootScope.builderAds.push(value._id);
                for (var i = 0; i < value.images.ad.length; i++)
                    "mobile" === value.images.ad[i].render ? $rootScope.builderModal.images.mobile = value.images.ad[i] : "desktop" === value.images.ad[i].render && ($rootScope.builderModal.images.desktop = value.images.ad[i])
            } else
                $rootScope.builderModal = null;
            $scope.build = null === $scope.build || void 0 === $scope.build ? {} : $scope.build,
            $scope.build[property] = value,
            findSelected(value, parent, colorway),
            $scope.build[property].selected = colorway,
            $scope.setInfo("build"),
            $scope.triggerLogic.value++,
            generateScreenshot()
        }
    }
    ,
    $scope.removeProperty = function(property, event) {
        var prop = property
          , comp = "";
        if (event && (event.stopPropagation(),
        event.preventDefault()),
        $rootScope.conflict.status === !0 && ($rootScope.conflict.status = !1),
        "crankset" === prop && $scope.build.crankset.crInclude && delete $scope.build["chain ring"],
        "crankset" !== prop && "chain ring" !== prop || delete $scope.build.spider,
        delete $scope.build[prop],
        "wheels" === prop ? prop = "wheel set" : "rear derailleur" === prop ? (prop = "drivetrain",
        comp = "derailleur") : "rear shifter" === prop ? (prop = "drivetrain",
        comp = "shifter") : "cassette" === prop ? (prop = "drivetrain",
        comp = "cassette") : "chain" === prop ? (prop = "drivetrain",
        comp = "chain") : "rotors" === prop ? prop = "rotor" : "caliper" === prop && (prop = "brake"),
        $scope.components[prop])
            for (var i = 0; i < $scope.components[prop].length; i++)
                "drivetrain" === prop ? $scope.components[prop][i].component === comp && (delete $scope.components[prop][i].selection,
                delete $scope.components[prop][i].selected,
                delete $scope.components[prop][i].index) : (delete $scope.components[prop][i].selection,
                delete $scope.components[prop][i].selected,
                delete $scope.components[prop][i].index);
        $scope.triggerLogic.value++,
        generateScreenshot()
    }
    ,
    $scope.setActive = function(active, $event, sub) {
        "default" === active ? ($event.stopPropagation(),
        $rootScope.mobile === !0 && ($scope.mobileSubNav = !1)) : active === $scope.active && void 0 === $event ? $scope.active = "" : "drivetrain" !== active || "cassette" !== $scope.active && "chain guide" !== $scope.active && "chain ring" !== $scope.active && "chain" !== $scope.active && "crank" !== $scope.active && "der front" !== $scope.active && "der rear" !== $scope.active && "shift front" !== $scope.active && "shift rear" !== $scope.active ? ($scope.active = active,
        $rootScope.mobile === !0 && sub && sub === !0 ? $scope.mobileSubNav = !0 : $scope.mobileSubNav = !1,
        $event && $event.stopPropagation()) : $scope.active = ""
    }
    ,
    $scope.setSpeed = function(speed) {
        function killDt() {
            for (var i = 0; i < dt.length; i++)
                $scope.build[dt[i]] && ($scope.removeProperty($scope.build[dt[i]].component),
                delete $scope.build[dt[i]]);
            dtKill = !1
        }
        var dt = ["cassette", "chain", "crankset", "bottom bracket", "rear derailleur", "rear shifter", "chain ring", "chain guide"]
          , dtKill = !1;
        if ($scope.speed = speed,
        $rootScope.initBuild && JSON.stringify($rootScope.initBuild) !== JSON.stringify({}) && ($rootScope.initBuild.speed = speed),
        speed.length) {
            for (var i = 0; i < ["cassette", "chain", "rear derailleur", "rear shifter"]; i++)
                if ($scope.build[dt[i]].speeds.indexOf(speed) < 0) {
                    dtKill = !0;
                    break
                }
            dtKill === !0 && killDt()
        } else
            killDt();
        $rootScope.triggerLogic.value++,
        generateScreenshot()
    }
    ,
    $scope.setInfo = function(info) {
        $scope.infoSection = info
    }
    ,
    $scope.filterDrivetrain = function(component, category) {
        return function(component) {
            for (var i = 0; i < component.speeds.length; i++) {
                var speed = component.speeds[i];
                if (component.component === category && speed === $scope.speed)
                    return component
            }
        }
    }
    ,
    $scope.closeConflict = function() {
        $rootScope.conflict.status = !1
    }
    ,
    $scope.builderScroll = function() {
        var height = $window.outerHeight - 135;
        $window.scrollTo(0, height)
    }
    ,
    $scope.setColorOpen = function(obj) {
        obj.colorOpen !== !0 && obj.colorOpen !== !1 ? obj.colorOpen = !0 : obj.colorOpen = !obj.colorOpen
    }
    ,
    $rootScope.loading = !0,
    $rootScope.$watch("banners", function(banners) {
        void 0 !== banners && banners["builder header"] && ($scope.bannerMarkup = $sce.trustAsHtml(banners["builder header"][0].markup))
    }),
    void 0 === $rootScope.bikes ? BikeService.bikeList({}).then(function(data) {
        $scope.bikes = data.bikes,
        $rootScope.bikes = data.bikes,
        findBike()
    }) : findBike()
}
]).directive("filter", ["$filter", function($filter) {
    return {
        restrict: "E",
        scope: {
            components: "=components",
            mobile: "=mobile"
        },
        templateUrl: "/modules/builder/directives/filter.client.directive.html",
        link: function(scope, element) {
            scope.price = null,
            scope.weight = null,
            scope.manufacturer = null,
            scope.toggleOrder = function(value) {
                value && scope[value] !== !0 && scope[value] !== !1 ? scope[value] = !0 : scope[value] = !scope[value],
                "price" === value ? (scope.components = $filter("orderBy")(scope.components, (scope.price === !0 ? "+" : "-") + "msrp"),
                scope.weight = null,
                scope.manufacturer = null) : "weight" === value ? (scope.components = $filter("orderBy")(scope.components, (scope.weight === !0 ? "+" : "-") + "weight"),
                scope.price = null,
                scope.manufacturer = null) : "manufacturer" === value && (scope.components = $filter("orderBy")(scope.components, (scope.manufacturer === !0 ? "+" : "-") + "manufacturer"),
                scope.price = null,
                scope.weight = null)
            }
            ,
            setTimeout(function() {
                scope.toggleOrder("manufacturer")
            }, 2e3)
        }
    }
}
]),
angular.module("builder").controller("CanvasController", ["$scope", "$q", "$rootScope", "$location", "$window", "$timeout", "CanvasService", "BuilderService", function($scope, $q, $rootScope, $location, $window, $timeout, CanvasService, BuilderService) {
    function redrawCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height),
        triggerDraw()
    }
    function proxyImage(params, spec) {
        var defer = $q.defer();
        return BuilderService.proxyImage(params).then(function(data) {
            spec.url = data.location,
            imgs.push(data.location),
            defer.resolve()
        }),
        defer.promise
    }
    function triggerDraw() {
        var promises = [];
        for (var key in $scope.bikeSpec) {
            var steerer = !1;
            if ("fork" === key) {
                for (var i = 0; i < $scope.bikeSpec[key].length; i++)
                    "steerer" === $scope.bikeSpec[key][i].position && (steerer = !0);
                steerer || $scope.bikeSpec[key].push({
                    use: "builder",
                    render: "desktop",
                    url: "http://content.bikologi.com/component/2018/rock-shox/fork/lyrik-rct3-black-steerer-desktop.png",
                    position: "steerer",
                    color: "black"
                })
            }
            if ("id" !== key && "category" !== key)
                for (var i = 0; i < $scope.bikeSpec[key].length; i++)
                    promises.push(proxyImage({
                        img: $scope.bikeSpec[key][i].url
                    }, $scope.bikeSpec[key][i]))
        }
        $q.all(promises).then(function() {
            window.util.preloadImages(imgs, drawCanvas)
        })
    }
    var canvas = document.getElementById("bike-canvas")
      , context = canvas.getContext("2d")
      , imgs = []
      , drawCanvas = function(imgs) {
        function drawComponent(srcs, props, under, flip) {
            for (var i = 0; i < srcs.length; i++) {
                var img = imgs[window.location.origin + srcs[i].url];
                context.save(),
                props.angle && context.rotate(props.angle),
                under && (context.globalCompositeOperation = "destination-over"),
                props.flip && context.scale(-1, 1),
                props.height ? context.drawImage(img, props.left, props.top, props.height * img.width / img.height, props.height) : context.drawImage(img, props.left, props.top, props.width, props.width * img.height / img.width),
                context.restore()
            }
            $rootScope.$apply(function() {
                $rootScope.loading = !1,
                null === $rootScope.builderModal && ($rootScope.builderLoading = !1)
            })
        }
        function setDerailleur() {
            var derailleur = []
              , chain = [];
            if ($scope.bikeSpec["rear derailleur"]) {
                for (var i = 0; i < $scope.bikeSpec["rear derailleur"].length; i++)
                    $scope.bikeSpec["rear derailleur"][i].position || derailleur.push($scope.bikeSpec["rear derailleur"][i]),
                    $scope.bikeSpec.chain && "der-color" === $scope.bikeSpec["rear derailleur"][i].position && $scope.bikeSpec.chain[0].color === $scope.bikeSpec["rear derailleur"][i].color && chain.push($scope.bikeSpec["rear derailleur"][i]);
                drawComponent(derailleur, geo["rear derailleur"]),
                $scope.bikeSpec.chain && $scope.bikeSpec.cassette && ($scope.bikeSpec["chain ring"] || $scope.bikeSpec.crankset && $scope.build.crankset.crInclude) && drawComponent(chain, geo["rear derailleur"])
            }
        }
        function setTopChain() {
            $scope.bikeSpec.chain && $scope.bikeSpec["rear derailleur"] && $scope.bikeSpec.cassette && ($scope.bikeSpec["chain ring"] || $scope.bikeSpec.crankset && $scope.build.crankset.crInclude) && ($scope.build["chain guide"] && $scope.build["chain guide"].bottomRoller ? (drawComponent($scope.bikeSpec.chainStruct["chain-top"], geo.chain.top),
            $scope.build.crankset.isOval || $scope.build["chain ring"].isOval ? drawComponent($scope.bikeSpec.chainStruct["chain-ring-oval"], geo.chain.ring) : drawComponent($scope.bikeSpec.chainStruct["chain-ring-roller"], geo.chain.ring),
            drawComponent($scope.bikeSpec.stays, geo.color)) : (drawComponent($scope.bikeSpec.chainStruct["chain-top"], geo.chain.top),
            $scope.build.crankset.isOval || $scope.build["chain ring"].isOval ? drawComponent($scope.bikeSpec.chainStruct["chain-ring-oval"], geo.chain.ring) : drawComponent($scope.bikeSpec.chainStruct["chain-on-ring"], geo.chain.ring),
            drawComponent($scope.bikeSpec.stays, geo.color)),
            $scope.bike.topRoller && drawComponent($scope.bikeSpec.chainStruct["top-roller"], geo.chain.topRoller))
        }
        function setBottomChain() {
            $scope.bikeSpec.chain && $scope.bikeSpec["rear derailleur"] && $scope.bikeSpec.cassette && ($scope.bikeSpec["chain ring"] || $scope.bikeSpec.crankset && $scope.build.crankset.crInclude) && ($scope.build["chain guide"] && $scope.build["chain guide"].bottomRoller ? drawComponent($scope.bikeSpec.chainStruct["chain-bottom-roller"], geo.chain.roller) : $scope.build["chain guide"] && $scope.build["chain guide"].bottomRoller || drawComponent($scope.bikeSpec.chainStruct["chain-bottom"], geo.chain.bottom))
        }
        function setCrankset(position) {
            $scope.bikeSpec.crankset && ("top" === position || "bottom" === position ? $scope.bikeSpec.crankset[0].position === position ? drawComponent([$scope.bikeSpec.crankset[0]], geo.crankRing) : drawComponent([$scope.bikeSpec.crankset[1]], geo.crankRing) : "single" === position && drawComponent([$scope.bikeSpec.crankset[0]], geo.crankset))
        }
        var geo = {}
          , chainStruct = {};
        if (geo = $scope.bikeSpec.canvasMap,
        geo.forkCrown) {
            var messageFork = JSON.parse(JSON.stringify(geo.forkCrown));
            messageFork.height = parseInt(geo.forkCrown.height),
            messageFork.height = messageFork.height - 6
        }
        if ("Downhill" === $scope.bikeSpec.category && $scope.bikeSpec.fork)
            for (var i = 0; i < $scope.bikeSpec.fork.length; i++)
                $scope.bikeSpec.fork[i].position || drawComponent([$scope.bikeSpec.fork[i]], geo.fork, !0);
        if ($scope.bikeSpec.color && drawComponent($scope.bikeSpec.color, geo.color, "Downhill" === $scope.bikeSpec.category),
        $scope.bikeSpec.stem && drawComponent($scope.bikeSpec.stem, geo.stem, !0),
        $scope.bikeSpec.fork && "Downhill" !== $scope.bikeSpec.category) {
            for (var forkCrown, forkLowers, steerer, i = 0; i < $scope.bikeSpec.fork.length; i++)
                "bottom" === $scope.bikeSpec.fork[i].position ? forkLowers = [$scope.bikeSpec.fork[i]] : "top" === $scope.bikeSpec.fork[i].position ? forkCrown = [$scope.bikeSpec.fork[i]] : "steerer" === $scope.bikeSpec.fork[i].position && (steerer = [$scope.bikeSpec.fork[i]]);
            $scope.bikeSpec.cockpit && drawComponent($scope.bikeSpec.cockpit, geo.cockpit, "Downhill" === $scope.bikeSpec.category),
            steerer && drawComponent(steerer, geo.steerer, !0),
            "Trust" === $scope.build.fork.manufacturer && "Message" === $scope.build.fork.model ? (drawComponent(forkLowers, messageFork, !1),
            drawComponent(forkCrown, messageFork, !0)) : (drawComponent(forkLowers, geo.forkLowers, !1),
            drawComponent(forkCrown, geo.forkCrown, !0))
        }
        if ($scope.bikeSpec.shock)
            if ($scope.bike.shockFlipped) {
                for (var i = 0; i < $scope.bikeSpec.shock.length; i++)
                    if ($scope.bikeSpec.shock[i].flipped && "decal" !== $scope.bikeSpec.shock[i].position) {
                        drawComponent([$scope.bikeSpec.shock[i]], geo.shock, !0, !0);
                        break
                    }
            } else
                for (var i = 0; i < $scope.bikeSpec.shock.length; i++)
                    if ("decal" !== $scope.bikeSpec.shock[i].position && !$scope.bikeSpec.shock[i].flipped) {
                        drawComponent([$scope.bikeSpec.shock[i]], geo.shock, !0, !0);
                        break
                    }
        if ($scope.bikeSpec.seatpost && drawComponent($scope.bikeSpec.seatpost, geo.seatpost, !0),
        $scope.bikeSpec.saddle && drawComponent($scope.bikeSpec.saddle, geo.saddle),
        $scope.bikeSpec.cassette && ($scope.build.cassette.speeds.indexOf("1 x 12") < 0 ? drawComponent($scope.bikeSpec.cassette, geo.cassette, !0) : drawComponent($scope.bikeSpec.cassette, geo.bigCassette, !0)),
        $scope.bikeSpec["bottom bracket"] && drawComponent($scope.bikeSpec["bottom bracket"], geo.bb),
        $scope.bikeSpec.chain) {
            if ($scope.bike.topRoller)
                for (var i = 0; i < $scope.bikeSpec.chain.length; i++)
                    "chain-top" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-top"] = [$scope.bikeSpec.chain[i]] : "chain-bottom" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-bottom"] = [$scope.bikeSpec.chain[i]] : "top-chain-ring" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-on-ring"] = [$scope.bikeSpec.chain[i]] : "chain-bottom-roller" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-bottom-roller"] = [$scope.bikeSpec.chain[i]] : "top-chain-ring-roller" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-ring-roller"] = [$scope.bikeSpec.chain[i]] : "top-chain-ring-oval" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-ring-oval"] = [$scope.bikeSpec.chain[i]] : "top-chain-ring-oval-roller" === $scope.bikeSpec.chain[i].position ? chainStruct["chain-ring-oval-roller"] = [$scope.bikeSpec.chain[i]] : "top-roller" === $scope.bikeSpec.chain[i].position && (chainStruct["top-roller"] = [$scope.bikeSpec.chain[i]]);
            else
                for (var i = 0; i < $scope.bikeSpec.chain.length; i++)
                    chainStruct[$scope.bikeSpec.chain[i].position] = [$scope.bikeSpec.chain[i]];
            $scope.bikeSpec.chainStruct = chainStruct
        }
        if ($scope.bikeSpec["chain guide"] && $scope.bikeSpec["chain ring"] ? "top" === $scope.bikeSpec["chain guide"][0].position ? (drawComponent([$scope.bikeSpec["chain guide"][1]], geo["chain guide"]),
        drawComponent($scope.bikeSpec["chain ring"], geo["chain ring"]),
        $scope.bikeSpec.spider && drawComponent($scope.bikeSpec.spider, geo.spider),
        setTopChain(),
        setDerailleur(),
        setBottomChain(),
        drawComponent([$scope.bikeSpec["chain guide"][0]], geo["chain guide"])) : (drawComponent([$scope.bikeSpec["chain guide"][0]], geo["chain guide"]),
        drawComponent($scope.bikeSpec["chain ring"], geo["chain ring"]),
        $scope.bikeSpec.spider && drawComponent($scope.bikeSpec.spider, geo.spider),
        setTopChain(),
        setDerailleur(),
        setBottomChain(),
        drawComponent([$scope.bikeSpec["chain guide"][1]], geo["chain guide"])) : $scope.bikeSpec["chain guide"] && !$scope.bikeSpec["chain ring"] ? "top" === $scope.bikeSpec["chain guide"][0].position ? (drawComponent([$scope.bikeSpec["chain guide"][1]], geo["chain guide"]),
        $scope.bikeSpec.crankset && $scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("bottom"),
        setTopChain(),
        $scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("top"),
        setDerailleur(),
        setBottomChain(),
        drawComponent([$scope.bikeSpec["chain guide"][0]], geo["chain guide"])) : (drawComponent([$scope.bikeSpec["chain guide"][0]], geo["chain guide"]),
        $scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("bottom"),
        setTopChain(),
        $scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("top"),
        setDerailleur(),
        setBottomChain(),
        drawComponent([$scope.bikeSpec["chain guide"][1]], geo["chain guide"])) : $scope.bikeSpec["chain ring"] && !$scope.bikeSpec["chain guide"] ? (drawComponent($scope.bikeSpec["chain ring"], geo["chain ring"]),
        $scope.bikeSpec.spider && drawComponent($scope.bikeSpec.spider, geo.spider),
        setTopChain(),
        setDerailleur(),
        setBottomChain()) : ($scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("bottom"),
        setTopChain(),
        $scope.bikeSpec.crankset && $scope.build.crankset.crInclude && setCrankset("top"),
        setDerailleur(),
        setBottomChain()),
        $scope.bikeSpec.crankset && !$scope.build.crankset.crInclude && setCrankset("single"),
        $scope.bikeSpec["wheel set"] && ("27.5+" === $scope.build["wheel set"].wheelSize ? (geo.plusWheels = [JSON.parse(JSON.stringify(geo.wheels[0])), JSON.parse(JSON.stringify(geo.wheels[1]))],
        geo.plusWheels[0].width = parseInt(geo.plusWheels[0].width) - 10,
        geo.plusWheels[1].width = parseInt(geo.plusWheels[1].width) - 10,
        geo.plusWheels[0].left = parseInt(geo.plusWheels[0].left) + 5,
        geo.plusWheels[1].left = parseInt(geo.plusWheels[1].left) + 5,
        geo.plusWheels[0].top = parseInt(geo.plusWheels[0].top) + 5,
        geo.plusWheels[1].top = parseInt(geo.plusWheels[1].top) + 5,
        drawComponent($scope.bikeSpec["wheel set"], geo.plusWheels[0], !0),
        drawComponent($scope.bikeSpec["wheel set"], geo.plusWheels[1], !0)) : (drawComponent($scope.bikeSpec["wheel set"], geo.wheels[0], !0),
        drawComponent($scope.bikeSpec["wheel set"], geo.wheels[1], !0))),
        $scope.bikeSpec["front tire"] && drawComponent($scope.bikeSpec["front tire"], geo["front tire"], !0),
        $scope.bikeSpec["rear tire"] && drawComponent($scope.bikeSpec["rear tire"], geo["rear tire"], !0),
        $scope.bikeSpec.pedals && drawComponent($scope.bikeSpec.pedals, geo.pedals),
        $scope.bikeSpec.caliper && ("bottom" === $scope.bikeSpec.caliper[0].position ? (drawComponent([$scope.bikeSpec.caliper[0]], geo["caliper front"], !0),
        drawComponent([$scope.bikeSpec.caliper[1]], geo["caliper rear"], !0),
        drawComponent($scope.bikeSpec.brakeMount, geo.color, !0)) : $scope.bikeSpec.caliper[1] && "bottom" === $scope.bikeSpec.caliper[1].position ? (drawComponent([$scope.bikeSpec.caliper[1]], geo["caliper front"], !0),
        drawComponent([$scope.bikeSpec.caliper[0]], geo["caliper rear"], !0),
        drawComponent($scope.bikeSpec.brakeMount, geo.color, !0)) : (drawComponent($scope.bikeSpec.caliper, geo["caliper front"], !0),
        drawComponent($scope.bikeSpec.caliper, geo["caliper rear"], !0),
        drawComponent($scope.bikeSpec.brakeMount, geo.color, !0))),
        $scope.bikeSpec.fork) {
            for (var i = 0; i < $scope.bikeSpec.fork.length; i++)
                if ("brake-mount" === $scope.bikeSpec.fork[i].position) {
                    if ("Downhill" === $scope.bikeSpec.category) {
                        drawComponent([$scope.bikeSpec.fork[i]], geo.fork, !0);
                        break
                    }
                    if ("Trust" === $scope.build.fork.manufacturer && "Message" === $scope.build.fork.model) {
                        drawComponent([$scope.bikeSpec.fork[i]], messageFork, !0);
                        break
                    }
                    drawComponent([$scope.bikeSpec.fork[i]], geo.forkLowers, !0);
                    break
                }
            $scope.bikeSpec.cockpit && drawComponent($scope.bikeSpec.cockpit, geo.cockpit, "Downhill" === $scope.bikeSpec.category)
        }
        if ($scope.bikeSpec.rotors && (drawComponent($scope.bikeSpec.rotors, geo["rear rotor"], !0),
        drawComponent($scope.bikeSpec.rotors, geo["front rotor"], !0)),
        $scope.bikeSpec.headset) {
            var headsetUnder = "Downhill" === $scope.bikeSpec.category || null;
            "bottom" === $scope.bikeSpec.headset[0].position ? (drawComponent([$scope.bikeSpec.headset[0]], geo.headset[0], headsetUnder),
            drawComponent([$scope.bikeSpec.headset[1]], geo.headset[1], headsetUnder)) : (drawComponent([$scope.bikeSpec.headset[0]], geo.headset[1], headsetUnder),
            drawComponent([$scope.bikeSpec.headset[1]], geo.headset[0], headsetUnder))
        }
    };
    $scope.$watch("bikeSpec", function(params) {
        redrawCanvas()
    })
}
]),
angular.module("builder").controller("BuildLogicController", ["$scope", "$rootScope", "$location", "$window", "$timeout", function($scope, $rootScope, $location, $window, $timeout) {
    function getComponent(parent, id) {
        for (var key in $scope.components[parent]) {
            var comp = $scope.components[parent][key];
            if (comp._id === id)
                return comp
        }
    }
    function calcComplete(build) {
        var total = 0
          , active = 0
          , map = {
            "bottom bracket": !0,
            brakeMount: !1,
            caliper: !0,
            cassette: !0,
            chain: !0,
            "chain guide": !1,
            "chain ring": !0,
            cockpit: !0,
            color: !0,
            crankset: !0,
            fork: !0,
            rotors: !0,
            "front tire": !0,
            grip: !0,
            handlebar: !0,
            headset: !0,
            spider: !1,
            "rear derailleur": !0,
            "rear tire": !0,
            saddle: !0,
            seatpost: !0,
            shifter: !0,
            shock: "Hardtail" !== $scope.bike.category,
            size: !0,
            stem: !0,
            "wheel set": !0,
            pedals: !1
        };
        "Insurgent" === $scope.bike.model && "Evil" === $scope.bike.manufacturer && $scope.build ? ($scope.build.headset = {},
        $scope.build["chain guide"] = {},
        $scope.build.headset.manufacturer = "included",
        $scope.build["chain guide"].manufacturer = "included") : "Wreckoning" === $scope.bike.model && "Evil" === $scope.bike.manufacturer && $scope.build ? ($scope.build.headset = {},
        $scope.build["chain guide"] = {},
        $scope.build.headset.manufacturer = "included",
        $scope.build["chain guide"].manufacturer = "included") : "Spartan Carbon" !== $scope.bike.model && "Troy Carbon" !== $scope.bike.model || "Devinci" !== $scope.bike.manufacturer || !$scope.build ? "Rip 9 RDO" === $scope.bike.model && "Niner" === $scope.bike.manufacturer && $scope.build ? ($scope.build.headset = {},
        $scope.build.headset.manufacturer = "included") : "YT" === $scope.bike.manufacturer && $scope.build ? ($scope.build.headset = {},
        $scope.build.headset.manufacturer = "included") : "Evil" === $scope.bike.manufacturer && "Following" === $scope.bike.model && $scope.build ? ($scope.build.headset = {},
        $scope.build.headset.manufacturer = "included") : "Mondraker" === $scope.bike.manufacturer && $scope.build && ($scope.build.headset = {},
        $scope.build.headset.manufacturer = "included") : ($scope.build.headset = {},
        $scope.build.headset.manufacturer = "included"),
        $scope.build && $scope.build.crankset && $scope.build.crankset.crInclude === !0 && ($scope.build["chain ring"] = {},
        $scope.build["chain ring"].manufacturer = "included",
        map["chain ring"] = !1);
        for (var key in build)
            map[key] === !1 && (map[key] = !0),
            active++;
        for (key in map)
            map[key] === !0 && total++;
        $rootScope.completeness.percent = active / total * 100,
        $rootScope.completeness.total = total,
        $rootScope.completeness.active = active,
        $rootScope.completeness.percent > 20 && $rootScope.saveBuild && void 0 !== typeof $rootScope.saveBuild && ($rootScope.authentication.user ? $rootScope.authentication.user && !$location.search().id && $rootScope.authentication.user.builds && $rootScope.authentication.user.builds.indexOf($rootScope.bId) < 0 && $rootScope.saveBuild("", 0) : $rootScope.saveBuild("", 0))
    }
    function calcWeightPrice() {
        var price = 0
          , weight = {
            grams: 0,
            lb: 0,
            oz: 0
        };
        if (null !== $scope.build) {
            for (var key in $scope.build)
                "caliper" !== key && "rotors" !== key || ($scope.build[key].lowestPrice && (price += parseFloat($scope.build[key].lowestPrice)),
                $scope.build[key].weight && (weight.grams += $scope.build[key].weight)),
                $scope.build[key].lowestPrice && (price += parseFloat($scope.build[key].lowestPrice)),
                $scope.build[key].weight && (weight.grams += $scope.build[key].weight);
            price += $scope.bike.lowestPrice ? parseFloat($scope.bike.lowestPrice) : parseFloat($scope.bike.msrp),
            weight.grams += $scope.bike.weight
        }
        weight.lb = window.util.gramsToLbs(weight.grams).lbs,
        weight.oz = window.util.gramsToLbs(weight.grams).oz,
        $scope.price = price.toFixed(2),
        $scope.weight = weight
    }
    function checkCrank(params) {
        var build = params
          , ring = {}
          , crank = {}
          , spider = {};
        if (build && build["chain ring"] && build.crankset && (ring = build["chain ring"],
        crank = build.crankset,
        spider = build.spider,
        ring.directRingMount !== crank.directRingMount ? void 0 !== ring.boltCircleDiameter && "cinch" === crank.directRingMount ? 104 !== ring.boltCircleDiameter || spider && "5689a3a1fd5063f09168a254" === spider._id || $scope.setProperty(getComponent("drivetrain", "5689a3a1fd5063f09168a254").component, getComponent("drivetrain", "5689a3a1fd5063f09168a254"), 0, []) : void 0 !== ring.boltCircleDiameter && "sram" === crank.directRingMount && (104 !== ring.boltCircleDiameter || spider && "5689b2689db0630c00606b17" === spider._id ? 94 !== ring.boltCircleDiameter || spider && "568ada6f5d6ecd0c004d53fb" === spider._id || $scope.setProperty(getComponent("drivetrain", "5689b2689db0630c00606b17").component, getComponent("drivetrain", "568ada6f5d6ecd0c004d53fb"), 0, []) : $scope.setProperty(getComponent("drivetrain", "5689b2689db0630c00606b17").component, getComponent("drivetrain", "5689b2689db0630c00606b17"), 0, [])) : ring.directRingMount === crank.directRingMount && spider && $scope.removeProperty("spider")),
        build && build.crankset) {
            if (crank = build.crankset,
            crank.crInclude === !0)
                for (var i = 0; i < $scope.components["chain ring"].length; i++)
                    $scope.components["chain ring"][i].compatible = !1;
            else if (crank.directRingMount)
                for (var i = 0; i < $scope.components["chain ring"].length; i++)
                    $scope.components["chain ring"][i].directRingMount !== crank.directRingMount ? "cinch" === crank.directRingMount && 104 === $scope.components["chain ring"][i].boltCircleDiameter ? $scope.components["chain ring"][i].compatible = !0 : "sram" === crank.directRingMount && 104 === $scope.components["chain ring"][i].boltCircleDiameter ? $scope.components["chain ring"][i].compatible = !0 : "sram" === crank.directRingMount && 94 === $scope.components["chain ring"][i].boltCircleDiameter ? $scope.components["chain ring"][i].compatible = !0 : $scope.components["chain ring"][i].compatible = !1 : $scope.components["chain ring"][i].compatible = !0;
            else if (crank.boltCircleDiameter)
                for (var i = 0; i < $scope.components["chain ring"].length; i++)
                    $scope.components["chain ring"][i].boltCircleDiameter !== crank.boltCircleDiameter ? $scope.components["chain ring"][i].compatible = !1 : $scope.components["chain ring"][i].compatible = !0;
            if (!build["chain ring"])
                for (var i = 0; i < $scope.components.crankset.length; i++)
                    $scope.components.crankset[i].compatible = !0
        }
        if (build && build["chain ring"]) {
            if (ring = build["chain ring"],
            ring.directRingMount)
                for (var i = 0; i < $scope.components.crankset.length; i++)
                    $scope.components.crankset[i].directRingMount !== ring.directRingMount ? ($scope.components.crankset[i].compatible = !1,
                    $scope.components.crankset[i].compatibility = "chain ring") : ($scope.components.crankset[i].compatible = !0,
                    "chain ring" === $scope.components.crankset[i].compatibility && delete $scope.components.crankset[i].compatibility),
                    $scope.components.crankset[i].crInclude && ($scope.components.crankset[i].compatible = !1,
                    $scope.components.crankset[i].compatibility = "chain ring");
            else if (ring.boltCircleDiameter)
                for (var i = 0; i < $scope.components.crankset.length; i++)
                    $scope.components.crankset[i].boltCircleDiameter !== ring.boltCircleDiameter ? 104 === ring.boltCircleDiameter && "cinch" === $scope.components.crankset[i].directRingMount ? ($scope.components.crankset[i].compatible = !0,
                    "chain ring" === $scope.components.crankset[i].compatibility && delete $scope.components.crankset[i].compatibility) : 104 === ring.boltCircleDiameter && "sram" === $scope.components.crankset[i].directRingMount ? ($scope.components.crankset[i].compatible = !0,
                    "chain ring" === $scope.components.crankset[i].compatibility && delete $scope.components.crankset[i].compatibility) : ($scope.components.crankset[i].compatible = !1,
                    $scope.components.crankset[i].compatibility = "chain ring") : ($scope.components.crankset[i].compatible = !0,
                    "chain ring" === $scope.components.crankset[i].compatibility && delete $scope.components.crankset[i].compatibility);
            if (!build.crankset)
                for (var i = 0; i < $scope.components["chain ring"].length; i++)
                    $scope.components["chain ring"][i].compatible = !0;
            for (var i = 0; i < $scope.components.crankset.length; i++)
                $scope.components.crankset[i].crInclude === !0 && "included" !== build["chain ring"].manufacturer && build["chain guide"] && "included" === build["chain guide"].manufacturer && ($scope.components.crankset[i].compatible = !1,
                $scope.components.crankset[i].compatibility = "chain ring")
        }
        if (build && !build["chain ring"] && !build.crankset) {
            for (var i = 0; i < $scope.components.crankset.length; i++)
                $scope.components.crankset[i].compatible = !0;
            for (var i = 0; i < $scope.components["chain ring"].length; i++)
                $scope.components["chain ring"][i].compatible = !0
        }
    }
    function checkChainGuide(params) {}
    function check1x11Speed(params) {
        var build = params
          , cassette = {}
          , derailleur = {}
          , shifter = {}
          , chain = {}
          , brands = {}
          , components = [];
        !x11 && "warning-1x11" !== $rootScope.conflict.type && build && (build.cassette || build.derailleur || build.shifter || build.chain) && (cassette = build.cassette,
        derailleur = build["rear derailleur"],
        shifter = build.shifter,
        chain = build.chain,
        "1 x 11" === $scope.speed && (cassette && (brands[cassette.manufacturer] = !0,
        components.push(cassette)),
        derailleur && (brands[derailleur.manufacturer] = !0,
        components.push(derailleur)),
        shifter && (brands[shifter.manufacturer] = !0,
        components.push(shifter)),
        chain && (brands[chain.manufacturer] = !0,
        components.push(chain))))
    }
    function checkBB(params) {
        var build = params
          , crank = {}
          , bb = {}
          , cpb = "";
        if (build && build.crankset) {
            crank = build.crankset,
            cpb = crank.bbCompatability;
            for (var i = 0; i < $scope.components["bottom bracket"].length; i++) {
                var bbList = $scope.components["bottom bracket"][i];
                bbList.bbCompatability !== cpb ? bbList.compatible = !1 : bbList.compatible = !0
            }
            if (!build.bb)
                for (var ii = 0; ii < $scope.components.crankset.length; ii++) {
                    var crankList = $scope.components.crankset[ii];
                    crankList.compatibility && "chain ring" === crankList.compatibility || (crankList.compatible = !0)
                }
        }
        if (build && build.bb) {
            bb = build.bb,
            cpb = bb.bbCompatability;
            for (var j = 0; j < $scope.components.crankset.length; j++) {
                var crankList = $scope.components.crankset[j];
                crankList.bbCompatability !== cpb ? crankList.compatible = !1 : crankList.compatibility && "chain ring" === crankList.compatibility || (crankList.compatible = !0)
            }
            if (!build.crankset)
                for (var jj = 0; jj < $scope.components["bottom bracket"].length; jj++) {
                    var bbList = $scope.components["bottom bracket"][jj];
                    bbList.compatible = !0
                }
        }
        if (build && !build.bb && !build.crankset) {
            for (var k = 0; k < $scope.components["bottom bracket"].length; k++) {
                var bbList = $scope.components["bottom bracket"][k];
                bbList.compatible = !0
            }
            for (var l = 0; l < $scope.components.crankset.length; l++) {
                var crankList = $scope.components.crankset[l];
                crankList.compatibility && "chain ring" === crankList.compatibility || (crankList.compatible = !0)
            }
        }
    }
    function checkClamp(params) {
        var build = params
          , stem = {}
          , bar = {};
        if (build && build.stem && (stem = build.stem,
        !build.handlebar)) {
            for (var i = 0; i < $scope.components.stem.length; i++) {
                var stemList = $scope.components.stem[i];
                stemList.compatible = !0
            }
            for (var i = 0; i < $scope.components.handlebar.length; i++) {
                var barList = $scope.components.handlebar[i];
                barList.barClampSize !== stem.stemClampSize ? barList.compatible = !1 : barList.compatible = !0
            }
        }
        if (build && build.handlebar && (bar = build.handlebar,
        !build.stem)) {
            for (var i = 0; i < $scope.components.handlebar.length; i++) {
                var barList = $scope.components.handlebar[i];
                barList.compatible = !0
            }
            for (var i = 0; i < $scope.components.stem.length; i++) {
                var stemList = $scope.components.stem[i];
                stemList.stemClampSize !== bar.barClampSize ? stemList.compatible = !1 : stemList.compatible = !0
            }
        }
        if (build && !build.handlebar && !build.stem) {
            for (var i = 0; i < $scope.components.handlebar.length; i++) {
                var barList = $scope.components.handlebar[i];
                barList.compatible = !0
            }
            for (var i = 0; i < $scope.components.stem.length; i++) {
                var stemList = $scope.components.stem[i];
                stemList.compatible = !0
            }
        }
    }
    function checkShifter(params) {
        var build = params;
        if (build && build["rear shifter"]) {
            for (var shifter = build["rear shifter"], i = 0; i < $scope.components.drivetrain.length; i++) {
                var derList = $scope.components.drivetrain[i];
                "derailleur" === derList.component && (derList.shiftLeverage !== shifter.shiftLeverage ? derList.compatible = !1 : derList.compatible = !0)
            }
            if (!build["rear derailleur"])
                for (var i = 0; i < $scope.components.drivetrain.length; i++) {
                    var shifterList = $scope.components.drivetrain[i];
                    "shifter" === shifterList.component && (shifterList.compatible = !0)
                }
        }
        if (build && build["rear derailleur"]) {
            for (var derailleur = build["rear derailleur"], i = 0; i < $scope.components.drivetrain.length; i++) {
                var shifterList = $scope.components.drivetrain[i];
                "shifter" === shifterList.component && (shifterList.shiftLeverage !== derailleur.shiftLeverage ? shifterList.compatible = !1 : shifterList.compatible = !0)
            }
            if (!build["rear shifter"])
                for (var i = 0; i < $scope.components.drivetrain.length; i++) {
                    var derList = $scope.components.drivetrain[i];
                    "derailleur" === derList.component && (derList.compatible = !0)
                }
        }
        if (build && !build["rear derailleur"] && !build["rear shifter"])
            for (var i = 0; i < $scope.components.drivetrain.length; i++) {
                var compList = $scope.components.drivetrain[i];
                "derailleur" !== compList.component && "shifter" !== compList || (compList.compatible = !0)
            }
    }
    function checkPlusWheels(params) {
        var build = params
          , wheels = {}
          , tire = {};
        if (build && build["wheel set"]) {
            wheels = build["wheel set"];
            for (var i = 0; i < $scope.components["front tire"].length; i++) {
                var tire = $scope.components["front tire"][i];
                tire.wheelSize !== wheels.wheelSize ? tire.compatible = !1 : tire.compatible = !0
            }
            for (var i = 0; i < $scope.components["rear tire"].length; i++) {
                var tire = $scope.components["rear tire"][i];
                tire.wheelSize !== wheels.wheelSize ? tire.compatible = !1 : tire.compatible = !0
            }
            if (!build["front tire"] && !build["rear tire"])
                for (var i = 0; i < $scope.components["wheel set"].length; i++) {
                    var wheelList = $scope.components["wheel set"][i];
                    wheelList.compatible = !0
                }
        }
        if (build && (build["front tire"] || build["rear tire"])) {
            tire = build["front tire"] ? build["front tire"] : build["rear tire"];
            for (var i = 0; i < $scope.components["wheel set"].length; i++) {
                var wheelList = $scope.components["wheel set"][i];
                tire.wheelSize !== wheelList.wheelSize ? wheelList.compatible = !1 : wheelList.compatible = !0
            }
            if (!build["wheel set"]) {
                if (build["front tire"] && !build["rear tire"]) {
                    for (var i = 0; i < $scope.components["front tire"].length; i++) {
                        var tireList = $scope.components["front tire"][i];
                        tireList.compatible = !0
                    }
                    for (var i = 0; i < $scope.components["rear tire"].length; i++) {
                        var tireList = $scope.components["rear tire"][i];
                        tireList.wheelSize !== build["front tire"].wheelSize ? tireList.compatible = !1 : tireList.compatible = !0
                    }
                }
                if (!build["front tire"] && build["rear tire"]) {
                    for (var i = 0; i < $scope.components["rear tire"].length; i++) {
                        var tireList = $scope.components["rear tire"][i];
                        tireList.compatible = !0
                    }
                    for (var i = 0; i < $scope.components["front tire"].length; i++) {
                        var tireList = $scope.components["front tire"][i];
                        tireList.wheelSize !== build["rear tire"].wheelSize ? tireList.compatible = !1 : tireList.compatible = !0
                    }
                }
            }
        }
        if (build && !build["front tire"] && !build["rear tire"] && !build["wheel set"]) {
            for (var i = 0; i < $scope.components["front tire"].length; i++) {
                var tireList = $scope.components["front tire"][i];
                tireList.compatible = !0
            }
            for (var i = 0; i < $scope.components["rear tire"].length; i++) {
                var tireList = $scope.components["rear tire"][i];
                tireList.compatible = !0
            }
            for (var i = 0; i < $scope.components["wheel set"].length; i++) {
                var wheelList = $scope.components["wheel set"][i];
                wheelList.compatible = !0
            }
        }
    }
    function checkTrekBB(params) {
        if ("bb90" === $scope.bike.bottomBracket && $scope.components && $scope.components.crankset)
            for (var i = 0; i < $scope.components.crankset.length; i++)
                "30mm" === $scope.components.crankset[i].bbCompatability && ($scope.components.crankset[i].compatible = !1,
                $scope.components.crankset[i].compatibility = "proprietary bullshit")
    }
    var x11 = !1;
    $scope.builderView = !0,
    $rootScope.conflict = {
        status: !1,
        components: [],
        type: ""
    },
    $rootScope.completeness = {
        percent: 0,
        total: 0,
        active: 0
    },
    $rootScope.closeAffiliateModal = function() {
        $rootScope.affiliateModal = !1
    }
    ,
    $rootScope.toggleBuilderView = function() {
        $scope.builderView = !$scope.builderView
    }
    ,
    $scope.$watch("triggerLogic.value", function(int) {
        var params = $scope.build;
        calcComplete(params),
        calcWeightPrice(),
        check1x11Speed(params),
        checkShifter(params),
        checkCrank(params),
        checkBB(params),
        checkPlusWheels(params),
        checkChainGuide(params),
        checkClamp(params),
        checkTrekBB(params)
    }, !0),
    $scope.$watch("bike.weight", function(params) {
        calcWeightPrice()
    }, !0)
}
]),
angular.module("builder").controller("ShopMapController", ["$scope", "$anchorScroll", "$sce", "$rootScope", "$location", "ShopService", "LeadService", "NgMap", function($scope, $anchorScroll, $sce, $rootScope, $location, ShopService, LeadService, NgMap) {
    var lead = {};
    $scope.parent = $scope.$parent.$parent.$parent.$parent.$parent.$parent,
    $scope.bike = $scope.parent.bike,
    $scope.completeness = null,
    $scope.mapCTA = !0,
    $scope.userCoords = [],
    $scope.lat = 37,
    $scope["long"] = -110,
    $scope.zoom = 4,
    $scope.shop = null,
    $scope.showDealerModal = !1,
    $scope.dealerRequest = {
        method: "email",
        isHuman: !1
    },
    $scope.mapLoading = !1,
    $scope.validation = {},
    NgMap.getMap().then(function(map) {
        $scope.map = map
    }),
    $scope.parent.$watch("build", function() {
        $scope.completeness = $scope.parent.completeness
    }),
    $scope.userLocation = function() {
        $scope.mapLoading = !0,
        navigator.geolocation ? navigator.geolocation.getCurrentPosition(function(position) {
            $scope.$apply(function() {
                $scope.lat = position.coords.latitude,
                $scope["long"] = position.coords.longitude,
                $scope.zoom = 9,
                $scope.mapCTA = !1,
                $scope.mapLoading = !1
            })
        }, function(error) {
            $scope.mapCTA = !1,
            $scope.mapLoading = !1
        }, {
            timeout: 5e3
        }) : (alert("No location found."),
        $scope.mapCTA = !1,
        $scope.mapLoading = !1)
    }
    ,
    $scope.toggleDealerModal = function() {
        $scope.showDealerModal = !$scope.showDealerModal
    }
    ,
    $scope.sendToDealer = function() {
        $scope.testName($scope.dealerRequest.name),
        $scope.testEmail($scope.dealerRequest.email),
        $scope.dealerRequest.phonre && $scope.testPhone($scope.dealerRequest.phone),
        $scope.validation.email.status === !0 && $scope.validation.name.status === !0 && ($scope.dealerRequest.phone && $scope.validation.phone.status === !0 || !$scope.dealerRequest.phone) && $scope.dealerRequest.isHuman && (lead.buildId = $rootScope.bId,
        lead.url = $scope.bike.url,
        lead.shopId = $scope.shop._id,
        lead.shop = $scope.shop,
        lead.name = $scope.dealerRequest.name,
        lead.email = $scope.dealerRequest.email,
        lead.phone = $scope.dealerRequest.phone ? $scope.dealerRequest.phone : null,
        lead.methodOfContact = $scope.dealerRequest.method,
        lead.notes = $scope.dealerRequest.notes ? $scope.dealerRequest.notes : null,
        lead.location = [$scope.lat, $scope["long"]],
        $rootScope.authentication.user && $rootScope.authentication.user.fbId && (lead.userId = $rootScope.authentication.user.fbId,
        lead.fbUser = !0),
        $rootScope.authentication.user && $rootScope.authentication.user.username && (lead.userId = $rootScope.authentication.user.username,
        lead.fbUser = !1),
        LeadService.saveLead(lead).then(function(data) {
            data.success ? $scope.validation.dealerRequest = {
                status: !0,
                message: data.success
            } : $scope.validation.dealerRequest = {
                status: !1,
                message: "There was an error."
            }
        }))
    }
    ,
    $scope.setHuman = function() {
        $scope.dealerRequest.isHuman = !0
    }
    ,
    $scope.testName = function(name) {
        !name || name.length < 2 ? $scope.validation.name = {
            status: !1,
            message: "name is required"
        } : $scope.validation.name = {
            status: !0
        }
    }
    ,
    $scope.testPhone = function(phone) {
        phone && (window.util.validatePhone(phone) ? $scope.validation.phone = {
            status: !0,
            message: "valid phone number"
        } : $scope.validation.phone = {
            status: !1,
            message: "not a valid phone number"
        })
    }
    ,
    $scope.testEmail = function(email) {
        email ? window.util.validateEmail(email) ? $scope.validation.email = {
            status: !0,
            message: "valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "email is required"
        }
    }
    ,
    $scope.showBikeShop = function(event, shop) {
        $scope.map.setCenter(event.latLng),
        $scope.shop = shop,
        $scope.map.showInfoWindow("location", shop._id),
        $scope.shop = shop
    }
    ,
    ShopService.shopList({}).then(function(data) {
        for (var i = 0; i < data.shops.length; i++) {
            var shop = data.shops[i];
            shop.brandAvailable = !1;
            for (var ii = 0; ii < shop.manufacturers.length; ii++)
                if (shop.manufacturers[ii].name === $scope.bike.manufacturer) {
                    shop.brandAvailable = !0;
                    break
                }
        }
        $scope.shops = data.shops
    })
}
]),
angular.module("builder").controller("SelectorController", ["$scope", "$anchorScroll", "$sce", "$rootScope", "$location", "BikeService", function($scope, $anchorScroll, $sce, $rootScope, $location, BikeService) {
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $scope.query = "",
    $scope.filtered = [],
    $scope.resetFilter = function() {
        $scope.query = ""
    }
    ,
    $scope.search = function(bike) {
        if ($scope.query && "d-ad" !== bike.manufacturer && bike.manufacturer.toLowerCase().indexOf($scope.query.toLowerCase()) == -1 && bike.model.toLowerCase().indexOf($scope.query.toLowerCase()) == -1) {
            if ($scope.query.indexOf(" ") > 0) {
                var manufacturer = $scope.query.substr(0, $scope.query.indexOf(" "))
                  , model = $scope.query.substr($scope.query.indexOf(" ") + 1);
                return bike.manufacturer.toLowerCase().indexOf(manufacturer.toLowerCase()) != -1 && bike.model.toLowerCase().indexOf(model.toLowerCase()) != -1
            }
            return !1
        }
        return !0
    }
    ,
    BikeService.bikeList({}).then(function(data) {
        $rootScope.bikes = data.bikes,
        $rootScope.loading = !1
    })
}
]),
angular.module("builder").controller("BuildShareController", ["$scope", "$q", "$rootScope", "$stateParams", "BikeService", "BuilderService", "Upload", "$timeout", "AuthService", function($scope, $q, $rootScope, $stateParams, BikeService, BuilderService, Upload, $timeout, AuthService) {
    $scope.shareStatus = !1,
    $scope.saveStatus = !1,
    $scope.buildStore = {},
    $rootScope.bId = "",
    $rootScope.saveBuild = function(path, ip, save) {
        var utc = (new Date).getTime()
          , user = $rootScope.authentication.user;
        $scope.buildStore = {
            year: $scope.bike.year,
            manufacturer: $scope.bike.manufacturer,
            model: $scope.bike.model,
            utc: utc,
            price: $scope.price,
            size: $scope.currentSize && $scope.currentSize.size ? $scope.currentSize.size : "",
            color: $scope.build.color.color,
            ip: ip,
            completeness: $scope.completeness.percent,
            weight: $scope.weight.grams,
            image: path,
            build: $scope.build,
            speed: $scope.speed,
            owner: user ? user._id : null
        },
        $rootScope.bId && $rootScope.bId.length && ($scope.buildStore._id = $rootScope.bId),
        BuilderService.saveBuild($scope.buildStore).then(function(data, response) {
            data.updatedExisting !== !0 && ($rootScope.bId = data._id,
            $scope.buildStore = data),
            path && path.length > 0 && ("save" === save ? ((!user.builds || user.builds.length < 1) && (user.builds = []),
            user.builds.indexOf($rootScope.bId) < 0 && user.builds.push($rootScope.bId),
            AuthService.updateBuilds(user).then(function(data, response) {
                $scope.saveStatus = !0
            })) : $scope.shareStatus = !0,
            $rootScope.loading = !1)
        })
    }
    ,
    $scope.closeShare = function() {
        $scope.shareStatus = !1,
        $scope.saveStatus = !1
    }
    ,
    $scope.facebookShare = function() {
        window.FB.ui({
            method: "share",
            href: "http://www.bikologi.com" + window.location.pathname + "?id=" + $rootScope.bId + "&view=final",
            title: "My Custom " + $scope.bike.year + " " + window.util.capitalize($scope.bike.manufacturer + " " + $scope.bike.model) + " on Bikologi",
            picture: $scope.buildStore.image,
            caption: "Build your " + $scope.bike.year + " " + window.util.capitalize($scope.bike.manufacturer + " " + $scope.bike.model) + " on Bikologi",
            description: "Check out the custom " + $scope.bike.year + " " + window.util.capitalize($scope.bike.manufacturer + " " + $scope.bike.model) + " I built on Bikologi.com. It weighs " + $scope.weight.lb + "lbs " + $scope.weight.oz + "oz(or " + ($scope.weight.grams / 1e3).toFixed(2) + "kg), has an MSRP of $" + $scope.price + ", and is " + $scope.completeness.percent.toFixed(2) + "% complete."
        }, function(response) {})
    }
    ,
    $rootScope.initShare = function(save) {
        function drawCanvas(imgs) {
            var finalImg = ""
              , newImg = new Image;
            context.save(),
            context.font = '200 24px "HelveticaNeue-Light","Helvetica Neue Light","Helvetica Neue", helvetica, arial, sans-serif',
            context.fillStyle = "#333333";
            for (var key in imgs)
                context.drawImage(imgs[key], 0, 0, 1600, 900);
            context.drawImage(bikeCanvas, 150, 50, 1300, 772),
            "YT" === $scope.bike.manufacturer ? context.fillText($scope.bike.year + " " + $scope.bike.manufacturer + " " + $scope.bike.model + "      " + $scope.completeness.percent.toFixed(2) + "% Complete", 30, 872) : context.fillText($scope.bike.year + " " + $scope.bike.manufacturer + " " + $scope.bike.model + "      " + $scope.weight.lb + "lbs " + $scope.weight.oz + "oz      " + ($scope.weight.grams / 1e3).toFixed(2) + "kg      " + $scope.completeness.percent.toFixed(2) + "% Complete", 30, 872),
            context.restore(),
            finalImg = finalCanvas.toDataURL("image/jpeg", 1),
            newImg.src = finalImg,
            newImg.onload = function() {
                newImg.upload = Upload.upload({
                    url: "/s3/upload",
                    data: {},
                    file: newImg.src
                }),
                newImg.upload.then(function(response) {
                    $timeout(function() {
                        $rootScope.saveBuild(response.data.img, response.data.ip, save)
                    })
                }, function(response) {
                    response.status > 0 && ($rootScope.errorMsg = response.status + ": " + response.data)
                })
            }
        }
        var bikeCanvas = document.getElementById("bike-canvas")
          , finalCanvas = document.getElementById("final-canvas")
          , context = finalCanvas.getContext("2d")
          , images = (bikeCanvas.toDataURL("image/png"),
        ["/modules/builder/img/backgrounds/default.jpg"]);
        $rootScope.loading = !0,
        window.util.preloadImages(images, drawCanvas)
    }
}
]),
angular.module("builder").factory("BikeService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var BikeResource = $resource("/api/bikes/:bikeId", {
        bikeId: "@id"
    }, {
        get: {
            method: "GET"
        }
    })
      , CompleteResource = $resource("/api/bikes/completes", {
        page: "@page"
    }, {
        get: {
            method: "GET"
        }
    })
      , ComponentResource = $resource("/api/bikes/by-product", {
        page: "@page"
    }, {
        get: {
            method: "GET"
        }
    })
      , factory = {
        bikeList: function(data) {
            var deferred = $q.defer();
            return BikeResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        bikeCompletes: function(filters) {
            var deferred = $q.defer();
            return CompleteResource.get(filters, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        buildsByComponent: function(filters) {
            var deferred = $q.defer();
            return ComponentResource.get(filters, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getBike: function(data) {
            var deferred = $q.defer();
            return BikeResource.get({
                bikeId: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("builder").factory("BuilderService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var ComponentResource = $resource("/api/components", {}, {
        get: {
            method: "GET"
        }
    })
      , BuildResource = $resource("/api/builds", {}, {
        save: {
            method: "POST"
        },
        get: {
            method: "GET"
        }
    })
      , ImageResource = $resource("/proxy/img", {}, {
        get: {
            method: "GET"
        }
    })
      , factory = {
        getComponents: function(param) {
            var deferred = $q.defer();
            return ComponentResource.get(param, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        saveBuild: function(data) {
            var deferred = $q.defer();
            return BuildResource.save(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getBuild: function(param) {
            var deferred = $q.defer();
            return BuildResource.get(param, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        proxyImage: function(param) {
            var deferred = $q.defer();
            return param.img.indexOf("content.bikologi.com") >= 0 ? ImageResource.get(param, function(resp) {
                deferred.resolve(resp)
            }) : deferred.resolve({
                location: param.img
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("builder").factory("CanvasService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var factory = {
        bikeMap: function(data) {
            var deferred = $q.defer();
            return deferred.resolve(maps[data]),
            deferred.promise
        }
    }
      , maps = {};
    return factory
}
]),
angular.module("builder").factory("LeadService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var LeadResource = $resource("/api/leads/:pageId", {
        pageId: "@id"
    }, {
        get: {
            method: "GET"
        },
        post: {
            method: "POST"
        },
        "delete": {
            method: "DELETE"
        }
    })
      , factory = {
        leadList: function(data) {
            var deferred = $q.defer();
            return LeadResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getLead: function(data) {
            var deferred = $q.defer();
            return LeadResource.get({
                pageId: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        saveLead: function(data) {
            var deferred = $q.defer();
            return LeadResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        deleteLead: function(id) {
            var deferred = $q.defer();
            return LeadResource["delete"]({
                pageId: id
            }, function(resp) {
                deferred.resolve(resp);
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("builder").factory("BuildLogicService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var factory = {
        logicMap: function(data) {
            var deferred = $q.defer();
            return deferred.resolve(maps[data]),
            deferred.promise
        }
    }
      , maps = {
        "santa-cruz-nomad-cc-2016": {
            "Vivid Air R2C": {
                adjPrice: 250
            },
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-nomad-cc-2015": {
            "Vivid Air R2C": {
                adjPrice: 250
            },
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-v10-cc-2016": {
            "Vivid Air R2C": {
                adjPrice: 0
            },
            "Float DHX2": {
                adjPrice: 100,
                adjWeight: !0
            }
        },
        "ibis-mojo-hd3-2017": {
            "Float X2": {
                adjPrice: 270
            },
            "Float DPS Evol": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "yeti-sb6-2016": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "yeti-sb6-turq-2017": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "yeti-sb55-turq-2017": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "pivot-mach-6-2016": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "rocky-mountain-slayer-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "rocky-mountain-altitude-2018": {
            "Float DPX2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "pivot-firebird-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "pivot-phoenix-carbon-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "intense-recluse-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "intense-tracer-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !1
            }
        },
        "evil-insurgent-2016": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "transition-patrol-carbon-2016": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "transition-patrol-carbon-2017": {
            "Super Deluxe RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "evil-wreckoning-2017": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "evil-following-2017": {
            "Monarch RT3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "mondraker-foxy-carbon-xr-2017": {
            "Float DPS Evol": {
                adjPrice: 0
            }
        },
        "specialized-s-works-enduro-650b-2017": {
            "STX 22 Air": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "juliana-roubion-2017": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-bronson-cc-2016": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-hightower-cc-2017": {
            "Monarch RT3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-5010-cc-2017": {
            "Monarch RT3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "santa-cruz-bronson-cc-2017": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "kona-supreme-operator-2017": {
            "Kage RC": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "commencal-meta-am-v4-2016": {
            "Float X": {
                adjWeight: !1
            }
        },
        "commencal-meta-am-v42-2017": {
            "Super Deluxe RC3": {
                adjWeight: !1
            }
        },
        "commencal-supreme-dh-v42-2017": {
            "Vivid Coil R2C": {
                adjWeight: !1
            }
        },
        "gt-sanction-2016": {
            "Float X2": {
                adjWeight: !1
            }
        },
        "devinci-spartan-carbon-2016": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "devinci-spartan-carbon-2017": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "devinci-troy-carbon-2017": {
            "Monarch RT3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "intense-m16c-2016": {
            "Vivid Coil R2C": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "trek-session-99-2017": {
            "Float DHX2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "transition-tr500-2017": {
            "Float DHX2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "niner-rip-9-rdo-2017": {
            "Float X": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "trek-remedy-99-2017": {
            "Deluxe RT3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "trek-fuel-ex-2017": {
            "Float Reaktiv": {
                adjWeight: !1
            }
        },
        "trek-slash-99-2016": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "kona-process-153-dl-2017": {
            "Monarch Plus RC3": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "trek-slash-99-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "knolly-warden-carbon-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "yt-capra-cf-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !1
            }
        },
        "yt-tues-cf-2017": {
            "Float X2": {
                adjPrice: 0,
                adjWeight: !1
            }
        },
        "intense-tracer-275c-2016": {
            "DB Inline": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "bmc-trailfox-01-2017": {
            "DB Inline": {
                adjPrice: 0,
                adjWeight: !0
            }
        },
        "intense-uzzi-2016": {
            "Float DHX2": {
                adjPrice: 0,
                adjWeight: !0
            }
        }
    };
    return factory
}
]),
angular.module("builder").factory("ManufacturersService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var ManufacturersResource = $resource("/api/manufacturers/:manufacturerId", {
        manufacturerId: "@id"
    }, {
        get: {
            method: "GET"
        },
        post: {
            method: "POST"
        },
        "delete": {
            method: "DELETE"
        }
    })
      , factory = {
        manufacturersList: function(data) {
            var deferred = $q.defer();
            return ManufacturersResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getManufacturers: function(data) {
            var deferred = $q.defer();
            return ManufacturersResource.get({
                manufacturerId: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        saveManufacturer: function(data) {
            var deferred = $q.defer();
            return ManufacturersResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("builder").factory("ShopService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var ShopResource = $resource("/api/shops/:pageId", {
        pageId: "@id"
    }, {
        get: {
            method: "GET"
        },
        post: {
            method: "POST"
        },
        "delete": {
            method: "DELETE"
        }
    })
      , factory = {
        shopList: function(data) {
            var deferred = $q.defer();
            return ShopResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getShop: function(data) {
            var deferred = $q.defer();
            return ShopResource.get({
                pageId: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        saveShop: function(data) {
            var deferred = $q.defer();
            return ShopResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        deleteShop: function(id) {
            var deferred = $q.defer();
            return ShopResource["delete"]({
                pageId: id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("core").config(["$stateProvider", "$urlRouterProvider", "ezfbProvider", "DoubleClickProvider", function($stateProvider, $urlRouterProvider, ezfbProvider, DoubleClickProvider) {
    var fbId = "1573252259661758";
    document.location.host.indexOf("localhost") >= 0 && (fbId = "1798335780486737"),
    $urlRouterProvider.otherwise("/not-found"),
    $stateProvider.state("home", {
        url: "/",
        templateUrl: "modules/core/views/home.client.view.html"
    }).state("privacy", {
        url: "/privacy-policy",
        templateUrl: "modules/core/views/privacy.client.view.html"
    }).state("404", {
        url: "/not-found",
        templateUrl: "/modules/core/views/404.client.view.html"
    }),
    ezfbProvider.setInitParams({
        appId: fbId
    })
}
]),
angular.module("core").run(["$rootScope", "$state", "$location", "$sce", "$window", "MetaFactory", function($rootScope, $state, $location, $sce, $window, MetaFactory) {
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
        function setMeta() {
            for (var i = 0; i < $rootScope.seo.length; i++) {
                var page = $rootScope.seo[i]
                  , url = window.location.pathname
                  , meta = {
                    title: page.title,
                    description: page.description,
                    url: $location.absUrl(),
                    img: page.ogImage,
                    type: page.ogType,
                    caption: page.ogCaption
                };
                if ("/home" === url && "/" === page.url) {
                    MetaFactory.setMeta(meta);
                    break
                }
                if (url.indexOf("/hub/") >= 0)
                    break;
                if (url === page.url) {
                    MetaFactory.setMeta(meta);
                    break
                }
            }
        }
        $rootScope.preloaded = {},
        $rootScope.Math = window.Math,
        $window.scrollTo(0, 0);
        var loadUtils = setInterval(function() {
            window.util && window.util.gramsToLbs && ($rootScope.util = window.util,
            clearInterval(loadUtils))
        }, 10);
        $rootScope.seo ? setMeta() : MetaFactory.getMeta().then(function(data) {
            $rootScope.seo = data.pages,
            setMeta()
        }),
        $location.url().indexOf(/builder/) >= 0 ? ($rootScope.builderPage = !0,
        window.scrollTo(0, 1)) : $rootScope.builderPage = !1,
        $rootScope.bodyClass = "page-" + window.util.stripUrl(window.location.pathname),
        document.location.host.indexOf("localhost") < 0 && document.location.host.indexOf("staging.bikologi") < 0 && window.ga("send", "pageview", {
            page: $location.url()
        })
    })
}
]),
angular.module("core").controller("NotFoundController", ["$scope", "$rootScope", "$timeout", "$http", "$location", "Authentication", "AuthService", function($rootScope, $scope, $timeout, $http, $location, Authentication, AuthService) {
    $timeout(function() {
        $rootScope.loading = !1
    }, 2e3)
}
]),
angular.module("core").controller("CoreController", ["$rootScope", "$window", "$scope", "$sce", "$sanitize", "$http", "$location", "Authentication", "AuthService", "BikeService", "ArticlesService", "CampaignService", "MailerService", "ezfb", function($rootScope, $window, $scope, $sce, $sanitize, $http, $location, Authentication, AuthService, BikeService, ArticlesService, CampaignService, MailerService, ezfb) {
    function bannersByLocation(campaigns) {
        for (var banners = {}, i = 0; i < campaigns.length; i++)
            for (var campaign = campaigns[i], ii = 0; ii < campaign.banners.length; ii++)
                banners[campaign.banners[ii].position] ? banners[campaign.banners[ii].position].push(campaign.banners[ii]) : (banners[campaign.banners[ii].position] = [],
                banners[campaign.banners[ii].position].push(campaign.banners[ii]));
        for (var key in banners)
            banners[key].sort(function(a, b) {
                return parseInt(a.priority) - parseInt(b.priority)
            });
        $rootScope.banners = banners
    }
    function windowSize() {
        var w = window
          , d = document
          , g = d.getElementsByTagName("body")[0]
          , x = w.innerWidth || g.clientWidth
          , y = w.innerHeight || g.clientHeight;
        x < 768 ? ($rootScope.mobile = !0,
        $rootScope.x = x,
        $rootScope.y = y) : ($rootScope.mobile = !1,
        $rootScope.x = x,
        $rootScope.y = y)
    }
    $rootScope.authentication = {},
    $rootScope.$window = $window,
    $rootScope.authModal = !1,
    $rootScope.authentication.user = Authentication.user,
    $rootScope.navToggle = !1,
    $rootScope.navUserToggle = !1,
    $rootScope.articles = {},
    $rootScope.newsletter = {},
    $rootScope.measurement = "metric",
    $rootScope.campaigns = [],
    $rootScope.builderAds = [],
    $rootScope.structure = [{
        category: "suspension",
        subs: ["fork", "shock"]
    }, {
        category: "wheels",
        subs: ["wheel set", "tires"]
    }, {
        category: "drivetrain",
        subs: ["cassette", "bottom bracket", "chain guide", "chain ring", "chain", "crankset", "derailleur", "shifter", "spider"]
    }, {
        category: "cockpit",
        subs: ["seatpost", "saddle", "handlebar", "grips", "stem", "headset"]
    }, {
        category: "brakes",
        subs: ["brake", "rotor"]
    }, {
        category: "accessories",
        subs: ["pedals"]
    }],
    $rootScope.encodeHTML = function(html) {
        return $sanitize(html)
    }
    ,
    $rootScope.trackAffiliateClick = function(data) {
        window.ga("send", "event", "click", "affiliateClick", data)
    }
    ,
    $rootScope.setMeasurement = function(measurement) {
        $rootScope.measurement = measurement
    }
    ,
    $rootScope.toggleNav = function(bool) {
        "undefined" != typeof bool ? $rootScope.navToggle = bool : $rootScope.navToggle = !$rootScope.navToggle
    }
    ,
    $rootScope.toggleUserNav = function(bool) {
        "undefined" != typeof bool ? $rootScope.navUserToggle = bool : $rootScope.navUserToggle = !$rootScope.navUserToggle
    }
    ,
    $rootScope.logout = function() {
        $rootScope.authentication.user.fbId && $rootScope.fbLogout(),
        AuthService.logout($rootScope.authentication.user).then(function(response) {
            200 === response.statusCode && ($rootScope.authentication.user = response.body,
            $location.path("/"))
        })
    }
    ,
    $rootScope.updateLoginStatus = function() {
        ezfb.getLoginStatus(function(res) {
            "connected" === res.status && $rootScope.authentication.user && $rootScope.authentication.user.fbId ? $rootScope.updateApiMe() : $rootScope.authentication.user && $rootScope.authentication.user.fbId && AuthService.logout($rootScope.authentication.user).then(function(response) {
                200 === response.statusCode && ($rootScope.authentication.user = response.body,
                $location.path("/"))
            })
        })
    }
    ,
    $rootScope.updateApiMe = function() {
        ezfb.api("/me", {
            locale: "en_US",
            fields: "name, email, first_name, last_name, picture, location, gender"
        }, function(res) {
            var fbUser = {};
            res.error || (fbUser.fbId = res.id,
            fbUser.firstName = res.first_name,
            fbUser.lastName = res.last_name,
            fbUser.email = res.email,
            fbUser.name = res.name,
            AuthService.fbAuth(fbUser).then(function(data) {
                $rootScope.authentication.user = data.body,
                $rootScope.authentication.user && ($rootScope.authentication.user.firstName = res.first_name,
                $rootScope.authentication.user.fbId = res.id,
                $rootScope.authentication.user.picture = res.picture.data.url,
                Authentication.user = $rootScope.authentication.user)
            }))
        })
    }
    ,
    $rootScope.fbLogout = function() {
        ezfb.getLoginStatus(function(response) {
            response && "connected" === response.status && ezfb.logout(function(response) {
                ezfb.getLoginStatus(function(response) {})
            })
        })
    }
    ,
    windowSize(),
    angular.element($window).bind("resize", function() {
        $rootScope.$apply(function() {
            windowSize()
        })
    }),
    $rootScope.$on("$routeChangeStart", function() {
        document.location.host.indexOf("localhost") < 0 && document.location.host.indexOf("staging.bikologi") < 0 && window.ga("send", "pageview", {
            page: $location.url()
        })
    }),
    $rootScope.updateLoginStatus(),
    $rootScope.campaigns && $rootScope.campaigns.length || CampaignService.campaignList().then(function(data) {
        $rootScope.campaigns = data.campaigns,
        bannersByLocation($rootScope.campaigns)
    }),
    $rootScope.newsletterSignup = function() {
        var newsletterUser = {};
        window.util.validateEmail($rootScope.newsletter.email) ? (newsletterUser.email_address = $rootScope.newsletter.email,
        newsletterUser.status = "subscribed",
        $rootScope.newsletter.success = !0,
        $rootScope.newsletter.response = "sending",
        MailerService.addUser(newsletterUser).then(function(response) {
            "subscribed" === response.newsletterSignUp.status ? ($rootScope.newsletter.error = !1,
            $rootScope.newsletter.success = !0,
            $rootScope.newsletter.response = "successfully added") : ($rootScope.newsletter.error = !0,
            $rootScope.newsletter.success = !1,
            $rootScope.newsletter.response = "Member Exists" === response.newsletterSignUp.title ? "email already exists" : "there was a problem with your email")
        })) : ($rootScope.newsletter.success = !1,
        $rootScope.newsletter.error = !0,
        $rootScope.newsletter.response = "not a valid email")
    }
    ,
    $rootScope.launchSignIn = function(location) {
        $rootScope.mobile ? $rootScope.navUserToggle = !0 : $rootScope.authModal = !0,
        "login" === location && ($rootScope.resetToggle = !1,
        $rootScope.signInToggle = !1)
    }
    ,
    $rootScope.closeAuthModal = function() {
        $rootScope.authModal = !1
    }
}
]),
angular.module("core").controller("FooterController", ["$scope", "$rootScope", "$http", "$location", "Authentication", "AuthService", function($rootScope, $scope, $http, $location, Authentication, AuthService) {
    $scope.currentYear = (new Date).getFullYear()
}
]),
angular.module("core").controller("HeaderController", ["$scope", "$rootScope", "$http", "$location", "Authentication", "AuthService", function($rootScope, $scope, $http, $location, Authentication, AuthService) {}
]),
angular.module("core").controller("HomeController", ["$scope", "$rootScope", "Authentication", "BikeService", function($scope, $rootScope, Authentication, BikeService) {
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $rootScope.homeRecents ? ($rootScope.loading = !1,
    window.prerenderReady = !0) : BikeService.bikeCompletes({
        page: 0
    }).then(function(data) {
        var date = (new Date).getTime();
        $rootScope.homeRecents = data.bikes;
        for (var i = 0; i < $scope.homeRecents.length; i++) {
            var recent = $scope.homeRecents[i];
            recent.timeDiff = (date - recent.utc) / 36e5,
            recent.url = window.util.formatUrl("/builder/" + recent.year + " " + recent.manufacturer + " " + recent.model) + "?id=" + recent._id
        }
        $rootScope.loading = !1,
        window.prerenderReady = !0
    })
}
]),
angular.module("core").controller("ModalController", ["$scope", function($scope) {}
]),
angular.module("core").factory("CampaignService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var CampaignResource = $resource("/api/campaigns/:pageId", {
        pageId: "@id"
    }, {
        get: {
            method: "GET"
        },
        post: {
            method: "POST"
        },
        "delete": {
            method: "DELETE"
        }
    })
      , factory = {
        campaignList: function(data) {
            var deferred = $q.defer();
            return CampaignResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getCampaign: function(data) {
            var deferred = $q.defer();
            return CampaignResource.get({
                pageId: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("core").factory("MailerService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var MailerResource = $resource("/api/newsletter-user", {}, {
        post: {
            method: "POST"
        }
    })
      , factory = {
        addUser: function(data) {
            var deferred = $q.defer();
            return MailerResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("core").service("MetaFactory", ["$http", "$resource", "$q", function($http, $resource, $q) {
    function bindContent(arr, value) {
        for (var i = 0; i < arr.length; i++)
            arr[i].setAttribute("content", value)
    }
    var MetaResource;
    MetaResource = $resource("/api/seo", {}, {
        get: {
            method: "GET"
        }
    });
    var factory = {
        getMeta: function() {
            var deferred = $q.defer();
            return MetaResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        setMeta: function(meta) {
            document.title = meta.title,
            bindContent(document.getElementsByClassName("meta-description"), meta.description),
            bindContent(document.getElementsByClassName("meta-social-description"), meta.description),
            bindContent(document.getElementsByClassName("meta-social-title"), meta.title),
            bindContent(document.getElementsByClassName("meta-social-url"), meta.url),
            bindContent(document.getElementsByClassName("meta-social-img"), meta.img),
            bindContent(document.getElementsByClassName("meta-social-type"), meta.type),
            bindContent(document.getElementsByClassName("meta-social-caption"), meta.caption)
        }
    };
    return factory
}
]),
angular.module("core").factory("S3Service", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var S3Resource = $resource("/api/s3", {}, {
        post: {
            method: "POST"
        }
    })
      , factory = {
        saveImage: function(data) {
            var deferred = $q.defer();
            return S3Resource.post(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("gallery").config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("gallery", {
        url: "/gallery",
        templateUrl: "/modules/gallery/views/gallery.client.view.html"
    })
}
]),
angular.module("gallery").controller("GalleryController", ["$rootScope", "$interval", "$window", "$scope", "$sce", "$http", "$location", "MetaFactory", "Authentication", "BikeService", "ezfb", function($rootScope, $interval, $window, $scope, $sce, $http, $location, MetaFactory, Authentication, BikeService, ezfb) {
    function setFilters() {
        $scope.filter.models = [],
        $scope.filter.manufacturers = [],
        $scope.filter.years = [],
        $scope.filter.sizes = [];
        for (var i = 0; i < $rootScope.bikes.length; i++) {
            var bike = $rootScope.bikes[i];
            if (bike.enabled && "d-ad" !== bike.manufacturer && ($scope.filter.manufacturers.indexOf(bike.manufacturer) < 0 && ($scope.filter.model.length > 0 ? bike.model === $scope.filter.model && ($scope.filter.manufacturers.push(bike.manufacturer),
            $scope.filter.manufacturer = bike.manufacturer) : $scope.filter.manufacturers.push(bike.manufacturer)),
            $scope.filter.years.indexOf(bike.year) < 0 && $scope.filter.years.push(bike.year),
            $scope.filter.models.indexOf(bike.model) < 0))
                if ($scope.filter.manufacturer.length > 0) {
                    if (bike.manufacturer === $scope.filter.manufacturer) {
                        $scope.filter.models.push(bike.model);
                        for (var j = 0; j < bike.sizes.length; j++)
                            $scope.filter.sizes.indexOf(bike.sizes[j].size) < 0 && $scope.filter.sizes.push(bike.sizes[j].size)
                    }
                } else if ($scope.filter.model.length > 0) {
                    if (bike.model === $scope.filter.model)
                        for (var j = 0; j < bike.sizes.length; j++)
                            $scope.filter.sizes.indexOf(bike.sizes[j].size) < 0 && $scope.filter.sizes.push(bike.sizes[j].size)
                } else if ($scope.filter.manufacturer.length <= 0 && $scope.filter.models.push(bike.model),
                "d-ad" !== bike.manufacturer)
                    for (var j = 0; j < bike.sizes.length; j++)
                        $scope.filter.sizes.indexOf(bike.sizes[j].size) < 0 && $scope.filter.sizes.push(bike.sizes[j].size)
        }
        $rootScope.loading = !1
    }
    function parseFilters(filters) {
        var queryFilters = {
            page: $scope.page
        };
        return filters.manufacturer && filters.manufacturer.length > 0 && (queryFilters.manufacturer = filters.manufacturer),
        filters.model && filters.model.length > 0 && (queryFilters.model = filters.model),
        filters.year && filters.year > 0 && (queryFilters.year = filters.year),
        filters.size && filters.size.length > 0 && (queryFilters.size = filters.size),
        queryFilters
    }
    function callFilteredBuilds(filters) {
        $rootScope.loading = !0,
        BikeService.bikeCompletes(filters).then(function(data) {
            var date = (new Date).getTime();
            $rootScope.recents = data.bikes;
            for (var i = 0; i < $scope.recents.length; i++) {
                var recent = $scope.recents[i];
                recent.timeDiff = (date - recent.utc) / 36e5,
                recent.url = window.util.formatUrl("/builder/" + recent.year + " " + recent.manufacturer + " " + recent.model) + "?id=" + recent._id
            }
            $rootScope.bikes && $rootScope.bikes.length ? setFilters() : BikeService.bikeList({}).then(function(data) {
                $rootScope.bikes = data.bikes,
                setFilters()
            }),
            $window.scrollTo(0, 0)
        })
    }
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $scope.page = 0,
    $rootScope.recents = [],
    $scope.filter = {
        manufacturer: "",
        manufacturers: [],
        model: "",
        models: [],
        year: "",
        years: [],
        size: "",
        sizes: []
    },
    $scope.mobileFilter = {
        manufacturer: !1,
        model: !1,
        year: !1,
        size: !1
    },
    $scope.setFilter = function(filter, value) {
        $scope.page = 0,
        $scope.filter[filter] = value,
        $scope.mobileFilter = {
            manufacturer: !1,
            model: !1,
            year: !1,
            size: !1
        },
        "manufacturer" === filter && ($scope.filter.model = ""),
        callFilteredBuilds(parseFilters($scope.filter))
    }
    ,
    $scope.resetFilter = function(filter, $event) {
        $scope.page = 0,
        "all" === filter ? ($scope.filter.manufacturer = "",
        $scope.filter.model = "",
        $scope.filter.year = "",
        $scope.filter.size = "") : ($scope.filter[filter] = "",
        "manufacturer" === filter && ($scope.filter.model = "")),
        callFilteredBuilds(parseFilters($scope.filter)),
        $rootScope.mobile && $event.stopPropagation()
    }
    ,
    $scope.setMobileFilters = function(filter) {
        angular.forEach($scope.mobileFilter, function(value, key) {
            key === filter ? $scope.mobileFilter[key] = !$scope.mobileFilter[key] : $scope.mobileFilter[key] = !1
        })
    }
    ,
    $rootScope.$watch("banners", function(banners) {
        void 0 !== banners && ($scope.bannerMarkup = $sce.trustAsHtml(banners["gallery bar"][0].markup))
    }),
    callFilteredBuilds({
        page: $scope.page
    }),
    angular.element($window).bind("scroll", function() {
        if ($location.path().indexOf("/gallery") >= 0 && $rootScope.loading === !1 && $rootScope.recents.length > 0) {
            var windowHeight = "innerHeight"in window ? window.innerHeight : document.documentElement.offsetHeight
              , body = document.body
              , html = document.documentElement
              , docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
              , windowBottom = windowHeight + window.pageYOffset;
            (!$rootScope.mobile && windowBottom >= docHeight - 140 || $rootScope.mobile && windowBottom >= docHeight - 240) && ($scope.page++,
            $rootScope.loading = !0,
            BikeService.bikeCompletes(parseFilters($scope.filter)).then(function(data) {
                for (var date = (new Date).getTime(), completeList = [], i = 0; i < data.bikes.length; i++) {
                    var recent = data.bikes[i];
                    recent.timeDiff = (date - recent.utc) / 36e5,
                    recent.url = window.util.formatUrl("/builder/" + recent.year + " " + recent.manufacturer + " " + recent.model) + "?id=" + recent._id
                }
                completeList = $rootScope.recents.concat(data.bikes),
                $rootScope.recents = completeList,
                $rootScope.loading = !1
            }))
        }
    })
}
]),
angular.module("gallery").factory("GalleryService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var ArticlesResource = $resource("/api/articles", {}, {
        get: {
            method: "GET"
        }
    })
      , ArticleResource = $resource("/api/article/:slug", {
        slug: "@slug"
    }, {
        get: {
            method: "GET"
        }
    })
      , ArticlesByCategoryResource = $resource("/api/articles/category/:id", {
        id: "@id"
    }, {
        get: {
            method: "GET"
        }
    })
      , FeaturedResource = $resource("/api/featuredArticles", {}, {
        get: {
            method: "GET"
        }
    })
      , TagResource = $resource("/api/tags", {}, {
        get: {
            method: "GET"
        }
    })
      , CategoryResource = $resource("/api/categories", {}, {
        get: {
            method: "GET"
        }
    })
      , factory = {
        getArticles: function(data) {
            var deferred = $q.defer();
            return ArticlesResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getFeaturedArticles: function(data) {
            var deferred = $q.defer();
            return FeaturedResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getTags: function(data) {
            var deferred = $q.defer();
            return TagResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getCategories: function(data) {
            var deferred = $q.defer();
            return CategoryResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getArticle: function(data) {
            var deferred = $q.defer();
            return ArticleResource.get({
                slug: data.slug
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        getArticlesByCategory: function(data) {
            var deferred = $q.defer();
            return ArticlesByCategoryResource.get({
                id: data.id
            }, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("involved").config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("involvedParent", {
        url: "/contact-us",
        templateUrl: "modules/involved/views/involved.client.view.html"
    }).state("partner", {
        url: "/partner",
        templateUrl: "modules/involved/views/partner.client.view.html"
    })
}
]),
angular.module("involved").controller("InvolvedController", ["$rootScope", "$window", "$scope", "$http", "$location", "MailerService", "$anchorScroll", function($rootScope, $window, $scope, $http, $location, MailerService, $anchorScroll) {
    function validate(feedback) {
        for (var valid = !0, required = feedback.required, errors = {}, i = 0; i < required.length; i++) {
            var prop = required[i];
            alert,
            feedback[prop] && feedback[prop].length ? "email" !== prop || re.test(feedback[prop]) ? "feedback" === prop && feedback[prop].length < 50 && (valid = !1,
            errors[prop] = "invalid") : (valid = !1,
            errors[prop] = "invalid") : (valid = !1,
            errors[prop] = "required")
        }
        return feedback.status = valid,
        feedback.errors = errors,
        feedback
    }
    function loaded() {
        $rootScope.$apply(function() {
            $rootScope.loading = !1,
            window.prerenderReady = !0
        })
    }
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      , bgs = [];
    $rootScope.toggleNav(!1),
    $rootScope.loading = !0,
    $scope.fbProp = {},
    $scope.limit = 5e3,
    $scope.fbTotal = 0,
    $scope.emailValid = !1,
    $rootScope.builderToggle = !0,
    $anchorScroll(),
    bgs = $rootScope.mobile ? ["/modules/involved/img/parent.mobile.jpg", "/modules/involved/img/rider.mobile.jpg"] : ["/modules/involved/img/parent.desktop.jpg", "/modules/involved/img/rider.desktop.jpg"],
    $scope.setFbProp = function(prop, value, isArray) {
        delete $scope.fbProp.sent,
        isArray ? (void 0 === $scope.fbProp[prop] && ($scope.fbProp[prop] = []),
        $scope.fbProp[prop].indexOf(value) < 0 ? $scope.fbProp[prop].push(value) : $scope.fbProp[prop].splice($scope.fbProp[prop].indexOf(value), 1)) : $scope.fbProp[prop] = value,
        $scope.fbProp.status === !1 && validate($scope.fbProp)
    }
    ,
    $scope.submitFeedback = function(required) {
        $scope.fbProp.required = required,
        $rootScope.mobile && ($location.hash("status-focus"),
        $anchorScroll()),
        validate($scope.fbProp).status === !0 && $scope.fbProp.sent !== !0 && ($scope.fbProp.sent = !1,
        MailerService.sendMail($scope.fbProp).then(function(data) {
            "success" === data.status ? $scope.fbProp.sent = !0 : (delete $scope.fbProp.sent,
            $scope.fbProp.status = !1,
            $scope.fbProp.errors = {
                failure: "There was an error with your message. Please try again."
            })
        }))
    }
    ,
    $scope.$watch("fbProp.feedback", function(val) {
        delete $scope.fbProp.sent,
        val && val.length ? ($scope.limit = 5e3 - val.length,
        $scope.total = val.length) : ($scope.limit = 5e3,
        $scope.total = 0),
        $scope.fbProp.status === !1 && validate($scope.fbProp)
    }),
    $scope.$watch("fbProp.email", function(val) {
        delete $scope.fbProp.sent,
        $scope.emailValid = re.test(val),
        $scope.fbProp.status === !1 && validate($scope.fbProp)
    }),
    window.util.preloadImages(bgs, loaded)
}
]),
angular.module("involved").controller("PartnerController", ["$rootScope", "$window", "$scope", "$http", "$location", "$anchorScroll", function($rootScope, $window, $scope, $http, $location, $anchorScroll) {
    var tfCtx = document.getElementById("trail-fork-chart")
      , tbCtx = document.getElementById("top-brand-chart")
      , wreckCtx = document.getElementById("wreckoning-chart")
      , trailForkData = {
        labels: ["2018 Fox 36 Float Evol HSC LSC", "2018 Rock Shox Pike RCT3 Debonair", "2017 Fox 36 Float RC2 HSC LSC", "2017 Rock Shox Lyrik RCT3", "2017 Fox 36 Talas RC2 FIT4", "2017 Cane Creek Helm", "2017 DVO Diamond", "2017 Rock Shox Pike RCT3", "2017 Rock Shox Yari", "2017 Fox 34 Float Factory", "2017 Fox 34 Float Performance", "2017 Öhlins RXF 36", "2017 SR Suntour Auron RC2"],
        datasets: [{
            data: [9636, 2483, 6704, 4630, 4001, 5499, 7223, 3998, 1123, 1857, 1774, 1577, 490],
            backgroundColor: ["#ff5001", "#3b3b3b", "#ff5001", "#3b3b3b", "#ff5001", "#1553d0", "#50fc0c", "#3b3b3b", "#3b3b3b", "#ff5001", "#ff5001", "#eeda00", "#a4a4a4"]
        }]
    }
      , topBrandData = {
        labels: ["SRAM", "Fox", "Shimano", "Race Face", "Maxxis", "Rock Shox"],
        datasets: [{
            data: [119053, 68234, 61344, 45775, 45079, 36148],
            backgroundColor: ["#ff0000", "#ff5001", "#0033ff", "#111111", "#fc6002", "#3b3b3b"]
        }]
    }
      , wreckoningData = {
        labels: ["Small", "Medium", "Large", "XL"],
        datasets: [{
            label: "Wreckoning",
            backgroundColor: "#50b2e9",
            data: [224, 461, 665, 206]
        }, {
            label: "Insurgent",
            backgroundColor: "#d9e600",
            data: [156, 341, 336, 93]
        }, {
            label: "Following",
            backgroundColor: "#fc2300",
            data: [145, 258, 362, 124]
        }]
    };
    wreckCtx.height = $(window).outerHeight() / 2 - 80;
    new Chart(tfCtx,{
        type: "doughnut",
        options: {
            title: {
                display: !0,
                text: "April 2017 - Trail Fork Interactions"
            },
            legend: {
                display: !1
            }
        },
        data: trailForkData
    }),
    new Chart(tbCtx,{
        type: "polarArea",
        options: {
            title: {
                display: !0,
                text: "April 2017 - Top Brand Interactions"
            },
            legend: {
                display: !1
            }
        },
        data: topBrandData
    }),
    new Chart(wreckCtx,{
        type: "bar",
        options: {
            title: {
                display: !0,
                text: "April 2017 - Evil Bikes Sizing Overview"
            },
            legend: {
                display: !1
            }
        },
        data: wreckoningData
    })
}
]),
angular.module("pricing").config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("pricingHome", {
        url: "/pricing",
        templateUrl: "/modules/pricing/views/pricing.client.view.html"
    }).state("pricingSub", {
        url: "/pricing/:slug",
        templateUrl: "/modules/pricing/views/pricing.client.view.html"
    }).state("productHome", {
        url: "/product/:slug",
        templateUrl: "/modules/pricing/views/product.client.view.html"
    })
}
]),
angular.module("pricing").controller("PricingController", ["$rootScope", "$window", "$scope", "$state", "$http", "$location", "$stateParams", "Authentication", "BuilderService", "ManufacturersService", function($rootScope, $window, $scope, $state, $http, $location, $stateParams, Authentication, BuilderService, ManufacturersService) {
    function parseParams(query) {
        for (var params = {}, i = 0; i < $scope.pricing.manufacturers.length; i++) {
            var manufacturerSlug = $scope.pricing.manufacturers[i].name.replace(/\s+/g, "-").toLowerCase();
            $scope.pricing.manufacturers[i].slug = manufacturerSlug,
            manufacturerSlug === slug && query && (params.manufacturer = $scope.pricing.manufacturers[i].name.toLowerCase())
        }
        if ($scope.active.manufacturers.length) {
            params.manufacturer = "";
            for (var i = 0; i < $scope.active.manufacturers.length; i++)
                i < $scope.active.manufacturers.length - 1 ? params.manufacturer += $scope.active.manufacturers[i] + "," : params.manufacturer += $scope.active.manufacturers[i]
        }
        for (var i = 0; i < structure.length; i++) {
            structure[i].prettySubs = [];
            for (var ii = 0; ii < structure[i].subs.length; ii++) {
                var componentSlug = structure[i].subs[ii].replace(/\s+/g, "-").toLowerCase();
                structure[i].prettySubs.push(componentSlug),
                slug === componentSlug && query && (params.component = structure[i].subs[ii])
            }
        }
        if ($scope.active.categories.length) {
            params.component = "";
            for (var i = 0; i < $scope.active.categories.length; i++)
                i < $scope.active.categories.length - 1 ? params.component += $scope.active.categories[i] + "," : params.component += $scope.active.categories[i]
        }
        return query && (query.components || query.manufacturers) ? (params.component = query.components,
        params.manufacturer = query.manufacturers) : $location.search({
            manufacturers: params.manufacturer,
            components: params.component
        }),
        params
    }
    var slug = $stateParams.slug
      , structure = $rootScope.structure;
    if ($scope.mobileFacets = !1,
    $scope.pricing = {},
    $scope.slug = slug,
    $scope.order = "+lowestInt",
    $scope.sort = {
        price: !0,
        weight: !1,
        direction: !0
    },
    $scope.active = {
        manufacturers: [],
        categories: []
    },
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $scope.sortProducts = function(sortBy) {
        var sort = "";
        $scope.sort[sortBy] === !0 ? $scope.sort.direction = !$scope.sort.direction : $scope.sort[sortBy] === !1 && ($scope.sort.direction = !0,
        "price" === sortBy ? ($scope.sort.price = !0,
        $scope.sort.weight = !1) : ($scope.sort.price = !1,
        $scope.sort.weight = !0)),
        sort += $scope.sort.direction ? "+" : "-",
        $scope.sort.price && (sort += "lowestInt"),
        $scope.sort.weight && (sort += "weight"),
        $scope.order = sort
    }
    ,
    $scope.toggleMobileFacets = function() {
        $scope.mobileFacets = !$scope.mobileFacets
    }
    ,
    $scope.pricingPrepLocation = function(slug, type) {
        "manufacturer" === type && ($scope.active.manufacturers.indexOf(slug) >= 0 ? $scope.active.manufacturers.splice($scope.active.manufacturers.indexOf(slug), 1) : $scope.active.manufacturers.push(slug)),
        "category" === type && ($scope.active.categories.indexOf(slug) >= 0 ? $scope.active.categories.splice($scope.active.categories.indexOf(slug), 1) : $scope.active.categories.push(slug))
    }
    ,
    $scope.pricingSetLocation = function() {
        var params;
        $scope.toggleMobileFacets(),
        $rootScope.loading = !0,
        0 === $scope.active.categories.length && 0 === $scope.active.manufacturers.length && $state.go("pricingHome"),
        $scope.active.categories.length >= 1 && $location.path("/pricing/" + $scope.active.categories[0]),
        0 === $scope.active.categories.length && $scope.active.manufacturers.length > 0 && $location.path("/pricing"),
        params = parseParams(),
        BuilderService.getComponents(params).then(function(data) {
            data.components.length > 50 && (data.components = data.components.splice(0, 50));
            for (var i = 0; i < data.components.length; i++)
                data.components[i].lowestPrice = parseFloat(data.components[i].lowestPrice),
                window.util.removeDuplicateComponents(data.components, data.components[i]);
            $scope.pricing.components = data.components,
            $rootScope.loading = !1
        })
    }
    ,
    $scope.pricingHome = function() {
        $state.go("pricingHome")
    }
    ,
    $scope.pricingLocation = function(slug, type) {
        var params = {}
          , add = !1;
        $rootScope.loading = !0,
        "manufacturer" === type && ($scope.active.manufacturers.indexOf(slug) >= 0 ? $scope.active.manufacturers.splice($scope.active.manufacturers.indexOf(slug), 1) : $scope.active.manufacturers.push(slug)),
        "category" === type && ($scope.active.categories.indexOf(slug) >= 0 ? ($scope.active.categories.splice($scope.active.categories.indexOf(slug), 1),
        add = !1) : ($scope.active.categories.push(slug),
        add = !0)),
        0 === $scope.active.categories.length && 0 === $scope.active.manufacturers.length && $state.go("pricingHome"),
        $scope.active.categories.length >= 1 && $location.path("/pricing/" + $scope.active.categories[0]),
        0 === $scope.active.categories.length && $scope.active.manufacturers.length > 0 && $location.path("/pricing/" + $scope.active.manufacturers[0]),
        params = parseParams(),
        BuilderService.getComponents(params).then(function(data) {
            data.components.length > 50 && (data.components = data.components.splice(0, 50));
            for (var i = 0; i < data.components.length; i++)
                data.components[i].lowestPrice = parseFloat(data.components[i].lowestPrice),
                window.util.removeDuplicateComponents(data.components, data.components[i]);
            $scope.pricing.components = data.components,
            $rootScope.loading = !1
        })
    }
    ,
    window.pricing && window.pricing.manufacturers)
        $scope.pricing = JSON.parse(JSON.stringify(window.pricing)),
        window.pricing = null,
        $rootScope.loading = !1;
    else {
        for (var i = 0; i < $rootScope.seo.length; i++) {
            var page = $rootScope.seo[i]
              , url = window.location.pathname;
            if (url === page.url) {
                $scope.pricing.description = page.article;
                break
            }
        }
        ManufacturersService.manufacturersList().then(function(data) {
            var params = {};
            if ($scope.pricing.manufacturers = data.manufacturers,
            $scope.pricing.categories = structure,
            params = parseParams($location.search()),
            !slug || params.component || params.manufacturer) {
                if (params.manufacturer)
                    for (var parMans = params.manufacturer.split(","), i = 0; i < parMans.length; i++)
                        $scope.active.manufacturers.push(parMans[i].replace(/\s+/g, "-").toLowerCase());
                if (params.component)
                    for (var parCats = params.component.split(","), i = 0; i < parCats.length; i++)
                        $scope.active.categories.push(parCats[i].replace(/\s+/g, "-").toLowerCase())
            } else
                $location.path("/not-found");
            BuilderService.getComponents(params).then(function(data) {
                for (var i = 0; i < data.components.length; i++)
                    window.util.removeDuplicateComponents(data.components, data.components[i]);
                data.components.length > 100 && (data.components = data.components.splice(0, 100)),
                $scope.pricing.components = data.components,
                $rootScope.loading = !1
            })
        })
    }
}
]),
angular.module("pricing").controller("ProductController", ["$rootScope", "$window", "$scope", "$http", "$location", "$stateParams", "Authentication", "BuilderService", "ManufacturersService", "MetaFactory", "BikeService", function($rootScope, $window, $scope, $http, $location, $stateParams, Authentication, BuilderService, ManufacturersService, MetaFactory, BikeService) {
    function getBuilds() {
        var comp;
        comp = "tires" === $scope.components[0].component ? "front tire" : "bottom bracket" === $scope.components[0].component ? "bb" : "wheel set" === $scope.components[0].component ? "wheels" : "derailleur" === $scope.components[0].component ? "rear derailleur" : "shifter" === $scope.components[0].component ? "rear shifter" : "grips" === $scope.components[0].component ? "grip" : "brake" === $scope.components[0].component ? "caliper" : "rotor" === $scope.components[0].component ? "rotors" : $scope.components[0].component,
        BikeService.buildsByComponent({
            component: comp,
            id: $scope.components[0]._id
        }).then(function(data) {
            if (data.bikes) {
                for (var i = 0; i < data.bikes.length; i++)
                    data.bikes[i].url = window.util.formatUrl("/builder/" + data.bikes[i].year + " " + data.bikes[i].manufacturer + " " + data.bikes[i].model) + "?id=" + data.bikes[i]._id;
                $scope.completes = data.bikes
            }
            $rootScope.loading = !1
        })
    }
    var slug = $stateParams.slug.split(/\s*\-\s*/g)
      , year = slug[0]
      , manufacturer = slug[1]
      , model = slug[2]
      , component = slug[slug.length - 1].substring(0, 3)
      , params = {};
    $scope.components = [],
    $scope.mainImage = "",
    $rootScope.loading = !0,
    $rootScope.toggleNav(!1),
    $scope.swapImage = function(image) {
        $scope.mainImage = image.url
    }
    ,
    window.product && window.product.components ? ($scope.components = JSON.parse(JSON.stringify(window.product.components)),
    $scope.mainImage = $scope.components[0].images.vanity[0].url,
    $scope.catUrl = $scope.components[0].component.replace(/\s+/g, "-").toLowerCase(),
    window.product = null,
    getBuilds()) : year && year.length && manufacturer && manufacturer.length && model && model.length && model.length < 100 && manufacturer.length < 100 ? (model = "",
    ManufacturersService.manufacturersList().then(function(data) {
        for (var manufacturers = data.manufacturers, i = 0; i < manufacturers.length; i++)
            if (manufacturers[i].name.replace(/\s+/g, "").toLowerCase() === manufacturer) {
                manufacturer = "",
                manufacturer = manufacturers[i].name.toLowerCase();
                break
            }
        for (var i = 2; i < slug.length - 1; i++)
            model = 2 === i ? slug[i] : model + "-" + slug[i];
        params = {
            year: year,
            manufacturer: manufacturer,
            model: model,
            component: component,
            pricing: !0
        },
        BuilderService.getComponents(params).then(function(data) {
            var meta = {
                title: data.components[0].manufacturer + " " + data.components[0].model + " " + $window.util.capitalizeString(data.components[0].component) + " Price Comparison, Best Deals, and Compatibility.",
                description: data.components[0].description ? data.components[0].description : "",
                url: $location.absUrl(),
                img: data.components[0].images.vanity[0].url,
                type: "product",
                caption: data.components[0].manufacturer + " " + data.components[0].model + " " + $window.util.capitalizeString(data.components[0].component) + " Price Comparison, Best Deals, and Compatibility."
            };
            data.components.length ? ($scope.components = data.components,
            $scope.catUrl = data.components[0].component.replace(/\s+/g, "-").toLowerCase(),
            $scope.mainImage = meta.img,
            MetaFactory.setMeta(meta),
            getBuilds()) : ($rootScope.loading = !1,
            $location.path("/not-found"))
        })
    })) : ($rootScope.loading = !1,
    $location.path("/not-found"))
}
]),
angular.module("pricing").factory("PricingService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var PricingResource = $resource("/api/pricing", {}, {
        get: {
            method: "GET"
        }
    })
      , factory = {
        getPricing: function(data) {
            var deferred = $q.defer();
            return PricingResource.get(function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]),
angular.module("users").config(["$httpProvider", function($httpProvider) {}
]),
angular.module("users").config(["$stateProvider", function($stateProvider) {
    $stateProvider.state("profile", {
        url: "/profile",
        templateUrl: "/modules/users/views/settings/profile.client.view.html"
    }).state("password", {
        url: "/settings/password",
        templateUrl: "/modules/users/views/settings/change-password.client.view.html"
    }).state("accounts", {
        url: "/settings/accounts",
        templateUrl: "/modules/users/views/settings/social-accounts.client.view.html"
    }).state("signup", {
        url: "/signup",
        templateUrl: "/modules/users/views/authentication/signup.client.view.html"
    }).state("signin", {
        url: "/signin",
        templateUrl: "/modules/users/views/authentication/signin.client.view.html"
    }).state("forgot", {
        url: "/password/forgot",
        templateUrl: "/modules/users/views/password/forgot-password.client.view.html"
    }).state("reset", {
        url: "/password/reset/:token",
        templateUrl: "/modules/users/views/password/reset-password.client.view.html"
    }).state("dealers", {
        url: "/dealers",
        templateUrl: "/modules/users/views/dealers.client.view.html"
    })
}
]),
angular.module("users").controller("AuthenticationController", ["$scope", "$rootScope", "$element", "$http", "$location", "AuthService", "Authentication", "ezfb", function($scope, $rootScope, $element, $http, $location, AuthService, Authentication, ezfb) {
    $rootScope.signInToggle = !1,
    $rootScope.resetToggle = !1,
    $scope.validation = {
        username: {},
        email: {}
    },
    $scope.credentials = {},
    $scope.authentication = Authentication,
    $scope.toggleSignInOut = function(email) {
        $rootScope.signInToggle = !$rootScope.signInToggle,
        $scope.credentials = {},
        $scope.validation = {}
    }
    ,
    $scope.toggleReset = function() {
        $rootScope.resetToggle = !$rootScope.resetToggle
    }
    ,
    $scope.testPassword = function(password) {
        password.length > 0 ? $scope.validation.password = window.util.validatePassword(password) : $scope.validation.password = {
            status: !1,
            message: "password is required"
        }
    }
    ,
    $scope.testName = function(position, name) {
        name && name.length > 1 ? $scope.validation[position + "Name"] = {
            status: !0
        } : $scope.validation[position + "Name"] = {
            status: !1,
            message: position + " name is required"
        }
    }
    ,
    $scope.testUsername = function(name) {
        name && name.length > 4 ? window.util.validateUsername(name) ? ($scope.validation.username = {
            status: !1,
            message: "checking"
        },
        AuthService.checkUsername({
            username: name
        }).then(function(response) {
            "not found" === response.error ? $scope.validation.username = {
                status: !0,
                message: "available"
            } : $scope.validation.username = {
                status: !1,
                message: "not available"
            },
            $scope.credentials.username.length < 1 ? $scope.validation.username = {
                status: !1,
                message: "username is required"
            } : $scope.credentials.username.length < 5 && ($scope.validation.username = {
                status: !1,
                message: "too short"
            })
        })) : $scope.validation.username = {
            status: !1,
            message: "username must be letters and numbers only"
        } : name.length < 1 ? $scope.validation.username = {
            status: !1,
            message: "username is required"
        } : $scope.validation.username = {
            status: !1,
            message: "too short"
        }
    }
    ,
    $scope.testEmail = function(email) {
        email ? window.util.validateEmail(email) ? ($scope.validation.email = {
            status: !1,
            message: "checking email"
        },
        AuthService.checkEmail({
            email: email
        }).then(function(response) {
            "not found" === response.error ? $scope.validation.email = {
                status: !0,
                message: "valid email"
            } : $scope.validation.email = {
                status: !1,
                message: "duplicate"
            }
        })) : $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : event.target.value.length > 0 ? $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "email is required"
        }
    }
    ,
    $scope.authSignUp = function(creds) {
        $scope.validation.email.status && $scope.validation.firstName.status && $scope.validation.lastName.status && $scope.validation.password.status && $scope.validation.username.status && AuthService.signup($scope.credentials).then(function(response) {
            200 === response.statusCode && ($rootScope.authentication.user = response.body,
            $rootScope.closeAuthModal(),
            $scope.credentials = {},
            $scope.validation = {},
            $location.path("/profile"))
        })
    }
    ,
    $scope.authSignIn = function(creds) {
        creds.username && creds.password ? ($scope.validation.username = {},
        $scope.validation.password = {},
        $scope.validation.login = {
            status: !1,
            message: "logging in"
        },
        AuthService.login(creds).then(function(response) {
            200 !== response.statusCode || response.body.error ? $scope.validation.login = {
                status: !1,
                message: response.body.error
            } : ($rootScope.authentication.user = response.body,
            $rootScope.closeAuthModal(),
            $scope.credentials = {},
            $scope.validation = {})
        })) : (creds.username ? $scope.validation.username = {} : $scope.validation.username = {
            status: !1,
            message: "username is required"
        },
        creds.password ? $scope.validation.password = {} : $scope.validation.password = {
            status: !1,
            message: "password is required"
        })
    }
    ,
    $scope.fbLogin = function() {
        ezfb.login(function(res) {
            res.authResponse && ($rootScope.closeAuthModal(),
            $rootScope.updateLoginStatus($rootScope.updateApiMe()))
        }, {
            scope: "email"
        })
    }
}
]),
angular.module("users").controller("DealerController", ["$scope", "$rootScope", "$http", "$location", "Users", "Authentication", "ManufacturersService", "ShopService", "AuthService", function($scope, $rootScope, $http, $location, Users, Authentication, ManufacturersService, ShopService, AuthService) {
    $scope.manufacturers = [],
    $scope.selectedManufacturers = [],
    $scope.dealerSignUp = {},
    $scope.validation = {
        name: {},
        phone: {},
        email: {},
        address: {},
        manufacturers: {}
    },
    $scope.testName = function() {
        $scope.dealerSignUp.name && $scope.dealerSignUp.name.length ? ($scope.validation.name.status = !0,
        $scope.validation.name.message = "") : ($scope.validation.name.status = !1,
        $scope.validation.name.message = "shop name is required")
    }
    ,
    $scope.testPhone = function(phone) {
        var ph = $scope.dealerSignUp.phone ? $scope.dealerSignUp.phone : phone;
        ph ? window.util.validatePhone(ph) ? $scope.validation.phone = {
            status: !0,
            message: "valid phone number"
        } : $scope.validation.phone = {
            status: !1,
            message: "not a valid phone number"
        } : $scope.validation.phone = {
            status: !1,
            message: "phone number is required"
        }
    }
    ,
    $scope.testEmail = function(email) {
        var em = $scope.dealerSignUp.email ? $scope.dealerSignUp.email : $rootScope.authentication.user.email;
        em ? window.util.validateEmail(em) ? $scope.validation.email = {
            status: !0,
            message: "valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "email is required"
        }
    }
    ,
    $scope.testAddress = function() {
        $scope.dealerSignUp.street && $scope.dealerSignUp.city && $scope.dealerSignUp.zip && $scope.dealerSignUp.state && $scope.dealerSignUp.country ? $scope.validation.address = {
            status: !0,
            message: "valid address"
        } : $scope.validation.address = {
            status: !1,
            message: "all address fields are required"
        }
    }
    ,
    $scope.testManufacturers = function() {
        $scope.selectedManufacturers.length > 0 ? $scope.validation.manufacturers = {
            status: !0,
            message: "manufacturers selected"
        } : $scope.validation.manufacturers = {
            status: !1,
            message: "please select your manufacturers"
        }
    }
    ,
    $scope.submitSignUp = function() {
        var shop = {};
        $scope.testName(),
        $scope.testEmail(),
        $scope.testPhone(),
        $scope.testAddress(),
        $scope.testManufacturers(),
        $scope.validation.address.status === !0 && $scope.validation.email.status === !0 && $scope.validation.name.status === !0 && $scope.validation.phone.status === !0 && $scope.validation.manufacturers.status === !0 && (shop = $scope.dealerSignUp,
        shop.manufacturers = $scope.selectedManufacturers,
        shop.status = "pending",
        ShopService.saveShop(shop).then(function(data) {
            var shop = data.shop
              , user = $rootScope.authentication.user;
            shop._id ? ((!user.shops || user.shops.length < 1) && (user.shops = []),
            user.shops.push(shop._id),
            AuthService.updateShops(user).then(function(data) {
                $rootScope.authentication.user.shops = data.body.shops
            }),
            $scope.validation.submit = {
                status: !0,
                message: "shop submitted successfully, check your profile for the status of this shop"
            }) : $scope.validation.submit = {
                status: !1,
                message: "there was an error processing your submition"
            }
        }))
    }
    ,
    ManufacturersService.manufacturersList({}).then(function(data) {
        for (var manufacturers = [], i = 0; i < data.manufacturers.length; i++)
            "bike" === data.manufacturers[i].type && manufacturers.push(data.manufacturers[i]);
        $scope.manufacturers = manufacturers,
        $rootScope.authentication.user.email && ($scope.dealerSignUp.email = $rootScope.authentication.user.email)
    }),
    $scope.toggleManufacturer = function(manufacturer) {
        $scope.selectedManufacturers.indexOf(manufacturer) >= 0 ? $scope.selectedManufacturers.splice($scope.selectedManufacturers.indexOf(manufacturer), 1) : $scope.selectedManufacturers.push(manufacturer)
    }
}
]),
angular.module("users").controller("PasswordController", ["$scope", "$rootScope", "$http", "$location", "Users", "Authentication", "AuthService", function($scope, $rootScope, $http, $location, Users, Authentication, AuthService) {
    $scope.user = Authentication.user,
    $scope.reset = {},
    $scope.validation = {
        reset: {},
        password: {},
        update: {}
    },
    $scope.credentials = {},
    $rootScope.toggleUserNav(!1),
    $rootScope.toggleNav(!1),
    $scope.testPassword = function(password) {
        password.length > 0 ? $scope.validation.password = window.util.validatePassword(password) : $scope.validation.password = {
            status: !1,
            message: "password is required"
        }
    }
    ,
    $scope.verifyPassword = function(password) {
        $scope.credentials.password === $scope.credentials.verifyPassword ? $scope.validation.verifyPassword = {
            status: !0,
            message: "passwords match"
        } : $scope.validation.verifyPassword = {
            status: !1,
            message: "passwords do not match"
        }
    }
    ,
    $scope.updatePassword = function() {
        $scope.credentials.token = $location.url().replace("/password/reset/", ""),
        $scope.validation.password.status === !0 && $scope.validation.verifyPassword.status === !0 && AuthService.updatePassword($scope.credentials).then(function(response) {
            response.body.error ? ($scope.validation.update.status = !1,
            $scope.validation.update.message = response.body.error) : response.body.success && ($scope.validation.update.status = !0,
            $scope.validation.update.message = response.body.success)
        })
    }
    ,
    $scope.passwordReset = function(reset) {
        var env = $location.protocol() + "://" + window.location.host;
        AuthService.resetPassword({
            username: reset.username,
            env: env
        }).then(function(response) {
            response.body.error ? ($scope.validation.reset.status = !1,
            $scope.validation.reset.message = response.body.error) : response.body.success && ($scope.validation.reset.status = !0,
            $scope.validation.reset.message = response.body.success)
        })
    }
}
]),
angular.module("users").controller("ProfileController", ["$scope", "$rootScope", "$http", "$location", "$q", "Users", "Authentication", "BuilderService", "AuthService", "ShopService", "ManufacturersService", function($scope, $rootScope, $http, $location, $q, Users, Authentication, BuilderService, AuthService, ShopService, ManufacturersService) {
    function getBuildsArray(id) {
        var defer = $q.defer();
        return BuilderService.getBuild({
            id: id
        }).then(function(resp) {
            null !== resp.build && (resp.build.date = new Date(resp.build.utc),
            resp.build.url = "/builder/" + window.util.formatUrl(resp.build.year + "-" + resp.build.manufacturer + "-" + resp.build.model) + "?id=" + resp.build._id,
            builds.push(resp.build)),
            defer.resolve()
        }),
        defer.promise
    }
    function getShopsArray(id) {
        var defer = $q.defer();
        return ShopService.getShop({
            id: id
        }).then(function(resp) {
            null !== resp.shops && (resp.shops.edit = !1,
            resp.shops.newManufacturers = [],
            shops.push(resp.shops)),
            defer.resolve()
        }),
        defer.promise
    }
    var promises = []
      , builds = []
      , shops = [];
    if ($rootScope.loading = !0,
    $rootScope.toggleUserNav(!1),
    $scope.validation = {
        username: {},
        email: {},
        firstName: {},
        lastName: {}
    },
    $scope.builds = [],
    $scope.shops = [],
    $scope.month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    $scope.user = $rootScope.authentication.user,
    $scope.user.edit = !1,
    $scope.removeBuild = function(build, $event) {
        $event.preventDefault(),
        $rootScope.loading = !0,
        1 == confirm("Are you sure you want to delete this build?") ? ($scope.user.builds.splice($scope.user.builds.indexOf(build._id), 1),
        $scope.builds.splice($scope.builds.indexOf(build), 1),
        AuthService.updateBuilds($scope.user).then(function(data, response) {
            $rootScope.loading = !1
        })) : $rootScope.loading = !1
    }
    ,
    $scope.removeShop = function(shop, $event) {
        $event.preventDefault(),
        $rootScope.loading = !0,
        1 == confirm("Are you sure you want to delete this shop?") ? ($rootScope.loading = !0,
        $scope.user.shops.splice($scope.user.shops.indexOf(shop._id), 1),
        $scope.shops.splice($scope.shops.indexOf(shop), 1),
        AuthService.updateShops($scope.user).then(function(data, response) {
            $rootScope.loading = !1
        })) : $rootScope.loading = !1
    }
    ,
    $scope.editBrands = function(shop) {
        shop.edit = !shop.edit,
        shop.edit === !1 && (shop.newManufacturers = [])
    }
    ,
    $scope.editUser = function(user) {
        user.edit = !user.edit,
        user.edit === !1 ? (user.newUsername = "",
        $scope.validation.username = {}) : (user.newFirstName = user.firstName,
        user.newLastName = user.lastName,
        user.newEmail = user.email)
    }
    ,
    $scope.saveShop = function(shop) {
        shop.manufacturers = shop.newManufacturers,
        ShopService.saveShop(shop).then(function(data) {
            shop.edit = !1,
            shop.newManufacturers = []
        })
    }
    ,
    $scope.saveUser = function(user) {
        var valid = !0;
        $rootScope.loading = !0,
        $scope.validation.username.status === !1 ? valid = !1 : $scope.validation.email.status === !1 ? validalid = !1 : $scope.validation.firstName.status === !1 ? valid = !1 : $scope.validation.lastName.status === !1 && (valid = !1),
        valid && AuthService.updateDetails(user).then(function(data, response) {
            data.body.message ? (user.edit = !1,
            $rootScope.loading = !1) : ($scope.user = data.body,
            $rootScope.authentication.user = $scope.user,
            user.edit = !1,
            $rootScope.loading = !1)
        })
    }
    ,
    $scope.toggleManufacturer = function(manufacturer, shop) {
        shop.newManufacturers.indexOf(manufacturer) >= 0 ? shop.newManufacturers.splice(shop.newManufacturers.indexOf(manufacturer), 1) : shop.newManufacturers.push(manufacturer)
    }
    ,
    $scope.testName = function(position, name) {
        name && name.length > 1 ? $scope.validation[position + "Name"] = {
            status: !0
        } : $scope.validation[position + "Name"] = {
            status: !1,
            message: position + " name is required"
        }
    }
    ,
    $scope.testUsername = function(name) {
        $scope.user.edit = !0,
        name && name.length > 4 ? window.util.validateUsername(name) ? ($scope.validation.username = {
            status: !1,
            message: "checking"
        },
        AuthService.checkUsername({
            username: name
        }).then(function(response) {
            "not found" === response.error ? $scope.validation.username = {
                status: !0,
                message: "available"
            } : $scope.validation.username = {
                status: !1,
                message: "not available"
            },
            $scope.credentials.username.length < 1 ? $scope.validation.username = {
                status: !1,
                message: "username is required"
            } : $scope.credentials.username.length < 5 && ($scope.validation.username = {
                status: !1,
                message: "too short"
            })
        })) : $scope.validation.username = {
            status: !1,
            message: "username must be letters and numbers only"
        } : name.length < 1 ? $scope.validation.username = {
            status: !1,
            message: "username is required"
        } : $scope.validation.username = {
            status: !1,
            message: "too short"
        }
    }
    ,
    $scope.testEmail = function(email) {
        email ? window.util.validateEmail(email) ? ($scope.validation.email = {
            status: !1,
            message: "checking email"
        },
        AuthService.checkEmail({
            email: email
        }).then(function(response) {
            "not found" === response.error ? $scope.validation.email = {
                status: !0,
                message: "valid email"
            } : $scope.validation.email = {
                status: !1,
                message: "duplicate"
            }
        })) : $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : event.target.value.length > 0 ? $scope.validation.email = {
            status: !1,
            message: "not a valid email"
        } : $scope.validation.email = {
            status: !1,
            message: "email is required"
        }
    }
    ,
    $scope.user.builds)
        for (var i = 0; i < $scope.user.builds.length; i++)
            promises.push(getBuildsArray($scope.user.builds[i]));
    if ($scope.user.shops)
        for (var i = 0; i < $scope.user.shops.length; i++)
            promises.push(getShopsArray($scope.user.shops[i]));
    $q.all(promises).then(function() {})["finally"](function() {
        ManufacturersService.manufacturersList({}).then(function(data) {
            for (var manufacturers = [], i = 0; i < data.manufacturers.length; i++)
                "bike" === data.manufacturers[i].type && manufacturers.push(data.manufacturers[i]);
            $scope.manufacturers = manufacturers,
            builds.length && ($scope.builds = builds),
            shops.length && ($scope.shops = shops),
            $rootScope.loading = !1
        })
    })
}
]),
angular.module("users").controller("SettingsController", ["$scope", "$http", "$location", "Users", "Authentication", function($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user
}
]),
angular.module("users").factory("AuthService", ["$http", "$resource", "$q", function($http, $resource, $q) {
    var UserResource = $resource("/api/user/:username", {
        username: "@username"
    }, {
        get: {
            method: "GET"
        }
    })
      , EmailResource = $resource("/api/user-email/:email", {
        email: "@email"
    }, {
        get: {
            method: "GET"
        }
    })
      , LoginResource = $resource("/api/login", {}, {
        post: {
            method: "POST"
        }
    })
      , SignupResource = $resource("/api/signup", {}, {
        post: {
            method: "POST"
        }
    })
      , LogoutResource = $resource("/api/logout", {}, {
        post: {
            method: "POST"
        }
    })
      , FBAuthResource = $resource("/api/fb-auth", {}, {
        post: {
            method: "POST"
        }
    })
      , ResetResource = $resource("/api/reset-password", {}, {
        post: {
            method: "POST"
        }
    })
      , UpdateResource = $resource("/api/update-password", {}, {
        post: {
            method: "POST"
        }
    })
      , ShopsResource = $resource("/api/update-shops", {}, {
        post: {
            method: "POST"
        }
    })
      , BuildsResource = $resource("/api/update-builds", {}, {
        post: {
            method: "POST"
        }
    })
      , DetailsResource = $resource("/api/update-details", {}, {
        post: {
            method: "POST"
        }
    })
      , factory = {
        checkUsername: function(data) {
            var deferred = $q.defer();
            return UserResource.get(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        resetPassword: function(data) {
            var deferred = $q.defer();
            return ResetResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        updatePassword: function(data) {
            var deferred = $q.defer();
            return UpdateResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        updateShops: function(data) {
            var deferred = $q.defer();
            return ShopsResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        updateBuilds: function(data) {
            var deferred = $q.defer();
            return BuildsResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        updateDetails: function(data) {
            var deferred = $q.defer();
            return DetailsResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        checkEmail: function(data) {
            var deferred = $q.defer();
            return EmailResource.get(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        login: function(data) {
            var deferred = $q.defer();
            return LoginResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        logout: function(data) {
            var deferred = $q.defer();
            return LogoutResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        signup: function(data) {
            var deferred = $q.defer();
            return SignupResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        },
        fbAuth: function(data) {
            var deferred = $q.defer();
            return FBAuthResource.post(data, function(resp) {
                deferred.resolve(resp)
            }),
            deferred.promise
        }
    };
    return factory
}
]).factory("Authentication", [function() {
    var _this = this;
    return _this._data = {
        user: window.user
    },
    _this._data
}
]),
angular.module("users").factory("Users", ["$resource", function($resource) {
    return $resource("users", {}, {
        update: {
            method: "PUT"
        }
    })
}
]);

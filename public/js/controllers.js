'use strict';

// ************************************************************************
// 
// CONTROLLERS
//
// ************************************************************************

(function (ng) {


  var controllers = ng.module(APPLICATION_NAME + '.controllers', []);

  //
  // Application Controller - Handles basic functionality of the app
  //

  controllers.controller('ApplicationCtrl', ['$rootScope', '$location', '$window', 'Session',
    function ($rootScope, $location, $window, Session) {
      var lastStep = Session.get('last_step');

      var goToLastStep = function () {
        if (lastStep) $location.path('section/' + lastStep);
      }

      var onBeforeUnload = function () {
        Session.save(); 
      }

      goToLastStep();

      $window.onbeforeunload = onBeforeUnload;
    }
  ]);

  controllers.controller('SectionCtrl', [ '$scope', 'Session',
    function ($scope, Session) {
      $scope.$on('$locationChangeSuccess', function () {
        Session.save();
      });
    }
  ]);

  //
  // Dialog Controller - Allows user to reset session when visiting
  //                     the page for a second time.
  //

  controllers.controller('DialogCtrl', ['$scope', 'Session',
    function ($scope, Session) {

      var showDialog = Session.isPersisted();

      var $main   = document.getElementById('main');
      var $dialog = document.getElementById('dialog');

      var show = function () {
        showDialog = true;
        $dialog.style.marginTop = '0';
      }

      var hide = function () {
        showDialog = false;
        $dialog.style.marginTop = '-200px';
      }

      var resetSession = function () {
        Session.reset();
        Session.save();
        dismissDialog();
      }

      var dismissDialog = function () {
        if (showDialog) {
          hide(); 
        }
      }

      ng.element($main).bind('click', dismissDialog);

      $scope.reset   = resetSession;
      $scope.dismiss = dismissDialog;

      if (showDialog) {
        setTimeout(show, 800);
      }
    }
  ]);

  //
  // Section 10 - What kind of business are you?
  //

  controllers.controller('10Ctrl', ['$scope', 'Session', 'NAICSCategory', 'CategoryKeywords',
    function ($scope, Session, NAICSCategory, CategoryKeywords) {

      //
      // NAICS Search
      //

      var resetSearch = function () {
        $scope.results = [];
        $scope.showResults = false;
        $scope.showError = false;
        $scope.showInvalid = false;
        $scope.lastSearch = null;
      } 

      var onSearchSuccess = function (results) {
        $scope.results = results;
        $scope.showLoading = false;
        $scope.showResults = true; 
      }

      var onSearchError = function () {
        $scope.showLoading = false;
        $scope.showError = true;
      }

      var onInvalidTerms = function () {
        $scope.showLoading = false;
        $scope.showInvalid = true; 
      }

      var search = function (keywords) {
        resetSearch();

        if ( ng.isUndefined(keywords) ) {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = keywords;
        $scope.showLoading = true;

        Session.set({ naics_keywords: keywords });
        Session.save();

        NAICSCategory.search({ keywords: keywords }, onSearchSuccess, onSearchError)
      }

      var keywords = Session.get('naics_keywords');

      if (keywords) {
        $scope.terms = keywords;
        search(keywords);
      }

      $scope.sampleInput = CategoryKeywords.random();
      $scope.search = search;

      //
      // NAICS Select
      //

      var select = function (item) {
        if ( !ng.equals(item, $scope.selected) ) {
          $scope.selected = item;
          Session.set({ naics_code: item.get('code') });
        } else {
          $scope.selected = null; 
          Session.set({ naics_code: null });
        }

        Session.save();
      } 

      $scope.$watch('results', function () {
        var code = Session.get('naics_code');
        if (code) {
          ng.forEach($scope.results, function (result) {
            if ( ng.equals(result.get('code'), code) ) $scope.selected = result;
          });
        }
      });

      $scope.select = select;
    }
  ]);

  //
  // Section 15 - Describe your business.
  //

  controllers.controller('15Ctrl', ['$scope', 'Session',
    function ($scope, Session) {
      var save = function () {
        Session.save(); 
      }

      $scope.$watch('description', function (description) {
        if (description) {
          Session.set({ description: description.trim() });
        }
      });

      $scope.description = Session.get('description');
      $scope.save = save
    }
  ]);

  //
  // Section 40 - Search for an address
  //

  controllers.controller('40Ctrl', [ '$scope', 'Session', 'Address', 'City', 'Map',

    function ($scope, Session, Address, City, Map) {

      //
      // Address Search
      //

      var perPage = 20;

      var resetSearch = function () {
        $scope.results = []; 
        $scope.showResults = false;
        $scope.showError = false;
        $scope.showInvalid = false;
        $scope.lastSearch = null;
      }

      var onSearchSuccess = function (results) {
        $scope.results = results.slice(0,perPage);
        $scope.showLoading = false;
        $scope.showResults = true;
      }

      var onSearchError = function () {
        $scope.showLoading = false; 
        $scope.showError = true;
      }

      var onInvalidTerms = function () {
        $scope.showLoading = false;
        $scope.showInvalid = true; 
      }

      var search = function (address) {
        resetSearch();

        if ( ng.isUndefined(address) ) {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = address;
        $scope.showLoading = true;

        Session.set({ address_keywords: address });
        Session.save();

        Address.search({ address: address }, onSearchSuccess, onSearchError) 
      }

      var address = Session.get('address_keywords');

      if (address) {
        $scope.terms = address;
        search(address);
      }

      $scope.search = search;

      //
      // Address Select
      //

      var select = function (item) {
        if ( !ng.equals(item, $scope.selected) ) {
          $scope.selected = item;
          Session.set({ address: item.get('address') });
        } else {
          $scope.selected = null; 
          Session.set({ address: null });
        }

        Session.save();
      }

      $scope.$watch('results', function () {
        var address = Session.get('address');
        if (address) {
          ng.forEach($scope.results, function (result) {
            if ( ng.equals(result.get('address'), address) ) $scope.selected = result;
          });
        }
      });

      $scope.select = select;

      //
      // Map
      //

      var map = new Map();

      $scope.$watch('selected', function (value) {
        var latitude, longitude, zoom;

        map.clearMarkers();

        if (value) {
          zoom = 19;
          latitude  = value.get('latitude');
          longitude = value.get('longitude');
          map.addMarker(new Map.Marker(latitude, longitude));
        } else {
          zoom = 11;
          latitude = 36.21205;
          longitude = -115.19395;
        }

        map.setZoom(zoom);
        map.panTo(latitude, longitude);
      });

      $scope.map = map;

      //
      // Display city limits overlay
      //

      var onCityLimitsSuccess = function (cityLimits) {
        $scope.cityLimits = cityLimits;
      }

      var onCityLimitsError = function () {
        $scope.showError = true;
      }

      $scope.$watch('cityLimits', function (value) {
        if (value) {
          var overlay = Map.Overlay.fromGeoJSON(value.get('geometry'));
          overlay.setStrokeWeight(4);
          overlay.setStrokeOpacity(0.1);
          map.addOverlay(overlay);
        }
      });

      City.find({}, onCityLimitsSuccess, onCityLimitsError);
    }
  ]);

  //
  // Section 41 - Neighborhood selection
  //
  controllers.controller('41Ctrl', ['$scope', 'Session', 'Neighborhood', 'City', 'Map',
    function ($scope, Session, Neighborhood, City, Map) {

      var map = new Map();
      var neighborhoodOverlays = {}

      var onSuccess = function (neighborhoods) {
        $scope.neighborhoods = neighborhoods;
        $scope.showError = false;
      } 

      var onError = function () {
        $scope.showError = true;
      }

      var showNeighborhood = function (neighborhood) {
        var overlay = neighborhoodOverlays[neighborhood.get('name')];
        if (overlay) {
          overlay.setFillOpacity(0.15);
          map.setBounds(overlay.getBounds());
        }
      }

      var hideNeighborhood = function (neighborhood) {
        var overlay = neighborhoodOverlays[neighborhood.get('name')];
        if (overlay) {
          overlay.setFillOpacity(0.0);
        }
      }

      $scope.$watch('neighborhoods', function (neighborhoods) {
        if (neighborhoods) {
          ng.forEach(neighborhoods, function (neighborhood) {
            var overlay = Map.Overlay.fromGeoJSON(neighborhood.get('geometry'));
            $scope.map.addOverlay(overlay);
            neighborhoodOverlays[neighborhood.get('name')] = overlay;
          });

          $scope.showNeighborhoods = true;
        } else {
          $scope.showNeighborhoods = false;
        }
      });

      $scope.map = map;
      $scope.showNeighborhood = showNeighborhood;
      $scope.hideNeighborhood = hideNeighborhood;

      Neighborhood.all({}, onSuccess, onError)

      //
      // City Limits
      //

      var cityLimitsOverlay;

      var showCityLimits = function () {
        if (cityLimitsOverlay) {
          cityLimitsOverlay.setFillOpacity(0.15);
          map.setBounds(cityLimitsOverlay.getBounds());
        }
      }

      var hideCityLimits = function () {
        if (cityLimitsOverlay) {
          cityLimitsOverlay.setFillOpacity(0);
        }
      }

      var onCityLimitsSuccess = function (cityLimits) {
        $scope.cityLimits = cityLimits;
      }

      var onCityLimitsError = function () {
        $scope.showError = true;
      }

      $scope.$watch('cityLimits', function (value) {
        if (value) {
          cityLimitsOverlay = Map.Overlay.fromGeoJSON(value.get('geometry'));
          cityLimitsOverlay.setStrokeWeight(4);
          cityLimitsOverlay.setStrokeOpacity(0.1);
          map.addOverlay(cityLimitsOverlay);
        } else {
          if (cityLimitsOverlay) map.removeOverlay(cityLimitsOverlay);
        }
      });

      City.find({}, onCityLimitsSuccess, onCityLimitsError);

      $scope.showCityLimits = showCityLimits;
      $scope.hideCityLimits = hideCityLimits;
    }
  ]);

  //
  // Section 45 - Select a parcel
  //

  controllers.controller('45Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      var map = new Map();
      $scope.map = map;
    }

  ]);

  //
  // Section 50 - Parcel confirmation
  //

  controllers.controller('50Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      var map = new Map();
      $scope.map = map;
    }

  ]);

})(angular);

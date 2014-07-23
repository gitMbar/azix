angular.module('app', ['ui.router']) //dont forget to load factories

.controller('ProjectsCtrl', function($scope, $state){
  $scope.data = {};
  $scope.data.test = "sup mike"
})

.run(
  [          '$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {

    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    }
  ]
)


.config(function($stateProvider, $urlRouterProvider) {


  $stateProvider

    // Each tab has its own nav history stack:

    .state('projects', {
      url: '/projects',
      templateUrl: '/app/projects.html',
      controller: 'ProjectsCtrl'
    })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/projects');

})


/*.controller('FormCtrl', ['$scope', '$animate', function($scope, $animate) {

  // hide error messages until 'submit' event
  $scope.submitted = false;

  // hide success message
  $scope.showMessage = false;

  // method called from shakeThat directive
  $scope.submit = function() {
    // show success message
  };

}])*/

/*.directive('shakeThat', ['$animate', function($animate) {

  return {
    require: '^form',
    scope: {
      submit: '&',
      submitted: '='
    },
    link: function(scope, element, attrs, form) {

      // listen on submit event
      element.on('submit', function() {

        // tell angular to update scope
        scope.$apply(function() {

          // everything ok -> call submit fn from controller
          if (form.$valid) return scope.submit();

          // show error messages on submit
          scope.submitted = true;

          // shake that form
          $animate.addClass(element, 'shake', function() {
            $animate.removeClass(element, 'shake');
          });

        });

      });

    }
  };

}]);*/
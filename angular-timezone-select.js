angular.module('angular-timezone-select', [])
  .constant('_', _)
  .constant('moment', moment)
  .factory('timezones', ['_', 'moment', function(_, moment) {
    return _.sortBy(_.map(moment.tz.names(), function(zoneName) {
      return {
        name: zoneName,
        offset: 'UTC' + moment().tz(zoneName).format('Z')
      };
    }), 'offset');
  }])
  .factory('zones', ['_', function(_) {
    var zones = [];
    var grouped = _.groupBy(zones, function(zone) {
      return zone.cca2;
    });
    return _.mapValues(grouped, function(countries) {
      return _.map(countries, 'name');
    });
  }])
  .directive('timezoneSelect', ['_', 'timezones', 'zones', function(_, timezones, zones) {
    return {
      restrict: 'A',
      scope: {
        country: '='
      },
      link: function(scope, elem, attrs) {
        var groups = _.groupBy(timezones, function(zone) {
          return !!(scope.country && zones[scope.country] && _.find(zones[scope.country], function(zoneName) {
            return zoneName === zone.name;
          }));
        });

        function transformTimezone(zone) {
          return {
            id: zone.name,
            text: zone.name + ' ' + zone.offset
          };
        }

        elem.select2({
          data: [{
            text: 'UTC',
            children: [
              {
                id: 'UTC',
                text: 'UTC'
              }
            ]
          }, {
            text: 'Common',
            children: _.map(groups[true], transformTimezone)
          }, {
            text: 'Other',
            children: _.map(groups[false], transformTimezone)
          }]
        });
      }
    };
  }]);

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
        function transformTimezone(zone) {
          return {
            id: zone.name,
            offset: zone.offset
          };
        }

        scope.$watch(attrs.country, function(country) {
          var groups = _.groupBy(timezones, function(zone) {
            return !!(country && zones[country] && _.find(zones[country], function(zoneName) {
              return zoneName === zone.name;
            }));
          });

          var data = [
            {
              text: 'UTC',
              children: [
                {
                  id: 'UTC',
                  offset: ''
                }
              ]
            }
          ];

          if (groups[true]) {
            data.push({
              text: 'Common',
              children: _.map(groups[true], transformTimezone)
            });
          }

          data.push({
            text: 'Other',
            children: _.map(groups[false], transformTimezone)
          });

          elem.select2({
            data: data,
            formatSelection: function(selection) {
              return selection.id;
            },
            formatResult: function(result) {
              if (!result.id) {
                return result.text;
              }
              return "<strong>" + result.id + "</strong>  <small>" + result.offset + "</small>";
            }
          });
        });
      }
    };
  }]);

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
  .directive('timezoneSelect', ['_', 'timezones', 'zones', '$timeout', function(_, timezones, zones, $timeout) {
    return {
      restrict: 'A',
      scope: {
        country: '=',
        ngModel: '='
      },
      link: function(scope, elem, attrs) {
        var $select2;
        function transformTimezone(zone) {
          return {
            id: zone.name,
            text: zone.name,
            offset: zone.offset
          };
        }

        function getTranslatedValue(key, defaultValue) {
          return attrs['i18n' + _.capitalize(key)] || defaultValue;
        }

        scope.$watch(attrs.country, function(country) {
          if ($select2) {
            $select2.select2('destroy');
            $select2.empty();
          }

          var groups = _.groupBy(timezones, function(zone) {
            return !!(country && zones[country] && _.find(zones[country], function(zoneName) {
              return zoneName === zone.name;
            }));
          });

          var data = [
            {
              text: getTranslatedValue('utc', 'UTC'),
              children: [
                {
                  id: 'UTC',
                  text:  getTranslatedValue('utc', 'UTC')
                }
              ]
            }
          ];

          if (groups[true]) {
            data.push({
              text: getTranslatedValue('common', 'Common'),
              children: _.map(groups[true], transformTimezone)
            });
          }

          data.push({
            text: getTranslatedValue('other', 'Other'),
            children: _.map(groups[false], transformTimezone)
          });

          $select2 = elem.select2({
            placeholder: 'Select a timezone',
            allowClear: true,
            width: 'resolve',
            data: data,
            templateSelection: function(selection) {
              return selection.text;
            },
            templateResult: function(result) {
              return result.offset
                ? $("<strong>" + result.id + "</strong>  <small>" + result.offset + "</small>")
                : result.text;
            }
          });
          scope.$watch('ngModel', function(newValue) {
            if (!!newValue) {
              $timeout(function() {
                $select2.val(newValue).trigger('change');
              }, 0, false);
            }
          });
        });
      }
    };
  }]);

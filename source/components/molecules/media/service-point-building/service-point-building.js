/* global finna */
finna.servicePointBuilding = (function servicePointBuilding(root) {
  var $holder, $loader, $content;
  var service;

  var getOrganisationData = function getOrganisationData(organisation) {
    var deferred = $.Deferred();

    service.getOrganisations('page', organisation, [], {}, function onOrganisationsLoaded(res) {
      if (res) {
        deferred.resolve(res);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise();
  };

  var getSchedules = function getSchedules(organisation, id) {
    var deferred = $.Deferred();

    service.getSchedules('page', organisation, id, null, null, true, true, function onSchedulesLoaded(res) {
      if (res) {
        deferred.resolve(res);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise();
  };

  var updateBuilding = function updateBuilding(data) {
    $content.find('.figure-caption').text(data.name);

    if (data.details.description) {
      $content.find('.js-building-description').html(data.details.description);
      $content.find('.js-building-description').removeClass('hide');
    }

    var yearBuilt = data.details.buildingYear;

    if (yearBuilt) {
      $content.find('.js-building-year span').text(yearBuilt);
      $content.find('.js-building-year').removeClass('hide');
    }

    if (data.details.pictures) {
      var imgSrc = data.details.pictures[0].url;

      $content.find('.js-building-image-primary .figure-image').attr('src', imgSrc);

      var hasExtraImages = data.details.museum;

      if (hasExtraImages) {
        var extraImages = [data.details.pictures[1], data.details.pictures[2]].map(function mapExtraImages(image) {
          return $('<img />').attr('src', image.url);
        });

        extraImages.forEach(function forEachExtraImage($image) {
          $content.find('.js-building-image-secondary').append($image);
        })

        $content.find('.js-building-image-secondary').removeClass('hide');
      }
    }

    $loader.addClass('hide');
    $content.removeClass('hide');
  };

  var getServicePoint = function getServicePoint(id) {
    var organisation = $holder.data('organisation');

    getOrganisationData(organisation).then(function onOrganisationResolve() {
      getSchedules(organisation, id).then(function onSchedulesResolve() {
        var data = service.getDetails(id);

        if (data.details) {
          updateBuilding(data);
        }
      });
    });
  };

  return {
    getServicePoint: getServicePoint,
    init: function init(_holder, _service) {
      $holder = _holder;
      service = _service;

      $loader = $holder.find('.js-loader');
      $content = $holder.find('.js-content');

      $(root).on('mapWidget:selectServicePoint', function onMapWidgetSelect(_, data) {
        $holder.data('service-point-id', data);

        $content.addClass('hide');
        $content.find('.js-hide-onload').addClass('hide');

        $loader.removeClass('hide');

        getServicePoint(data)
      })
    }
  }
});


var mockTags = [{
  id: '1',
  value: 'Testing 1'
},
{
  id: '2',
  value: 'Testing 2'
}
];

var mockOpeningTimes = [
  { opens: "9", closes: "10", selfservice: true },
  { opens: "10", closes: "17", selfservice: false },
  { opens: "17", closes: "18", selfservice: true }
];

var getWeekForDate = function (date) {
  var weekModel = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  return weekModel.map(function (_, index) {
    var first = date.getDate() - date.getDay() + (index + 1);
    var day = new Date(date.setDate(first)).toISOString().slice(0, 10);

    var dayArray = day.split('-').reverse();
    var yearRemoved = dayArray.slice(0, -1);
    var dateString = yearRemoved.join('.')

    return dateString
  });
};

var getWeekNumber = function (date) {
  var oneJan = new Date(date.getFullYear(), 0, 1);

  return Math.ceil((((date.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
};

$.mockjax([
  {
    url: '/finna/tags',
    type: 'GET',
    responseTime: 2000,
    response: function () {
      this.responseText = {
        'tags': mockTags
      };
    }
  },
  {
    url: '/finna/tags',
    type: 'POST',
    responseTime: 1000,
    response: function (settings) {
      mockTags.push({
        id: Math.floor(Math.random() * 100 + 1).toString(),
        value: JSON.parse(settings.data).tag
      });

      this.responseText = {
        'status': 'OK'
      };
    }
  },
  {
    url: '/finna/tags',
    type: 'DELETE',
    responseTime: 1000,
    response: function (settings) {
      var deleteTagId = JSON.parse(settings.data).id;

      var newTags = mockTags.filter(function (tag) {
        return tag.id !== deleteTagId;
      });

      mockTags = newTags.slice(0);

      this.responseText = {
        'status': 'OK'
      };
    }
  },
  {
    url: VuFind.path + '/AJAX/JSON?method=getFeed&id=*&touch-device=*',
    type: 'GET',
    responseTime: 1000,
    response: function () {
      this.responseText = {
        data: {
          html: "<div><p>Feed Content</p><div>",
          settings: { type: "grid", modal: false }
        }
      }
    }
  },
  {
    url: VuFind.path + '/AjaxTab',
    type: 'POST',
    responseTime: 1000,
    response: function () {
      this.responseText = "<div><p>Tab Record</p><div>";
    }
  },
  {
    url: VuFind.path + '/AJAX/JSON',
    data: { method: 'getOrganisationInfo', params: { action: 'details' } },
    type: 'GET',
    responseTime: 1000,
    response: function (settings) {
      var params = settings.data.params;

      if (params.dir) {
        if (params.dir > 0) {
          var dateWeekFromNow = new Date;
          dateWeekFromNow.setDate(dateWeekFromNow.getDate() + 7);

          var week = getWeekForDate(dateWeekFromNow);
          var weekNumber = getWeekNumber(new Date) + 1;
        } else {
          var week = getWeekForDate(new Date);
          var weekNumber = getWeekNumber(new Date);
        }
        this.responseText = {
          data: {
            openTimes: {
              schedules: [
                {
                  date: week[0],
                  times: mockOpeningTimes,
                  day: "Ma",
                  today: true
                },
                {
                  date: week[1],
                  times: mockOpeningTimes,
                  day: "Ti"
                },
                {
                  date: week[2],
                  times: mockOpeningTimes,
                  day: "Ke"
                },
                {
                  date: week[3],
                  times: mockOpeningTimes,
                  day: "To"
                },
                {
                  date: week[4],
                  times: mockOpeningTimes,
                  day: "Pe"
                },
                { date: week[5], times: [], day: "La", closed: true },
                { date: week[6], times: [], day: "Su", closed: true }
              ],
              currentWeek: weekNumber == getWeekNumber(new Date),
            },
            id: "86154",
            periodStart: "2020-09-28",
            weekNum: weekNumber
          }
        }
      } else {
        this.responseText = {
          data: {
            phone: "<ul>\n  <li><p><i class=\"fa fa-phone-square\"></i><a href=\"tel:02&#x20;9412&#x20;3196\">02 9412 3196</a> / Asiakaspalvelu</p></li>\n</ul>\n",
            emails: "<ul>\n  <li><p><i class=\"fa fa-envelope\"></i><a href=\"mailto:kk-palvelu&#x40;helsinki.fi\">kk-palvelu@helsinki.fi</a></p></li>\n</ul>\n",
            pictures: [
              {
                url: "https://kirkanta.kirjastot.fi/files/photos/medium/kanki-k-590867ab71c76.jpg",
                size: 643166,
                resolution: "1543x1000"
              }
            ],
            links: [
              { name: "Twitter", url: "https://twitter.com/NatLibFi" },
              {
                name: "Instagram",
                url: "https://www.instagram.com/kansalliskirjasto/"
              },
              {
                name: "Facebook",
                url: "https://www.facebook.com/Kansalliskirjasto/"
              },
              {
                name: "Kirjaston kotisivut",
                url: "http://www.kansalliskirjasto.fi/"
              }
            ],
            services: [
              'wifi',
              'print'
            ],
            id: "86154",
            periodStart: "2020-09-14",
            weekNum: weekNumber
          }
        }
      }
    }
  },
  {
    url: VuFind.path + '/AJAX/JSON',
    data: { method: 'getOrganisationInfo', params: { action: 'consortium' } },
    type: 'GET',
    responseTime: 1000,
    response: function () {
      var week = getWeekForDate(new Date);
      var weekNumber = getWeekNumber(new Date);

      this.responseText = {
        data: {
          consortium: {
            finna: {
              service_point: 86154
            },
          },
          list: [
            {
              id: 86154,
              name: "Kansalliskirjasto",
              mobile: 0,
              email: "kk-palvelu@helsinki.fi",
              address: {
                street: "Unioninkatu 36",
                zipcode: "00170",
                city: "Helsinki",
                coordinates: { "lat": 60.17037, "lon": 24.95034 }
              },
              routeUrl: "https://opas.matka.fi/?to=Unioninkatu%2036,%20Helsinki",
              mapUrl: "http://maps.google.com/?q=Unioninkatu%2036%20Helsinki",
              openTimes: {
                schedules: [
                  {
                    date: week[0],
                    times: mockOpeningTimes,
                    day: "Ma",
                    today: true
                  },
                  {
                    date: week[1],
                    times: mockOpeningTimes,
                    day: "Ti"
                  },
                  {
                    date: week[2],
                    times: mockOpeningTimes,
                    day: "Ke"
                  },
                  {
                    date: week[3],
                    times: mockOpeningTimes,
                    day: "To",
                  },
                  {
                    date: week[4],
                    times: mockOpeningTimes,
                    day: "Pe"
                  },
                  { date: week[5], times: [], day: "La", "closed": true },
                  { date: week[6], times: [], day: "Su", "closed": true }
                ],
                currentWeek: true,
              },
              openNow: true
            }
          ],
          id: "86154",
          weekNum: weekNumber
        }
      }
    }
  }
]);

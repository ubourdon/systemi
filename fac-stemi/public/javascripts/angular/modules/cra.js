facstemi.controller('CraController', function($scope, $modal, $log, $http, Client) {
    $scope.cra = { days : [] };

    $scope.datesSelected = function(start, end, label) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        $scope.startDate = start;
        $scope.endDate = end;
        // generate blocks
        var weeks = [];
        var days = [];
        var currentDayOfWeek = 0;
        var currentWeek = [];
        moment().range(start, end).by('days', function(day) {
            if (currentDayOfWeek == 0) {
                var count = day.isoWeekday();
                while (--count != 0 ){
                    currentWeek.push({});
                }
            } else if (day.isoWeekday() <= currentDayOfWeek) {
                // change week
                weeks.push(currentWeek);
                currentWeek = [];
            }
            var currentDay = $scope.createDay(day);
            days.push(currentDay);
            currentWeek.push(currentDay);
            currentDayOfWeek = day.isoWeekday();
            if (day.isSame(end)) {
                weeks.push(currentWeek);
            }
        });
        $scope.weeks = weeks;
        $scope.cra.days = days;
        $scope.$apply();
    }

    $scope.createDay = function(date) {
        return {
            day : date,
            halfUp : (date.isoWeekday() != 6 && date.isoWeekday() !=7),
            halfDown : (date.isoWeekday() != 6 && date.isoWeekday() !=7),
            state : (date.isoWeekday() != 6 && date.isoWeekday() !=7) ? 0 : 3,
            toggleNextState: function() {
                this.state = (this.state + 1) % 4;
                var newState = this.stateToHalfDay(this.state);
                this.halfUp = newState.halfUp;
                this.halfDown = newState.halfDown;
            },
            stateToHalfDay: function(state) {
                if(state === 0) {
                    return { halfUp: true, halfDown: true };
                }
                if(state === 1) {
                    return { halfUp: true, halfDown: false };
                }
                if(state === 2) {
                    return { halfUp: false, halfDown: true };
                }
                if(state === 3) {
                    return { halfUp: false, halfDown: false };
                }
            }
        }
    }

    $scope.submit = function() {
        var accumulator = function(acc, day) {
            return acc + (day.halfUp ? 0.5 : 0) + (day.halfDown ? 0.5 : 0);
        };

        $scope.cra.numberOfDays = _.reduce($scope.cra.days, accumulator, 0);
        $http.post("/api/cra", JSON.stringify($scope.cra)).success(function() { }).error(function (){ })
    }

    var optionSet1 = {
        startDate: moment().subtract('days', 29),
        endDate: moment(),
        minDate: moment().subtract('year', 1),
        maxDate: moment().add('year', 1),
        dateLimit: { days: 60 },
        showDropdowns: true,
        showWeekNumbers: true,
        timePicker: false,
        timePickerIncrement: 1,
        timePicker12Hour: true,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
            'Last 7 Days': [moment().subtract('days', 6), moment()],
            'Last 30 Days': [moment().subtract('days', 29), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        },
        opens: 'left',
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary',
        cancelClass: 'btn-small',
        format: 'MM/DD/YYYY',
        separator: ' to ',
        locale: {
            applyLabel: 'Submit',
            cancelLabel: 'Clear',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            firstDay: 1
        }
    };

    $('#reportrange span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

    $('#reportrange').daterangepicker(optionSet1, $scope.datesSelected);
});
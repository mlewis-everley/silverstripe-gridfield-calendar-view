<% require css("webbuilders-group/silverstripe-gridfield-calendar-view: client/dist/css/fullcalendar.min.css") %>
<% require css("webbuilders-group/silverstripe-gridfield-calendar-view: client/dist/css/GridFieldCalendarView.css") %>

<% require javascript("webbuilders-group/silverstripe-gridfield-calendar-view: client/dist/js/moment.min.js") %>
<% require javascript("webbuilders-group/silverstripe-gridfield-calendar-view: client/dist/js/fullcalendar.min.js") %>
<% require javascript("webbuilders-group/silverstripe-gridfield-calendar-view: client/dist/js/GridFieldCalendarView.js") %>

<div class="grid-field__calendar" data-calendar-feed="$FeedLink">
    <div class="calendar-display"></div>
</div>
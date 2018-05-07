<div class="calendar-view-mode-toggle btn-group">
    <button
        class="calendar-view-list btn btn-secondary btn--icon-sm btn--no-text font-icon-list<% if not $Default %> active"<% end_if %>"
        title="List View"
        data-view-mode="default"
    ></button>
    <button
        class="calendar-view-month btn btn-secondary btn--icon-sm btn--no-text font-icon-columns<% if $Default %> active"<% end_if %>"
        title="Calendar View"
        data-view-mode="calendar"
    ></button>
</div>
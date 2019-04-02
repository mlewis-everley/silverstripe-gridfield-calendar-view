(function($) {
    /**
     * Set the current GridField Calendar state (so we know what view we are
     * looking at).
     */
    function setGridState(gridField, state, mode) {
        if (state) {
            state.view_mode = mode;
        } else {
            state = {
                view_mode: mode,
                start_date: ''
            };
        }

        gridField.setState('GridFieldCalendarView', state);
    }

    $.entwine('ss', function($) {
        /**
         * Calendar Toggle Component items
         */
        $('.ss-gridfield .calendar-view-mode-toggle .btn').entwine({

            /**
             * Either generate, or regenerate the calendar view
             */
            drawCalendar: function() {
                var gridField = this.closest('.ss-gridfield');
                var state = gridField.getState().GridFieldCalendarView;

                
                //Switch the view mode
                if (state && state.view_mode == 'calendar') {
                    gridField.find('.grid-field__table').hide();
                    gridField.find('.grid-field__calendar').show().css('display', 'initial').redraw();
                } else {
                    gridField.find('.grid-field__calendar').hide();
                    gridField.find('.grid-field__table').show();
                }

                this._super();
            },
            onadd: function() {
                var gridField = this.closest('.ss-gridfield');
                var state = gridField.getState().GridFieldCalendarView;
                var mode;
                var active = this.hasClass('active');
                
                //If already active do nothing
                if (active) {
                    mode = this.attr('data-view-mode');
                }

                setGridState(gridField, state, mode);

                if (active) {
                    this.drawCalendar();
                }

                this._super();
            },
            onclick: function(e) {
                //If already active do nothing
                if (this.hasClass('active')) {
                    return false;
                }
                
                var gridField = this.closest('.ss-gridfield');
                var state = gridField.getState().GridFieldCalendarView;
                var mode = this.attr('data-view-mode');

                //Remove all active
                this.siblings('.active').removeClass('active');

                //Mark this as the active one
                this.addClass('active');

                setGridState(gridField, state, mode);
                
                this.drawCalendar();

                this._super();

                return false;
            }
        });

        /**
         * Calendar Component
         */
        $('.ss-gridfield .grid-field__calendar').entwine({
            GridFieldID: null,
            Rendered: false,

            onadd: function() {
                //Restore the calendar to the front if the rembered state says to
                var gridField = this
                    .closest('.ss-gridfield');
                var state = gridField
                    .getState()
                    .GridFieldCalendarView;
                var mode = gridField
                    .find(".calendar-view-mode-toggle .btn.active")
                    .attr('data-view-mode');

                setGridState(gridField, state, mode);

                this._super();
            },

            redraw: function() {
                var self = this;
                
                //If already rendered bail
                if (this.getRendered()) {
                    return;
                }

                var gridField = this.closest('.ss-gridfield');
                var state = gridField.getState().GridFieldCalendarView;

                this.setGridFieldID(gridField.attr('id'));

                /**** Bootstrap Calendar ****/
                var calendar = self.find('.calendar-display');
                var stateField = gridField.find('.gridstate');
                var monthHop = false;

                //Reload the start date from the grid state
                var startDate = null;
                if (state && state.start_date!='') {
                    startDate=state.start_date;
                }

                var calendar_options = {
                    editable: false,
                    eventLimit: true,
                    defaultDate: startDate,            
                    events: {
                        url: self.attr('data-calendar-feed'),
                        type: 'POST',
                        startParam: 'start-date',
                        endParam: 'end-date',
                        data: function() {
                            var dataObj = {
                                SecurityID: self.closest('form').find('input[name=SecurityID]').val()
                            };
                            dataObj[stateField.attr('name')] = stateField.val();

                            return dataObj;
                        },
                        error: function() {
                            jQuery.noticeAdd({
                                text: 'Error loading calendar, please try again later',
                                type: 'error',
                                stayTime: 5000,
                                inEffect: {left: '0', opacity: 'show'}
                            });
                        },
                        className: 'cms-panel-link'
                    },
                    buttonIcons: {
                        prev: ' font-icon-left-open-big',
                        next: ' font-icon-right-open-big',
                    },

                    /**
                     * Handles when the view is rendered
                     */
                    viewRender: function(view, element) {
                        if (monthHop) {
                            var state = gridField.getState().GridFieldCalendarView;
                            if (state) {
                                //Store start date in the state
                                if (view.start.format('D')==1) {
                                    state.start_date=view.start.format('YYYY-MM-01');
                                } else {
                                    state.start_date=view.start.clone().add(1, 'months').format('YYYY-MM-01');
                                }
                                gridField.setState('GridFieldCalendarView', state);
                            }
                            monthHop = false;
                        }
                    },

                    /**
                     * Handles when the view is destroyed
                     * @param {object} view Calendar View Object
                     * @param {object} element jQuery object representing the view
                     */
                    viewDestroy: function(view, element) {
                        //Remove all calendar tips
                        $('.gridfield-calendar-tip').remove();
                        monthHop = true;
                    },

                    /**
                     * Handles when the the loading state for the calendar changes
                     * @param {boolean} isLoading Whether or not the event calendar is loading or not
                     */
                    loading: function(isLoading) {
                        self.closest('form').toggleClass('loading', isLoading);
                    },

                    /**
                     * Shows/Creates a tooltip when the mouse is over an event item
                     * @param {object} event Calendar Event Object
                     * @param {MouseEvent} jsEvent JavaScript Mouse Event
                     * @param {object} view Calendar View Object
                     */
                    eventMouseover: function(event, jsEvent, view) {
                        var tip = $('#'+self.getGridFieldID()+'_calendar_tt'+event._id);
                        
                        if (tip.length == 0) {
                            tip = $('<div class="gridfield-calendar-tip"></div>');
                            tip.attr('id', self.getGridFieldID()+'_calendar_tt'+event._id);
                            tip.addClass(event.className.join(' '));
                            tip.append($('<p class="evt-title"/>').text(event.title));
                            
                            //Figure out the event range format
                            var dateTimeStr = false;
                            if (event.end) {
                                var startMonth = event.start.format('MMM D');
                                var startTime = event.start.format('h:mma');
                                var endMonth = event.end.format('MMM D');
                                var endTime = event.end.format('h:mma');
                                
                                if (startMonth == endMonth) {
                                    dateTimeStr=startMonth;
                                    
                                    if (event.allDay==false) {
                                        dateTimeStr+=' @ '+startTime+' - '+endTime;
                                    }
                                } else {
                                    dateTimeStr=startMonth+' - '+endMonth;
                                    
                                    if (event.allDay==false) {
                                        if (startTime==endTime) {
                                            dateTimeStr+=' @ '+startTime;
                                        } else {
                                            dateTimeStr+=' @ '+startTime+' - '+endTime;
                                        }
                                    }
                                }
                            } else {
                                dateTimeStr=event.start.format('MMM D @ h:mma');
                            }

                            if (dateTimeStr) {
                                tip.append($('<p class="evt-time-range"/>').text(dateTimeStr));
                            }

                            if (event.abstractText) {
                                tip.append('<hr />');
                                tip.append($('<p class="evt-abstract"/>').text(event.abstractText));
                            }

                            //Append to the dom
                            $(document.body).append(tip);
                        }

                        var element=$(jsEvent.currentTarget);
                        var elementPos=element.offset();
                        tip
                            .css('left', ((elementPos.left+(element.outerWidth()/2))-161)+'px')
                            .css('top', (elementPos.top+element.outerHeight())+'px')
                            .show();
                    },

                    /**
                     * Hides the tooltip when the mouse leaves an event item
                     * @param {object} event Calendar Event Object
                     * @param {MouseEvent} jsEvent JavaScript Mouse Event
                     * @param {object} view Calendar View Object
                     */
                    eventMouseout: function(event, jsEvent, view) {
                        var tip=$('#'+self.getGridFieldID()+'_calendar_tt'+event._id);
                        if(tip.length > 0) {
                            tip.hide();
                        }
                    }
                };

                // Merge calendar defaults with custom options (if available)
                if (typeof gridfield_calendar_data !== 'undefined') {
                    for (var key in gridfield_calendar_data) {
                        calendar_options[key] = gridfield_calendar_data[key];
                    }
                }

                calendar.fullCalendar(calendar_options);
                
                this.setRendered(true);

                this._super();
            }
        });
    });
})(jQuery);
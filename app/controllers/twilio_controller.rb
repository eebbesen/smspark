require 'twilio-ruby'

class TwilioController < ApplicationController

  # POST /twilio
  # POST /twilio.json
  def create
    #@event = Event.new(event_params)
    
    if(params['Body'])
      input_string = params['Body']

      Rails.logger.debug 'This is the twilio controller'
      Rails.logger.debug 'Input: ' + input_string

      # PARK GAME TODAY START_TIME END_TIME INFO
      
      @input_arr = input_string.split(' ')

      event1 = Event.new
      event1.park = @input_arr[0]
      event1.game = @input_arr[1]
      event1.date = Date.today
      #event1.date = @input_arr[2]
      event1.start_time = Time.now
      #event1.start_time = @input_arr[3]
      event1.end_time = Time.now
      #event1.end_time = @input_arr[4]
      event1.extra_info = @input_arr[5]

      event1.save

    end

    #render :nothing => true
    response = Twilio::TwiML::Response.new do |r|
      r.Sms "Event " + event1.id.to_s + " created. " + "http://textmypark.herokuapp.com/events/" + event1.id.to_s
    end
    render :text => response.text
  end

end

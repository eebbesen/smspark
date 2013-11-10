json.array!(@events) do |event|
  json.extract! event, :date, :park, :game, :start_time, :end_time, :extra_info
  json.url event_url(event, format: :json)
end

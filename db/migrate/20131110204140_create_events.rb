class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.timestamp :date
      t.string :park
      t.string :game
      t.timestamp :start_time
      t.timestamp :end_time
      t.text :extra_info

      t.timestamps
    end
  end
end

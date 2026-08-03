# frozen_string_literal: true

module Jekyll
  class CitationTimelineGenerator < Generator
    safe true
    priority :normal

    START_YEAR = 2018
    CHART_LEFT = 50
    CHART_RIGHT = 850
    CHART_TOP = 7
    CHART_BOTTOM = 270
    GRID_SEGMENTS = 4
    GRID_STEP = 200

    def generate(site)
      publications_data = site.data.dig('home', 'publications')
      return unless publications_data

      publications = publications_data.fetch('publications', [])
      current_year = site.time.year
      counts = Hash.new(0)
      total = 0

      publications.each do |publication|
        Array(publication['cited_by']).each do |citation|
          total += 1
          year = citation.to_s.scan(/\b(?:19|20)\d{2}\b/)
                         .map(&:to_i)
                         .reverse
                         .find { |value| value.between?(START_YEAR, current_year) }
          counts[year || current_year] += 1
        end
      end

      chart_max = [(total.to_f / GRID_STEP).ceil * GRID_STEP, GRID_STEP].max
      years = (START_YEAR..current_year).to_a
      x_step = years.length > 1 ? (CHART_RIGHT - CHART_LEFT).to_f / (years.length - 1) : 0
      cumulative = 0

      timeline = years.each_with_index.map do |year, index|
        cumulative += counts[year]
        x = (CHART_LEFT + (index * x_step)).round
        y = (CHART_BOTTOM - (cumulative.to_f / chart_max * (CHART_BOTTOM - CHART_TOP))).round

        {
          'year' => year,
          'count' => counts[year],
          'cumulative' => cumulative,
          'x' => x,
          'y' => y,
          'first' => index.zero?,
          'last' => index == years.length - 1,
          'tooltip_below' => y < 90
        }
      end

      line_path = timeline.map.with_index do |point, index|
        "#{index.zero? ? 'M' : 'L'}#{point['x']} #{point['y']}"
      end.join(' ')

      grid_step_value = chart_max / GRID_SEGMENTS
      grid = (1..GRID_SEGMENTS).map do |index|
        y = (CHART_TOP + ((CHART_BOTTOM - CHART_TOP).to_f * index / GRID_SEGMENTS)).round
        {
          'value' => chart_max - (grid_step_value * index),
          'y' => y,
          'label_y' => y + 4
        }
      end

      publications_data['citation_total'] = total
      publications_data['citation_timeline'] = timeline
      publications_data['citation_chart_grid'] = grid
      publications_data['citation_chart_line_path'] = line_path
      publications_data['citation_chart_area_path'] = "#{line_path} L#{CHART_RIGHT} #{CHART_BOTTOM} L#{CHART_LEFT} #{CHART_BOTTOM} Z"
    end
  end
end

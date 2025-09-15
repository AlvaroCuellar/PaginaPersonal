require 'bibtex'
require 'yaml'

module Jekyll
  class BibConverter < Generator
    safe true
    priority :low

    def generate(site)
      # Path to the .bib file
      bib_file = File.join(site.source, '_data', 'publications.bib')
      
      return unless File.exist?(bib_file)
      
      # Parse .bib file
      bibliography = BibTeX.open(bib_file)
      
      # Convert to hash format
      publications = {}
      
      bibliography.each do |entry|
        entry_data = {
          'type' => entry.type.to_s,
          'key' => entry.key.to_s
        }
        
        # Safe field extraction
        %w[title author year journal booktitle publisher pages doi url isbn address editor language featured volume number series].each do |field|
          if entry.field_names.include?(field.to_sym)
            value = entry[field].to_s.strip
            # Remove extra whitespace and normalize
            value = value.gsub(/\s+/, ' ').strip
            entry_data[field] = value
          else
            entry_data[field] = ''
          end
        end
        
        publications[entry.key] = entry_data
      end
      
      # Add to site data
      site.data['bibliography'] = publications
    end
  end
end

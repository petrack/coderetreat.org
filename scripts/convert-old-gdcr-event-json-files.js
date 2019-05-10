const jsonMapper = require('json-mapper-json');
const fs = require('fs');
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var data = JSON.parse(fs.readFileSync(path.resolve('_data/past-events/', 'gdcr15.json'), 'utf8').toString());
console.log(data.length);  

jsonMapper(data, {
	'title': 'title',
	'url': 'url',
	'location' : {
		path: '$empty',
		nested: { 
			'city' : 'city', 
			'country': 'country',
			'timezone': 'timeZone',
			'utcOffset': 'offset',
			'coordinates': {
				path: '$empty',
				nested: { 
					latitude : {
						path: 'coords',
						formatting: (value, index) => (value[0]),
					},
					longitude : {
						path: 'coords',
						formatting: (value, index) => (value[1]),
					}
				 }
			},
			'addedBy': 'addedBy',
			'organizedBy': {
				path: 'details',
				formatting: (value, indexInArray) => {
					const length = "Organized By: ".length;
					const index = value.indexOf("Organized By");
					const end = value.indexOf("<br />", index);
					const organizedBy = value.substring(index + length, end);

					var anchor = new JSDOM('<!DOCTYPE html>' + organizedBy).window.document.querySelector('a');
					if (index == -1) console.log(organizedBy, index);
	
					const text = anchor ? anchor.textContent : organizedBy;					
					console.log(text);
					return text.split(/, | &amp; | and | - | along in association with /);
				}
			}
		}
	}
}).then((result) => {
  // console.log(JSON.stringify(result, null, 2));
  
});
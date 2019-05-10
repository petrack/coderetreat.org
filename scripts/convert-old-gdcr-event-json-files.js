const jsonMapper = require('json-mapper-json');
const fs = require('fs');
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var data = JSON.parse(fs.readFileSync(path.resolve('_data/past-events/', 'gdcr16.json'), 'utf8').toString());

jsonMapper(data, {
	'datetime': {
		path: '$empty',
		formatting: () => { return '2016-10-22 09:00:00' }
	},
	'title': 'title',
	'url': {
		path: 'details',
		formatting: (value, indexInArray) => {
			const length = "Website or Map: ".length;
			const index = value.indexOf("Website or Map: ");
			const end = value.indexOf("<br />", index);
			const websiteOrMap = value.substring(index + length, end);
			
			if (index == -1) 
				return "";

			var anchor = new JSDOM('<!DOCTYPE html>' + websiteOrMap).window.document.querySelector('a');
			return anchor.getAttribute("href");
		}
	},
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
		}
	},
	'moderators': {
		path: '$item',
		formatting: (value) => {
			const details = value.details;
			const length = "Organized By: ".length;
			const index = details.indexOf("Organized By");
			const end = details.indexOf("<br />", index);
			const organizedBy = details.substring(index + length, end);
			
			if (index == -1) 
				return "";
			
			const anchor = new JSDOM('<!DOCTYPE html>' + organizedBy).window.document.querySelector('a');
			const text = anchor ? anchor.textContent : organizedBy;					
			// console.log(text);
			const organizers = text.split(/, | &amp; | and |\/| \/ | - | along in association with /);
			organizers.push(value.addedBy)
			var uniqueOrganizers = Array.from(new Set(organizers))
			// console.log(uniqueOrganizers);
			return uniqueOrganizers.map((name) => {return {'name': name}});
		}
	}
}).then((result) => {
	console.log('Generating individual event json files...');
	result.forEach((event) => {
		const eventJsonString = JSON.stringify(event, null, 2);
		fs.writeFile(event.title.replace('/', '') + '.json', eventJsonString, 'utf8', () => {});
	})
	console.log('Done!');
});
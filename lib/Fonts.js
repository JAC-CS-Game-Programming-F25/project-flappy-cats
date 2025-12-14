export default class Fonts {
	constructor() {
		this.fonts = {};
	}

	load(fontDefinitions) {
		fontDefinitions.forEach((fontDefinition) => {
			// Use 'src' if available, otherwise fall back to 'path'
			const fontPath = fontDefinition.src || fontDefinition.path;
			const font = new FontFace(
				fontDefinition.name,
				`url(${fontPath})`
			);

			this.fonts[fontDefinition.name] = font;

			// Set font string immediately for direct access (e.g., fonts.FlappySmall)
			// Format: "sizepx FontName"
			// This allows the font to be used even before it's fully loaded
			this[fontDefinition.name] = `${fontDefinition.size}px ${fontDefinition.name}`;

			font.load().then(font => {
				document.fonts.add(font);
			});
		});
	}

	get(name) {
		return this.fonts[name];
	}
}

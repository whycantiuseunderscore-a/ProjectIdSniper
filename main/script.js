// get contents of an image from a URL as a Blob
async function getImageBlob(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
}

// Example usage:
// getImageBlob('https://example.com/image.jpg')
//     .then(blob => {
//         console.log('Image Blob:', blob);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

getImageBlob('https://trampoline.turbowarp.org/thumbnails/104?width=100&height=100')
    .then(blob => {
        console.log('Image Blob:', blob);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// const invalidUrl = 'https://example.com/nonexistent.jpg';
// getImageBlob(invalidUrl)
//     .then(blob => {
//         console.log('Image Blob:', blob);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

const nonexisty = 'https://trampoline.turbowarp.org/thumbnails/9999999999?width=100&height=100';
getImageBlob(nonexisty)
    .then(blob => {
        console.log('Image Blob:', blob);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// see whether the fetched image has the same contents as nonexisty
let sames = 0;
let numberToCheck = 1329990000;
let milestone = null;
let step = 4096;
let decrementStep = 1;
let existenceConfirmed = null;
// tracking for speed (how much `existenceConfirmed` increases per second)
let lastConfirmedValue = null;
let lastConfirmedTime = null;
let speeds = [];
let averageSpeed = null;
let estimatedTimeLeft = null;

function formatNumber(n){
	return Intl.NumberFormat().format(n);
}

function formatTime(n) {
	if (n < 60) return `${Math.ceil(n / 1)} seconds`;
	if (n < 3600) return `${Math.ceil(n / 60)} minutes`;
	if (n < 86400) return `${Math.ceil(n / 3600)} hours`;
	return `${Math.ceil(n / 86400)} days`;
}

function main() {
	let fetchedImageData = null;
	let comparisonImageData = null;
	let isSame = null;
	milestone = Number(document.querySelector("#mile").value);
	getImageBlob(nonexisty)
		.then(blob => {
			console.log('Image Blob:', blob);
			return blob.arrayBuffer();
		})
		.then(buffer => {
			fetchedImageData = new Uint8Array(buffer);
			return getImageBlob(`https://trampoline.turbowarp.org/thumbnails/${numberToCheck}?width=100&height=100`)
				.then(blob => blob.arrayBuffer())
				.then(buffer => {
					comparisonImageData = new Uint8Array(buffer);
					isSame = fetchedImageData.length === comparisonImageData.length &&
						fetchedImageData.every((value, index) => value === comparisonImageData[index]);
					console.log('Images are the same:', isSame, numberToCheck);

					// if it's different and the numberToCheck and the existenceConfirmed are different, set the element's text content to existenceConfirmed
					if (!isSame && numberToCheck != existenceConfirmed) {
						// set existenceConfirmed to numberToCheck
						existenceConfirmed = numberToCheck;
						// update displayed result
						document.getElementById('result').textContent = formatNumber(existenceConfirmed);
						// compute and display how much `existenceConfirmed` increased per second
						try {
							const now = Date.now();
							let speedVal = 0;
							if (lastConfirmedValue !== null && lastConfirmedTime !== null) {
								const seconds = (now - lastConfirmedTime) / 1000;
								if (seconds > 0) {
									speedVal = (existenceConfirmed - lastConfirmedValue) / seconds;
								}
							}
							// add speedVal to speeds array
							speeds.push(speedVal);
							// then compute average speed over last 25 entries (3 entries if speed is above 20)
							if (speeds.length > ((speedVal > 20) ? 3 : 25)) {
								speeds.shift();
								if (speedVal > 20) {
									speeds.shift();
								}
							}
							averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
							let speedText;
							if (!averageSpeed) {
								speedText = '0 projects/s';
							} else if (Math.abs(averageSpeed) < 1000) {
								speedText = `${averageSpeed.toFixed(2)} projects/s`;
							} else {
								speedText = `${formatNumber(Math.round(averageSpeed))} projects/s`;
							}
							const speedEl = document.getElementById('speed');
							if (speedEl) speedEl.textContent = speedText;
							lastConfirmedValue = existenceConfirmed;
							lastConfirmedTime = now;
							estimatedTimeLeft = Math.max((milestone - existenceConfirmed) / (averageSpeed), 0);
							document.getElementById("timeleft").innerText = estimatedTimeLeft === 0 ? "Passed" : formatTime(estimatedTimeLeft) + (estimatedTimeLeft < 20 ? "- You may snipe now." : "");
						} catch (e) {
							console.warn('Failed to update speed display', e);
						}
						// set decrementStep to 1
						decrementStep = 1;
						// increment numberToCheck by step
						numberToCheck += step;
						// multiply the value of step by 2.4, round it up, then add by 1
						step *= 2;
						step = Math.ceil(step);
						step += 1;
						sames = 0;
					} else {
						// if same, set halfen step and round it up, then subtract numberToCheck by decrementStep, then double the value of decrementStep
						step = Math.ceil(step / 2);
						numberToCheck -= decrementStep;
						// subtract numberToCheck by a random number between 1 and 10.
						numberToCheck -= Math.floor(Math.random() * 10) + 1;
						decrementStep *= 2;
						sames++;
						// if numberToCheck is less than existenceConfirmed, set it to existenceConfirmed
						if (numberToCheck < existenceConfirmed) {
							numberToCheck = existenceConfirmed;
							// then set step to a random number between 1 and sames
							step = Math.floor(Math.random() * sames) + 1;
							numberToCheck += step;
						}
					}
					// Redo after 100 milliseconds
					setTimeout(main, 1200+Math.random()*800)
				});
		}).catch(error => {
			console.error('Error:', error);
			document.getElementById('result').textContent = "Error";
		});
}

main();

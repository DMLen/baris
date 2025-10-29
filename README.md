# B.A.R.I.S.T.A. (WIP)
### Basic-Arse Reverse Image Search Tool (Amazing)
**BARISTA** is my attempt at a reverse image search tool that is powered by hashing. If you remember from class, hashing algorithms like SHA256 will produce a completely unique hash for each image and file, with huge differences in the resulting hash even if only a small amount of file/image data has been changed. Algorithms such as **Perceptual Hash** and **Difference Hash** do the opposite, they will still give an identical (or similar) hash if small amounts of image data have been changed. We can take advantage of this to discover other files that have *some similarity*.

BARISTA is a self-contained Javascript web application that handles a SQLite database accessible through an API and through a browser GUI.

## Deployment
1. Download the repository somewhere.
2. `cd` into the frontend directory and run `npm install`. Wait for prerequisites to download, and then do `npm build`.
3. `cd` into the backend directory and run `npm install`.  Wait for prerequisites to download.
4. Do `npm start` while in the backend directory to launch BARISTA. How to populate the database (and how to set it up to work with your own web scraper) is covered under the API subheading.

## Usage
Access the service in your browser by visiting `localhost:5000`. You can use port forwarding to also make this service accessible over the internet.

## API

## Sample Data
For the purposes of demonstration and testing, I've included some sample data which is contained in the "companion" folder.
- `metmuseum_images.txt` contains 7416 image links (one per line) from the Met Museum.
- `populator.py` is a very simple Python script to feed image links to the database's API.
- The "test" folder contains some images from the Met Museum's website, as well as some altered variants.
 
Run the script to begin automatically populating the database.
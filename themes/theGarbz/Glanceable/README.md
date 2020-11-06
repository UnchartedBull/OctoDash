# Glanceable theme v0.1

This variation on the standard theme includes a nearly full width horizontal progress bar during printing. This makes it far easier to see the progress of a print when glancing at the screen from a distance, hence the name "Glanceable theme". 

To install copy the custom-styles.css file into the octodash config folder:
```
~/.config/octodash/custom-styles.css
```
Users of Octodash 2.1.1 read the important note below. 

###### Theme by theGarbz.

## Screenshots:

1. Printing with the Horizontal Progressbar:

   ![Filament List](screenshots/screenshot_printing_straight.png)

2. Printing with Circular Progressbar:

   ![File List](screenshots/screenshot_printing_circle.png)

## Important Note for Octodash 2.1.1 users

This theme relies on an additional progress percentage element which is not available in Octodash 2.1.1. Using this theme on Octodash 2.1.1 without modification (read on) will result in no progress percentage visible when the horizontal progressbar is displayed. 

It is possible to move the progress percentage from the circular progressbar to the horizontal progressbar by __uncommenting the following lines__ in this custom-styles.css:

```
/*.job-info__progress-percentage {
    margin-top: -0.3vh!important;
    margin-left: 0vw!important;
    font-size: 6.7vh!important;
    font-weight: 500!important;
    display:block!important;
    position:fixed!important;
    left: 43.4vw!important;
    top: 77vh!important;
    z-index:1!important;
    color:white!important;
    text-shadow: 1px 1px 4px black;
}*/
```


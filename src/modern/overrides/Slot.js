/**
 * Credits to: https://ftp.sencha.com/forum/showthread.php?309447-ExtJS-6.0.2.408-Modern-Datepicker-wrong-selection
 */
Ext.define('Koala.overrides.Slot', {
    override: 'Ext.picker.Slot',

    scrollToItem: function(item, animated) {
        var y = item.getY(),
            parentEl = item.parent(),
            parentY = parentEl.getY(),
            offsetPadding = parentEl.getBorderPadding().beforeY,
            scroller = this.getScrollable(),
            difference = y - parentY;
        // scrolling doesn't take into account that the selected item should be
        // centered in the middle of the container
        scroller.scrollTo(0, difference-offsetPadding, animated);
    }
});

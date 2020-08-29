AOS.init({
    duration: 800,
    easing: 'slide',
});

(function ($) {
    'use strict';

    $(window).stellar({
        responsive: true,
        parallaxBackgrounds: true,
        parallaxElements: true,
        horizontalScrolling: false,
        hideDistantElements: false,
        scrollProperty: 'scroll',
        horizontalOffset: 0,
        verticalOffset: 0,
    });

    var fullHeight = function () {
        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });
    };
    fullHeight();

    // loader
    var loader = function () {
        setTimeout(function () {
            if ($('#ftco-loader').length > 0) {
                $('#ftco-loader').removeClass('show');
            }
        }, 1);
    };
    loader();

    // scroll
    var scrollWindow = function () {
        $(window).scroll(function () {
            var $w = $(this),
                st = $w.scrollTop(),
                navbar = $('.ftco_navbar'),
                sd = $('.js-scroll-wrap');

            if (st > 150) {
                if (!navbar.hasClass('scrolled')) {
                    navbar.addClass('scrolled');
                }
            }
            if (st < 150) {
                if (navbar.hasClass('scrolled')) {
                    navbar.removeClass('scrolled sleep');
                }
            }
            if (st > 550) {
                if (!navbar.hasClass('awake')) {
                    navbar.addClass('awake');
                }

                if (sd.length > 0) {
                    sd.addClass('sleep');
                }
            }
            if (st < 550) {
                if (navbar.hasClass('awake')) {
                    navbar.removeClass('awake');
                    navbar.addClass('sleep');
                }
                if (sd.length > 0) {
                    sd.removeClass('sleep');
                }
            }
        });
    };
    scrollWindow();

    var contentWayPoint = function () {
        let i = 0;
        $('.ftco-animate').waypoint(
            function (direction) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    i++;

                    $(this.element).addClass('item-animate');
                    setTimeout(function () {
                        $('body .ftco-animate.item-animate').each(function (k) {
                            var el = $(this);
                            setTimeout(
                                function () {
                                    var effect = el.data('animate-effect');
                                    if (effect === 'fadeIn') {
                                        el.addClass('fadeIn ftco-animated');
                                    } else if (effect === 'fadeInLeft') {
                                        el.addClass('fadeInLeft ftco-animated');
                                    } else if (effect === 'fadeInRight') {
                                        el.addClass('fadeInRight ftco-animated');
                                    } else {
                                        el.addClass('fadeInUp ftco-animated');
                                    }
                                    el.removeClass('item-animate');
                                },
                                k * 50,
                                'easeInOutExpo',
                            );
                        });
                    }, 100);
                }
            }, {
                offset: '95%',
            },
        );
    };
    contentWayPoint();

    var scrollDown = function () {
        $('.mouse-icon').on('click', function (event) {
            event.preventDefault();

            $('html,body').animate({
                    scrollTop: $('.goto-here').offset().top,
                },
                500,
                'easeInOutExpo',
            );

            return false;
        });
    };

    var gotoInstallation = function () {
        $('.goto-installation').on('click', function (event) {
            event.preventDefault();

            $('html,body').animate({
                    scrollTop: $('.installation-anchor').offset().top,
                },
                500,
                'easeInOutExpo',
            );

            return false;
        });
    }

    var gotoFAQ = function () {
        $('.goto-faq').on('click', function (event) {
            event.preventDefault();

            $('html,body').animate({
                    scrollTop: $('.faq-anchor').offset().top,
                },
                500,
                'easeInOutExpo',
            );

            return false;
        });
    }

    var gotoScreenshots = function () {
        $('.goto-screenshots').on('click', function (event) {
            event.preventDefault();

            $('html,body').animate({
                    scrollTop: $('.screenshots-anchor').offset().top,
                },
                500,
                'easeInOutExpo',
            );

            return false;
        });
    }

    var gotoFeatures = function () {
        $('.goto-features').on('click', function (event) {
            event.preventDefault();

            $('html,body').animate({
                    scrollTop: $('.features-anchor').offset().top,
                },
                500,
                'easeInOutExpo',
            );

            return false;
        });
    }

    scrollDown();
    gotoInstallation();
    gotoFAQ();
    gotoScreenshots();
    gotoFeatures();
})(jQuery);

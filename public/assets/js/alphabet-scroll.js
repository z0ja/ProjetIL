$(document).ready(function() {
      function scrollText() {
        $('#alphabet').animate({ marginLeft: "-=10px" }, 10000, 'linear', function() {
          var firstLetter = $(this).text()[0];
          $(this).text($(this).text().substr(1) + firstLetter);
          $(this).css('margin-left', '0');
          scrollText();
        });
      }

      scrollText();
    });
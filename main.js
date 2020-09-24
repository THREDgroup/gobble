$('document').ready(function(){
  var turkeyBeakBottom = $('[data-js="turkey__beak-bottom"]'),
      turkeyBody = $('[data-js="turkey__body"]'),
      turkeyBeakTop = $('[data-js="turkey__beak-top"]'),
      turkeyShoulderDark = $('[data-js="turkey__shoulder--dark"]'),
      turkeyShoulderLight =$('[data-js="turkey__shoulder--light"]'),
      turkeySnood = $('[data-js="turkey__snood"]'),
      turkeyOutline = $('[data-js="turkey__outline"]'),
      turkeyEyeOpen = $('[data-js="turkey__eye--open"]'),
      turkeyEyeClosed = $('[data-js="turkey__eye--closed"]'),
      turkeyEyeUnderline = $('[data-js="turkey__eye-underline"]'),
      turkeyMouthBridge = $('[data-js="turkey__mouth-bridge"]'),
      turkeyMouthBridgeOpen = $('[data-js="turkey__mouth-bridge--open"]'),
      turkeyMouthBridgeClosed = $('[data-js="turkey__mouth-bridge--closed"]'),
      turkeyMouthBridgeWide = $('[data-js="turkey__mouth-bridge--wide"]'),
      turkey = $('[data-js="turkey"]'), 
      feather1 = $('[data-js="feather-1"]'),
      feather2 = $('[data-js="feather-2"]'),
      featherContainer = $('[data-js="feather-container"]'),
      featherFallSegments = 7;
  
//   var SnoodSwayTL = new TimelineMax({ paused:true, repeat:-1, yoyo:true});
  
//   SnoodSwayTL.to(turkeySnoodLeft, 1, {
//     ease:Expo.easeInOut,
//     morphSVG:{
//       points: $(turkeySnoodRight).attr('d')  
//     }
//   })
//   .to(turkeyOutlineSnoodLeftMouthOpen, 1, {
//     ease:Expo.easeInOut,
//     morphSVG:{
//       points: $(turkeyOutlineSnoodRightMouthOpen).attr('d')  
//     }
//   }, 0);
  
  var eyeBlinkTL = new TimelineMax({repeat:-1, ease:Expo.easeInOut});
  
  eyeBlinkTL.to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeOpen).attr('d')}})
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeClosed).attr('d')}}, '+=5')
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeOpen).attr('d')}})
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeClosed).attr('d')}}, '+=5')
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeOpen).attr('d')}})
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeClosed).attr('d')}}, '+=.5')
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeOpen).attr('d')}})
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeClosed).attr('d')}})
    .to(turkeyEyeOpen, .1, {morphSVG:{points: $(turkeyEyeOpen).attr('d')}});
  
  function openMouthWide() {
    TweenMax.set( turkeyBeakBottom, {
      transformOrigin: '0% 0%'
    })   
    TweenMax.to( turkeyBeakBottom, .4, {
      ease:Expo.linear,
      rotation: -18,
    })
    TweenMax.to( turkeyMouthBridge, .4, {
       ease:Expo.linear,
       morphSVG:{
        points: $(turkeyMouthBridgeWide).attr('d')  
      } 
    }, 0);
  }
  
  function closeMouth() {
    TweenMax.set( turkeyBeakBottom, {
      transformOrigin: '0% 0%'
    })   
    TweenMax.to( turkeyBeakBottom, .4, {
      ease:Expo.linear,
      rotation: 16,
    })
    TweenMax.to( turkeyMouthBridge, .4, {
       ease:Expo.linear,
       morphSVG:{
        points: $(turkeyMouthBridgeClosed).attr('d')  
      } 
    }, 0);
  }
  
  function openMouth() {
    TweenMax.set( turkeyBeakBottom, {
      transformOrigin: '0% 0%'
    })   
    TweenMax.to( turkeyBeakBottom, .4, {
      ease:Expo.linear,
      rotation: 0,
    })
    TweenMax.to( turkeyMouthBridge, .4, {
       ease:Expo.linear,
       morphSVG:{
        points: $(turkeyMouthBridgeOpen).attr('d')  
      } 
    }, 0);
  }  
  
  $('[data-js="wide-mouth-trigger"]').on('click', function() {
    openMouthWide();
  });
  $('[data-js="close-mouth-trigger"]').on('click', function() {
    closeMouth();
  });
  $('[data-js="open-mouth-trigger"]').on('click', function() {
    openMouth();
  });
  $('[data-js="drop-feather-trigger"]').on('click', function() {
    dropFeather();
  });
  
  function dropFeather() {
    var randomNumber = 1 + Math.floor(Math.random() * 2);
    var feather;
    if (randomNumber === 1) {
      feather = feather1;
    } else {
      feather = feather2;
    }
    
    feather.clone().appendTo(featherContainer);
    
    var thisFeather = featherContainer.find('.feather').last();
        
    var featherPath = newFeatherPath(thisFeather);
        
    TweenMax.set(thisFeather, {x: featherPath[0].x, y: featherPath[0].y});
    
    featherFallTL = new TimelineMax();
    
    for (var i = 1; i < featherFallSegments; i++) {
      var rotation = Math.floor(Math.random() * ((20-6)+1) + 6);
      if (i % 2 === 0) {
        rotation = rotation;
      } else {
        rotation = -(rotation);
      }
            
      featherFallTL.to(thisFeather, 2, {
        bezier: {
          values: [{x: featherPath[i].x, y: featherPath[i].y}],
          curviness: 2
        },
        rotation: rotation,
        ease: Power1.easeInOut
      });
    }
  }
  
  function newFeatherPath(feather) {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth - feather.width();
    var totalHeight = windowHeight + (feather.height() * 6);
    console.log('window height: ' + windowHeight);
    console.log('total height: ' + totalHeight);

    var totalWidth = windowWidth * .4;
    var leftOffset = 1 + Math.floor(Math.random() * windowWidth);

    var pathArray = [];

    var initCoords = { x: leftOffset, y: -(feather.height()) }
    pathArray.push(initCoords);

    for (i = 0; i < featherFallSegments - 1; i++) {
      var y = (totalHeight/featherFallSegments) * i;
      var x;

      if (i % 2 === 0) {
        x = leftOffset + totalWidth;
      } else {
        x = leftOffset;
      }
      pathArray.push({ x: x, y: y });

    }  
    return pathArray
  }
  
function getNextRate() {
    return Math.floor(Math.random() * (12000 - 100 + 1)) + 100;
}


var turkeyDropTL = new TimelineMax({paused: true, onComplete: function(){
  setTimeout(function loop(){
    console.log('loooop');
    dropFeather();
    setTimeout(loop, getNextRate());
}, getNextRate());
}});

  turkeyDropTL.set(turkey, {visibility: "visible"})
  .from(turkey, 3.4, {
    y: -(turkey.height()),
    ease: 'turkeyDrop'
  })
  .to( turkeyBeakBottom, .4, {
    ease:Expo.linear,
    rotation: 16
  }, .2)
  .to( turkeyMouthBridge, .4, {
    ease:Expo.linear,
    morphSVG:{
      points: $(turkeyMouthBridgeClosed).attr('d')  
    } 
  }, .2)
  .to( turkeyBeakBottom, .4, {
    ease:Expo.linear,
    rotation: -18,
  },.6)
  .to( turkeyMouthBridge, .4, {
    ease:Expo.linear,
    morphSVG:{
      points: $(turkeyMouthBridgeWide).attr('d')  
    } 
  },.6)
  .add( function(){
    dropFeather();
  }, .2 );
  
  function dropTurkey() {
    turkeyDropTL.play()
  }
  
  var turkeySway = new TimelineMax({repeat: -1, yoyo: true});
  
  turkeySway.set(turkey, {
    rotation: -3,
    transformOrign: '50% 0%',
  })
  .to(turkey, 3, {
    rotation: 3,
    ease: Power1.easeInOut,
    x: -10
  });
  
  CustomEase.create("turkeyDrop", "M0,0 C0,0 0.048,-0.011 0.076,0.022 0.15,0.11 0.175,0.51 0.2,0.812 0.239,1.087 0.392,1.018 0.408,0.988 0.424,0.972 0.466,0.946 0.52,0.986 0.558,1.012 0.611,1.027 0.657,1.002 0.707,0.969 0.794,1.008 0.852,1.01 0.956,1.014 1,1 1,1");
  
  var initFeathers = new TimelineMax({onComplete: function(){
    dropTurkey();
  }});
  
  initFeathers.add( function(){ dropFeather(); } )
              .add( function(){ dropFeather(); }, 5)
              .add( function(){ dropFeather(); }, 10)
              .add( function(){ dropFeather(); }, 12);
});

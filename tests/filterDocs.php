<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="css/style.css">
    <script type="text/javascript" src="../extlib/jQuery/jquery-3.2.0.min.js"></script>
  	<script type="text/javascript" src="../extlib/iFSM/extlib/jquery.dorequesttimeout.js"></script>
  	<script type="text/javascript" src="../extlib/iFSM/extlib/jquery.attrchange.js"></script>
  	<script type="text/javascript" src="../extlib/iFSM/iFSM.js"></script>
    <script type="text/javascript" src="../extlib/Blapy/extlib/mustache/mustache.js"></script>
    <script type="text/javascript" src="../extlib/Blapy/Blapy.js"></script>
  	<script type="text/javascript" src="../extlib/jQuery-MD5/jquery.md5.js"></script>
  	<script type="text/javascript" src="../jamrules.js"></script>
</head>
<body id="myBlapy">
    <section>
        <div class="titleblock bg-salmon">
            <div class="container">
                <div class="row">
                    <div class="col col-12 offset-1">
                        <h2 class="h1">Documents</h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="container filter-container">
            <div class="row">
                <div class="col col-12 offset-1">
                    <div class="filters level1">
                        <div class="years">
                            <a href="#" data-year="all" class="btn active">Tous</a>
                            <a href="#" data-year="2020" class="btn">2020</a>
                            <a href="#" data-year="2019" class="btn">2019</a>
                            <a href="#" data-year="2018" class="btn">2018</a>
                            <a href="#" data-year="2017" class="btn">2017</a>
                            <a href="#" data-year="2016" class="btn">2016</a>
                        </div>
                        <div class="categories">
                            <a href="#" data-cat="all" class="btn active">Tous</a>
                            <a href="#" data-cat="compte-rendu" class="btn">Comptes-rendus</a>
                            <a href="#" data-cat="dossier" class="btn">Dossiers</a>
                            <a href="#" data-cat="annexe" class="btn">Annexes</a>
                            <a href="#" data-cat="plan d'action" class="btn">Plans d'action</a>
                            <a href="#" data-cat="dossier de presse" class="btn">Dossier de presse</a>
                            <a href="#" data-cat="divers" class="btn">Divers</a>
                        </div>
                    </div>
                    <div class="filters level2">
                        <a href="#" class="toggle">Affiner par type de réunion</a>
                        <div class="tags">
                            <a href="#" data-tag="all" class="btn active">Tous</a>
                            <a href="#" data-tag="anticipation" class="btn">Anticipation et prospective</a>
                            <a href="#" data-tag="rayonnement" class="btn">Rayonnement international</a>
                            <a href="#" data-tag="club" class="btn">Club</a>
                            <a href="#" data-tag="ag" class="btn">AG</a>
                            <a href="#" data-tag="ca" class="btn">CA</a>
                            <a href="#" data-tag="bureau" class="btn">Bureau</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div  id="sectionDate"
      data-blapy-container="true"
			data-blapy-container-name="sectionDate"
			data-blapy-container-content="sectionDate"
			data-blapy-update="json"
			data-blapy-template-init="includes/sectionDate.json"
      data-blapy-template-init-processdata="stringifyData"
    >
    <xmp style="display:none;">
      <section class="documents" data-year="{{dateYear}}">

          <div class="titleblock bg-salmon">
              <div class="container">
                  <div class="row">
                      <div class="col col-12 offset-1">
                          <h2 class="h1">{{dateYear}}</h2>
                      </div>
                  </div>
              </div>
          </div>
          <ul id="sectionDate"
            data-blapy-container="true"
      			data-blapy-container-name="sectionDocument{{dateYear}}"
      			data-blapy-container-content="sectionDocument{{dateYear}}"
      			data-blapy-update="json"
            data-blapy-template-mustache-delimiterStart="{%"
            data-blapy-template-mustache-delimiterEnd="%}"
          >
            <|xmp style="display:none;">
              <li data-tags="{%tags%}" data-cat="{%cat%}">
                  <div class="container">
                      <div class="row info">
                          <div class="col col-2 offset-1 date">
                            {%date%}
                          </div>
                          <div class="col col-4 text-sm-right">
                             {%cat%}
                          </div>
                      </div>
                      <div class="row sm-vertical">
                          <div class="col col-10 col-sm-14 offset-1">
                              <h3>{%title%}</h2>
                          </div>
                          <div class="col col-2 col-sm-14 text-right text-sm-left">
                              <a href="" class="download">Télécharger</a>
                          </div>
                      </div>
                  </div>
              </li>
            </|xmp>
          </ul>
          <script>
          $("#myBlapy").trigger('updateBlock',{
            html:[{{#documents}}{{{stringify}}}{{/documents}}],
            params:{embeddingBlockId:'sectionDocument{{dateYear}}'}
          });
          </script>
      </section>
    </xmp>
    </div>

    <script>

    var docFilter = {
        init: function(){
            if($(".filters.level1").length <= 0)
                return;
            console.log("docFilter: init");
            $(".filters a.btn").on('click', docFilter.select);
            $(".filters a.toggle").on("click", docFilter.toggleTags);
        },
        select: function(e) {
            e.preventDefault();
            $(e.currentTarget).parent().find("a.btn").removeClass('active');
            $(e.currentTarget).addClass("active");
        },
        toggleTags: function(e) {
            e.preventDefault();
            $(".filters.level2").toggleClass("active");
            var label = $(".filters.level2").hasClass("active") ? "Fermer les filtres" : "Affiner par type de réunion";
            $(".filters a.toggle").html(label);
        },

    };
    docFilter.init();

    function stringifyData(aJson)
    {
      //for each elements, do an analysis and add/remove or do whatever you need to be done...
      aJson = aJson.map(aData => {
        //add specific property that returns a stringify of the current processed data by mustache
        aData["stringify"] = function () {
              return JSON.stringify(this)+',';
        }
        return aData;//returns the modified array item
      });
      //return our modified json data array
      return aJson;
    }

    $( document ).ready(function() {
  		$('#myBlapy').Blapy();
  	});

    var rulesEngine = jamrules.build();


    </script>
</body>
</html>

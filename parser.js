/*
PARSER de Data pour SEHOMI
Version du 03/06/2015
*/

/*Mot clé utilisé pour le matching du SMS par IFTTT*/
var KEYWORD = "SEHOMI1";

function myFunction() {
  parse();
}


function parse() {
  Logger.log("parse");

  var data = getData();
  if(!checkDuplicate(data)) {
    Logger.log("Traitement des données");
    data = removeKeyword(data);
    var data_par_jours = splitDay(data);
    for(cpt = 0; cpt < data_par_jours.length; cpt++) {
      getDate(data_par_jours[cpt]); 
    }
  }
}

function setDataOnCell(ligne, colonne, data, sheetName) {
  Logger.log("setDataOnCell");
  var cell = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange(ligne, colonne);
  cell.setValue(data);
}

function addRow(date, data, mesures) {
  Logger.log("addRow");
  Logger.log(data);

  var heure_regex = /(\d{1,2}[hH]\d{1,2})/g;
  var mesures_heure = data.match(heure_regex);
  
  var tension_regex = /[tT](\d{1,2},\d{1,2})/g;
  var mesures_tension = data.match(tension_regex);
  
  var puissance_regex = /[pP](\d+)/g;
  var mesures_puissance = data.match(puissance_regex);

  for(mesure = 0; mesure < mesures; mesure++) {
    var ligne_data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getLastRow() + 1;
    
    /*Feuille data*/
    
    /*Ecriture de la date*/
    setDataOnCell(ligne_data, 1, date, "Data");
    /*Ecriture de l'heure*/
    setDataOnCell(ligne_data, 2, mesures_heure[mesure], "Data");
    /*Ecriture de la tension*/
    setDataOnCell(ligne_data, 3, mesures_tension[mesure].replace(/[tT]/, ""), "Data");
    /*Ecriture de la puissance*/
    setDataOnCell(ligne_data, 4, mesures_puissance[mesure].replace(/[pP]/, ""), "Data");
    
    
    var dateTime = date[0] + " " + mesures_heure[mesure];
    Logger.log(dateTime);
    /*Feuille tension*/
    var ligne_tension = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tension").getLastRow() + 1;
    setDataOnCell(ligne_tension, 1, dateTime, "Tension");
    setDataOnCell(ligne_tension, 2, mesures_tension[mesure].replace(/[tT]/, "").replace(",", "."), "Tension");

    /*Feuille puissance*/
    var ligne_puissance = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Puissance").getLastRow() + 1;
    setDataOnCell(ligne_puissance, 1, dateTime, "Puissance");
    setDataOnCell(ligne_puissance, 2, mesures_puissance[mesure].replace(/[pP]/, ""), "Puissance");
  }
}

function getDataOfDate(date, data) {
  Logger.log("getDataOfDate");
   /*Récupère les différentes valeurs du jour*/
   /*Utlisation d'une regex, pour plus d'info (et comprendre) consulter : https://regex101.com/*/
  var data_journee_regex = /(\d{1,2}[hH]\d{1,2}\s[tT]\d{1,2},\d{1,2}\s[pP]\d+)/g;
  var data_journee = data.match(data_journee_regex);
  /*data_journee.length contient le nombre de mesure de la journée*/
  Logger.log(data_journee);
  Logger.log(data_journee.length);
  addRow(date, data, data_journee.length);
}

function getDate(data) {
  Logger.log("getDate");
  /*Récupère la date contenu*/
  /*Utlisation d'une regex, pour plus d'info (et comprendre) consulter : https://regex101.com/*/
  var date_regex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;
  date =  data.match(date_regex);
  Logger.log(date);
  Logger.log(data);
  getDataOfDate(date, data);
}

function getData() {
  Logger.log("getData");
  /*Récupère la cellule de la dernière ligne C*/
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
     sheet = ss.getSheetByName("Brut"),
     range = sheet.getDataRange(),
     values = range.getValues();
  Logger.log(values[values.length - 1][2]);
  return values[values.length - 1][2];
}

function checkDuplicate(data) {
  /*Vérifie si les données reçues ne sont pas identiques aux dernières données traitées
  Renvoie true si les données sont identiques, dans ce cas on ne traite pas, et false sinon.
  */
  Logger.log("checkDuplicate");
  var retour = false;
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
   sheet = ss.getSheetByName("Brut"),
   range = sheet.getDataRange(),
   values = range.getValues();
  Logger.log(values.length);
  if(values.length < 4) {
    retour = false;
  }
  else {
    var data_precedente = values[values.length - 2][2];
    (data === data_precedente) ? retour = true : retour = false;
    Logger.log(retour);
  }
  return retour;
}

function removeKeyword(data) {
  Logger.log("removeKeyword");
 /*Supprime le mot clé utilisé pour le mathing du SMS par IFTTT*/
  data = data.replace(KEYWORD, '');
  Logger.log(data);
  return data;
}

function splitDay(data) {
  Logger.log("splitDay");
 /*Sépare la chaîne à partir des ; pour récupérer les dates*/ 
    var data_par_jours = data.split(";");
  for(cpt = 0; cpt < data_par_jours.length; cpt++) {
    Logger.log(data_par_jours[cpt]);
  }
  return data_par_jours;
}

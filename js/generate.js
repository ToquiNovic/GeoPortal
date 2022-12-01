var wb = XLSX.utils.book_new();
wb.props = {
    Title: "Reporte",
    subject: "Test file",
    Autor: "user",
    CreatedDate: new Date(1,12,2022)
};
wb.SheetNames.push("Test Sheet");
var ws_data = [['Hello','world']];
var ws = XLSX.utils.aoa_to_sheet(ws_data);
wb.Sheets["Test Sheet"] = ws;

var wbout = XLSX.write(wb,{bookType:'xlsx', type:'binary'});
function s2ab (s){
    var buf = new ArrayBuffer(s.lebght);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
$('#button-a').click(function(){
    SVGAnimatedPreserveAspectRatio(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');
});
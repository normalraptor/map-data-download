
const PopupContent = ({ id, kabupaten, region, averagedownload }) => {

  var download = averagedownload;
  if(download === null){
    download = 'Tidak ada data'
  }else{
    download = parseInt(download)
  }
  return (
    <div id={`popup-${id}`}>
      <h3>{kabupaten}</h3>
      <b>{region}</b>
      <b><br/>Rata rata Download: {download}</b>
    </div>
  );
};

export default PopupContent;
  
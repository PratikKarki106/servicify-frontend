import './VehicleInfo.css';

const VehicleInfo = () => {
  return (
    <>
    <div className="vehicle-info-main">
      <p style={{fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Vehicle Information</p>
      <div className="vehicle-info-first">
        <div className="vehicle-info-first-first">
          <p className="vehicle-info-title"> Vehicle Info</p>
          <input
            type="text"
            className="vehicle-info-input"
            placeholder="e.g., Honda Activa 6G"
          />
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title"> Version / Model</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., BS6 / 2023"
            />
        </div>      
      </div>
      <div className="vehicle-info-first">
        <div className="vehicle-info-first-first">
          <p className="vehicle-info-title"> Color</p>
          <input
            type="text"
            className="vehicle-info-input"
            placeholder="e.g., Red, Maroon, Blue, Black"
          />
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title"> Number Plate</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., Ba 6 Pa 9049"
            />
        </div>      
      </div>
      <div className="vehicle-info-first-second">
        <p className="vehicle-info-title"> Kilometers Run</p>
          <input
            type="text"
            className="vehicle-info-input2"
            placeholder="e.g., 16720 km"
          />
      </div> 
      <div className="vehicle-info-first-second">
        <p className="vehicle-info-title"> Optional Notes</p>
          <textarea
            className="vehicle-info-input3"
            placeholder="Do you have any specific issues with your vehicle?"
          />
      </div>   
      <div className="vehicle-info-first-second">
        <p className="vehicle-info-title">Upload Image (Optional)</p>
        <label className="vehicle-upload-box">
          <span className="vehicle-upload-text">
            Upload a file or drag and drop<br />
            <span className="vehicle-upload-subtext">PNG, JPG, GIF up to 10MB</span>
          </span>
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            className="vehicle-upload-input"
          />
        </label>
      </div> 
      <div className="vehicle-info-last-button">
        <button className="vehicle-info-back"> Back </button>
        <button className="vehicle-info-continue"> Continue </button>
      </div>
    </div>
    </>
  )
}

export default VehicleInfo

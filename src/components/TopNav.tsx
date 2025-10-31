import Logo from "../assets/Servicify.png";
export default function LandingPage() {
  return (
    <div className="landing">
        <div className="landingButton">
            <button className="BarButton"> About Us </button>
            <button className="BarButton"> Contact </button>
        </div>
        <img src={Logo} alt="Servicify Logo" />
        <div className="landingButton1">
            <button className="BarButton"> Log In </button>
            <button className="BarButton1"style={{backgroundColor: "#1094E6", color: "white", padding: "8px", borderRadius: "5px"
}} > Sign Up </button>
        </div>
    </div>
  );
}

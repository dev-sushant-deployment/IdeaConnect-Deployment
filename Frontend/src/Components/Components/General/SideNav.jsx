import { RiMenu3Line } from "@remixicon/react"
import { getData } from "../../dataLoaders";
import {
	useEffect,
	useState
} from "react";
import {
	NavLink,
	useNavigate
} from "react-router-dom";

const SideNav = () => {
	const [username,setUsername] = useState("");
	const navigate = useNavigate();
	const active = (isActive) => {
		let style = "p-1 border-2 border-black border-solid rounded-full text-center w-full hover:scale-105";
		if (isActive) style += " bg-black text-white";
		return style;
	}
	useEffect(() => {
		const getUsername = async () => {
			const { authenticated, user } = await getData("/users/activeUser", "get", true);
			if (authenticated) setUsername(user.username);
		};
		getUsername();
	})
	const logout = async () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		navigate("/");
	}
	const [seeing, setSeeing] = useState(false);
	const TopContent = [
		{to: "/ideas", primaryText: "Feed"},
		{to: "/myIdeas", primaryText: "My", responsiveText: "Ideas"},
		{to: "/exploreIdeas", primaryText: "Explore", responsiveText: "Ideas"},
		{to: "/collaboratedIdeas", primaryText: "Collaborated", responsiveText: "Ideas"},
		{to: "/intrestedIdeas", primaryText: "Intrested", responsiveText: "Ideas"},
		{to: "/chats", primaryText: "Chats"}
	]
	const BottomContent = [
		{to: `/profile/${username}`, primaryText: "Profile"},
		{to: "/settings", primaryText: "Settings"}
	]
	return (
		<>
			<RiMenu3Line
				onClick={() => setSeeing(!seeing)}
				className="lg:hidden fixed left-[4vw] top-4 z-50 cursor-pointer"
			/>
			<div className={`lg:h-[calc(98vh)] fixed left-0 top-0 p-3 lg:flex flex-col justify-between lg:w-[calc(100vw/6.5)] m-2 border-2 border-black border-solid rounded-2xl backdrop-blur-sm ${!seeing ? "hidden" : "flex z-50 w-48 h-[90.5vh] overflow-y-scroll -left-2 rounded-e-0"}`}>
				<div className="flex flex-col justify-center gap-5 w-full">
					<button
						onClick={() => setSeeing(false)}
						className="text-left lg:hidden"
					>
						X
					</button>
					{TopContent.map(({ to, primaryText, responsiveText }, index) => (
						<NavLink
							key={index}
							className={({isActive}) => active(isActive)}
							to={to}
						>
							{primaryText}	{responsiveText ? <p className="hidden xl:inline-block"> {responsiveText} </p> : null}
						</NavLink>
					))}
				</div>
				<div className="flex flex-col justify-center gap-5 w-full">
					<button
						onClick={logout}
						className="p-1 border-2 border-black border-solid rounded-full text-center w-full hover:scale-105"
					>
						Logout
					</button>
					{BottomContent.map(({ to, primaryText, responsiveText }, index) => (
						<NavLink
							key={index}
							className={({isActive}) => active(isActive)}
							to={to}
						>
							{primaryText}	{responsiveText ? <p className="hidden xl:inline-block"> {responsiveText} </p> : null}
						</NavLink>
					))}
				</div>
			</div>
		</>
	)
}

export default SideNav
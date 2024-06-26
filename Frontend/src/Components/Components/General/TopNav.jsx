import { getData } from "../../dataLoaders";
import { useIdeas } from "../../../context/ideas";
import {
	useEffect,
	useState
} from "react"

const TopNav = ({ noSearchText }) => {
	const [prompt, setPrompt] = useState("");
	const { originalIdeas, setIdeas } = useIdeas();
	const handleOnChange = (e) => {
		setPrompt(e.target.value);
		if (e.target.value == "") setIdeas(originalIdeas);
	}
	useEffect(() => {
		const id = setTimeout(async () => {
			if (prompt == "") return;
			const { ideas, authenticated } = await getData(`/ideas/search/${prompt}`, "get", true);
			if (authenticated) setIdeas(ideas);
			else setIdeas([]);
		}, 500);
		return () => clearTimeout(id);
	}, [prompt])
	return (
			<div className="fixed top-2 lg:top-0 lg:right-0 lg:w-[calc(100vw*(5.4/6.5))] w-[95vw] right-1/2 translate-x-1/2 lg:translate-x-0 lg:h-[calc(100vh/10)] px-2 py-1 flex flex-col lg:flex-row justify-between items-end lg:items-center lg:m-2 border-2 border-black border-solid rounded-2xl backdrop-blur-lg mb-2 z-40">
					<img
						className="w-[15vmax]" src="../../../../images/logo.png"
						alt="Logo"
					/>
					<div className="relative w-full lg:w-60">
						{!noSearchText ?
							<>
								<input
									className="bg-transparent border-2 border-black border-solid rounded-full pl-8 py-1 w-full"
									type="text"
									value={prompt}
									onChange={handleOnChange}
									placeholder="Search Ideas"
								/>
								<p className="absolute top-1/2 -translate-y-1/2 left-[min(10px,3%)]">🔎</p>
							</>
							:
							<p className="text-2xl">{noSearchText}</p>
						}
					</div>
			</div>
	)
}

export default TopNav
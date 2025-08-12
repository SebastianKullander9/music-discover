	"use client";

	import { useState } from "react";

	export default function Home() {
		const [artist, setArtist] = useState<string>("");

		const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			alert(artist);
		}

		return (
			<div className="">
				<div className="w-[300px] h-[200px] shadow-md bg-gray-100">
					<form className="flex flex-col justify-between h-full p-5" onSubmit={(e) => handleSubmit(e)}>
						<label htmlFor="artist" >Enter an artist</label>
						<input
							id="artist"
							type="text"
							value={artist}
							onChange={(e) => setArtist(e.target.value)}
							className="p-2 bg-white text-lg rounded-lg"
							required
						/>
						<button className="font-bold text-white rounded-lg bg-indigo-500 p-4 cursor-pointer hover:bg-indigo-700" aria-label="submit artist" type="submit">Submit</button>
					</form>
				</div>
			</div>
		);
	}

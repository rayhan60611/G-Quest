import { Circle, Ellipse, Path, Svg } from "react-native-svg";
import type { AnimalAvatarId } from "@/lib/anonymousProfile";

const BACKGROUNDS: Record<AnimalAvatarId, string> = {
  fox: "#E8F2E5",
  panda: "#E7F0E7",
  cat: "#F5EBDD",
  owl: "#E8F1E3",
  bear: "#F3E6D3",
  rabbit: "#F5EEE3",
};

export function AnimalAvatar({
  animal,
  size = 40,
}: {
  animal: AnimalAvatarId;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityLabel={`Anonymous ${animal} avatar`}
    >
      <Circle cx="50" cy="50" r="50" fill={BACKGROUNDS[animal]} />
      {animal === "fox" ? (
        <>
          <Path d="M20 50 23 19 46 36 77 19 80 50Z" fill="#D87935" />
          <Path d="m28 37-1-11 12 9m34 2 1-11-12 9" fill="#F2C2A0" />
          <Ellipse cx="50" cy="57" rx="31" ry="32" fill="#D87935" />
          <Path d="M23 61c9-13 18-14 27-5 9-9 18-8 27 5-6 17-17 25-27 25S29 78 23 61Z" fill="#F2F7EE" />
          <Circle cx="39" cy="53" r="3" fill="#173820" />
          <Circle cx="61" cy="53" r="3" fill="#173820" />
          <Path d="m46 65 4-3 4 3-4 4Z" fill="#173820" />
        </>
      ) : null}
      {animal === "panda" ? (
        <>
          <Circle cx="28" cy="30" r="13" fill="#234C2B" />
          <Circle cx="72" cy="30" r="13" fill="#234C2B" />
          <Circle cx="50" cy="55" r="35" fill="#F2F7EE" />
          <Ellipse cx="38" cy="51" rx="9" ry="12" transform="rotate(28 38 51)" fill="#234C2B" />
          <Ellipse cx="62" cy="51" rx="9" ry="12" transform="rotate(-28 62 51)" fill="#234C2B" />
          <Circle cx="39" cy="52" r="3" fill="#FFFFFF" />
          <Circle cx="61" cy="52" r="3" fill="#FFFFFF" />
          <Ellipse cx="50" cy="69" rx="13" ry="9" fill="#FFFFFF" />
          <Path d="m46 64 4-3 4 3-4 4Z" fill="#173820" />
        </>
      ) : null}
      {animal === "cat" ? (
        <>
          <Path d="M19 48 22 17 45 34 78 17 81 48Z" fill="#B9845A" />
          <Path d="m28 36-1-11 12 9m34 2 1-11-12 9" fill="#EAC5A2" />
          <Ellipse cx="50" cy="57" rx="32" ry="31" fill="#D5A476" />
          <Path d="m38 54 7-2m10 0 7 2" stroke="#173820" strokeWidth="3" strokeLinecap="round" />
          <Path d="M43 68c4 4 10 4 14 0m-7-8v4" fill="none" stroke="#173820" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M35 64 19 61m17 10-15 4m44-11 16-3m-17 13 15 4" fill="none" stroke="#8C674E" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
      {animal === "owl" ? (
        <>
          <Path d="M18 45 24 25 39 36 61 36 76 25 82 45v20c0 18-14 29-32 29S18 83 18 65Z" fill="#8A6540" />
          <Circle cx="38" cy="55" r="15" fill="#F2F7EE" />
          <Circle cx="62" cy="55" r="15" fill="#F2F7EE" />
          <Circle cx="39" cy="56" r="5" fill="#173820" />
          <Circle cx="61" cy="56" r="5" fill="#173820" />
          <Path d="m45 70 5-7 5 7-5 7Z" fill="#FFC107" />
          <Path d="M26 81c8-7 15-10 24-10s16 3 24 10" fill="none" stroke="#C79B62" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}
      {animal === "bear" ? (
        <>
          <Circle cx="29" cy="34" r="14" fill="#8B603D" />
          <Circle cx="71" cy="34" r="14" fill="#8B603D" />
          <Circle cx="29" cy="34" r="7" fill="#D9B18A" />
          <Circle cx="71" cy="34" r="7" fill="#D9B18A" />
          <Ellipse cx="50" cy="58" rx="33" ry="32" fill="#B98558" />
          <Circle cx="39" cy="52" r="3" fill="#173820" />
          <Circle cx="61" cy="52" r="3" fill="#173820" />
          <Ellipse cx="50" cy="67" rx="14" ry="10" fill="#F2DDBF" />
          <Path d="m46 64 4-3 4 3-4 4Z" fill="#173820" />
          <Path d="M46 72c2 2 6 2 8 0" fill="none" stroke="#173820" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
      {animal === "rabbit" ? (
        <>
          <Ellipse cx="36" cy="29" rx="11" ry="25" transform="rotate(-12 36 29)" fill="#F2F7EE" />
          <Ellipse cx="65" cy="29" rx="11" ry="25" transform="rotate(12 65 29)" fill="#F2F7EE" />
          <Ellipse cx="36" cy="29" rx="4" ry="15" transform="rotate(-12 36 29)" fill="#E7A8A0" />
          <Ellipse cx="65" cy="29" rx="4" ry="15" transform="rotate(12 65 29)" fill="#E7A8A0" />
          <Ellipse cx="50" cy="62" rx="31" ry="29" fill="#F2F7EE" />
          <Circle cx="40" cy="58" r="3" fill="#173820" />
          <Circle cx="60" cy="58" r="3" fill="#173820" />
          <Path d="m46 69 4-3 4 3-4 4Z" fill="#C87D75" />
          <Path d="M46 76c2 2 6 2 8 0" fill="none" stroke="#8C674E" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
    </Svg>
  );
}

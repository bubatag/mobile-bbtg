export type BubalinoStatus = "disconnected" | "location" | "alert" | "healthy";

export type BubalinoForm = {
  name: string;
  sex: "Macho" | "Fêmea" | "";
  birthDate: string;
  tag: string;
  collar: string;
};

export type Bubalino = Omit<BubalinoForm, "sex"> & {
  id: string;
  sex: "Macho" | "Fêmea";
  status: BubalinoStatus;
  pulse: number;
  temperature: number;
  coordinate: { latitude: number; longitude: number };
};

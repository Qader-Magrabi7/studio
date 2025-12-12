import type { Timestamp } from "firebase/firestore";

export type SavedLocation = {
  id: string;
  name: string;
  summary: string;
  createdAt: Timestamp;
};

export type Story = {
    title: string;
    story: string;
};

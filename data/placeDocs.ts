export type PlaceDoc = {
  id: string;
  title: string;
  location: string;
  content: string;
};

export const placeDocs: PlaceDoc[] = [
  {
    id: "picasso-barcelona",
    title: "Picasso in Barcelona",
    location: "Barcelona",
    content:
      "Pablo Picasso lived in Barcelona during his formative years. The city played an important role in his artistic development. He studied at the School of Fine Arts and spent time around the Gothic Quarter and Els Quatre Gats, a famous café associated with modernist artists.",
  },
  {
    id: "picasso-museum-barcelona",
    title: "Picasso Museum Barcelona",
    location: "Barcelona",
    content:
      "The Picasso Museum in Barcelona is located in the El Born neighborhood. It focuses especially on Picasso's early works and shows how Barcelona influenced his development as a young artist.",
  },
  {
    id: "marienplatz-munich",
    title: "Marienplatz Munich",
    location: "Munich",
    content:
      "Marienplatz is the central square of Munich and has been the city's main square since the 12th century. It is known for the New Town Hall, the Glockenspiel, and its role as a historic civic and commercial center.",
  },
  {
    id: "louvre-paris",
    title: "Louvre Paris",
    location: "Paris",
    content:
      "The Louvre is one of the world's largest museums and a historic palace in Paris. It contains major artworks including the Mona Lisa and has deep connections to French royal and national history.",
  },
];
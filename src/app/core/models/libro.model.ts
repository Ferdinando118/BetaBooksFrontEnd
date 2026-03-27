export interface CategoriaDTO {
  id: number;
  nome: string;
}

export interface AutoreDTO {
  id: number;
  nome: string;
  cognome: string;
}

export interface EditoreDTO {
  id: number;
  nome: string;
}

export interface FormatoLibroDTO {
  id: number;
  tipoSupporto: string;
  tipoCopertina: string;
  isbn: string;
  prezzo: number;
  quantita: number;
  attivo: boolean;
  copertina?: string; // Questa è la stringa Base64 che arriva da Java
}

export interface LibroDTO {
  id: number;
  titolo: string;
  descrizione: string;
  autore: AutoreDTO;
  editore: EditoreDTO;
  categorie: CategoriaDTO[];
  formati: FormatoLibroDTO[];
}
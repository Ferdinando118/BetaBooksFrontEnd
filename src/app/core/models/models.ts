// ── ENUM ──────────────────────────────────────────
export enum RuoloUtente   { USER = 'USER', ADMIN = 'ADMIN' }
export enum StatoOrdine   { IN_ATTESA = 'IN_ATTESA', SPEDITO = 'SPEDITO', CONSEGNATO = 'CONSEGNATO' }
export enum MetodoPagamento { CARTA = 'CARTA', PAYPAL = 'PAYPAL', CONSEGNA = 'CONSEGNA', BONIFICO = 'BONIFICO' }
export enum FiltroTemporale {
  ULTIMI_30_GIORNI = 'ULTIMI_30_GIORNI',
  ULTIMI_3_MESI = 'ULTIMI_3_MESI',
  ULTIMI_6_MESI = 'ULTIMI_6_MESI',
  ULTIMO_ANNO = 'ULTIMO_ANNO',
  TUTTO = 'TUTTO'
}
// ── UTENTE ────────────────────────────────────────
export interface Utente {
  id: number;
  email: string;
  ruolo: RuoloUtente;
}

export interface ProfiloUtente {
  id?: number; // <-- Aggiungi il punto interrogativo qui
  idUtente: number;
  nome: string;
  cognome: string;
  telefono?: string;
}

export interface Indirizzo {
  id?: number; // <-- Aggiungi il punto interrogativo qui
  idUtente: number;
  isDefault: boolean;
  via: string;
  civico: string;
  comune: string;
  cap: string;
  provincia?: string;
  paese: string;
  noteConsegna?: string;
}

// ── CATALOGO ──────────────────────────────────────
export interface Autore {
  id: number;
  nome: string;
  cognome: string;
  nazionalita?: string;
  biografia?: string;
}

export interface Editore {
  id: number;
  nome: string;
  descrizione?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descrizione?: string;
}

export interface Libro {
  id: number;
  titolo: string;
  isbn: string;
  copertina?: string;
  descrizione?: string;
  volume?: string;
  anno?: number;
  lingua: string;
  prezzo: number;
  quantita: number;
  editore?: Editore;
  autore: Autore;
  categorie?: Categoria[];
  valutazioneMedia?: number;   // calcolata dal backend
}

// ── CARRELLO ──────────────────────────────────────
export interface CarrelloDTO {
  id: number;
  idUtente: number;
  items: CarrelloItemDTO[];
  prezzoTotaleComplessivo: number; // Il totale calcolato da Spring Boot!
}

export interface CarrelloItemDTO {
  id: number;
  idFormatoLibro: number;
  titoloLibro: string;
  quantita: number;
  prezzoUnitario: number;
  prezzoTotaleRiga: number; // Fornito direttamente dal backend!
}

// ── ORDINE ────────────────────────────────────────
export interface OrdineItem {
  id: number;
  libro: Libro;
  quantita: number;
  prezzoUnitarioAcquisto: number;
}

export interface Ordine {
  id: number;
  dataOrdine: string;
  stato: StatoOrdine;
  totale: number;
  idUtente: number;
  indirizzo?: Indirizzo;
  metodoPagamento: MetodoPagamento;
  items: OrdineItem[];
}

export interface TrackingDTO {
  codice: string;
  corriere: string;
  stato: string;
  ultimoAggiornamento: string;
  eventi: {
    timestamp: string;
    stato: string;
    descrizione: string;
  }[];
}

export interface OrdineDTO {
    id: number;
    dataOrdine: string;
    stato: string;
    totale: number;
    metodoPagamento: string; tracking?: TrackingDTO;
    items: any[]; // O usa l'interfaccia specifica degli item se l'hai creata
}
// ── RECENSIONE & WISHLIST ─────────────────────────
export interface Recensione {
  id: number;
  idUtente: number;
  idLibro: number;
  valutazione: number;   // 1-5
  descrizione?: string;
  data: string;
}

export interface WishlistItem {
  id: number;
  idUtente: number;
  libro: Libro;
}

export interface Resp {
    message: string;
    obj?: any; // Il campo dove Java mette i dati (es. l'ordine o la lista)
}
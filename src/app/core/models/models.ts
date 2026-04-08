// ── ENUM ──────────────────────────────────────────
export enum RuoloUtente   { USER = 'USER', ADMIN = 'ADMIN' }
export enum StatoOrdine   { IN_ATTESA = 'IN_ATTESA', SPEDITO = 'SPEDITO', CONSEGNATO = 'CONSEGNATO' }
export enum MetodoPagamento { CARTA = 'CARTA', PAYPAL = 'PAYPAL', CONSEGNA = 'CONSEGNA', BONIFICO = 'BONIFICO' }
export enum TipoSpedizione {
  STANDARD = 'STANDARD',
  ESPRESSA = 'ESPRESSA',
  PROGRAMMATA = 'PROGRAMMATA'
}
export enum TipoEdizione {
  COPERTINA_FLESSIBILE = 'COPERTINA_FLESSIBILE',
  COPERTINA_RIGIDA = 'COPERTINA_RIGIDA',
  EBOOK = 'EBOOK'
}
export enum StatoTracking {
  PREPARAZIONE = 'PREPARAZIONE',
  RITIRO_CORRIERE = 'RITIRO_CORRIERE',
  IN_TRANSITO = 'IN_TRANSITO',
  IN_CONSEGNA = 'IN_CONSEGNA',
  CONSEGNATO = 'CONSEGNATO'
}

// ── UTENTE ────────────────────────────────────────
export interface Utente {
  id: number;
  email: string;
  ruolo: RuoloUtente;
}

export interface ProfiloUtente {
  id: number;
  idUtente: number;
  nome: string;
  cognome: string;
  telefono?: string;
}

export interface Indirizzo {
  id: number;
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
  miPiace?: boolean;            // preferito dall'utente corrente
}

// ── CARRELLO ──────────────────────────────────────
export interface CarrelloItem {
  id: number;
  idUtente: number;
  libro: Libro;
  edizione: TipoEdizione;
  quantita: number;
  prezzoPezzi: number;
}

// ── ORDINE ────────────────────────────────────────
export interface OrdineItem {
  id: number;
  libro: Libro;
  edizione: TipoEdizione;
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
  tipoSpedizione: TipoSpedizione;
  items: OrdineItem[];
  tracking?: TrackingSpedizione;
}

export interface EventoTracking {
  timestamp: string;
  stato: StatoTracking;
  descrizione: string;
}

export interface TrackingSpedizione {
  codice: string;
  corriere: string;
  stato: StatoTracking;
  ultimoAggiornamento: string;
  eventi: EventoTracking[];
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
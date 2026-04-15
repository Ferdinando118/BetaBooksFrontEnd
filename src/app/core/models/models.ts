
export enum RuoloUtente   { USER = 'USER', ADMIN = 'ADMIN' }
export enum StatoOrdine   { IN_ATTESA = 'IN_ATTESA', SPEDITO = 'SPEDITO', CONSEGNATO = 'CONSEGNATO', ANNULLATO = 'ANNULLATO' }
export enum MetodoPagamento { CARTA = 'CARTA', PAYPAL = 'PAYPAL', CONSEGNA = 'CONSEGNA', BONIFICO = 'BONIFICO' }
export enum FiltroTemporale {
  ULTIMI_30_GIORNI = 'ULTIMI_30_GIORNI',
  ULTIMI_3_MESI = 'ULTIMI_3_MESI',
  ULTIMI_6_MESI = 'ULTIMI_6_MESI',
  ULTIMO_ANNO = 'ULTIMO_ANNO',
  TUTTO = 'TUTTO'
}
export interface Utente {
  id: number;
  email: string;
  ruolo: RuoloUtente;
  validato: boolean;
}

export interface ProfiloUtente {
  id?: number; 
  idUtente: number;
  nome: string;
  cognome: string;
  telefono?: string;
}

export interface Indirizzo {
  id?: number; 
  idUtente: number;
  isDefault: boolean;
  via: string;
  civico: string;
  comune: string;
  cap: string;
  provincia?: string;
  paese: string;
  noteConsegna?: string;
  attivo: boolean;
}

export interface Autore {
  id: number;
  nome: string;
  cognome: string;
  nazionalita?: string;
  biografia?: string;
  attivo: boolean;
}

export interface Editore {
  id: number;
  nome: string;
  descrizione?: string;
  attivo: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descrizione?: string;
  attivo: boolean;
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


export interface CarrelloDTO {
  id: number;
  idUtente: number;
  items: CarrelloItemDTO[];
  prezzoTotaleComplessivo: number; // calcolato da java
}

export interface FormatoDisponibileDTO {
  id: number;
  tipoSupporto: string;
  tipoCopertina: string;
  prezzo: number;
}

export interface CarrelloItemDTO {
  id: number;
  idFormatoLibro: number;
  titoloLibro: string;
  autoreNome: string;     
  autoreCognome: string; 
  editoreNome: string;   
  copertina: string;   
  quantita: number;
  prezzoUnitario: number;
  prezzoTotaleRiga: number; 
  tipoSupporto?: string;    //  (Copertina flessibile, Copertina rigida, E-book)
  tipoCopertina?: string;  
  idLibro?: number;       
  formatiDisponibili?: FormatoDisponibileDTO[]; 
}


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
    totaleComplessivo: number;
    metodoPagamento: string; tracking?: TrackingDTO;
    items: OrdineItemDTO[]; 
    indirizzo:string;
}

export interface OrdineItemDTO {
  id: number;
  titoloLibro: string;
  copertina: string | null;
  quantita: number;
  prezzoUnitarioAcquisto: number;
  tipoSupporto?: string;    //  (Copertina flessibile, Copertina rigida, E-book)
  tipoCopertina?: string;
}

export interface Recensione {
  id: number;
  idUtente: number;
  idLibro: number;
  valutazione: number;   // 1-5
  descrizione?: string;
  data: string;
  nomeUtente:string;
}

export interface WishlistItem {
  id: number;
  idUtente: number;
  libro: Libro;
}

export interface Resp {
    message: string;
    obj?: any; 
}

export interface AuditLogDTO {
  id: number;
  nomeTabella: string;
  tipoOperazione: string; 
  idModificato: number;
  valoriPrecedenti: any;  
  valoriNuovi: any;     
  utenteDb: string;
  dataModifica: string;  
}

export interface PasswordReq{
  email:string;
  oldPwd:string;
  newPwd:string;
}


export interface PasswordRecoveryReq {
  token: string;
  nuovaPassword: string;
}

export interface Registrazione {
  email: string;
  password: string;
  ruolo?: string; 
  nome: string;
  cognome: string;
  validato?: boolean;
}
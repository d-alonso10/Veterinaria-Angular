export interface Cliente {
  idCliente?: number;
  nombre: string;
  apellido: string;
  dniRuc: string;
  email: string;
  telefono: string;
  direccion: string;
  preferencias?: string;
}

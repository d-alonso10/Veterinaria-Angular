import { Cliente } from './client.model';

export interface IMascota {
  idMascota?: number;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string; // YYYY-MM-DD
  cliente?: Cliente;
  idCliente?: number; // For forms
}

export interface IAtencion {
  idAtencion?: number;
  mascota: IMascota;
  fechaAtencion: string; // ISO LocalDateTime
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  costoTotal: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
}

export interface IReporteIngresos {
  fecha: string;
  totalIngresos: number;
  cantidadAtenciones: number;
}

export interface ILoginResponse {
  token: string;
  username: string;
  rol: string;
}

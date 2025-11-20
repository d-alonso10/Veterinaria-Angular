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
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
  mensaje: string;
  token: string;
  tokenType: string;
}

export interface ITiempoPromedio {
  groomer: string;
  tiempoPromedio: number; // in minutes
  cantidadAtenciones: number;
}

export interface IServicio {
  idServicio: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionEstimadaMin: number;
  categoria: string; // 'baño', 'corte', etc.
}

export interface ICita {
  idCita?: number;
  idMascota: number;
  idCliente: number;
  idSucursal: number;
  idServicio: number;
  fechaProgramada: string; // LocalDateTime string
  modalidad: 'presencial' | 'domicilio';
  estado?: string;
  notas?: string;
  // Campos expandidos para mostrar en tablas (si el backend los devuelve poblados)
  nombreMascota?: string;
  nombreCliente?: string;
  nombreServicio?: string;
}

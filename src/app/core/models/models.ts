import { Cliente } from './client.model';

export interface IMascota {
  idMascota?: number;
  nombre: string;
  especie: 'perro' | 'gato' | 'otro';
  raza: string;
  sexo: 'macho' | 'hembra' | 'otro';
  fechaNacimiento: string; // YYYY-MM-DD
  cliente?: Cliente;
  idCliente?: number; // For forms
}

export interface IAtencion {
  idAtencion?: number;
  mascota: IMascota;
  fechaAtencion?: string; // Keep for compatibility if needed
  createdAt?: string; // Backend field
  tiempoEstimadoInicio?: string; // Backend field
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  costoTotal: number;
  estado: 'en_espera' | 'en_servicio' | 'pausado' | 'terminado';
  idGroomer?: number;
  idSucursal?: number;
  turnoNum?: number;
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
  categoria: 'baño' | 'corte' | 'dental' | 'paquete' | 'otro';
}

export interface ICita {
  idCita?: number;
  idMascota: number;
  idCliente: number;
  idSucursal: number;
  idServicio: number;
  fechaProgramada: string; // LocalDateTime string
  modalidad: 'presencial' | 'virtual';
  estado?: 'reservada' | 'confirmada' | 'asistio' | 'cancelada' | 'no_show';
  notas?: string;
  // Campos expandidos para mostrar en tablas (si el backend los devuelve poblados)
  nombreMascota?: string;
  nombreCliente?: string;
  nombreServicio?: string;
}

export interface IFactura {
  idFactura?: number;
  idAtencion: number;
  serie: string;
  numero: string;
  metodoPagoSugerido: string;
  estado: 'pendiente' | 'confirmado' | 'anulado';
  fechaEmision?: string;
  total?: number;
}

export interface IPago {
  idPago?: number;
  idFactura: number;
  monto: number;
  metodo: 'efectivo' | 'tarjeta' | 'transfer' | 'otro';
  referencia?: string;
  fechaPago?: string;
}


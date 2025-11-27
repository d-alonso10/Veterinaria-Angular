import { Cliente } from './client.model';

export interface ICliente {
  idCliente?: number;
  nombre: string;
  apellido: string;
  dniRuc?: string;
  email: string;
  telefono: string;
  direccion?: string;
  preferencias?: string;
}

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
  cliente?: ICliente;  // Cliente completo anidado
  groomer?: any;  // Groomer completo anidado
  cita?: any;  // Cita completa anidada
  fechaAtencion?: string; // Keep for compatibility if needed
  createdAt?: string; // Backend field
  updatedAt?: string;
  tiempoEstimadoInicio?: string; // Backend field
  tiempoEstimadoFin?: string;
  tiempoRealInicio?: string | null;
  tiempoRealFin?: string | null;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  costoTotal?: number;
  estado: 'en_espera' | 'en_servicio' | 'pausado' | 'terminado';
  idGroomer?: number;
  idSucursal?: number;
  idCita?: number;
  turnoNum?: number;
  prioridad?: number;  // 1-5
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
  estado?: 'reservada' | 'confirmada' | 'asistio' | 'atendido' | 'cancelada' | 'no_show';
  notas?: string;
  // Campos expandidos para mostrar en tablas (si el backend los devuelve poblados)
  nombreMascota?: string;
  nombreCliente?: string;
  nombreServicio?: string;
}

export interface IFactura {
  idFactura?: number;
  serie: string;
  numero: string;
  atencion?: IAtencion;  // Atención completa anidada
  cliente?: ICliente;  // Cliente duplicado del backend
  idAtencion?: number;
  fechaEmision?: string;
  subtotal?: number;
  impuesto?: number;  // IGV 18%
  descuentoTotal?: number;
  total?: number;
  estado?: 'emitida' | 'pagada' | 'anulada';
  metodoPagoSugerido?: string;  // efectivo, tarjeta, yape, plin
  createdAt?: string;
  updatedAt?: string;
}

export interface IPago {
  idPago?: number;
  idFactura: number;
  monto: number;
  metodo: 'efectivo' | 'tarjeta' | 'transfer' | 'otro';
  referencia?: string;
  fechaPago?: string;
}


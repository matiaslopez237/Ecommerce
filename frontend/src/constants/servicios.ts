export const WA_LINK = "https://wa.me/5492995502644";

export type Tratamiento = {
  nombre: string;
  descripcion: string;
  indicaciones?: string;
  beneficios?: string[];
  sesiones?: string;
  faq?: { pregunta: string; respuesta: string }[];
  video?: string;           // URL de embed de YouTube
  videoFormato?: "vertical" | "horizontal";
};

export type Servicio = {
  slug: string;
  nombre: string;
  icono: string;       // emoji fallback (legacy)
  imagen?: string;     // ruta a /iconos/*.png
  descripcionCorta: string;
  descripcionLarga?: string;
  tratamientos?: Tratamiento[];
  obrasSociales?: string[];
};

export const SERVICIOS: Servicio[] = [
  {
    slug: "estetica-facial",
    nombre: "Estética Facial",
    icono: "✨",
    imagen: "/iconos/estetica-facial.png",
    descripcionCorta:
      "Tratamientos faciales profesionales para cuidar, rejuvenecer y realzar tu piel",
    tratamientos: [
      {
        nombre: "Limpieza Profunda con extracción de puntos negros",
        descripcion:
          "Remueve impurezas, células muertas y exceso de oleosidad. Mejora la textura de la piel, favorece la oxigenación y la prepara para recibir tratamientos posteriores.",
        indicaciones:
          "Indicado para hombres y mujeres de todas las edades.",
        sesiones: "Cada 10, 15 o 30 días según el tipo de piel.",
        beneficios: [
          "Elimina impurezas y puntos negros",
          "Mejora la textura de la piel",
          "Favorece la oxigenación cutánea",
          "Prepara la piel para otros tratamientos",
        ],
        faq: [
          {
            pregunta: "¿Cada cuánto debo realizarla?",
            respuesta: "Cada 10, 15 o 30 días, según el tipo de piel y recomendación profesional.",
          },
        ],
      },
      {
        nombre: "Radiofrecuencia Facial",
        descripcion:
          "Mejora la firmeza de la piel, estimula la producción de colágeno y le devuelve luminosidad y tersura.",
        indicaciones:
          "Indicado para quienes buscan prevenir o tratar la flacidez y las arrugas.",
        sesiones: "Cada 7 a 10 días.",
        video: "/videos/radiofrecuencia-facial.mp4",
        beneficios: [
          "Mejora firmeza y elasticidad",
          "Estimula la producción de colágeno",
          "Devuelve luminosidad a la piel",
          "Reduce la flacidez y las arrugas",
        ],
        faq: [
          {
            pregunta: "¿Cuántas sesiones necesito?",
            respuesta: "Se recomienda un mínimo de 6 sesiones, con frecuencia de cada 7 a 10 días.",
          },
        ],
      },
      {
        nombre: "Dermapen - Microneedling",
        descripcion:
          "Micropunciones que estimulan la regeneración celular, oxigenan e hidratan la piel en profundidad. Indoloro y no invasivo.",
        indicaciones:
          "Apto para todo tipo de pieles. Indoloro, no invasivo.",
        sesiones: "Cada 15 días.",
        video: "/videos/dermapen.mp4",
        beneficios: [
          "Estimula la renovación celular",
          "Favorece la producción de colágeno",
          "Mejora la textura de la piel",
          "Piel más luminosa y uniforme",
        ],
        faq: [
          {
            pregunta: "¿Duele el procedimiento?",
            respuesta: "No, es un procedimiento indoloro y no invasivo.",
          },
          {
            pregunta: "¿Con qué frecuencia se realiza?",
            respuesta: "Cada 15 días para mejores resultados.",
          },
        ],
      },
      {
        nombre: "Fraxface - Radiofrecuencia Fraccionada",
        descripcion:
          "Calienta la dermis estimulando la capa más interna sin afectar la epidermis. Se aplica con anestesia en crema para mayor confort. Solo se siente calor.",
        indicaciones:
          "3 a 5 sesiones. Cada 30 días (alternando con Dermapen a los 15 días). Se aplica con anestesia en crema.",
        sesiones: "Cada 30 días. 3 a 5 sesiones totales.",
        video: "/videos/frax-face.mp4",
        beneficios: [
          "Rejuvenecimiento facial",
          "Estimula la producción de colágeno",
          "Efecto lifting",
          "Elimina líneas de expresión y arrugas",
          "Reduce patas de gallo, código de barras y surco nasogeniano",
          "Mejora cicatrices de acné",
        ],
        faq: [
          {
            pregunta: "¿Duele?",
            respuesta: "No duele. Solo se siente calor. Se aplica anestesia en crema para mayor confort.",
          },
        ],
      },
      {
        nombre: "Peeling",
        descripcion:
          "Exfolia la piel con ácidos o métodos mecánicos, eliminando células muertas y renovando la superficie cutánea.",
        indicaciones:
          "Ideal para realizar en otoño e invierno. 4 a 6 sesiones.",
        sesiones: "Cada 7 a 10 días. 4 a 6 sesiones.",
        beneficios: [
          "Piel más suave y radiante",
          "Ayuda en manchas y cicatrices",
          "Mejora el acné",
          "Reduce poros dilatados",
        ],
        faq: [
          {
            pregunta: "¿En qué época del año es mejor realizarlo?",
            respuesta: "Es ideal realizarlo en otoño o invierno, ya que el sol es menos intenso.",
          },
        ],
      },
      {
        nombre: "Dermaplaning",
        descripcion:
          "Exfoliación física no invasiva realizada con bisturí estéril para eliminar células muertas y vello facial superficial.",
        indicaciones:
          "Apto para todo tipo de pieles. No invasivo.",
        beneficios: [
          "Suaviza la textura de la piel",
          "Mayor luminosidad",
          "Remueve células muertas",
          "Piel más uniforme",
          "Mejora la absorción de productos",
          "Ideal como preparación para maquillaje",
        ],
        faq: [
          {
            pregunta: "¿Vuelve a crecer el vello más grueso?",
            respuesta: "No. El vello facial vuelve a crecer de la misma forma, ya que el dermaplaning no altera el folículo piloso.",
          },
        ],
      },
      {
        nombre: "Cabina Led Facial",
        descripcion:
          "Fototerapia con diodos LED que actúa en profundidad sobre la piel. Se combina con alta frecuencia (ozono) para potenciar sus beneficios antibacterianos y descongestivos.",
        indicaciones:
          "Indicado para todo tipo de pieles. Se combina con alta frecuencia.",
        beneficios: [
          "Reduce arrugas y líneas de expresión",
          "Estimula la producción de colágeno",
          "Elimina bacterias del acné",
          "Atenúa manchas",
          "Mejora la oxigenación de la piel",
        ],
        faq: [
          {
            pregunta: "¿Qué es la alta frecuencia?",
            respuesta: "Es un complemento que genera ozono con efecto antibacteriano y descongestivo, potenciando los resultados del LED.",
          },
        ],
      },
    ],
  },
  {
    slug: "estetica-corporal",
    nombre: "Estética Corporal",
    icono: "💆",
    imagen: "/iconos/estetica-corporal.png",
    descripcionCorta:
      "Tratamientos corporales para reducir, reafirmar y modelar tu figura",
    tratamientos: [
      {
        nombre: "Vela Velvet Max - Reduce, Reafirma, Modela",
        descripcion:
          "Masaje con rodillos que mejora la circulación y combate la celulitis. Combina Radiofrecuencia, Luz LED infrarroja y Vacumterapia en un solo equipo.",
        indicaciones:
          "Zonas: abdomen, flancos, piernas, glúteos, brazos.",
        sesiones: "Cada 7 días.",
        video: "/videos/vela-velvet-max.mp4",
        beneficios: [
          "Reduce la celulitis",
          "Reafirma la piel",
          "Mejora la circulación",
          "Modela la silueta",
        ],
        faq: [
          {
            pregunta: "¿En qué zonas se puede aplicar?",
            respuesta: "Abdomen, flancos, piernas, glúteos y brazos.",
          },
        ],
      },
      {
        nombre: "Ultracavitación",
        descripcion:
          "Ultrasonidos de baja frecuencia que eliminan grasa localizada y reducen la celulitis. Rompe las células adiposas que el cuerpo elimina de forma natural. Indoloro y no invasivo.",
        indicaciones:
          "Zonas: abdomen, flancos, piernas, glúteos. Indoloro, no invasivo.",
        beneficios: [
          "Elimina grasa localizada",
          "Reduce la celulitis",
          "No invasivo e indoloro",
          "El cuerpo elimina la grasa naturalmente",
        ],
        faq: [
          {
            pregunta: "¿Duele?",
            respuesta: "No, es un procedimiento completamente indoloro y no invasivo.",
          },
        ],
      },
      {
        nombre: "Radiofrecuencia Corporal",
        descripcion:
          "Ondas electromagnéticas que calientan las capas profundas de la piel, estimulando la producción de colágeno y elastina para reafirmar los tejidos.",
        indicaciones:
          "Indicado para flacidez post-embarazo, estrías en abdomen.",
        sesiones: "Cada 7 a 10 días.",
        beneficios: [
          "Reafirma la piel",
          "Estimula colágeno y elastina",
          "Reduce flacidez post-embarazo",
          "Mejora el aspecto de las estrías",
        ],
        faq: [
          {
            pregunta: "¿Es efectiva para la flacidez post-parto?",
            respuesta: "Sí, está especialmente indicada para tratar la flacidez abdominal post-embarazo.",
          },
        ],
      },
      {
        nombre: "Body Up",
        descripcion:
          "Pulsos magnéticos que generan contracciones musculares involuntarias para tonificar y fortalecer la musculatura. Ideal como complemento del entrenamiento.",
        indicaciones:
          "Zonas: abdomen, piernas, glúteos, brazos. Cada 7 a 10 días.",
        sesiones: "Cada 7 a 10 días.",
        beneficios: [
          "Tonifica la musculatura",
          "Fortalece músculos",
          "Complementa el entrenamiento físico",
          "Múltiples zonas de aplicación",
        ],
        faq: [
          {
            pregunta: "¿Puedo combinarlo con mi entrenamiento?",
            respuesta: "Sí, de hecho se recomienda combinarlo con entrenamiento regular para mejores resultados.",
          },
        ],
      },
      {
        nombre: "Tratamiento Piernas Cansadas",
        descripcion:
          "Combinación de aparatología avanzada y masajes circulatorios para aliviar la pesadez, hinchazón y mala circulación en las piernas.",
        beneficios: [
          "Alivia la pesadez en piernas",
          "Reduce la hinchazón",
          "Mejora la circulación",
          "Bienestar y alivio inmediato",
        ],
        faq: [
          {
            pregunta: "¿Quién puede realizarse este tratamiento?",
            respuesta: "Cualquier persona que sufra de pesadez, hinchazón o mala circulación en las piernas.",
          },
        ],
      },
    ],
  },
  {
    slug: "depilacion-laser",
    nombre: "Depilación Definitiva Láser",
    icono: "⚡",
    imagen: "/iconos/depilacion-laser.png",
    descripcionCorta:
      "Disfrutá de una piel suave y olvidate de depilarte constantemente",
    descripcionLarga:
      "Atendemos todos los días del año para hombres y mujeres. A partir de los 11-12 años con autorización de padre/madre/tutor. No duele, solo se siente calor o un leve pinchazo. Las sesiones son cada 30 días como mínimo y se necesitan mínimo 8 sesiones para notar un cambio significativo. Luego las sesiones se van distanciando a 45-60 días. El mantenimiento posterior es cada 6 meses o 1 año. Muchas personas no necesitan más sesiones una vez completado el tratamiento.",
    tratamientos: [
      {
        nombre: "Depilación Láser - Todos los días del año",
        descripcion:
          "Tratamiento definitivo para hombres y mujeres. Atención todos los días del año. A partir de los 11-12 años con autorización de padre/madre/tutor.",
        indicaciones:
          "Hombres y mujeres. Desde los 11-12 años con autorización. Todas las zonas del cuerpo.",
        sesiones:
          "Mínimo 8 sesiones, cada 30 días. Luego distanciadas a 45-60 días. Mantenimiento cada 6 meses o 1 año.",
        beneficios: [
          "Reducción permanente del vello",
          "Piel suave y libre de irritaciones",
          "No duele, solo se siente calor o leve pinchazo",
          "Apto para todas las zonas del cuerpo",
          "Para hombres y mujeres",
          "Atención todos los días del año",
        ],
        faq: [
          {
            pregunta: "¿Cuántas sesiones necesito?",
            respuesta: "Se necesitan mínimo 8 sesiones para notar un cambio significativo. Luego las sesiones se distancian a 45-60 días.",
          },
          {
            pregunta: "¿Duele?",
            respuesta: "No duele. Solo se siente calor o un leve pinchazo en la zona tratada.",
          },
          {
            pregunta: "¿Desde qué edad se puede realizar?",
            respuesta: "A partir de los 11-12 años con autorización de padre, madre o tutor.",
          },
          {
            pregunta: "¿Cuándo se hace el mantenimiento?",
            respuesta: "El mantenimiento se realiza cada 6 meses o 1 año. Algunas personas no necesitan más sesiones una vez completado el tratamiento.",
          },
        ],
      },
    ],
  },
  {
    slug: "ginecologia",
    nombre: "Ginecología y Estética Médica",
    icono: "🩺",
    imagen: "/iconos/ginecologia.png",
    descripcionCorta:
      "Atención ginecológica integral y tratamientos de medicina estética avanzada",
    tratamientos: [
      {
        nombre: "Ginecología General",
        descripcion:
          "Atención ginecológica completa para todas las etapas de la vida: infanto juvenil, edad fértil, menopausia y climaterio.",
        indicaciones:
          "Infanto juvenil, edad fértil, menopausia, climaterio.",
        beneficios: [
          "Control anual",
          "Pap y Colposcopía",
          "Examen ginecológico completo",
          "Patología ginecológica",
          "Atención en todas las etapas de la vida",
        ],
        faq: [
          {
            pregunta: "¿Con qué frecuencia debo realizarme un control?",
            respuesta: "Se recomienda un control anual. En caso de alguna patología, la frecuencia la indicará el profesional.",
          },
        ],
      },
      {
        nombre: "Pellet Hormonal (Chip Sexual) - Terapia de Reemplazo Hormonal",
        descripcion:
          "Pequeño implante subcutáneo del tamaño de un grano de arroz que libera hormonas bioidénticas (testosterona/estradiol) de forma continua durante 3 a 6 meses. Se inserta bajo anestesia local en la cadera o el glúteo.",
        indicaciones:
          "Trata síntomas de menopausia y andropausia. Se inserta bajo anestesia local en cadera o glúteo.",
        sesiones: "Cada 3 a 6 meses.",
        beneficios: [
          "Aumenta energía y vitalidad",
          "Mejora la actividad sexual",
          "Regula el metabolismo",
          "Previene el daño vascular",
          "Alivia síntomas de menopausia",
          "Mejora el sueño y el humor",
          "Favorece el desarrollo muscular",
          "Mejora la memoria y concentración",
          "Ayuda en dietas y control de peso",
          "Otorga bienestar general",
        ],
        faq: [
          {
            pregunta: "¿Duele la inserción?",
            respuesta: "No, se realiza bajo anestesia local. El procedimiento es rápido y ambulatorio.",
          },
          {
            pregunta: "¿Cuánto dura el efecto?",
            respuesta: "Entre 3 y 6 meses, dependiendo del metabolismo de cada persona.",
          },
        ],
      },
      {
        nombre: "Ginecología Regenerativa, Funcional y Estética",
        descripcion:
          "Procedimientos estéticos y regenerativos íntimos: hilos tensores, blanqueamiento vaginal, rellenos de labios, corrección de asimetrías y disminución de diámetros vaginales con plasmagel, ácido hialurónico y lipotransferencia.",
        beneficios: [
          "Hilos tensores vaginales",
          "Blanqueamiento vaginal",
          "Rellenos de labios menores y mayores",
          "Corrección de asimetrías",
          "Disminución de diámetros vaginales",
        ],
        faq: [
          {
            pregunta: "¿Es necesaria una consulta previa?",
            respuesta: "Sí, se requiere una consulta inicial para evaluar cada caso y determinar el tratamiento adecuado.",
          },
        ],
      },
      {
        nombre: "MELA - Mini Extracción Lipídica Ambulatoria",
        descripcion:
          "Procedimiento ambulatorio con microcánula para aspirar grasa en sesiones de 20 minutos a 2 horas bajo anestesia local. Menor inflamación, menos hematomas y recuperación rápida respecto a la liposucción tradicional.",
        indicaciones:
          "Zonas: abdomen, flancos, zona pre-axilar, rodillas, pantalón de montar, cara interna de muslos. Anestesia local.",
        beneficios: [
          "Menor inflamación post-procedimiento",
          "Menos hematomas",
          "Mayor seguridad",
          "Recuperación rápida",
          "Sin quirófano",
          "Anestesia local",
          "Áreas pequeñas y precisas",
        ],
        faq: [
          {
            pregunta: "¿En qué se diferencia de la liposucción?",
            respuesta: "Se trabaja en áreas pequeñas, sin quirófano, con anestesia local y se extrae un menor volumen de grasa, lo que implica una recuperación mucho más rápida.",
          },
        ],
      },
      {
        nombre: "Plasma Rico en Plaquetas (PRP)",
        descripcion:
          "Se obtiene plasma de la propia sangre del paciente para tratamientos faciales, capilares y vaginales. Estimula la regeneración natural de los tejidos.",
        indicaciones:
          "Usos: Facial, Capilar y Vaginal.",
        beneficios: [
          "Facial: regenera tejidos, estimula colágeno y elastina, reduce el envejecimiento, mejora textura y firmeza",
          "Capilar: estimula el crecimiento del cabello, detiene la caída, aumenta la densidad",
          "Vaginal: mejora sequedad, elasticidad y sensibilidad genital, reduce dolor en relaciones, ayuda en atrofia menopáusica",
        ],
        faq: [
          {
            pregunta: "¿De dónde se obtiene el plasma?",
            respuesta: "De la propia sangre del paciente. Es un tratamiento autólogo, totalmente seguro y natural.",
          },
        ],
      },
      {
        nombre: "Sueroterapia",
        descripcion:
          "Administración intravenosa de sueros personalizados con vitaminas, minerales, antioxidantes y fármacos biológicos. Absorción del 100% al ser administrado directamente en sangre. Requiere consulta presencial previa y estudios de laboratorio.",
        indicaciones:
          "Requiere consulta presencial previa y estudios de laboratorio.",
        beneficios: [
          "Energía y vitalidad inmediata",
          "Refuerzo del sistema inmunológico",
          "Desintoxicación profunda",
          "Salud estética antiaging",
          "Recuperación física acelerada",
          "Alivio de síntomas diversos",
        ],
        faq: [
          {
            pregunta: "¿Se requiere algún estudio previo?",
            respuesta: "Sí. Se requiere consulta presencial previa y estudios de laboratorio para personalizar el suero.",
          },
        ],
      },
    ],
  },
  {
    slug: "quiropraxia",
    nombre: "Quiropraxia",
    icono: "🦴",
    imagen: "/iconos/quiropraxia.png",
    descripcionCorta:
      "Detectamos, analizamos y corregimos subluxaciones vertebrales para mejorar tu calidad de vida",
    descripcionLarga:
      "La quiropraxia es una ciencia que detecta, analiza y corrige subluxaciones vertebrales. Al alinear la columna liberamos el sistema nervioso para que funcione de manera óptima. Apta para todas las edades, hombres y mujeres.",
    tratamientos: [
      {
        nombre: "Tratamiento Quiropráctico",
        descripcion:
          "Ciencia que detecta, analiza y corrige subluxaciones vertebrales. Al alinear la columna se libera el sistema nervioso. Para todas las edades, hombres y mujeres.",
        indicaciones:
          "Para todas las edades, hombres y mujeres.",
        sesiones:
          "Cada 7, 10, 15 o 30 días según evaluación profesional.",
        beneficios: [
          "Hernias de disco",
          "Cervicalgia y lumbalgia",
          "Contracturas musculares",
          "Protusión vertebral",
          "Corrección de mala postura",
          "Bruxismo",
          "Dolor ciático",
          "Dolor de cabeza y migraña",
          "Vértigo y mareos",
          "Mal descanso",
          "Dolores articulares o musculares",
          "Ansiedad",
          "Rectificación cervical",
          "Personas que pasan mucho tiempo sentadas o paradas",
        ],
        faq: [
          {
            pregunta: "¿Es seguro para todas las edades?",
            respuesta: "Sí. La quiropraxia es apta para todas las edades, desde niños hasta adultos mayores.",
          },
          {
            pregunta: "¿Cada cuánto debo ir?",
            respuesta: "La frecuencia es de cada 7, 10, 15 o 30 días, según la evaluación del profesional en cada caso.",
          },
        ],
      },
    ],
  },
  {
    slug: "odontologia",
    nombre: "Odontología",
    icono: "🦷",
    imagen: "/iconos/odontologia.png",
    descripcionCorta:
      "Odontología general y especializada con la última tecnología en equipamiento",
    tratamientos: [
      {
        nombre: "Odontología General",
        descripcion:
          "Atención con OSPEPRI y particular. Incluye endodoncia (tratamiento de conducto), periodoncia, ortodoncia, prótesis e implantes, extracciones, arreglos y limpiezas.",
        indicaciones:
          "Atención con OSPEPRI y particular.",
        beneficios: [
          "Endodoncia (tratamiento de conducto)",
          "Periodoncia",
          "Ortodoncia",
          "Prótesis e implantes",
          "Extracciones",
          "Arreglos y restauraciones",
          "Limpiezas dentales",
        ],
        faq: [
          {
            pregunta: "¿Atienden con obra social?",
            respuesta: "Sí. Se atiende con OSPEPRI y de forma particular.",
          },
        ],
      },
      {
        nombre: "Escáner 3D Intraoral",
        descripcion:
          "Tecnología de vanguardia que permite lograr implantes de calidad a medida de cada paciente mediante un escaneado digital preciso de la cavidad bucal.",
        beneficios: [
          "Implantes a medida de cada paciente",
          "Mayor precisión en el diagnóstico",
          "Proceso digital sin moldes físicos incómodos",
          "Mejor planificación del tratamiento",
        ],
        faq: [
          {
            pregunta: "¿Para qué sirve el escáner 3D?",
            respuesta: "Permite digitalizar la boca del paciente para planificar y confeccionar implantes y prótesis con mayor precisión y calidad.",
          },
        ],
      },
      {
        nombre: "Rayos X / Pantomógrafo",
        descripcion:
          "Tecnología de vanguardia con diseño elegante. Imágenes de alta calidad para un diagnóstico preciso. Primera tecnología de este tipo en la ciudad de Catriel.",
        beneficios: [
          "Imágenes de alta calidad",
          "Diagnóstico preciso",
          "Primera tecnología de este tipo en Catriel",
          "Diseño moderno y ergonómico",
        ],
        faq: [
          {
            pregunta: "¿Es la primera tecnología de este tipo en Catriel?",
            respuesta: "Sí. El Centro Médico Santo Domingo fue el primero en incorporar esta tecnología en la ciudad de Catriel.",
          },
        ],
      },
    ],
  },
  {
    slug: "kinesiologia",
    nombre: "Kinesiología y Rehabilitación",
    icono: "🏃",
    imagen: "/iconos/kinesiologia.png",
    descripcionCorta:
      "Rehabilitación profesional con atención de obras sociales y particular",
    descripcionLarga:
      "Atención de lunes a viernes. Obras sociales: OSDE, OSPEPRI, Sancor Salud, Prevención, Avalian, Medife, Jerárquicos, Unión Personal, Consolidar, Federada, Osdipp, Omint, Camioneros de la Pampa, Sempre.",
    obrasSociales: [
      "OSDE",
      "OSPEPRI",
      "Sancor Salud",
      "Prevención",
      "Avalian",
      "Medife",
      "Jerárquicos",
      "Unión Personal",
      "Consolidar",
      "Federada",
      "Osdipp",
      "Omint",
      "Camioneros de la Pampa",
      "Sempre",
    ],
    tratamientos: [
      {
        nombre: "Kinesiología y Rehabilitación",
        descripcion:
          "Rehabilitación profesional para la recuperación de lesiones y cirugías. Atención con obras sociales y particular. Disponible de lunes a viernes.",
        indicaciones:
          "Disponible de lunes a viernes.",
        beneficios: [
          "Post quirúrgicos",
          "Esguinces",
          "Tendinitis",
          "Fracturas",
          "Desgarros",
          "Y más patologías",
        ],
        faq: [
          {
            pregunta: "¿Qué obras sociales atienden?",
            respuesta: "OSDE, OSPEPRI, Sancor Salud, Prevención, Avalian, Medife, Jerárquicos, Unión Personal, Consolidar, Federada, Osdipp, Omint, Camioneros de la Pampa, Sempre.",
          },
          {
            pregunta: "¿Qué días atienden?",
            respuesta: "Lunes a viernes.",
          },
        ],
      },
    ],
  },
  {
    slug: "medicina-general",
    nombre: "Medicina General",
    icono: "🏥",
    imagen: "/iconos/medicina-general.png",
    descripcionCorta:
      "Medicina integrativa, general y clínica con atención de obras sociales",
    descripcionLarga:
      "Medicina integrativa, general y clínica. Disponible los miércoles. Obras sociales: Ipross, Sancor Salud, Prevención, Avalian, Medife, Jerárquicos, Unión Personal, Consolidar, Federada, Osdipp, Omint, Camioneros de la Pampa, Sempre.",
    obrasSociales: [
      "Ipross",
      "Sancor Salud",
      "Prevención",
      "Avalian",
      "Medife",
      "Jerárquicos",
      "Unión Personal",
      "Consolidar",
      "Federada",
      "Osdipp",
      "Omint",
      "Camioneros de la Pampa",
      "Sempre",
    ],
    tratamientos: [
      {
        nombre: "Medicina Integrativa, General y Clínica",
        descripcion:
          "Atención médica integral con un enfoque integrativo. Disponible los miércoles con atención de múltiples obras sociales y particular.",
        indicaciones:
          "Disponible los miércoles.",
        beneficios: [
          "Medicina integrativa",
          "Medicina general",
          "Clínica médica",
          "Atención con obras sociales",
          "Atención particular",
        ],
        faq: [
          {
            pregunta: "¿Qué días atienden?",
            respuesta: "Los miércoles.",
          },
          {
            pregunta: "¿Qué obras sociales atienden?",
            respuesta: "Ipross, Sancor Salud, Prevención, Avalian, Medife, Jerárquicos, Unión Personal, Consolidar, Federada, Osdipp, Omint, Camioneros de la Pampa, Sempre.",
          },
        ],
      },
    ],
  },
];

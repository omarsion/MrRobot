const phone = '59176988638';

export function whatsappUrl(message = 'Hola, quiero conversar sobre un proyecto con Mr. Robot Bolivia.') {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

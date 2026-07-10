import { motion } from "framer-motion";
import { whatsappLink } from "@/lib/config";

export default function WhatsAppFab() {
  return (
    <motion.a
      data-testid="whatsapp-fab"
      href={whatsappLink("Hi BookMyHomez, I'm interested in a property.")}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_30px_rgba(37,211,102,0.45)]"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.555 4.184 1.61 6.008L4 29l8.184-1.57a12 12 0 0 0 3.82.625h.004C22.629 28.055 28 22.672 28 16.05 28 9.43 22.625 3 16.004 3Zm0 21.906h-.004a9.9 9.9 0 0 1-3.375-.594l-.242-.098-4.855.934.965-4.73-.157-.243a9.86 9.86 0 0 1-1.52-5.078c0-5.48 4.461-9.938 9.945-9.938 2.656 0 5.152 1.035 7.031 2.914a9.86 9.86 0 0 1 2.914 7.027c-.004 5.48-4.461 9.938-9.949 9.938Zm5.457-7.442c-.297-.148-1.762-.87-2.035-.969-.273-.098-.473-.148-.672.15-.199.296-.77.968-.945 1.167-.172.199-.348.223-.645.075-.297-.15-1.258-.464-2.394-1.477-.883-.789-1.48-1.762-1.652-2.059-.172-.297-.02-.457.129-.605.133-.133.297-.348.445-.523.149-.172.199-.297.297-.496.098-.199.05-.372-.024-.52-.075-.148-.672-1.62-.918-2.219-.242-.582-.488-.504-.672-.512l-.573-.011c-.199 0-.522.074-.796.371-.273.297-1.043 1.02-1.043 2.488 0 1.469 1.066 2.887 1.215 3.086.148.199 2.098 3.203 5.078 4.492.71.309 1.262.492 1.695.629.712.227 1.36.195 1.872.117.571-.086 1.762-.719 2.008-1.414.246-.695.246-1.293.172-1.414-.074-.121-.273-.199-.57-.348Z" />
      </svg>
    </motion.a>
  );
}

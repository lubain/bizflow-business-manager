import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="text-8xl font-black text-slate-200">404</div>
      <h1 className="text-2xl font-bold text-slate-700">Page introuvable</h1>
      <p className="text-slate-500">La page que vous cherchez n'existe pas.</p>
      <button onClick={() => navigate(-1)} className="mt-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
        Retour
      </button>
    </div>
  );
}

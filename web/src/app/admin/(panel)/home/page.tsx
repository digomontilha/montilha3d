import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import { defaultSettings, type Settings } from "@/lib/products";
import { saveSettings } from "../../actions";

export default async function AdminHome({ searchParams }: PageProps<"/admin/home">) {
  const { error, ok } = await searchParams;
  const sb = await requireAdmin();
  const { data } = await sb.from("site_settings").select("*").maybeSingle();
  const s = (data as Settings | null) ?? defaultSettings;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Home</h1>
      {error && <p role="alert" className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {ok && <p className="mb-4 border border-line bg-white p-3 text-sm">Salvo.</p>}
      <form action={saveSettings} className="max-w-xl space-y-5">
        <label className="block text-sm">Título
          <textarea name="hero_title" rows={2} required className="field mt-1" defaultValue={s.hero_title} />
        </label>
        <label className="block text-sm">Subtítulo
          <textarea name="hero_subtitle" rows={2} className="field mt-1" defaultValue={s.hero_subtitle} />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm">Imagem principal</legend>
          {s.hero_image && (
            <div className="mb-3 text-xs">
              <Image src={s.hero_image} alt="" width={320} height={180} className="h-auto w-64 object-cover" />
              <label className="mt-1 flex items-center gap-1"><input type="checkbox" name="remove_hero" /> remover</label>
            </div>
          )}
          <input type="file" name="hero_image" accept="image/*" className="text-sm" />
        </fieldset>
        <button className="btn">Salvar</button>
      </form>
    </>
  );
}

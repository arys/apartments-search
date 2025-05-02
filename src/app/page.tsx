import RealEstateChatbot from "@/components/RealEstateChatbot";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 py-10">
      <h1 className="text-3xl font-bold mb-6">ИИ-помощник по недвижимости</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl">
        Задавайте вопросы о недвижимости и получайте подробную информацию о доступных вариантах.
      </p>
      <RealEstateChatbot />
    </div>
  );
}

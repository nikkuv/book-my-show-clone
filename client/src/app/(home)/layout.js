import Header from "@/components/Header/Header";
export default function HomeLayout({ children }) {
  return <section>
    <Header />
    {children}
</section>;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-primary-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-primary-700 mb-8">
          Forms Wall Display System
        </h1>
      </div>
      
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <a
          href="/screen/main"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-primary-300 hover:bg-primary-100"
        >
          <h2 className="mb-3 text-2xl font-semibold text-primary-700">
            Screen{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            매장 디스플레이 화면으로 이동
          </p>
        </a>

        <a
          href="/admin"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-primary-300 hover:bg-primary-100"
        >
          <h2 className="mb-3 text-2xl font-semibold text-primary-700">
            Admin{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            관리자 대시보드로 이동
          </p>
        </a>

        <div className="group rounded-lg border border-transparent px-5 py-4">
          <h2 className="mb-3 text-2xl font-semibold text-primary-700">
            Status
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            시스템 준비 중...
          </p>
        </div>
      </div>
    </main>
  )
}
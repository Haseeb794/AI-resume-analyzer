import { useState } from "react";
import { FileUploader } from "~/components/FileUploader";
import { Navbar } from "~/components/Navbar";

export const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget.closest("form");
        if (!formElement) return;
        const formData = new FormData(formElement);

        const companyName = formData.get("company-name");
        const jobTitle = formData.get("job-title");
        const jobDescription = formData.get("job-description");

        console.log({ companyName, jobTitle, jobDescription, file });

    }


  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart fedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" alt="" />
            </>
          ) : (
            <h2>Drop you resume for ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form action="" id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                <div className="form-div">
                    <label htmlFor="company-name">Company Name</label>
                    <input type="text" id="company-name" name="company-name" placeholder="Company Name" />
                </div>
                <div className="form-div">
                    <label htmlFor="job-title">job title</label>
                    <input type="text" id="job-title" name="job-title" placeholder="job title" />
                </div>
                <div className="form-div">
                    <label htmlFor="job-description">Job description</label>
                    <textarea rows={5} id="job-description" name="job-description" placeholder="Job description" />
                </div>
                <div className="form-div">
                    <label htmlFor="uploader">Upload resume</label>
                    <FileUploader  onFileSelect={handleFileSelect}/>
                    <button className="primary-button" type="submit">
                        Analyze resume
                    </button>
                </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;

import { useState } from "react";
import { useNavigate } from "react-router";
import { FileUploader } from "~/components/FileUploader";
import { Navbar } from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { convertPdfToImage } from "~/lib/pdf2img";
import { prepareInstructions } from "constants/index";

export const Upload = () => {
    const {fs, isLoading, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        console.log(file);
    };
    const handleAnalyze = async (companyName : string, jobTitle: string, jobDescription : string, file: File) =>{
        setIsProcessing(true);
        setStatusText("Uploading resume...");
        const uploadedFile = await fs.upload([file]);

        if (!uploadedFile) {
            setStatusText("Failed to upload resume.");
            return;
        }

        setStatusText("Converting to image...");
        const imageFile = await convertPdfToImage(file);
        console.log(imageFile);
        if (!imageFile.file) return setStatusText("Failed to convert resume to image.");
        setStatusText("Uploading image...");
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText("Failed to upload resume image.");

        setStatusText("Preparing data...");

        const uuid = generateUUID();

        const data = {
          id: uuid,
          resumePath: uploadedFile.path,
          imagePath: uploadedImage.path,
          companyName,
          jobTitle,
          jobDescription,
          feedback : '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analyzing...");

        const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({jobTitle, jobDescription}));

        if (!feedback) return setStatusText("Failed to analyze resume.");

        console.log({ feedback });
        const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;
        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis complete!");
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget.closest("form");
        if (!formElement) return;
        const formData = new FormData(formElement);

        const companyName = (formData.get("company-name") as string) ?? "";
        const jobTitle = (formData.get("job-title") as string) ?? "";
        const jobDescription = (formData.get("job-description") as string) ?? "";

        console.log({ companyName, jobTitle, jobDescription, file });

        if (!file) return;
        handleAnalyze(companyName, jobTitle, jobDescription, file);

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


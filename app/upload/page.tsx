export default function UploadPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Upload Excel</h2>

      <form
        action="/api/upload"
        method="POST"
        encType="multipart/form-data"
      >
        <input type="file" name="file" />
        <br /><br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
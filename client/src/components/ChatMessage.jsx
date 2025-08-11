const ChatMessage = ({ message, isSender, time, type, url }) => {
  const renderMedia = () => {
    if (!type || !url) return null;
    if (type.startsWith("image/")) {
      return (
        <img
          src={url}
          alt="media"
          crossOrigin="anonymous"
          onError={() => console.error("Failed to load image", url)}
          className="w-[70%] h-auto object-cover rounded-xl mb-2"
        />
      );
    }
    if (type.startsWith("video/")) {
      return (
        <video
          src={url}
          controls
          className="max-h-64 w-full object-cover rounded-xl mb-2"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    if (type.startsWith("audio/")) {
      return (
        <audio controls className="w-full mb-2">
          <source src={url} type={type} />
          Your browser does not support the audio tag.
        </audio>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all mb-2"
      >
        View File
      </a>
    );
  };

  return (
    <div
      className={`max-w-[60%] mb-3 p-3 rounded-2xl relative flex flex-col h-auto ${
        isSender
          ? "bg-custom1 text-white ml-auto rounded-br-[5px]"
          : "bg-orange-200 text-black rounded-bl-[5px]"
      }`}
    >
      {renderMedia()}
      {message && <p className="text-xl mb-3">{message}</p>}

      <small
        className={`text-md font-thin absolute bottom-1 right-2 ${
          isSender ? "text-white" : "text-black"
        }`}
      >
        {time}
      </small>
    </div>
  );
};

export default ChatMessage;

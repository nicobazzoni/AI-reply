import React from 'react';

const ReplyWithLinks = ({ reply }) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const parts = reply.split(urlRegex);
  const urls = reply.match(urlRegex);

  if (!urls) return <p>{reply}</p>;

  return (
    <p>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {urls[index] && (
            <a
              className="block w-full mb-2 p-3 border border-gray-300 rounded bg-gray-50 text-gray-700 break-words hover:bg-gray-200"
              href={urls[index]}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {urls[index]}
            </a>
          )}
        </React.Fragment>
      ))}
    </p>
  );
};

export default ReplyWithLinks;
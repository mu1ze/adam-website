'use client';
import { useState, useCallback } from 'react';

async function urlToBlob(url) {
  const res = await fetch(url);
  return res.blob();
}

export default function useShareImage({ imageUrl, fileName, shareText, permalink, challengeUrl }) {
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, kind = 'info') => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (!imageUrl) return;
    setStatus('sharing');
    try {
      const blob = await urlToBlob(imageUrl);
      const file = new File([blob], fileName, { type: 'image/png' });
      const fullText = `${shareText} ${permalink}`;
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: fullText, title: 'ADAM OS' });
        setStatus('idle');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      try {
        await navigator.clipboard.writeText(fullText);
        showToast('Image downloaded — paste the copied text into your tweet or post', 'success');
      } catch {
        showToast('Image downloaded. Attach it to your post.', 'success');
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.error('Native share failed:', err);
        showToast('Share failed — try Download instead.', 'error');
      }
    }
    setStatus('idle');
  }, [imageUrl, fileName, shareText, permalink, showToast]);

  const handleChallengeShare = useCallback(async () => {
    if (!imageUrl) return;
    setStatus('sharing');
    try {
      const blob = await urlToBlob(imageUrl);
      const file = new File([blob], fileName, { type: 'image/png' });
      const text = `Beat my score on ADAM OS! ${challengeUrl}`;
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, title: 'Beat my score!' });
        setStatus('idle');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      try {
        await navigator.clipboard.writeText(text);
        showToast('Image downloaded + challenge text copied', 'success');
      } catch {
        showToast('Image downloaded.', 'success');
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.error('Challenge share failed:', err);
      }
    }
    setStatus('idle');
  }, [imageUrl, fileName, challengeUrl, showToast]);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;
    setStatus('downloading');
    try {
      const blob = await urlToBlob(imageUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Image saved', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed.', 'error');
    }
    setStatus('idle');
  }, [imageUrl, fileName, showToast]);

  const handleCopy = useCallback(async () => {
    if (!imageUrl) return;
    setStatus('copying');
    try {
      const blob = await urlToBlob(imageUrl);
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Image copied to clipboard', 'success');
      } else {
        const win = window.open(imageUrl, '_blank');
        if (win) showToast('Opened in new tab — right-click to copy', 'info');
      }
    } catch (err) {
      try {
        window.open(imageUrl, '_blank');
        showToast('Opened in new tab — right-click to copy', 'info');
      } catch {
        showToast('Copy failed — try Download instead.', 'error');
      }
    }
    setStatus('idle');
  }, [imageUrl, showToast]);

  const handleTweet = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(permalink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  }, [shareText, permalink]);

  const handleChallengeTweet = useCallback(() => {
    const text = encodeURIComponent(`Beat my score on ADAM OS! ${challengeUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=400');
  }, [challengeUrl]);

  return {
    status,
    toast,
    handleNativeShare,
    handleChallengeShare,
    handleDownload,
    handleCopy,
    handleTweet,
    handleChallengeTweet,
  };
}

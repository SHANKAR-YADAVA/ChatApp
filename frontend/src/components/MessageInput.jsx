import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Languages } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const indianLanguages = [
  "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi",
  "Gujarati", "Bengali", "Punjabi", "Odia", "Urdu"
];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState(""); // stores original before translation
  const [imagePreview, setImagePreview] = useState(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const fileInputRef = useRef(null);

  const {
    sendMessage,
    sendGroupMessage,
    selectedUser,
    selectedGroup,
  } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTranslate = async (lang) => {
    if (!text.trim() || !lang) return;

    try {
      setIsTranslating(true);
      const response = await axiosInstance.post("/api/translate", {
        text: text.trim(),
        targetLang: lang,
      });

      setOriginalText(text); // store original
      setText(response.data.translatedText); // overwrite input with translated
      setSelectedLang(lang); // update selected language
      toast.success(`Translated to ${lang}`);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) {
      toast.error("Please enter a message or attach an image");
      return;
    }

    const messagePayload = {
      text: text.trim(), // may be translated
      ...(originalText && { originalText }),
      ...(selectedLang && { translationLanguage: selectedLang }),
      image: imagePreview,
    };

    try {
      if (selectedUser) {
        await sendMessage({
          ...messagePayload,
          receiverId: selectedUser._id
        });
      } else if (selectedGroup) {
        await sendGroupMessage({
          ...messagePayload,
          groupId: selectedGroup._id
        });
      } else {
        toast.error("No recipient selected");
        return;
      }

      // Reset form
      setText("");
      setOriginalText("");
      setImagePreview(null);
      setSelectedLang(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Translation Info */}
      {originalText && (
        <div className="mb-2 text-sm text-blue-700">
          Translated from original.{" "}
          <button
            className="underline text-blue-600 hover:text-blue-800"
            onClick={() => {
              setText(originalText);
              setOriginalText("");
              setSelectedLang(null);
              toast("Reverted to original text");
            }}
          >
            Use original instead
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={
              selectedUser
                ? `Message ${selectedUser.name}...`
                : selectedGroup
                ? `Message group ${selectedGroup.name}...`
                : "Select a user or group"
            }
            disabled={!selectedUser && !selectedGroup}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Language Dropdown Button */}
          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md ${selectedLang ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            disabled={!text.trim()}
          >
            <Languages size={20} />
          </button>

          {/* Language Dropdown */}
          {showLangDropdown && (
            <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg z-50 w-40">
              <ul>
                {indianLanguages.map((lang) => (
                  <li
                    key={lang}
                    className={`p-2 hover:bg-gray-100 cursor-pointer text-sm ${
                      selectedLang === lang ? "bg-gray-100 font-semibold" : ""
                    }`}
                    onClick={() => {
                      setShowLangDropdown(false);
                      handleTranslate(lang);
                    }}
                  >
                    {lang}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Image Upload Button */}
          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md ${
              imagePreview ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-circle btn-sm sm:btn-md btn-primary"
          disabled={(!text.trim() && !imagePreview) || isTranslating}
        >
          {isTranslating ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

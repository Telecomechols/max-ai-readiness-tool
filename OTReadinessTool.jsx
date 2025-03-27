import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const questions = [/* same as before */];
const tooltips = [/* same as before */];

export default function OTReadinessTool() {
  const [logo, setLogo] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleAnswer = (answer) => {
    const updated = [...answers];
    updated[step] = answer;
    setAnswers(updated);
    setShowTip(false);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((a, i) => {
      if ([0, 1, 2, 4, 7, 8, 9, 10, 11].includes(i) && a.toLowerCase() === "yes") score += 1;
      if (i === 3) {
        const freq = a.toLowerCase();
        if (freq === "occasionally") score += 2;
        else if (freq === "frequently") score += 3;
        else if (freq === "continuously") score += 4;
      }
      if (i === 5) score += parseInt(a) || 0;
    });
    return score;
  };

  const getReadinessLevel = (score) => {
    if (score <= 4) return "Not Ready";
    if (score <= 8) return "Emerging";
    if (score <= 13) return "Ready";
    return "Advanced";
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const generatePDF = async () => {
    const styles = StyleSheet.create({
      page: { padding: 30 },
      section: { marginBottom: 10 },
      heading: { fontSize: 18, marginBottom: 10 },
      text: { fontSize: 12, marginBottom: 5 }
    });

    const score = calculateScore();
    const level = getReadinessLevel(score);
    const domainRecommendations = [
      {
        domain: "Governance",
        status: answers[11],
        summary: answers[11].toLowerCase() === "yes" ? "✅ Governance in place" : "⚠️ Create policies for AI governance",
        detail: answers[11].toLowerCase() === "yes"
          ? "You have foundational governance structures. Continue updating policies as AI capabilities evolve."
          : "Establish a formal AI governance framework, define risk boundaries, assign oversight roles, and align with NIST AI RMF."
      },
      {
        domain: "Leadership Support",
        status: answers[10],
        summary: answers[10].toLowerCase() === "yes" ? "✅ Leadership is supportive" : "⚠️ Assign AI leadership sponsor",
        detail: answers[10].toLowerCase() === "yes"
          ? "Ensure leadership continues to align AI strategy with OT outcomes and resources."
          : "Designate an executive sponsor to oversee AI/OT alignment, resource allocation, and governance development."
      },
      {
        domain: "Data Readiness",
        status: answers[1],
        summary: answers[1].toLowerCase() === "yes" ? "✅ Historical data available" : "❌ Begin structured data collection",
        detail: answers[1].toLowerCase() === "yes"
          ? "Ensure data is well-labeled, timestamped, and stored in accessible formats for ML training."
          : "Implement logging mechanisms across OT systems and store historical data to support future AI analysis."
      }
    ];

    const Report = () => (
      <Document>
        <Page style={styles.page}>
          <View style={{ marginBottom: 20 }}>
            <Image src={logo || "https://yourdomain.com/assets/aimframe-logo.png"} style={{ width: 100, height: 40 }} />
          </View>
          <Text style={styles.heading}>Max AI - OT Readiness Report</Text>
          <Text style={styles.text}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.text}>Readiness Level: {level} (Score: {score})</Text>
          <Text style={styles.heading}>Recommendations</Text>
          {domainRecommendations.map((rec, i) => (
            <View key={i} style={styles.section}>
              <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{rec.domain}:</Text> {rec.summary}</Text>
              <Text style={styles.text}>{rec.detail}</Text>
            </View>
          ))}
        </Page>
      </Document>
    );

    const blob = await pdf(<Report />).toBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MaxAI_Readiness_Report.pdf";
    link.click();
  };

  if (submitted) {
    const score = calculateScore();
    const level = getReadinessLevel(score);
    const domainRecommendations = [/* same mapping as above */];

    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Your OT AI Readiness Level:</h2>
        <p className="text-3xl mb-2">{level}</p>
        <p className="text-sm text-muted">(Score: {score})</p>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Key Recommendations</h3>
          <ul className="space-y-3">
            {domainRecommendations.map((rec, index) => (
              <li key={index} className="bg-gray-50 p-3 border rounded">
                <p className="font-semibold">{rec.domain} – {rec.summary}</p>
                <p className="text-sm text-gray-700 mt-1">{rec.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <input type="file" accept="image/*" onChange={handleLogoUpload} className="mb-4" />
        <button className="mt-6 mr-2 bg-blue-600 text-white px-4 py-2 rounded" onClick={generatePDF}>
          Download PDF
        </button>
        <button className="mt-6 bg-gray-600 text-white px-4 py-2 rounded" onClick={() => {
          setStep(0);
          setAnswers(Array(questions.length).fill(""));
          setSubmitted(false);
        }}>
          Retake Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Step {step + 1} of {questions.length}</h2>
      <div className="flex items-center justify-between mb-2">
        <p>{questions[step]}</p>
        <button
          onClick={() => setShowTip(!showTip)}
          className="text-blue-500 ml-2"
          aria-label="More info"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              {tooltips[step]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-x-2">
        {["Yes", "No", "Occasionally", "Frequently", "Continuously", "1", "2", "3", "4", "5"].map((opt) => (
          <button
            key={opt}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

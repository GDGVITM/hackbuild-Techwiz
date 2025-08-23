// src/lib/ai/contractGenerator.ts
export interface ContractInput {
  jobTitle: string;
  jobDescription: string;
  studentName: string;
  businessName: string;
  milestones: Array<{ title: string; amount: number; dueDate: string }>;
  totalAmount: number;
  startDate: string;
  endDate: string;
}

export async function generateContract(input: ContractInput): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = `
    Generate a professional contract for a freelance project with the following details:

    Job Title: ${input.jobTitle}
    Job Description: ${input.jobDescription}
    Student Name: ${input.studentName}
    Business Name: ${input.businessName}

    Milestones:
    ${input.milestones.map(m => `- ${m.title}: $${m.amount} (Due: ${m.dueDate})`).join('\n')}

    Total Amount: $${input.totalAmount}
    Start Date: ${input.startDate}
    End Date: ${input.endDate}

    The contract should include:
    1. Introduction of parties
    2. Project scope and deliverables
    3. Payment terms and milestones
    4. Timeline and deadlines
    5. Confidentiality clause
    6. Termination conditions
    7. Governing law
    8. Signatures

    Format the contract in plain text with clear headings for each section.
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // free/cheap testing model
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", errText);
      throw new Error(`OpenRouter request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const contract = data?.choices?.[0]?.message?.content;
    if (!contract) {
      throw new Error("No contract content returned from model");
    }

    return contract.trim();
  } catch (error) {
    console.error("Error generating contract:", error);
    throw new Error("Failed to generate contract");
  }
}

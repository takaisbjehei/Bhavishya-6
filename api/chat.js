export default async function handler(req,res){

  try{

    if(req.method!=="POST"){
      return res.status(405).json({
        error:{message:"POST only"}
      });
    }

    const {model,messages=[]}=req.body||{};

    if(!model){
      return res.status(400).json({
        error:{message:"Model required"}
      });
    }

    const key=process.env.ANTHROPIC_API_KEY;

    if(!key){
      return res.status(500).json({
        error:{message:"API key missing in Vercel"}
      });
    }

    const isClaude=model.startsWith("claude-");

    let url;
    let body;
    let headers={
      "Content-Type":"application/json",
      "Authorization":`Bearer ${key}`
    };

    /*
      CLAUDE
      Base: https://freetokenfaucet.com/anthropic
      Endpoint: /v1/messages
    */
    if(isClaude){

      url="https://freetokenfaucet.com/anthropic/v1/messages";

      headers["anthropic-version"]="2023-06-01";
      headers["x-api-key"]=key;

      body={
        model:model,
        max_tokens:2048,
        messages:messages
      };

    }

    /*
      EVERYTHING ELSE
      Base: https://freetokenfaucet.com/v1
      Endpoint: /chat/completions
    */
    else{

      url="https://freetokenfaucet.com/v1/chat/completions";

      body={
        model:model,
        messages:messages,
        max_tokens:2048
      };

    }

    const response=await fetch(url,{
      method:"POST",
      headers:headers,
      body:JSON.stringify(body)
    });

    const raw=await response.text();

    let data;

    try{
      data=JSON.parse(raw);
    }catch{

      return res.status(response.status).json({
        error:{
          message:`FreeToken returned non-JSON (${response.status})`,
          details:raw.slice(0,500)
        }
      });

    }

    if(!response.ok){
      return res.status(response.status).json(data);
    }

    let answer="";

    if(isClaude){

      answer=data?.content
        ?.filter(x=>x.type==="text")
        ?.map(x=>x.text)
        ?.join("")||"";

    }else{

      answer=data?.choices?.[0]?.message?.content||"";

    }

    return res.status(200).json({
      answer:answer
    });

  }catch(error){

    return res.status(500).json({
      error:{
        message:error.message
      }
    });

  }

}    if (isClaude) {
      headers["anthropic-version"] = "2023-06-01";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages
      })
    });

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(response.status).json({
        error: {
          message: `FreeToken returned non-JSON (${response.status})`,
          response: raw.slice(0, 1000)
        }
      });
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    let answer = "";

    if (isClaude) {
      answer = data?.content
        ?.filter(x => x.type === "text")
        ?.map(x => x.text)
        ?.join("") || "";
    } else {
      answer =
        data?.choices?.[0]?.message?.content || "";
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    return res.status(500).json({
      error: {
        message: error.message
      }
    });
  }
}

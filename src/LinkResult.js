 import axios from "axios";
 import { useEffect, useState } from "react"
 import CopyToClipboard from 'react-copy-to-clipboard';
 import { CopyOutlined } from "@ant-design/icons"
 import * as FileSaver from "file-saver";
 import * as XLSX from "xlsx";


const LinkResult = ({ inputValue }) => {
    const [shortenLink,setShortenLink] = useState([]);
    // const [arr, setArr] = useState({})
    const [copied,setCopied] = useState(false);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(false);
    const fileType ="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    
    const exportFile=()=> {
        let data;
        let excelBuffer
        
        const obj = {};
        let i = 0;
        for (const key of shortenLink) {
            i++
            obj[i] = key;
        }
        // console.log(obj)
        const ws = XLSX.utils.json_to_sheet([obj]);
        // console.log(ws, 'ws')
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        // console.log(wb, 'wb')
        excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        // console.log(excelBuffer)
        data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, 'Data' + fileExtension);
       
    }
    const fetchData = async () =>{
        try {
            setLoading(true);

            for (let url of inputValue) {
                if (url) {
                    const res = await axios(`https://api.shrtco.de/v2/shorten?url=${url}`);
                    shortenLink.push(res.data.result.full_short_link);
                }
            }
            setShortenLink(shortenLink);
            exportFile();
            
        } catch(err) {
            setError(err)
            console.log(err)
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (inputValue.length) {
            fetchData(); 
        }
    },[inputValue]);

   
    useEffect(() => {
        const timer = setTimeout(()=> {
            setCopied(false);
        },1000);
    
        return () => clearTimeout(timer);
    }, [copied]);

    if (loading) {
        return <p className="noData">Loading...</p>
    }

    if (error) {
        return <p className="noData">something went wrong</p>
    } 


    return (
        <>
        {
            shortenLink.map((shortLink,index)=>(
                <div className="result">
                <p>{shortLink}</p>
                <CopyToClipboard text={shortLink} onCopy = {() => setCopied(true)} loading>
                <button className={copied ? "copied" : ""} title="copy"><CopyOutlined /></button>
                </CopyToClipboard>
            </div>
            ) 
           
        )}
        </>
    )
}

export default LinkResult
import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const date = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
export default function ExtraLectureRequests() {
  const [requests, setRequests] = useState([]), [error, setError] = useState(""), [message, setMessage] = useState("");
  const load = async () => { try { const response = await api.get("/extra-lectures"); setRequests(response.data.requests || []); } catch (e) { setError(e.response?.data?.message || "Failed to load requests."); } };
  useEffect(() => { load(); }, []);
  const review = async (request, status) => { const adminNote = window.prompt(status === "approved" ? "Optional approval note:" : "Optional rejection reason:", ""); if (adminNote === null) return; try { const action = status === "approved" ? "approve" : "reject"; const response = await api.put(`/extra-lectures/${request._id}/${action}`, { adminNote }); setMessage(response.data.message); load(); } catch (e) { setError(e.response?.data?.message || "Could not review request."); } };
  return <AdminLayout><div className="p-8 max-w-6xl"><h1 className="text-3xl font-bold">Extra lecture requests</h1><p className="text-slate-400 mb-6">Approve requests only after the current schedule conflict check passes.</p>{error && <p className="text-red-400 mb-4">{error}</p>}{message && <p className="text-green-400 mb-4">{message}</p>}<div className="bg-slate-900 rounded-xl overflow-x-auto"><table className="w-full text-left"><thead className="text-slate-400"><tr><th className="p-4">Instructor</th><th>Course</th><th>When</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((x) => <tr key={x._id} className="border-t border-slate-800"><td className="p-4">{x.instructor?.name}</td><td>{x.course?.name}</td><td>{date(x.date)}<br />{x.startTime}–{x.endTime}</td><td>{x.reason}</td><td className="capitalize">{x.status}</td><td>{x.status === "pending" && <div className="flex gap-2"><button onClick={() => review(x, "approved")} className="text-green-400">Approve</button><button onClick={() => review(x, "rejected")} className="text-red-400">Reject</button></div>}</td></tr>)}</tbody></table>{!requests.length && <p className="p-5 text-slate-400">No requests.</p>}</div></div></AdminLayout>;
}
